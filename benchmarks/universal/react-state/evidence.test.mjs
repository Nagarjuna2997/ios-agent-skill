import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Checkpoints} from '../../../mcp-server/dist/app-ir/checkpoints.js';
import {testEvidence,verifyNativeSizes} from './evidence.mjs';
async function setup(t){
 const root=await mkdtemp(join(tmpdir(),'state-evidence-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'result.xcresult'));await writeFile(join(root,'result.xcresult','data'),'native result');await writeFile(join(root,'test.log'),'3 tests passed');
 const files=async dir=>(await readdir(dir)).map(name=>join(dir,name));
 let runs=0;const journal=new Checkpoints(root,'pinned-test-contract');
 return {root,journal,runs:()=>runs,options:{root,folder:root,key:'large',journal,files,
  runTests:async()=>{runs++;return {status:'passed',passed:3,failed:0,skipped:0,logPath:'test.log',resultBundle:'result.xcresult'};},record:async()=>{},
  exportAttachments:async(bundle,dest)=>{await mkdir(dest);await writeFile(join(dest,'screenshot.png'),'synthetic test artifact');},
 }};
}
test('completed native cells resume without rerunning tests, preserving result and attachment hashes',async t=>{
 const context=await setup(t),first=await testEvidence(context.options);assert.deepEqual(await testEvidence(context.options),first);assert.equal(context.runs(),1);
 const checkpoint=JSON.parse(await readFile(join(context.root,'checkpoints/large.json'),'utf8'));
 assert.ok(checkpoint.payload.artifacts.some(a=>a.file==='result.xcresult/data'));
 assert.ok(checkpoint.payload.artifacts.some(a=>a.file.endsWith('screenshot.png')));
});
test('tampered raw xcresult blocks resume instead of trusting a passed summary',async t=>{
 const context=await setup(t);await testEvidence(context.options);await writeFile(join(context.root,'result.xcresult/data'),'changed');
 await assert.rejects(testEvidence(context.options),/Artifact changed/);assert.equal(context.runs(),1);
});
test('failed, skipped and malformed summaries never become completed native cells',async t=>{
 const context=await setup(t);
 for(const changed of [{status:'unavailable'},{status:'failed'},{skipped:1},{passed:0},{passed:undefined},{passed:'3'},{passed:Infinity},{failed:1}]){
  const options={...context.options,runTests:async()=>({...await context.options.runTests(),...changed})};
  await assert.rejects(testEvidence(options),/failed or unavailable/);
 }
 await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
});
test('a crash after export creates a new attachment destination on retry',async t=>{
 const context=await setup(t),destinations=[];
 const exportAttachments=async(bundle,dest)=>{destinations.push(dest);await context.options.exportAttachments(bundle,dest);if(destinations.length===1)throw Error('interrupted');};
 await assert.rejects(testEvidence({...context.options,exportAttachments}),/interrupted/);
 await testEvidence({...context.options,exportAttachments});assert.equal(context.runs(),2);assert.notEqual(destinations[0],destinations[1]);
});
test('a reduced passing subset cannot satisfy the declared fixture test count',async t=>{
 const context=await setup(t);
 await assert.rejects(testEvidence({...context.options,expectedTests:4}),/test count differs/);
 await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
 await testEvidence({...context.options,expectedTests:3});
});
test('failed native tests export reviewable captures but cannot checkpoint a pass',async t=>{
 const context=await setup(t),records=[];
 await assert.rejects(testEvidence({...context.options,runTests:async()=>({...await context.options.runTests(),status:'failed',passed:2,failed:1}),record:async(tests,artifacts)=>records.push({tests,...artifacts})}),/failed or unavailable/);
 const last=records.at(-1);assert.equal(last.tests.failed,1);assert.ok(last.attachments);
 assert.equal(await readFile(join(last.attachments,'screenshot.png'),'utf8'),'synthetic test artifact');
 await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
});
test('missing or failed exports stay explicit and never mask failed test outcomes',async t=>{
 const context=await setup(t),records=[];
 for(const bundle of ['result.xcresult',undefined]){
  await assert.rejects(testEvidence({...context.options,runTests:async()=>({...await context.options.runTests(),status:'failed',resultBundle:bundle}),exportAttachments:async()=>{throw Error('export interrupted');},record:async(tests,artifacts)=>records.push({tests,...artifacts})}),/failed or unavailable/);
  assert.match(records.at(-1).attachmentError,/export interrupted|bundle unavailable/);
 }
 await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
});

test('independent sizes retain failures while collecting and resuming a successful sibling',async t=>{
 const context=await setup(t),calls=[],failures=[];let failLarge=true;
 const run=async(key,size)=>testEvidence({...context.options,key,runTests:async()=>{calls.push([key,size]);const tests=await context.options.runTests();return failLarge&&key==='large'?{...tests,status:'failed',passed:2,failed:1}:tests;}});
 await assert.rejects(verifyNativeSizes(run,async(key,error)=>failures.push({key,message:error.message})),/size cells: large/);
 assert.deepEqual(calls.map(x=>x[0]),['large','xxxl']);assert.equal(failures[0].key,'large');
 await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
 assert.ok(JSON.parse(await readFile(join(context.root,'checkpoints/xxxl.json'),'utf8')).payload);
 failLarge=false;await verifyNativeSizes(run,async()=>assert.fail('unexpected failure'));
 assert.deepEqual(calls.map(x=>x[0]),['large','xxxl','large']);
});

test('wrapping cells require real portrait and landscape captures from the passing layout test before checkpointing',async t=>{
 const {createRequire}=await import('node:module');
 const {PNG}=createRequire(new URL('../../../mcp-server/package.json',import.meta.url))('pngjs');
 const image=(width,height)=>PNG.sync.write({width,height,data:Buffer.alloc(width*height*4,255)});
 const context=await setup(t),records=[];
 let damage='missing';
 const options={...context.options,fixture:'wrapping-chip-row',expectedTests:1,
  runTests:async()=>({...await context.options.runTests(),passed:1}),
  record:async(tests,artifacts)=>records.push(artifacts),
  exportAttachments:async(bundle,dest)=>{
   await mkdir(dest);
   const attachment=orientation=>({isAssociatedWithFailure:false,exportedFileName:orientation+'.png',suggestedHumanReadableName:orientation+'-tags_0_UUID.png'});
   const captures=[attachment('portrait'),attachment('landscape')];
   if(damage==='missing')captures.pop();
   if(damage==='failure')captures[0].isAssociatedWithFailure=true;
   if(damage==='duplicate')captures.push(captures[0]);
   if(damage==='unsafe')captures[0].exportedFileName='../portrait.png';
   const id=damage==='wrong-test'?'UnrelatedTests/test()':'WrappingRowTests/testRowsReflowAndPreserveReadingOrder()';
   await writeFile(join(dest,'manifest.json'),JSON.stringify([{testIdentifier:id,attachments:captures}]));
   await writeFile(join(dest,'portrait.png'),damage==='truncated'?image(1,2).subarray(0,33):image(1,2));
   await writeFile(join(dest,'landscape.png'),damage==='orientation'?image(1,2):image(2,1));
  }};
 for(damage of ['missing','failure','duplicate','unsafe','wrong-test','truncated','orientation']){
  await assert.rejects(testEvidence(options));
  assert.ok(records.at(-1).attachmentError,damage);
  await assert.rejects(readFile(join(context.root,'checkpoints/large.json')),/ENOENT/);
 }
 damage=undefined;
 const {attachments}=await testEvidence(options);
 assert.ok((await readdir(attachments)).includes('landscape.png'));
 assert.ok(JSON.parse(await readFile(join(context.root,'checkpoints/large.json'))).payload);
});
