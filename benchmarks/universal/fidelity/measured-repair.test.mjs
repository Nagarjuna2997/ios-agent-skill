import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectMeasuredText,compareSizeRepairs,combineSizeDecisions} from './measured-repair.mjs';
const ir={nodes:[{id:'node-9',kind:'text',style:{fontSize:34}},{id:'node-20',kind:'disclosure',style:{fontSize:20}}]};
const measurements=(error,changed,mismatches)=>Object.fromEntries(['large','xxxl'].map(size=>[size,{
 referenceHash:'ref-'+size,pins:{size},typography:{status:mismatches?'failed':'passed',mismatches,regions:[{id:'node-9',mismatches},{id:'node-20',mismatches:5}]},meanError:error,changedFraction:changed}]));
const policy={maxMeanError:.02,maxChangedFraction:.1,maxLineBreakMismatches:0,minimumImprovement:.001};
test('chooses measured text regions by traced identity and fails closed for missing typography',()=>{
 const a=measurements(.018,.07,2);assert.deepEqual(selectMeasuredText(ir,a),['node-9']);
 a.xxxl.typography.mismatches=null;assert.deepEqual(selectMeasuredText(ir,a),[]);
});
test('one improving size cannot hide regression or insufficient evidence at the other size',()=>{
 const a=measurements(.018,.07,2),b=measurements(.014,.06,0);
 assert.equal(compareSizeRepairs(a,b,policy).outcome,'passed');
 b.xxxl.meanError=.02;assert.equal(compareSizeRepairs(a,b,policy).outcome,'rejected');
 b.xxxl.referenceHash='different';assert.equal(compareSizeRepairs(a,b,policy).outcome,'requires-review');
});
test('missing pixels, changed pins and unavailable observations cannot pass', () => {
 const a=measurements(.018,.07,2), b=measurements(.014,.06,0);
 b.xxxl.meanError=NaN;
 assert.equal(compareSizeRepairs(a,b,policy).outcome,'requires-review');
 b.xxxl.meanError=.014; b.xxxl.pins={appearance:'dark'};
 assert.equal(compareSizeRepairs(a,b,policy).outcome,'requires-review');
 b.large.typography.status='unavailable';
 assert.deepEqual(selectMeasuredText(ir,b),[]);
});

test('improved pixels cannot override the independent native and reference gates', () => {
  const passed = {outcome: 'accepted', reasons: []};
  const pixels = {outcome: 'passed', reasons: []};
  for (const reason of ['accessibility failed', 'functionality failed']) {
    const failed = {outcome: 'rejected', reasons: [reason]};
    assert.deepEqual(combineSizeDecisions(passed, failed, pixels),
      {outcome: 'rejected', reasons: ['XXXL: ' + reason]});
  }
  assert.equal(combineSizeDecisions(passed, {outcome:'requires-review', reasons:['approval missing']}, pixels).outcome, 'requires-review');
  assert.equal(combineSizeDecisions(passed, passed, pixels).outcome, 'accepted');
});
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sharedVerifierInputs, readCaptureSize} from './capture-contract.mjs';

test('changing the test scheme helper changes the checkpoint contract input', async t => {
  const root = await mkdtemp(join(tmpdir(), 'scheme-contract-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  const directory = join(root, 'benchmarks/universal/native-behavior');
  await mkdir(directory, {recursive:true});
  const helper = join(directory, 'ui-test-scheme.mjs');
  await writeFile(helper, 'first scheme');
  const first = await sharedVerifierInputs(root);
  await writeFile(helper, 'second scheme');
  assert.notDeepEqual(await sharedVerifierInputs(root), first);
});
test('a capture cannot be labeled XXXL when the simulator reports Large', async () => {
  await assert.rejects(readCaptureSize(async () => 'large\n', 'test-device', 'extra-extra-extra-large'), /simulator reports large/);
  assert.equal(await readCaptureSize(async (name, args) => {
    assert.equal(name, 'xcrun');
    assert.deepEqual(args, ['simctl','ui','test-device','content_size']);
    return 'extra-extra-extra-large\n';
  }, 'test-device', 'extra-extra-extra-large'), 'extra-extra-extra-large');
});
