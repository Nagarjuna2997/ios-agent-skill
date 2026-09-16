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
  await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--project',root],env:{...process.env,HOME:root,USERPROFILE:root}}));
  const {tools}=await client.listTools();assert.equal(tools.length,37);assert.equal(new Set(tools.map(t=>t.name)).size,37);
  for(const name of ['analyze_swift_project','search_local_references','simulator_list','create_app'])assert.ok(tools.some(t=>t.name===name));
  const privatePreview=await client.callTool({name:'private_feedback',arguments:{action:'preview',report:{feature:'installation',symptom:'timeout'}}});
  assert.equal(JSON.parse(privatePreview.content[0].text).status,'not-configured');
  const preview=await client.callTool({name:'prepare_issue_report',arguments:{feature:'installation',symptom:'timeout'}});
  assert.equal(JSON.parse(preview.content[0].text).submitted,false);
  const rejected=await client.callTool({name:'prepare_issue_report',arguments:{feature:'installation',symptom:'timeout',logs:'PRIVATE_SENTINEL'}});
  assert.equal(rejected.isError,true);assert.ok(!JSON.stringify(rejected).includes('PRIVATE_SENTINEL'));
  const result=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Reading list with local persistence',xcodegen:true}});assert.notEqual(result.isError,true,JSON.stringify(result));
  assert.match(await readFile(join(root,'UnifiedProbe','App','APP_BRIEF.md'),'utf8'),/Reading list/);
  const again=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Do not overwrite'}});assert.equal(again.isError,true);
  assert.match(again.content.at(-1).text,/Developer workflow for this failed operation/);
  assert.match(again.content.at(-1).text,/not confirmation of a public report/);
  assert.ok(again.content.length>1,'original diagnostic remains before guidance');
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
