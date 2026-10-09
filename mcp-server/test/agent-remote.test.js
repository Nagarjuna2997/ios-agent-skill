import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { GitHubBuildBackend, snapshotFiles, snapshotHash, digest, evidencePath, validateRemoteOptions } from '../dist/agent/remote.js';
import { newAppSpec } from '../dist/agent/spec.js';
import { newRunState, saveState, loadState } from '../dist/agent/state.js';
const options = { repo: 'example/builds', toolRef: 'a'.repeat(40), xcode: '26.3' };
const plan = { appName: 'DemoApp', displayName: 'Demo', summary: 'A small local demonstration app', navigation: 'stack', screens: [{ id: 'home', title: 'Home', purpose: 'Show a demo', topLevel: true }], models: [], capabilities: [], assumptions: [] };
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'remote-ios-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, text] of Object.entries({ '.ios-agent/spec.json': JSON.stringify(newAppSpec({ name: 'DemoApp' })), '.ios-agent/plan.json': JSON.stringify(plan), 'DemoApp/Main.swift': 'import SwiftUI', 'DemoApp.xcodeproj/project.pbxproj': 'project', 'Config/Base.xcconfig': 'SWIFT_VERSION = 6.0', 'Config/Secrets.xcconfig': 'PRIVATE_KEY = SECRET', '.env': 'SECRET=true' })) {
    await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text);
  }
  await saveState(root, newRunState({ description: 'demo', projectDir: root }));
  return root;
}
async function harness(root, mutate = r => r) {
  const inputHash = snapshotHash(await snapshotFiles(root));
  const contents = { '.ios-agent/logs/build-1.log': Buffer.from('BUILD SUCCEEDED'), ...Object.fromEntries(['light','dark','xxl'].map(v => [`.ios-agent/screenshots/home-${v}.png`, Buffer.from(`png-${v}`)])) };
  const result = mutate({ protocol: 1, inputHash, build: { success: true, errors: [], warnings: [], durationMs: 1, scheme: 'DemoApp', destination: 'simulator', logPath: '.ios-agent/logs/build-1.log' }, toolchain: { xcode: 'Xcode 26.3', simulator: 'iPhone' }, run: { udid: 'sim', simulator: 'iPhone' }, screenshots: ['light','dark','xxl'].map(variant => ({ screen: 'home', variant, path: `.ios-agent/screenshots/home-${variant}.png` })), files: Object.entries(contents).map(([path, content]) => ({ path, sha256: digest(content) })) });
  const calls = []; let ref; let failPoll = false; let failRef = false;
  const request = async (url, init) => {
    const path = url.split('/repos/example/builds/')[1]; calls.push([path, init.method]);
    const body = init.body ? JSON.parse(init.body) : {};
    let value;
    if (path.startsWith('git/matching-refs/')) value = ref ? [ref] : [];
    else if (path === 'git/blobs' || path === 'git/trees') value = { sha: 'b'.repeat(40) };
    else if (path === 'git/commits') value = { sha: 'c'.repeat(40) };
    else if (path === 'git/refs') { if (failRef) { failRef = false; throw new Error('interrupted ref creation'); } ref = { ref: body.ref, object: { sha: body.sha } }; value = ref; }
    else if (path.startsWith('actions/runs?')) value = { workflow_runs: [{ id: 7, head_sha: 'c'.repeat(40), path: '.github/workflows/ios-agent-remote.yml' }] };
    else if (path === 'actions/runs/7') { if (failPoll) throw new Error('connection dropped'); value = { status: 'completed', head_sha: 'c'.repeat(40) }; }
    else throw new Error(`Unexpected ${path}`);
    return new Response(JSON.stringify(value), { status: 200 });
  };
  const runner = { async run(command, args) {
    assert.equal(command, 'gh');
    if (args[0] === 'auth') return { exitCode: 0, stdout: 'test-token' };
    const out = args.at(-1);
    for (const [path, content] of Object.entries(contents)) { await mkdir(dirname(join(out, path)), { recursive: true }); await writeFile(join(out, path), content); }
    await writeFile(join(out, 'result.json'), JSON.stringify(result));
    return { exitCode: 0, stdout: '' };
  } };
  return { backend: new GitHubBuildBackend(options, runner, request, 0), calls, failPoll(value) { failPoll = value; }, failRefOnce() { failRef = true; } };
}
test('snapshot excludes secrets and artifacts, changes when Swift changes, rejects symlinks', async t => {
  const root = await fixture(t); const before = await snapshotFiles(root);
  assert.ok(!before.some(f => /Secrets|\.env|state\.json/.test(f.path)));
  const hash = snapshotHash(before); await writeFile(join(root, 'DemoApp/Main.swift'), 'changed');
  assert.notEqual(snapshotHash(await snapshotFiles(root)), hash);
  await symlink(join(root, '.env'), join(root, 'DemoApp/leak.swift'));
  await assert.rejects(snapshotFiles(root), /symlink/);
});
test('upload rejects traversal in spec and requires pinned remote settings', async t => {
  const root = await fixture(t); await writeFile(join(root, '.ios-agent/spec.json'), JSON.stringify({ name: '../outside' }));
  await assert.rejects(snapshotFiles(root), /App name/);
  for (const patch of [{ repo: '../repo' }, { toolRef: 'main' }, { xcode: '26.3; curl evil' }, { runnerLabel: 'self-hosted' }]) assert.throws(() => validateRemoteOptions({ ...options, ...patch }));
  assert.equal(evidencePath('.ios-agent/logs/../state.json'), false);
});
test('success imports verified evidence once; interrupted poll resumes the same commit/run', async t => {
  const root = await fixture(t); const h = await harness(root);
  h.failPoll(true); await assert.rejects(h.backend.build(root), /connection dropped/);
  h.failPoll(false); const result = await h.backend.build(root);
  assert.equal(result.success, true); await h.backend.build(root);
  assert.equal(h.calls.filter(([p]) => p === 'git/refs').length, 1);
  const state = await loadState(root); assert.equal(state.builds.length, 1); assert.equal(state.screenshots.length, 3); assert.equal(state.run.simulator, 'iPhone');
});
test('compile failure returns diagnostics to the client instead of transport failure', async t => {
  const root = await fixture(t); const h = await harness(root, r => ({ ...r, build: { ...r.build, success: false, errors: [{ severity: 'error', file: 'DemoApp/Main.swift', line: 1, message: 'type mismatch' }] }, screenshots: [] }));
  const result = await h.backend.build(root); assert.equal(result.success, false); assert.equal(result.errors[0].message, 'type mismatch');
});
for (const [name, mutate, error] of [
  ['wrong source', r => ({ ...r, inputHash: 'f'.repeat(64) }), /source hash/],
  ['corrupt artifact', r => ({ ...r, files: r.files.map(f => ({ ...f, sha256: 'f'.repeat(64) })) }), /hash mismatch/],
  ['incomplete screenshots', r => ({ ...r, screenshots: r.screenshots.slice(0,1) }), /screenshot matrix/],
  ['unsafe artifact', r => ({ ...r, files: [{ path: '../outside', sha256: 'f'.repeat(64) }] }), /Unsafe/],
]) test(`rejects ${name} before updating state`, async t => {
  const root = await fixture(t); const h = await harness(root, mutate);
  await assert.rejects(h.backend.build(root), error); assert.equal((await loadState(root)).builds.length, 0);
});
test('capture failure is explicitly retryable and is not reported as a complete run', async t => {
  const root = await fixture(t); const h = await harness(root, r => ({ ...r, captureError: 'simulator failed' }));
  await assert.rejects(h.backend.build(root), /--remote-retry/);
});
test('workflow pins tooling and Xcode, restricts token, always uploads hidden evidence', async () => {
  const text = await readFile(new URL('../../templates/ci-cd/ios-agent-remote.yml', import.meta.url), 'utf8');
  assert.match(text, /ref: __TOOL_REF__/); assert.match(text, /contents: read/); assert.match(text, /persist-credentials: false/); assert.match(text, /if: always\(\)/); assert.match(text, /include-hidden-files: true/);
});

test('worker returns build diagnostics and real-shaped hashed capture manifest without a model', async t => {
  const { remoteWorker } = await import('../dist/agent/remote-worker.js');
  const { ProcessRunner } = await import('../dist/agent/runner.js');
  const { fakeXcode } = await import('./helpers/fake-xcode.js');
  const fake = await fakeXcode(t); const root = await fixture(t);
  const request = join(root, 'request.json');
  const processRunner = new ProcessRunner({ ...process.env, ...fake.env });
  let firstProbe = true;
  const runner = { async run(command, args, options) {
    if (firstProbe && command === 'xcrun' && args.includes('list')) {
      firstProbe = false;
      return { command, args, exitCode: 1, stdout: '', stderr: 'Simulator service starting', durationMs: 1 };
    }
    return processRunner.run(command, args, options);
  } };
  await writeFile(request, JSON.stringify({ protocol: 1, inputHash: snapshotHash(await snapshotFiles(root)) }));
  assert.equal(await remoteWorker(root, request, join(root, 'evidence'), { runner, screenshotDelayMs: 0 }), true);
  const good = JSON.parse(await readFile(join(root, 'evidence/result.json'), 'utf8'));
  assert.match(good.toolchain.simulator, /iPhone Fixture/); assert.equal(good.toolchain.sdk, "27.0");
  assert.equal(good.screenshots.length, 3); assert.equal(good.build.success, true);
  for (const file of good.files) assert.equal(digest(await readFile(join(root, 'evidence', file.path))), file.sha256);
  await writeFile(join(root, 'DemoApp/Main.swift'), 'AGENT_TEST_ERROR');
  // A fresh remote attempt begins with no previous runtime evidence.
  const state = await loadState(root); state.screenshots = []; delete state.run; await saveState(root, state);
  await writeFile(request, JSON.stringify({ protocol: 1, inputHash: snapshotHash(await snapshotFiles(root)) }));
  assert.equal(await remoteWorker(root, request, join(root, 'broken-evidence'), { runner, screenshotDelayMs: 0 }), false);
  const broken = JSON.parse(await readFile(join(root, 'broken-evidence/result.json'), 'utf8'));
  assert.equal(broken.build.errors[0].file, 'DemoApp/Main.swift'); assert.equal(broken.screenshots.length, 0);
});

test('interruption after commit creation resumes without another source commit', async t => {
  const root = await fixture(t); const h = await harness(root);
  h.failRefOnce(); await assert.rejects(h.backend.build(root), /interrupted ref/);
  assert.equal((await h.backend.build(root)).success, true);
  assert.equal(h.calls.filter(([p]) => p === 'git/commits').length, 1);
});
