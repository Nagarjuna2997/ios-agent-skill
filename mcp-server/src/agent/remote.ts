// Explicit opt-in GitHub transport. Source goes only to --remote-repo, on a new
// isolated branch; credentials stay on the client. No local git index is touched.
import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { BuildResult } from './build.js';
import { PlanSchema } from "./plan.js";
import { validateAppName } from "./spec.js";
import { readSpec } from './project.js';
import { attemptsThisCycle, loadState, progress, saveState } from './state.js';
import type { CommandRunner } from './runner.js';

export const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const diagnostic = z.object({ severity: z.enum(['error', 'warning']), message: z.string().max(10000), file: z.string().optional(), line: z.number().optional(), column: z.number().optional() });
export const RemoteResult = z.object({
  protocol: z.literal(1), inputHash: z.string().regex(/^[a-f0-9]{64}$/),
  build: z.object({ success: z.boolean(), errors: z.array(diagnostic), warnings: z.array(diagnostic), durationMs: z.number().nonnegative(), scheme: z.string(), destination: z.string(), logPath: z.string(), toolError: z.string().optional() }),
  captureError: z.string().optional(),
  run: z.object({ udid: z.string(), simulator: z.string(), pid: z.number().optional() }).optional(),
  toolchain: z.object({ sdk: z.string().optional(), xcode: z.string().optional(), simulator: z.string().optional() }),
  screenshots: z.array(z.object({ screen: z.string(), variant: z.enum(['light', 'dark', 'xxl']), path: z.string() })),
  files: z.array(z.object({ path: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/) })).max(500),
});
export type RemoteOptions = { repo: string; toolRef: string; xcode: string; runnerLabel?: string; sink?: (message: string) => void };
export function validateRemoteOptions(o: RemoteOptions): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(o.repo)) throw new Error('--remote-repo must be owner/repo');
  if (!/^[a-f0-9]{40}$/.test(o.toolRef)) throw new Error('--remote-tool-ref must pin a full Git commit SHA containing the remote worker');
  if (!/^\d+\.\d+(?:\.\d+)?$/.test(o.xcode)) throw new Error('--remote-xcode must pin an installed Xcode version (for example 26.3)');
  if (o.runnerLabel && !/^macos-\d+(?:-intel)?$/.test(o.runnerLabel)) throw new Error('--remote-runner must be a versioned standard macOS label');
}

export function evidencePath(path: string): boolean {
  return /^\.ios-agent\/(?:logs|screenshots)\/[a-zA-Z0-9_.-]+\.(?:log|png)$/.test(path) && !path.includes('..');
}

/** Narrow generated-project selection; never include .env, Secrets.xcconfig,
 * Git metadata, existing artifacts, symlinks or arbitrary sibling files. */
export async function snapshotFiles(root: string): Promise<Array<{ path: string; content: Buffer }>> {
  const spec = await readSpec(root);
  validateAppName(spec.name);
  for (const extension of spec.extensions ?? []) validateAppName(extension.name);
  const files: Array<{ path: string; content: Buffer }> = [];
  let bytes = 0;
  const walk = async (path: string): Promise<void> => {
    const full = join(root, path);
    let stat;
    try { stat = await lstat(full); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return; throw e; }
    if (stat.isSymbolicLink()) throw new Error(`Remote upload refuses symlink: ${path}`);
    if (stat.isDirectory()) {
      for (const name of (await readdir(full)).sort()) {
        if (name.startsWith('.') || ['node_modules', 'DerivedData', 'xcuserdata', 'Secrets.xcconfig'].includes(name)) continue;
        await walk(`${path}/${name}`);
      }
    } else if (stat.isFile()) {
      if (/\.(?:p12|p8|pem|key|mobileprovision)$/i.test(path)) throw new Error(`Remote upload refuses credential file: ${path}`);
      bytes += stat.size;
      if (bytes > 25 * 1024 * 1024 || files.length >= 1000) throw new Error('Remote source snapshot exceeds 25 MiB / 1000 files');
      files.push({ path, content: await readFile(full) });
    }
  };
  for (const path of [spec.name, ...(spec.extensions ?? []).map(e => e.name), `${spec.name}.xcodeproj`, 'Config', 'project.yml', '.ios-agent/spec.json', '.ios-agent/plan.json']) await walk(path);
  return files;
}
export const snapshotHash = (files: Array<{ path: string; content: Buffer }>) => digest(files.map(f => `${f.path}\0${digest(f.content)}`).sort().join('\n'));

interface Checkpoint { protocol: 1; identity: string; branch: string; commit?: string; run?: number; runAttempt?: number; applied?: boolean }
async function atomicJSON(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(`${path}.tmp`, JSON.stringify(value, null, 2));
  await rename(`${path}.tmp`, path);
}

export class GitHubBuildBackend {
  get id(): string { return `github:${digest(JSON.stringify(this.options))}`; }
  constructor(private options: RemoteOptions, private runner: CommandRunner, private request: typeof fetch = fetch, private pollMs = 10000) { validateRemoteOptions(options); }
  async build(root: string): Promise<BuildResult & { attempt: number; cap: number }> {
    const state = (await loadState(root))!;
    const files = await snapshotFiles(root);
    const inputHash = snapshotHash(files);
    const identity = digest(JSON.stringify([this.options, inputHash, state.cycle]));
    const folder = join(root, '.ios-agent', 'remote', identity);
    const checkpointPath = join(folder, 'checkpoint.json');
    let checkpoint: Checkpoint;
    try { checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8')); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; checkpoint = { protocol: 1, identity, branch: `ios-agent-build/${identity.slice(0, 24)}` }; }
    if (checkpoint.identity !== identity || checkpoint.protocol !== 1) throw new Error('Remote checkpoint identity mismatch');
    const auth = await this.runner.run('gh', ['auth', 'token', '--hostname', 'github.com'], { timeoutMs: 30000 });
    if (auth.exitCode !== 0 || !auth.stdout.trim()) throw new Error('Sign in with gh auth login; contents/workflow write and Actions read access are required');
    const token = auth.stdout.trim();
    const api = async (path: string, method = 'GET', body?: unknown): Promise<any> => {
      const response = await this.request(`https://api.github.com/repos/${this.options.repo}/${path}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`GitHub ${method} ${path.split('?')[0]} returned HTTP ${response.status}`);
      return response.json();
    };
    await atomicJSON(checkpointPath, checkpoint);
    // The branch name is content-addressed. Recover a completed push if the
    // client died before recording it, rather than trigger another paid job.
    if (!checkpoint.commit) {
      const existing = await api(`git/matching-refs/heads/${checkpoint.branch}`);
      const match = existing.find((r: { ref: string }) => r.ref === `refs/heads/${checkpoint.branch}`);
      if (match) checkpoint.commit = match.object.sha;
      else {
        const workflowPath = join(dirname(fileURLToPath(import.meta.url)), '../../data/remote/ios-agent-remote.yml');
        const workflow = (await readFile(workflowPath, 'utf8')).replaceAll('__TOOL_REF__', this.options.toolRef).replaceAll('__XCODE_VERSION__', this.options.xcode).replaceAll('__RUNNER__', this.options.runnerLabel ?? 'macos-15');
        const cleanState = { ...state, description: '', progress: [], refinements: [], screenshots: [], run: undefined, toolchain: undefined };
        const payload = [...files.map(f => ({ ...f, path: `app/${f.path}` })),
          { path: 'app/.ios-agent/state.json', content: Buffer.from(JSON.stringify(cleanState)) },
          { path: '.github/workflows/ios-agent-remote.yml', content: Buffer.from(workflow) },
          { path: 'request.json', content: Buffer.from(JSON.stringify({ protocol: 1, inputHash })) }];
        const tree = [];
        for (const f of payload) {
          const blob = await api('git/blobs', 'POST', { content: f.content.toString('base64'), encoding: 'base64' });
          tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
        }
        const createdTree = await api('git/trees', 'POST', { tree });
        const commit = await api('git/commits', 'POST', { message: `iOS Agent remote build ${identity.slice(0, 12)}`, tree: createdTree.sha, parents: [] });
        // Save the commit before creating the ref. A retry reuses the exact commit.
        checkpoint.commit = commit.sha;
        await atomicJSON(checkpointPath, checkpoint);
        await api('git/refs', 'POST', { ref: `refs/heads/${checkpoint.branch}`, sha: commit.sha });
      }
      await atomicJSON(checkpointPath, checkpoint);
    }
    // A saved commit may precede ref creation after a crash.
    const refs = await api(`git/matching-refs/heads/${checkpoint.branch}`);
    if (!refs.some((r: { ref: string }) => r.ref === `refs/heads/${checkpoint.branch}`)) await api('git/refs', 'POST', { ref: `refs/heads/${checkpoint.branch}`, sha: checkpoint.commit });
    const deadline = Date.parse(state.deadlineAt);
    let completed = false;
    let lastStatus = "";
    while (Date.now() < deadline) {
      if (!checkpoint.run) {
        const runs = await api(`actions/runs?head_sha=${checkpoint.commit}&event=push&per_page=100`);
        const run = runs.workflow_runs.find((r: any) => r.head_sha === checkpoint.commit && r.path === '.github/workflows/ios-agent-remote.yml');
        if (run) { checkpoint.run = run.id; await atomicJSON(checkpointPath, checkpoint); }
      }
      if (checkpoint.run) {
        const run = await api(`actions/runs/${checkpoint.run}`);
        if (run.status !== lastStatus) { this.options.sink?.(`[remote] ${run.status}: https://github.com/${this.options.repo}/actions/runs/${checkpoint.run}`); lastStatus = run.status; }
        if (run.head_sha !== checkpoint.commit) throw new Error('Remote run commit mismatch');
        if (run.status === 'completed') { checkpoint.runAttempt = run.run_attempt ?? 1; await atomicJSON(checkpointPath, checkpoint); completed = true; break; }
      }
      await new Promise(r => setTimeout(r, this.pollMs));
    }
    if (!completed) throw new Error(`Remote run pending; resume to reuse it. Branch ${checkpoint.branch}${checkpoint.run ? `, run ${checkpoint.run}` : ''}`);
    const downloaded = await mkdtemp(join(folder, 'download-')); 
    const download = await this.runner.run('gh', ['run', 'download', String(checkpoint.run), '--repo', `github.com/${this.options.repo}`, '--name', 'ios-agent-evidence', '--dir', downloaded], { timeoutMs: 120000 });
    if (download.exitCode !== 0) throw new Error(`Remote infrastructure/artifact failure. Inspect https://github.com/${this.options.repo}/actions/runs/${checkpoint.run}; app source was not modified. Use --resume --remote-retry to start a new job`);
    const result = RemoteResult.parse(JSON.parse(await readFile(join(downloaded, 'result.json'), 'utf8')));
    if (result.inputHash !== inputHash) throw new Error('Remote evidence source hash mismatch');
    for (const f of result.files) {
      if (!evidencePath(f.path)) throw new Error('Unsafe remote evidence path');
      await refuseSymlinks(downloaded, f.path);
      await refuseSymlinks(root, f.path);
      const source = join(downloaded, f.path);
      if (!(await lstat(source)).isFile() || digest(await readFile(source)) !== f.sha256) throw new Error(`Remote evidence hash mismatch: ${f.path}`);
    }
    for (const shot of result.screenshots) if (!result.files.some(f => f.path === shot.path && f.path.endsWith('.png'))) throw new Error('Screenshot missing verified evidence');
    if (!result.files.some(f => f.path === result.build.logPath)) throw new Error('Build log missing verified evidence');
    if (result.build.success && !result.captureError) {
      if (result.build.errors.length || !result.run) throw new Error('Inconsistent remote success evidence');
      const plan = PlanSchema.parse(JSON.parse(await readFile(join(root, '.ios-agent/plan.json'), 'utf8')));
      const expected = plan.screens.filter(s => s.topLevel).flatMap(s => ['light', 'dark', 'xxl'].map(v => `${s.id}:${v}`));
      const actual = result.screenshots.map(s => `${s.screen}:${s.variant}`);
      if (!expected.length || expected.length !== actual.length || expected.some(k => !actual.includes(k))) throw new Error('Incomplete remote screenshot matrix');
    }
    for (const f of result.files) { await mkdir(dirname(join(root, f.path)), { recursive: true }); await copyFile(join(downloaded, f.path), join(root, f.path)); }
    const fresh = (await loadState(root))!;
    const attempt = attemptsThisCycle(fresh) + 1;
    const receipt = `https://github.com/${this.options.repo}/actions/runs/${checkpoint.run}?attempt=${checkpoint.runAttempt ?? 1}`;
    // State receipt makes replay idempotent even if interrupted before checkpoint update.
    if (!fresh.progress.some(p => p.message === receipt)) {
      fresh.builds.push({ cycle: fresh.cycle, attempt, success: result.build.success, errors: result.build.errors.length, warnings: result.build.warnings.length, durationMs: result.build.durationMs, at: new Date().toISOString(), firstErrors: result.build.errors.slice(0, 5) });
      fresh.toolchain = result.toolchain;
      fresh.run = result.run;
      fresh.screenshots = result.screenshots;
      progress(fresh, 'building', receipt);
      await saveState(root, fresh);
    }
    checkpoint.applied = true;
    await atomicJSON(checkpointPath, checkpoint);
    if (result.captureError) throw new Error(`Remote build succeeded but simulator verification failed: ${result.captureError}. ${receipt}. Use --resume --remote-retry for a new job`);
    return { ...result.build, attempt: attemptsThisCycle((await loadState(root))!), cap: fresh.maxBuildAttempts };
  }
}

async function refuseSymlinks(root: string, path: string): Promise<void> {
  let cursor = root;
  for (const part of path.split('/')) {
    cursor = join(cursor, part);
    try { if ((await lstat(cursor)).isSymbolicLink()) throw new Error('Symlink in evidence path'); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
}
