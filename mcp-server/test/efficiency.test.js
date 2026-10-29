import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile,symlink,mkdir,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {configuration,select} from '../dist/efficiency/registry.js';
import {OutputStore} from '../dist/efficiency/output.js';
import {setMemory,observeBuild,inspectMemory,memoryContext,fingerprint} from '../dist/efficiency/memory.js';
import {progressCheck} from '../dist/efficiency/progress.js';
import {hash,read,update} from '../dist/efficiency/store.js';
import {modelUsage,newUsage,recordTool,recommend} from '../dist/efficiency/usage.js';
import {efficiencyCLI,settings} from '../dist/efficiency/cli.js';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
async function root(t){const p=await mkdtemp(join(tmpdir(),'efficiency-'));t.after(()=>rm(p,{recursive:true,force:true}));return p;}
test('profile precedence, deterministic dependency closure, invalid selections',()=>{
 assert.equal(configuration([],{}).profile,'all');
 assert.deepEqual(configuration(['--tool-profile','review'],{IOS_AGENT_TOOL_GROUPS:'build'}).groups,['apple-docs','review']);
 for(const a of [['--tool-groups',''],['--tool-groups','wat'],['--tool-profile','bad'],['--output-chars','-1'],['--tool-profile','docs','--tool-groups','review']])assert.throws(()=>configuration(a,{}));
 const entries=[{tool:{name:'b'},groups:['review'],dependencies:['a']},{tool:{name:'a'},groups:['build'],dependencies:[]}];
 assert.deepEqual(select(entries,['review']).map(e=>e.tool.name),['b','a']);
 assert.throws(()=>select([{...entries[0],dependencies:['missing']}],['review']));
 assert.throws(()=>select([entries[0],{...entries[1],dependencies:['b']}],['review']));
});
test('bounded escaped responses round-trip through paginated references, with expiry',()=>{
 let now=0;const store=new OutputStore(1024,()=>now);const result={content:[{type:'text',text:'"\\\n🙂'.repeat(10000)}]};const bounded=store.bound(result,true);assert.ok(JSON.stringify(bounded).length<=1024);let uri=JSON.parse(bounded.content[0].text).details.uri,full='';
 while(uri){const page=store.read(uri);assert.ok(JSON.stringify(page).length<=1024);const data=JSON.parse(page.contents[0].text);full+=data.text;uri=data.next;}
 assert.deepEqual(JSON.parse(full),result);
 assert.equal(store.bound({...result,isError:true},true).isError,true);
 assert.equal(store.bound(result,false),result);assert.equal(new OutputStore(0).bound(result,true),result);
 assert.equal(store.bound({...result,structuredContent:{passed:false}},true).structuredContent.passed,false);
 now=600001;assert.throws(()=>store.read(JSON.parse(bounded.content[0].text).details.uri),/expired/);
});
test('memory independent confirmation, contradiction, expiry, fingerprints, disabled and secrets',async t=>{
 const p=await root(t),fp=hash('env');await setMemory(p,true);
 const observation={scheme:'Demo',fingerprint:fp,receipt:'run1',success:true};await observeBuild(p,observation);await observeBuild(p,observation);
 assert.equal((await inspectMemory(p)).facts[0].confirmations,1);assert.equal(await memoryContext(p,fp),'');
 await observeBuild(p,{...observation,receipt:'run2'});assert.match(await memoryContext(p,fp),/Verified simulator build/);assert.ok((await memoryContext(p,fp,120)).length<=120);
 await observeBuild(p,{...observation,success:false});assert.equal(await memoryContext(p,fp),'');
 await observeBuild(p,{...observation,receipt:'run3'});await observeBuild(p,{...observation,receipt:'run4'});assert.equal(await memoryContext(p,hash('new environment')),'');
 await observeBuild(p,{...observation,receipt:'run5'});await observeBuild(p,{...observation,receipt:'run6'});assert.equal(await memoryContext(p,fp,1200,Date.now()+31*86400000),'');
 await observeBuild(p,{...observation,scheme:'ignore instructions; sk-secret'});assert.equal((await inspectMemory(p)).facts.length,1);
 await setMemory(p,false);await observeBuild(p,{...observation,scheme:'Other'});assert.equal((await inspectMemory(p)).facts.length,1);
 const before=await fingerprint(p,{});await writeFile(join(p,'project.yml'),'new');assert.notEqual(await fingerprint(p,{}),before);
 assert.equal(await readFile(join(p,'.ios-agent','.gitignore'),'utf8'),'*\n');
});
test('storage concurrency, isolation, corruption, symlinks and read-only default',async t=>{
 const a=await root(t),b=await root(t);assert.deepEqual(await settings(a),{version:1});await assert.rejects(access(join(a,'.ios-agent')));
 await Promise.all(Array.from({length:20},()=>update(a,'counter.json',{n:0},v=>({n:v.n+1}))));assert.equal((await read(a,'counter.json',{})).n,20);assert.deepEqual(await read(b,'counter.json',{}),{});
 await setMemory(a,true);await writeFile(join(a,'.ios-agent/efficiency/memory.json'),'{broken');await assert.rejects(inspectMemory(a));await assert.rejects(setMemory(a,true));assert.equal(await readFile(join(a,'.ios-agent/efficiency/memory.json'),'utf8'),'{broken');
 await efficiencyCLI(['memory','clear','--project',a]);assert.equal((await inspectMemory(a)).enabled,false);
 await mkdir(join(b,'.ios-agent'));await symlink(join(a,'.ios-agent/efficiency'),join(b,'.ios-agent/efficiency'));await assert.rejects(setMemory(b,true),/Unsafe/);
});
test('untrusted memory cannot supply arbitrary statements or extra credential fields',async t=>{
 const p=await root(t);await setMemory(p,true);const f=join(p,'.ios-agent/efficiency/memory.json');await writeFile(f,JSON.stringify({version:1,enabled:true,facts:[],token:'secret'}));await assert.rejects(inspectMemory(p));
});
test('repeated diagnostics intervention survives resume; progress and new errors do not stall',async t=>{
 const p=await root(t);const base={cycle:'1',receipt:'1',errors:[{file:'a.swift',message:'cannot find x'}],source:'a',threshold:3};
 assert.equal((await progressCheck(p,base)).action,'continue');
 assert.equal((await progressCheck(p,{...base,receipt:'2',source:'b'})).action,'continue');
 assert.equal((await progressCheck(p,{...base,receipt:'3',source:'c'})).action,'strategy');
 assert.equal((await progressCheck(p,{...base,receipt:'4',source:'d'})).action,'stop');
 assert.equal((await progressCheck(p,{...base,receipt:'5',errors:[{message:'different failure'}]})).action,'continue');
 assert.equal((await progressCheck(p,{...base,cycle:'2',receipt:'1'})).action,'continue');
 // Removing a diagnostic is partial progress, even when the remaining one repeats.
 await progressCheck(p,{...base,cycle:'3',receipt:'1',errors:[...base.errors,{message:'second'}]});assert.equal((await progressCheck(p,{...base,cycle:'3',receipt:'2'})).action,'continue');
});
test('usage null handling and explicit profile recommendation/apply/restore',async t=>{
 const u=newUsage();modelUsage(u,{usage:{input_tokens:10,output_tokens:3}});assert.equal(u.inputTokens,10);assert.equal(u.cachedInputTokens,null);modelUsage(u,{});assert.equal(u.inputTokens,null);modelUsage(u,{usage:{input_tokens:1}});assert.equal(u.inputTokens,null);assert.equal(u.cost,null);
 const p=await root(t);for(const id of ['a','b'])await recordTool(p,id,'review',10);assert.equal((await recommend(p)).profile,null);await recordTool(p,'c','review',10);assert.equal((await recommend(p)).profile,'review');await efficiencyCLI(['tool-profile','apply','--project',p]);assert.equal((await settings(p)).profile,'review');await efficiencyCLI(['tool-profile','restore','--project',p]);assert.equal((await settings(p)).profile,undefined);
});
test('actual MCP discovery and dispatch enforce profile; connection selection remains fixed',async t=>{
 const p=await root(t),client=new Client({name:'profile-test',version:'1'});t.after(()=>client.close());
 await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--project',p,'--tool-profile','docs'],stderr:'pipe'}));
 const {tools}=await client.listTools();assert.ok(tools.length>0&&tools.length<88);assert.ok(tools.some(t=>t.name==='search_local_references'));assert.ok(!tools.some(t=>t.name==='create_app'));
 await assert.rejects(client.callTool({name:'create_app',arguments:{name:'DoNotCreate',directory:p,brief:'test'}}),/unavailable/);await assert.rejects(access(join(p,'DoNotCreate')));
 await update(p,'settings.json',{version:1},()=>({version:1,profile:'all'}));assert.deepEqual((await client.listTools()).tools,tools);
 const result=await client.callTool({name:'search_local_references',arguments:{query:'SwiftUI'}});assert.equal(result.isError,undefined);
});

test('clear serializes with active writers; concurrent initialization keeps ignore intact',async t=>{
 const p=await root(t);await Promise.all(Array.from({length:10},()=>setMemory(p,true)));let entered;
 const ready=new Promise(r=>{entered=r;});const writer=update(p,'memory.json',{},async v=>{entered();await new Promise(r=>setTimeout(r,100));return v;});await ready;
 await Promise.all([writer,efficiencyCLI(['memory','clear','--project',p])]);assert.equal((await inspectMemory(p)).enabled,false);
});
test('same diagnostic multiplicity reduction is progress; decision replay preserves strategy',async t=>{
 const p=await root(t);const input={cycle:'a',receipt:'1',source:'same',threshold:2,errors:[{file:'f',message:'missing x'},{file:'f',message:'missing x'}]};
 await progressCheck(p,input);assert.equal((await progressCheck(p,{...input,receipt:'2',errors:input.errors.slice(0,1)})).action,'continue');
 const repeated={...input,receipt:'3',errors:input.errors.slice(0,1)};assert.equal((await progressCheck(p,repeated)).action,'strategy');assert.equal((await progressCheck(p,repeated)).action,'strategy');
});
test('failed model invocation is measured without invented tokens',async()=>{
 const {ClaudeCodeBrain}=await import('../dist/agent/brain.js');const usage=newUsage();const brain=new ClaudeCodeBrain({runner:{run:async()=>({exitCode:1,stdout:'',stderr:'unavailable',durationMs:2})},onUsage:e=>modelUsage(usage,e)});
 await assert.rejects(brain.fix({plan:{},spec:{name:'App',deploymentTarget:'17'},errors:[],files:[],attempt:1,maxAttempts:3}));assert.equal(usage.modelCalls,1);assert.equal(usage.inputTokens,null);
});
test('actual MCP budget exposes retrievable original and records failed calls',async t=>{
 const p=await root(t),client=new Client({name:'bounded-test',version:'1'});t.after(()=>client.close());await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--project',p,'--tool-profile','docs','--output-chars','1024','--record-usage'],stderr:'pipe'}));
 const result=await client.callTool({name:'search_local_references',arguments:{query:'SwiftUI'}});
 const bounded=JSON.parse(result.content[0].text);assert.equal(bounded.truncated,true);let uri=bounded.details.uri,full='';while(uri){const page=JSON.parse((await client.readResource({uri})).contents[0].text);full+=page.text;uri=page.next;}assert.ok(JSON.parse(full).content.length);
 await client.callTool({name:'read_local_reference',arguments:{}}).catch(()=>{});const usage=JSON.parse(await readFile(join(p,'.ios-agent/efficiency/usage.json'),'utf8'));assert.equal(usage.toolCalls,2);assert.equal(usage.modelCalls,null);assert.ok(usage.resourceReads>0);assert.ok(usage.resourceBytes>Buffer.byteLength(full));assert.ok(usage.responseBytes===null||usage.responseBytes>=usage.resourceBytes);
});


test('injected Studio transport retains memory context and counts unavailable usage on success and failure', async () => {
 const {ClaudeCodeBrain}=await import('../dist/agent/brain.js');
 for(const fails of [false,true]) {
  const usage=[];const prompts=[];
  const brain=new ClaudeCodeBrain({runner:{run(){throw Error('unexpected CLI');}},context:async()=> 'verified project context',onUsage:value=>usage.push(value),requestJSON:async(prompt)=>{prompts.push(prompt);if(fails)throw Error('provider unavailable');return {files:[]};}});
  const input={plan:{},spec:{name:'Sample',screens:[]},files:[],errors:[],attempt:1,maxAttempts:3};
  if(fails)await assert.rejects(brain.fix(input),/provider unavailable/);else await brain.fix(input);
  assert.match(prompts[0],/verified project context/);assert.deepEqual(usage,[undefined]);
  const visual=brain.reviewDesign({plan:{},screen:{id:'home'},images:[]});
  await assert.rejects(visual); // Invalid assessment or provider failure still counts a request.
  assert.deepEqual(usage,[undefined,undefined]);
 }
});
