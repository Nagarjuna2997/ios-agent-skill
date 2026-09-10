import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
test('single connection exposes reviews, knowledge, simulator and safe app creation',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ios-unified-'));
 const client=new Client({name:'test',version:'1'});
 try {
  await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--project',root]}));
  const {tools}=await client.listTools();assert.equal(tools.length,34);assert.equal(new Set(tools.map(t=>t.name)).size,34);
  for(const name of ['analyze_swift_project','search_local_references','simulator_list','create_app'])assert.ok(tools.some(t=>t.name===name));
  const result=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Reading list with local persistence',xcodegen:true}});assert.notEqual(result.isError,true,JSON.stringify(result));
  assert.match(await readFile(join(root,'UnifiedProbe','App','APP_BRIEF.md'),'utf8'),/Reading list/);
  const again=await client.callTool({name:'create_app',arguments:{name:'UnifiedProbe',directory:root,brief:'Do not overwrite'}});assert.equal(again.isError,true);
  const refs=await client.callTool({name:'search_local_references',arguments:{query:'Persistence'}});assert.notEqual(refs.isError,true,JSON.stringify(refs));
  assert.ok((await client.listResources()).resources.length>0);
 }finally{await client.close();await rm(root,{recursive:true,force:true});}
});
