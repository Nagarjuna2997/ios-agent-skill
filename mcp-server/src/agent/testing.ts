// Test results are separate from compilation. A zero-test run is never a pass.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { resolveDestination } from './build.js';
import { readSpec, projectPaths } from './project.js';
import type { CommandRunner } from './runner.js';
import { snapshotFiles, snapshotHash } from './remote.js';
import { loadState, saveState } from './state.js';

export interface TestEvidence {
  cycle?: number; sourceHash: string; at: string; status: 'passed' | 'failed' | 'unavailable';
  passed: number; failed: number; skipped: number; logPath: string; resultBundle: string; reason?: string;
}
export function classifyTestSummary(exitCode: number | null, value: unknown): Pick<TestEvidence, 'status' | 'passed' | 'failed' | 'skipped' | 'reason'> {
  const s = value as Record<string, unknown> | null;
  if (!s || !['passedTests', 'failedTests', 'skippedTests'].every(k => Number.isInteger(s[k]) && Number(s[k]) >= 0)) return {status: exitCode === 0 ? 'unavailable' : 'failed', passed: 0, failed: 0, skipped: 0, reason: 'No readable xcresult test summary'};
  const passed = Number(s.passedTests), failed = Number(s.failedTests), skipped = Number(s.skippedTests);
  return {status: exitCode === 0 && passed > 0 && failed === 0 && skipped === 0 ? 'passed' : 'failed', passed, failed, skipped, ...(passed === 0 ? {reason: 'No passing tests recorded'} : {})};
}
export async function testProject(root: string, runner: CommandRunner, udid?: string): Promise<TestEvidence> {
  const spec = await readSpec(root);
  if (!spec.tests) throw new Error('Project has no configured test targets');
  const sourceHash = snapshotHash(await snapshotFiles(root));
  const id = randomUUID();
  const logPath = `.ios-agent/logs/test-${id}.log`, resultBundle = `.ios-agent/test-results/${id}.xcresult`;
  await mkdir(join(root, '.ios-agent/test-results'), {recursive: true});
  await mkdir(projectPaths(root).logs, {recursive: true});
  const destination = await resolveDestination(runner, udid);
  if (destination.startsWith('generic/')) throw new Error('Tests need an available simulator');
  const before = await loadState(root);
  if (before && (before.tests ?? []).filter(t => t.cycle === before.cycle).length >= 3) throw new Error("Test attempt cap reached for this cycle");
  const timeoutMs = Math.min(15 * 60_000, before ? Date.parse(before.deadlineAt) - Date.now() : 15 * 60_000);
  if (timeoutMs <= 0) throw new Error("Test wall-clock budget exhausted");
  const result = await runner.run('xcodebuild', ['-project', `${spec.name}.xcodeproj`, '-scheme', spec.name, '-configuration', 'Debug', '-destination', destination, '-derivedDataPath', projectPaths(root).derivedData, '-resultBundlePath', join(root, resultBundle), 'CODE_SIGNING_ALLOWED=NO', 'test'], {cwd: root, timeoutMs});
  await writeFile(join(root, logPath), result.stdout + '\n' + result.stderr);
  const summary = await runner.run('xcrun', ['xcresulttool', 'get', 'test-results', 'summary', '--path', join(root, resultBundle)], {cwd: root, timeoutMs: 60_000});
  let value: unknown;
  if (summary.exitCode === 0) { try { value = JSON.parse(summary.stdout); } catch { /* unknown, not passed */ } }
  const evidence: TestEvidence = {...(before ? {cycle:before.cycle} : {}), sourceHash, at: new Date().toISOString(), logPath, resultBundle, ...classifyTestSummary(result.exitCode, value)};
  if (snapshotHash(await snapshotFiles(root)) !== sourceHash) { evidence.status = 'unavailable'; evidence.reason = 'Source changed during test execution'; }
  const state = await loadState(root);
  if (state) { state.tests = [...(state.tests ?? []), evidence]; await saveState(root, state); }
  return evidence;
}

/** Deterministic screen smoke checks; the model cannot silently omit a screen. */
export function screenSmokeTests(screens: Array<{id: string}>): string {
  const methods = screens.map(screen => `    func test_${screen.id.replaceAll('-', '_')}() throws {
        for orientation in [UIDeviceOrientation.portrait, .landscapeLeft] {
            XCUIDevice.shared.orientation = orientation
            let app = XCUIApplication()
            app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", ${JSON.stringify(screen.id)}]
            app.launch()
            XCTAssertTrue(app.descendants(matching: .any).matching(identifier: ${JSON.stringify('screen-' + screen.id)}).firstMatch.waitForExistence(timeout: 15), "Planned screen must be visible")
            app.terminate()
        }
    }`).join('\n');
  return `import XCTest\nimport UIKit\n\n@MainActor final class PlannedScreenTests: XCTestCase {\n    override func tearDown() { XCUIDevice.shared.orientation = .portrait; super.tearDown() }\n${methods}\n}\n`;
}
