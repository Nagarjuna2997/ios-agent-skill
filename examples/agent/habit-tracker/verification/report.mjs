// Export the same planned checkpoints used by /ios-build from a preserved result bundle.
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { ProcessRunner } from '../../../../mcp-server/dist/agent/runner.js';
import { collectJourneyScreenshots } from '../../../../mcp-server/dist/agent/journey-evidence.js';
import { classifyTestSummary } from '../../../../mcp-server/dist/agent/testing.js';

const bundle = resolve(process.argv[2]);
const plan = JSON.parse(await readFile(new URL('../.ios-agent/plan.json', import.meta.url), 'utf8'));
const runner = new ProcessRunner();
const summary = await runner.run('xcrun', ['xcresulttool', 'get', 'test-results', 'summary', '--path', bundle]);
if (summary.exitCode !== 0) throw new Error('No XCTest results in ' + bundle);
const value = JSON.parse(summary.stdout);
const result = classifyTestSummary(value.result === 'Passed' ? 0 : 1, value);
const output = await mkdtemp(resolve(dirname(bundle), 'habit-journey-evidence-'));
const images = await collectJourneyScreenshots(output, relative(output, bundle), 'habit', plan.journeys, runner);
const expected = plan.journeys.reduce((n, j) => n + j.steps.length, 0);
const complete = result.status === 'passed' && images.length === expected;
const report = [
  '# Habit Tracker simulator journey', '',
  `Test result: ${result.status}. ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped.`,
  `Checkpoint images: ${images.length}/${expected}. Journey evidence: ${complete ? 'complete' : 'incomplete'}.`,
  `Result bundle: ${basename(bundle)}.`,
  ...(value.devicesAndConfigurations ?? []).map(d => `Device: ${d.device.deviceName}, ${d.device.osVersion}.`),
  '', ...images.map(i => `- [${i.step}](${i.path})`), '',
];
await writeFile(resolve(output, 'RUN_REPORT.md'), report.join('\n'));
console.log(resolve(output, 'RUN_REPORT.md'));
if (!complete) process.exitCode = 1;
