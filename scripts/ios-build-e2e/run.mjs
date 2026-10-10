// Real CLI acceptance, not a scored benchmark and not a fake provider.
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash, validatePins, validatePlan, classify, verifyEvidence, finalizeResult } from './contracts.mjs';
import { ProcessRunner } from '../../mcp-server/dist/agent/runner.js';
import { snapshotFiles, snapshotHash } from '../../mcp-server/dist/agent/remote.js';
const repo = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const config = JSON.parse(await readFile(new URL('./cases.json', import.meta.url), 'utf8'));
const [id, output] = process.argv.slice(2);
const fixture = config.cases.find(c => c.id === id);
if (!fixture || !output) throw new Error('Usage: node scripts/ios-build-e2e/run.mjs CASE OUTPUT');
const root = resolve(output), app = join(root, 'app');
await mkdir(root, {recursive: true});
const runner = new ProcessRunner();
const json = async (path, value) => { await writeFile(path + '.tmp', JSON.stringify(value, null, 2) + '\n'); await rename(path + '.tmp', path); };
const read = async path => { try { return JSON.parse(await readFile(path, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return undefined; throw e; } };
const command = async (cmd, args) => {
  const r = await runner.run(cmd, args, {cwd: repo, timeoutMs: 60000});
  if (r.exitCode !== 0) throw new Error(`Tool unavailable: ${cmd}`);
  return r.stdout.trim();
};
let identityAccepted = false;
let result = {protocol: config.protocol, case: id, status: 'infrastructure_failure'};
try {
  const pins = {commit: await command('git',['rev-parse','HEAD']), model: process.env.IOS_BUILD_E2E_MODEL,
    xcode: process.env.IOS_BUILD_E2E_XCODE, sdk: process.env.IOS_BUILD_E2E_SDK,
    runtime: process.env.IOS_BUILD_E2E_RUNTIME, claude: config.claudeVersion};
  validatePins(pins);
  if (await command('git',['status','--porcelain','--untracked-files=normal'])) throw new Error('Live acceptance requires a clean checkout so the commit pin identifies the executed source');
  if (process.platform !== 'darwin') throw new Error('macOS required');
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing CI provider credential');
  const actual = {xcode: await command('xcodebuild',['-version']), sdk: await command('xcrun',['--sdk','iphonesimulator','--show-sdk-version']), claude: await command('claude',['--version'])};
  if (actual.xcode.split('\n')[0] !== `Xcode ${pins.xcode}` || actual.sdk !== pins.sdk || actual.claude.split(' ')[0] !== pins.claude) throw new Error('Installed toolchain/client differs from pins');
  const devices = JSON.parse(await command('xcrun',['simctl','list','devices','available','--json']));
  const simulator = devices.devices[pins.runtime]?.find(d => d.isAvailable && /iPhone/.test(d.name));
  if (!simulator) throw new Error('Pinned simulator runtime has no available iPhone');
  const identity = hash(JSON.stringify({pins, fixture, protocol: config.protocol}));
  const previous = await read(join(root,'identity.json'));
  if (previous && previous.identity !== identity) throw new Error('Existing cell belongs to different pins or prompt; use a new output directory');
  identityAccepted = true;
  await json(join(root,'identity.json'), {identity, pins, actual, fixture, protocol: config.protocol, simulator});
  // Never silently rerun a finished failure into a passing observation.
  const completed = await read(join(root,'result.json'));
  if (completed) {
    if (completed.status === 'pass') {
      const state = await read(join(app,'.ios-agent/state.json'));
      const plan = await read(join(app,'.ios-agent/plan.json'));
      await verifyEvidence(app,state,plan,snapshotHash(await snapshotFiles(app)));
    }
    console.log(JSON.stringify(completed)); process.exit(completed.status === 'pass' ? 0 : 1);
  }
  let checkpoint = await read(join(root,'checkpoint.json'));
  // An interrupted run keeps its original external deadline on resume.
  checkpoint ??= {deadline: Date.now() + 40 * 60_000, phase: 'plan'};
  await json(join(root,'checkpoint.json'), checkpoint);
  const invoke = async args => {
    const remaining = checkpoint.deadline - Date.now();
    if (remaining <= 0) return {exitCode: null, timedOut: true, durationMs: 0};
    const r = await runner.run(process.execPath,[join(repo,'mcp-server/dist/unified.js'),'build',...args,'--out',app,'--model',pins.model,'--udid',simulator.udid,'--minutes','35','--max-attempts','4'],{cwd:repo,timeoutMs:remaining});
    // Save bounded output locally; upload only the explicitly selected evidence folder.
    const scrub = text => text.split(process.env.ANTHROPIC_API_KEY).join('[REDACTED]');
    await writeFile(join(root,`${checkpoint.phase}.log`),scrub(r.stdout + '\n' + r.stderr));
    return r;
  };
  result.status = 'regression';
  let run;
  if (checkpoint.phase === 'plan') {
    const existing = await read(join(app,'.ios-agent/state.json'));
    const instruction = `${fixture.prompt} Use only built-in Apple frameworks and default design capabilities. Do not add packages, network, accounts, signing or credentials. Generate tests. Keep the app small.`;
    run = await invoke(existing ? ['--resume','--plan-only'] : [instruction,'--plan-only']);
    const plan = await read(join(app,'.ios-agent/plan.json'));
    if (run.exitCode !== 0 || run.timedOut || !plan) {
      result.status = classify(await read(join(app,'.ios-agent/state.json')),run.exitCode,run.timedOut);
      if (result.status === 'candidate_pass') result.status = 'regression';
      throw new Error('Planning did not produce an acceptable plan');
    }
    validatePlan(plan);
    checkpoint.phase = 'build'; await json(join(root,'checkpoint.json'),checkpoint);
  }
  const plan = await read(join(app,'.ios-agent/plan.json'));
  validatePlan(plan);
  const stateBefore = await read(join(app,'.ios-agent/state.json'));
  const choose = plan.designDirections?.length && !stateBefore?.milestones?.created ? ['--design','first'] : [];
  run = await invoke(['--resume',...choose]);
  const state = await read(join(app,'.ios-agent/state.json'));
  result = {...result, identity, status: classify(state,run.exitCode,run.timedOut), builds: state?.builds?.length ?? 0,
    failedBuilds: state?.builds?.filter(b=>!b.success).length ?? 0, tests: state?.tests?.map(t=>({status:t.status,passed:t.passed,failed:t.failed,skipped:t.skipped})), elapsedMs: 40*60_000 - Math.max(0,checkpoint.deadline-Date.now())};
  if (result.status === 'candidate_pass') {
    try {
      result.screenshots = await verifyEvidence(app,state,await read(join(app,'.ios-agent/plan.json')),snapshotHash(await snapshotFiles(app)));
      result.status = 'pass';
    } catch (e) { result.status = 'regression'; result.reason = e.message; }
  }
} catch (e) { result.reason = e.message; }
if (!await finalizeResult(root,result,identityAccepted)) {
  console.error('Existing cell preserved; rejected resume: ' + (result.reason ?? result.status)); process.exit(1);
}
console.log(JSON.stringify(result,null,2));
process.exitCode = result.status === 'pass' ? 0 : 1;
