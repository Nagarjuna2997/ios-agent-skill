// One deterministic macOS attempt. No model credentials or repair agent on CI.
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, copyFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { testProject } from './testing.js';
import { readSpec } from './project.js';
import { launchAndCapture } from './loop.js';
import { ProcessRunner, type CommandRunner } from './runner.js';
import { loadState, saveState } from './state.js';
import { recordedBuild, readPlan } from './workspace.js';
import { preflight, chooseSimulator } from './toolchain.js';
import { digest, snapshotFiles, snapshotHash, RemoteResult } from './remote.js';

export async function remoteWorker(root: string, requestPath: string, output: string, options: { runner?: CommandRunner; screenshotDelayMs?: number } = {}): Promise<boolean> {
  const request = JSON.parse(await readFile(requestPath, 'utf8'));
  if (request.protocol !== 1 || request.inputHash !== snapshotHash(await snapshotFiles(root))) throw new Error('Remote request source hash mismatch');
  const runner = options.runner ?? new ProcessRunner();
  const check = await preflight(runner);
  const simulator = chooseSimulator(check.toolchain.simulators);
  const state = (await loadState(root))!;
  state.deadlineAt = new Date(Date.now() + 30 * 60000).toISOString();
  state.toolchain = { ...(check.toolchain.iosSimulatorSdk ? { sdk: check.toolchain.iosSimulatorSdk } : {}), xcode: check.toolchain.xcode ? `Xcode ${check.toolchain.xcode.version} (${check.toolchain.xcode.build})` : 'unavailable', simulator: simulator ? `${simulator.name} (${simulator.runtimeVersion.join('.')})` : 'unavailable' };
  await saveState(root, state);
  const build = await recordedBuild(root, runner, simulator ? { udid: simulator.udid } : {});
  let captureError: string | undefined;
  if (build.success) {
    try {
      const plan = await readPlan(root);
      if (!plan || !plan.screens.some(s => s.topLevel)) throw new Error('Plan has no top-level screens');
      await launchAndCapture(root, { runner, ...(options.screenshotDelayMs !== undefined ? { screenshotDelayMs: options.screenshotDelayMs } : {}), ...(simulator ? { udid: simulator.udid } : {}) }, plan);
    } catch (e) { captureError = String(e).slice(0, 1000); }
  }
  const tests = build.success && (await readSpec(root)).tests ? await testProject(root, runner, simulator?.udid) : undefined;
  if (tests && existsSync(join(root, tests.resultBundle))) {
    const archive = `.ios-agent/logs/${tests.resultBundle.split('/').at(-1)}.zip`;
    const packed = await runner.run('ditto', ['-c', '-k', '--keepParent', join(root, tests.resultBundle), join(root, archive)], {timeoutMs: 120_000});
    if (packed.exitCode !== 0) throw new Error('Could not preserve remote xcresult bundle');
    tests.resultBundle = archive;
  } else if (tests) tests.resultBundle = 'unavailable (test process produced no xcresult bundle)';
  const fresh = (await loadState(root))!;
  const files = [];
  for (const kind of ['logs', 'screenshots']) {
    const folder = join(root, '.ios-agent', kind);
    let names: string[];
    try { names = await readdir(folder); } catch { continue; }
    for (const name of names) {
      if (!/^[\w.-]+\.(log|png|zip)$/.test(name)) continue;
      const path = `.ios-agent/${kind}/${name}`;
      await mkdir(dirname(join(output, path)), { recursive: true });
      await copyFile(join(root, path), join(output, path));
      files.push({ path, sha256: digest(await readFile(join(output, path))) });
    }
  }
  const { appPath: _app, ...portable } = build;
  const result = RemoteResult.parse({ protocol: 1, inputHash: request.inputHash, build: { ...portable, logPath: `.ios-agent/logs/${build.logPath.split(/[\\/]/).at(-1)}` }, captureError, tests, primaryCaptureDevice: fresh.primaryCaptureDevice, toolchain: fresh.toolchain, screenshots: fresh.screenshots, run: fresh.run, files });
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ buildSucceeded: build.success, screenshots: result.screenshots.length, captureError, tests, primaryCaptureDevice: fresh.primaryCaptureDevice, toolchain: result.toolchain }));
  return build.success && !captureError && (!tests || tests.status === "passed");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [root, request, output] = process.argv.slice(2);
  if (!root || !request || !output) throw new Error('remote-worker ROOT REQUEST OUTPUT');
  if (!await remoteWorker(resolve(root), resolve(request), resolve(output))) process.exitCode = 1;
}
