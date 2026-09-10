import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { searchTechnologies, lookupTechnology, lookupUpdates, appPlan, iconPlan, searchLocalReferences, readLocalReference, referenceOutline, technologyOverview } from '../dist/knowledge.js';

test('exact technology lookup and source-backed guide, no arbitrary file access',()=>{
  assert.equal(searchTechnologies('XPC',5)[0].name,'XPC');
  assert.equal(searchTechnologies('Accelerate',5)[0].id,'accelerate');
  assert.match(lookupTechnology('xpc').guideText,/XPCListener/);
  assert.match(lookupTechnology('../../.npmrc').error,/not found/);
});
test('updates and icon layers are available offline and labelled honestly',()=>{
  assert.ok(lookupUpdates('Swift',10).results.length);
  const icon=iconPlan('Books','Open book');
  assert.equal(new Set(icon.groups.map(g=>g.file)).size,3);
  assert.match(icon.guidance,/Icon Composer/);
});
test('brief is data, never concatenated shell syntax',()=>{
  const brief='Build a list; $(touch /tmp/unwanted)';
  const plan=appPlan('SafeApp',brief);
  assert.equal(plan.scaffold.args[plan.scaffold.args.indexOf('--brief')+1],brief);
  assert.throws(()=>appPlan('../escape','brief'));
  for(const name of ['Con','NUL','COM1','lpt9']) assert.throws(()=>appPlan(name,'brief'));
  assert.equal(appPlan('Books','reading tracker').name,'Books');
  assert.match(plan.status,/not an app already built/);
});
test('knowledge server supports real MCP stdio discovery and calls',async()=>{
  const transport=new StdioClientTransport({command:process.execPath,args:[new URL('../dist/knowledge-server.js',import.meta.url).pathname]});
  const client=new Client({name:'knowledge-test',version:'1.0.0'});
  try {
    await client.connect(transport);
    const list=await client.listTools();
    assert.equal(list.tools.length,8);
    for(const tool of list.tools) assert.equal(tool.annotations.readOnlyHint,true);
    const response=await client.callTool({name:'search_apple_technologies',arguments:{query:'XPC'}});
    assert.equal(JSON.parse(response.content[0].text).results[0].name,'XPC');
    const local=await client.callTool({name:'read_local_reference',arguments:{path:'samples/SkillPatterns/Sources/SkillPatterns/Persistence.swift',maxChars:100}});
    const page=JSON.parse(local.content[0].text);
    assert.equal(page.content.length,100);
    assert.equal(page.nextOffset,100);
    const invalid=await client.callTool({name:'plan_ios_app',arguments:{name:'../escape',brief:'hello'}});
    assert.equal(invalid.isError,true);
  } finally { await client.close(); }
});
test('knowledge server supports real stateless HTTP MCP and health',async()=>{
  const child=spawn(process.execPath,[new URL('../dist/knowledge-server.js',import.meta.url).pathname,'--http','--port','0'],{stdio:['ignore','pipe','pipe']});
  let client;
  try {
    const port=await new Promise((resolve,reject)=>{
      let output='';const timeout=setTimeout(()=>reject(new Error('HTTP startup timeout: '+output)),10000);
      child.once('exit',code=>{clearTimeout(timeout);reject(new Error('HTTP server exited '+code+output));});
      child.stderr.on('data',data=>{output+=data;const match=output.match(/listening on (\d+)/);if(match){clearTimeout(timeout);resolve(Number(match[1]));}});
    });
    const base=`http://127.0.0.1:${port}`;
    assert.equal((await (await fetch(base+'/health')).json()).mode,'public-reference-only');
    client=new Client({name:'http-test',version:'1.0.0'});
    await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp')));
    assert.equal((await client.listTools()).tools.length,8);
    const response=await client.callTool({name:'get_apple_technology',arguments:{id:'accelerate'}});
    assert.equal(JSON.parse(response.content[0].text).name,'Accelerate');
    const absent=await client.callTool({name:'get_apple_technology',arguments:{id:'../../etc/passwd'}});
    assert.match(JSON.parse(absent.content[0].text).error,/not found/);
  } finally { await client?.close();child.kill('SIGTERM'); }
});

// Read actual reusable source rather than a guide full of external links.
test('local source retrieval reconstructs complete files without duplicate or missing characters',()=>{
  const matches=searchLocalReferences('Persistence',8,'source');
  const path='samples/SkillPatterns/Sources/SkillPatterns/Persistence.swift';
  assert.ok(matches.some(f=>f.path===path));
  let offset=0, source='';
  do {
    const page=readLocalReference(path,offset,97);
    assert.ok(page.content.length<=97);
    assert.equal(page.offset,offset);
    source+=page.content;
    offset=page.nextOffset;
  } while(offset!==null);
  assert.equal(source,readLocalReference(path,0,16000).content);
  assert.match(source,/@ModelActor/);
  assert.match(readLocalReference('../../.npmrc').error,/Unknown/);
  assert.match(readLocalReference(path,-1).error,/offset/);
  assert.match(readLocalReference(path,0,16001).error,/maxChars/);
});
test('overview avoids the full guide and headings point into exact local content',()=>{
  const overview=technologyOverview('accelerate');
  assert.equal(overview.guideText,undefined);
  assert.ok(JSON.stringify(overview).length<JSON.stringify(lookupTechnology('accelerate')).length);
  const outline=referenceOutline(overview.guide);
  assert.ok(outline.headings.length>0);
  for(const heading of outline.headings) {
    assert.match(readLocalReference(overview.guide,heading.offset,1000).content,/^#/);
  }
});
