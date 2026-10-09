// One deterministic macOS attempt. No model credentials or repair agent on CI.
import { mkdir, readFile, readdir, copyFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchAndCapture } from './loop.js';
import { ProcessRunner } from './runner.js';
import { loadState, saveState } from './state.js';
import { recordedBuild, readPlan } from './workspace.js';
import { preflight, chooseSimulator } from './toolchain.js';
import { digest, snapshotFiles, snapshotHash, RemoteResult } from './remote.js';

export async function remoteWorker(root: string, requestPath: string, output: string): Promise<void> {
  const request = JSON.parse(await readFile(requestPath, 'utf8'));
  if (request.protocol !== 1 || request.inputHash !== snapshotHash(await snapshotFiles(root))) throw new Error('Remote request source hash mismatch');
  const runner = new ProcessRunner();
  const check = await preflight(runner);
  const simulator = chooseSimulator(check.toolchain.simulators);
  const state = (await loadState(root))!;
  state.deadlineAt = new Date(Date.now() + 30 * 60000).toISOString();
  state.toolchain = { xcode: check.toolchain.xcode ? `Xcode ${check.toolchain.xcode.version} (${check.toolchain.xcode.build})` : 'unavailable', simulator: simulator ? `${simulator.name} (${simulator.runtimeVersion.join('.')})` : 'unavailable' };
  await saveState(root, state);
  const build = await recordedBuild(root, runner, simulator ? { udid: simulator.udid } : {});
  let captureError: string | undefined;
  if (build.success) {
    try {
      const plan = await readPlan(root);
      if (!plan || !plan.screens.some(s => s.topLevel)) throw new Error('Plan has no top-level screens');
      await launchAndCapture(root, { runner, ...(simulator ? { udid: simulator.udid } : {}) }, plan);
    } catch (e) { captureError = String(e).slice(0, 1000); }
  }
  const fresh = (await loadState(root))!;
  const files = [];
  for (const kind of ['logs', 'screenshots']) {
    const folder = join(root, '.ios-agent', kind);
    let names: string[];
    try { names = await readdir(folder); } catch { continue; }
    for (const name of names) {
      if (!/^[\w.-]+\.(log|png)$/.test(name)) continue;
      const path = `.ios-agent/${kind}/${name}`;
      await mkdir(dirname(join(output, path)), { recursive: true });
      await copyFile(join(root, path), join(output, path));
      files.push({ path, sha256: digest(await readFile(join(output, path))) });
    }
  }
  const { appPath: _app, ...portable } = build;
  const result = RemoteResult.parse({ protocol: 1, inputHash: request.inputHash, build: { ...portable, logPath: `.ios-agent/logs/${build.logPath.split(/[\\/]/).at(-1)}` }, captureError, toolchain: fresh.toolchain, screenshots: fresh.screenshots, run: fresh.run, files });
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'result.json'), JSON.stringify(result, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [root, request, output] = process.argv.slice(2);
  if (!root || !request || !output) throw new Error('remote-worker ROOT REQUEST OUTPUT');
  await remoteWorker(resolve(root), resolve(request), resolve(output));
}
