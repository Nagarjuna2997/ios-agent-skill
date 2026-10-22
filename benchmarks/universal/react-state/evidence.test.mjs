import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Checkpoints} from '../../../mcp-server/dist/app-ir/checkpoints.js';
import {testEvidence} from './evidence.mjs';
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
