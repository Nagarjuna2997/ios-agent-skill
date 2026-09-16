import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
test('single connection exposes reviews, knowledge, simulator and safe app creation',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ios-unified-'));
 const client=new Client({name:'test',version:'1'});
 try {
  await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--project',root]}));
  const {tools}=await client.listTools();assert.equal(tools.length,35);assert.equal(new Set(tools.map(t=>t.name)).size,35);
  for(const name of ['analyze_swift_project','search_local_references','simulator_list','create_app'])assert.ok(tools.some(t=>t.name===name));
  const result=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Reading list with local persistence',xcodegen:true}});assert.notEqual(result.isError,true,JSON.stringify(result));
  assert.match(await readFile(join(root,'UnifiedProbe','App','APP_BRIEF.md'),'utf8'),/Reading list/);
  const again=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Do not overwrite'}});assert.equal(again.isError,true);
  const refs=await client.callTool({name:'search_local_references',arguments:{query:'Persistence'}});assert.notEqual(refs.isError,true,JSON.stringify(refs));
  await writeFile(join(root,'Book.swift'),'import AppIntents\nstruct Book: AppEntity { let id: String }');
  const review=await client.callTool({name:'review_app_intents',arguments:{path:root,appleIntelligence:true,onscreenContent:true}});
  assert.notEqual(review.isError,true,JSON.stringify(review));
  const rules=review.structuredContent.issues.map(i=>i.rule);
  assert.ok(rules.includes('app-entity-schema-review'));
  assert.ok(rules.includes('onscreen-entity-association-review'));
  const ordinary=await client.callTool({name:'review_app_intents',arguments:{path:root}});
  assert.equal(ordinary.structuredContent.issues.length,0);
  assert.ok((await client.listResources()).resources.length>0);
 }finally{await client.close();await rm(root,{recursive:true,force:true});}
});
