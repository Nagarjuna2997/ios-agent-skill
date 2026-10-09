import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PlanSchema} from '../dist/agent/plan.js';
import {VisualAssessmentSchema, visualInputs, reviewVisualRound} from '../dist/agent/visual-review.js';
import {newRunState} from '../dist/agent/state.js';
import {ClaudeCodeBrain} from '../dist/agent/brain.js';
const plan=PlanSchema.parse({appName:'DemoApp',displayName:'Demo',summary:'Demo',navigation:'stack',screens:[{id:'home',title:'Home',purpose:'Dashboard',topLevel:true}]});
const pass={verdict:'pass',findings:[],limitations:['VoiceOver untested']};
async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'visual-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const state=newRunState({description:'test',projectDir:root});
 await mkdir(join(root,'shots'));
 const png=Buffer.from('89504e470d0a1a0a'+'00'.repeat(40),'hex');
 for(const variant of ['light','dark','xxl']){const path=`shots/${variant}.png`;await writeFile(join(root,path),png);state.screenshots.push({screen:'home',variant,path});}
 return {root,state};
}
test('design alternatives validate IDs, count and selection',()=>{
 const directions=['calm','bold'].map(id=>({id,name:id,rationale:'A distinct direction',design:plan.design}));
 assert.equal(PlanSchema.parse({...plan,designDirections:directions}).selectedDesign,undefined);
 assert.throws(()=>PlanSchema.parse({...plan,designDirections:directions,selectedDesign:'missing'}));
 assert.throws(()=>PlanSchema.parse({...plan,designDirections:[directions[0]]}));
 assert.throws(()=>PlanSchema.parse({...plan,designDirections:[directions[0],directions[0]]}));
});
test('contradictory visual verdicts are rejected',()=>{
 assert.throws(()=>VisualAssessmentSchema.parse({...pass,verdict:'needs_changes'}));
 assert.throws(()=>VisualAssessmentSchema.parse({...pass,findings:[{variant:'light',category:'layout',observation:'Clipped title',repair:'Wrap title'}]}));
 assert.equal(VisualAssessmentSchema.parse({...pass,verdict:'unknown'}).verdict,'unknown');
});
test('matrix requires all variants and rejects external symlinks',async t=>{
 const {root,state}=await fixture(t); assert.equal((await visualInputs(root,plan,state))[0].images.length,3);
 await assert.rejects(visualInputs(root,plan,{...state,screenshots:state.screenshots.slice(1)}),/missing/);
 await rm(join(root,'shots/light.png'));await symlink('/etc/hosts',join(root,'shots/light.png'));
 await assert.rejects(visualInputs(root,plan,state),/escapes/);
});
test('review persists per screen and reuses only matching content hashes',async t=>{
 const {root,state}=await fixture(t);let calls=0;
 const review=async()=>{calls++;return pass;};
 const first=await reviewVisualRound(root,plan,[],state,review);
 assert.equal(first.status,'pass');assert.equal(calls,1);
 await reviewVisualRound(root,plan,[],state,review);assert.equal(calls,1);
 const changed=await reviewVisualRound(root,plan,[{path:'DemoApp/Views/A.swift',content:'changed'}],state,review);
 assert.notEqual(changed.key,first.key);assert.equal(calls,2);
 assert.equal(JSON.parse(await readFile(join(root,`.ios-agent/design-reviews/${first.key}/review.json`),'utf8')).status,'pass');
});
test('provider failure resumes successful screen cells without losing evidence',async t=>{
 const {root,state}=await fixture(t);
 const second={...plan.screens[0],id:'second'};const two={...plan,screens:[...plan.screens,second]};
 state.screenshots.push(...state.screenshots.map(s=>({...s,screen:'second'})));
 let count=0;await assert.rejects(reviewVisualRound(root,two,[],state,async()=>{if(++count===2)throw Error('provider unavailable');return pass;}),/unavailable/);
 const resumed=[];const result=await reviewVisualRound(root,two,[],state,async i=>{resumed.push(i.screen.id);return pass;});
 assert.deepEqual(resumed,['second']);assert.equal(result.status,'pass');
});
test('Claude receives image blocks via stdin without image data in arguments',async()=>{
 let seen;
 const brain=new ClaudeCodeBrain({runner:{async run(command,args,options){seen={command,args,options};return {exitCode:0,stdout:JSON.stringify({type:'result',result:JSON.stringify(pass)})+'\n'};}}});
 await brain.reviewDesign({plan,screen:plan.screens[0],images:[{variant:'light',sha256:'abc',data:'aW1hZ2U='}]});
 const input=JSON.parse(seen.options.input);assert.equal(input.message.content[1].type,'image');assert.equal(input.message.content[1].source.data,'aW1hZ2U=');
 assert.ok(!seen.args.join(' ').includes('aW1hZ2U='));assert.ok(seen.args.includes('stream-json'));
});

test('MCP design evidence returns actual images and rejects stale source',async t=>{
 const {fakeXcode}=await import('./helpers/fake-xcode.js');
 const {ProcessRunner}=await import('../dist/agent/runner.js');
 const {writePlan,createProject,recordedBuild}=await import('../dist/agent/workspace.js');
 const {launchAndCapture}=await import('../dist/agent/loop.js');
 const {registerAgentTools}=await import('../dist/agent/tools.js');
 const fake=await fakeXcode(t);const root=join(fake.root,'app');const runner=new ProcessRunner({...process.env,...fake.env});
 await writePlan(root,plan);await createProject({projectDir:root,name:'DemoApp'},runner);await recordedBuild(root,runner);await launchAndCapture(root,{runner,screenshotDelayMs:0},plan);
 const handlers=new Map();registerAgentTools({registerTool(name,_definition,handler){handlers.set(name,handler);}},()=>runner);
 const handler=handlers.get('ios_design_evidence');const result=await handler({projectDir:root,screen:'home',capture:false});
 assert.notEqual(result.isError,true,JSON.stringify(result));assert.equal(result.content.filter(c=>c.type==='image').length,3);
 await writeFile(join(root,'DemoApp/Views/RootView.swift'),'struct RootView { let changed = true }');
 const stale=await handler({projectDir:root,screen:'home',capture:false});assert.equal(stale.isError,true);assert.match(stale.content[0].text,/stale/);
});
