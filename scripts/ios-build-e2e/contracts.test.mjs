import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validatePins, validatePlan, classify, artifact, hash, verifyEvidence } from './contracts.mjs';
const pins = {commit:'a'.repeat(40),model:'claude-sonnet-4-5-20250929',xcode:'26.5',sdk:'26.5',runtime:'com.apple.CoreSimulator.SimRuntime.iOS-26-5',claude:'2.1.296'};
test('requires complete explicit model/client/toolchain pins',()=>{
  validatePins(pins);
  for(const key of Object.keys(pins)) assert.throws(()=>validatePins({...pins,[key]:undefined}));
  for(const model of ['sonnet','claude-sonnet-latest','']) assert.throws(()=>validatePins({...pins,model}));
  assert.throws(()=>validatePins({...pins,commit:'main'}));
});
test('rejects account/network modules at plan and screen level',()=>{
  validatePlan({screens:[{topLevel:true}],capabilities:[{id:'design-system'}]});
  assert.throws(()=>validatePlan({screens:[{topLevel:true,capabilities:['firebase-auth']}]}));
  assert.throws(()=>validatePlan({screens:[{topLevel:true}],capabilities:[{id:'stripe-payments'}]}));
  assert.throws(()=>validatePlan({screens:[]}));
});
test('provider, timeout, infrastructure and incomplete runs cannot pass',()=>{
  assert.equal(classify({status:'complete'},0),'candidate_pass');
  assert.equal(classify({status:'stopped'},0),'regression');
  assert.equal(classify({status:'complete'},1),'regression');
  assert.equal(classify({failure:'Provider returned HTTP 429'},1),'provider_failure');
  assert.equal(classify({failure:'build tool itself failed'},1),'infrastructure_failure');
  assert.equal(classify({status:'complete'},0,true),'timeout');
});
async function evidence(t) {
  const root=await mkdtemp(join(tmpdir(),'ios-e2e-contract-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),Buffer.alloc(24)]);
  for(const file of ['PLAN.md','RUN_REPORT.md','test.log','tests.xcresult/Info.plist','light.png','dark.png','xxl.png']) {
    await mkdir(join(root,file,'..'),{recursive:true});await writeFile(join(root,file),file.endsWith('.png')?png:'evidence');
  }
  const state={status:'complete',cycle:1,run:{udid:'test'},builds:[{success:true}],buildSourceHash:'abc',captureSourceHash:'abc',
    tests:[{status:'passed',sourceHash:'abc',passed:2,failed:0,skipped:0,logPath:'test.log',resultBundle:'tests.xcresult'}],
    screenshots:['light','dark','xxl'].map(variant=>({screen:'home',variant,path:variant+'.png'})),
    visualReviews:[{status:'pass',cycle:1,screens:[{screen:'home',assessment:{verdict:'pass',findings:[]},images:['light','dark','xxl'].map(variant=>({variant,sha256:hash(png)}))}]}]};
  return {root,state,plan:{screens:[{id:'home',topLevel:true}]}};
}
test('accepts complete source-bound evidence',async t=>{
  const {root,state,plan}=await evidence(t);assert.equal((await verifyEvidence(root,state,plan,'abc')).length,3);
});
for(const [name,mutate] of [
 ['stale source',s=>s.buildSourceHash='old'], ['stale captures',s=>s.captureSourceHash='old'],
 ['zero tests',s=>s.tests[0].passed=0],['skipped tests',s=>s.tests[0].skipped=1],
 ['stale tests',s=>s.tests[0].sourceHash='old'],['failed tests',s=>s.tests[0].status='failed'],
 ['missing screen',s=>s.screenshots.pop()],['duplicate capture',s=>s.screenshots.push(s.screenshots[0])],
 ['unresolved visual findings',s=>s.visualReviews[0].status='needs_changes'],['wrong pixels',s=>s.visualReviews[0].screens[0].images=[]],
 ['stale review',s=>s.visualReviews[0].cycle=0],['failed build',s=>s.builds[0].success=false]
]) test(`rejects ${name}`,async t=>{const {root,state,plan}=await evidence(t);mutate(state);await assert.rejects(verifyEvidence(root,state,plan,'abc'));});
test('missing bundles and corrupt screenshots are failures',async t=>{
 const {root,state,plan}=await evidence(t);await rm(join(root,'tests.xcresult'),{recursive:true});await assert.rejects(verifyEvidence(root,state,plan,'abc'));
 await writeFile(join(root,'light.png'),'not png'); await assert.rejects(artifact(root,'missing.png'));
});
test('evidence cannot escape via traversal or symlink',async t=>{
 const {root}=await evidence(t);await assert.rejects(artifact(root,'../anything'));
 await symlink('/etc/hosts',join(root,'outside'));await assert.rejects(artifact(root,'outside'));await assert.rejects(artifact(root,'/etc/hosts'));
});
test('rejects a corrupt capture with otherwise complete evidence',async t=>{
 const {root,state,plan}=await evidence(t);await writeFile(join(root,'light.png'),'bad');await assert.rejects(verifyEvidence(root,state,plan,'abc'));
});
test('export excludes unrelated files and refuses secrets and symlinks',async t=>{
 const {exportEvidence}=await import('./export.mjs');
 const root=await mkdtemp(join(tmpdir(),'ios-e2e-export-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await writeFile(join(root,'identity.json'),'{}');await writeFile(join(root,'.env'),'private');
 await exportEvidence(root);await assert.rejects(artifact(join(root,'export'),'.env'));
 await writeFile(join(root,'result.json'),'token-test-value');await assert.rejects(exportEvidence(root,'token-test-value'));
 await rm(join(root,'result.json'));await symlink('/etc/hosts',join(root,'result.json'));await assert.rejects(exportEvidence(root));
});
test('rejected identity preserves an interrupted cell for its original pins',async t=>{
 const {finalizeResult}=await import('./contracts.mjs');const root=await mkdtemp(join(tmpdir(),'e2e-resume-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await writeFile(join(root,'identity.json'),'original');await writeFile(join(root,'checkpoint.json'),'unfinished');
 assert.equal(await finalizeResult(root,{status:'infrastructure_failure'},false),false);
 await assert.rejects(artifact(root,'result.json'));
 assert.equal((await artifact(root,'checkpoint.json')).toString(),'unfinished');
 assert.equal(await finalizeResult(root,{status:'pass'},true),true);
 assert.equal(await finalizeResult(root,{status:'regression'},true),false);
 assert.equal(JSON.parse(await artifact(root,'result.json')).status,'pass');
});
test('a fresh preflight failure is recorded without a model call',async t=>{
 const {finalizeResult}=await import('./contracts.mjs');const root=await mkdtemp(join(tmpdir(),'e2e-preflight-'));t.after(()=>rm(root,{recursive:true,force:true}));
 assert.equal(await finalizeResult(root,{status:'infrastructure_failure'},false),true);
 assert.equal(JSON.parse(await artifact(root,'result.json')).status,'infrastructure_failure');
});

test('accepts versioned Claude API IDs without dates and legacy dated IDs',()=>{
 for(const model of ['claude-opus-5-5','claude-sonnet-5-5','claude-haiku-5-5','claude-fable-5-1','claude-sonnet-4-5-20250929','claude-3-5-sonnet-20241022']) validatePins({...pins,model});
});
test('rejects shorthand, latest aliases and malformed model pins',()=>{
 for(const model of ['sonnet','opus','haiku','default','latest','claude-sonnet','claude-sonnet-latest','claude-sonnet-5-5-latest','claude-latest-5-5',' claude-sonnet-5-5','claude-sonnet-5-5\n','claude--5-5','https://example.com/model',123]) assert.throws(()=>validatePins({...pins,model}),String(model));
});
