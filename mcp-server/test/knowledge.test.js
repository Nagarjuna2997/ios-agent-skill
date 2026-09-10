import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { searchTechnologies, lookupTechnology, lookupUpdates, appPlan, iconPlan } from '../dist/knowledge.js';

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
    assert.equal(list.tools.length,5);
    for(const tool of list.tools) assert.equal(tool.annotations.readOnlyHint,true);
    const response=await client.callTool({name:'search_apple_technologies',arguments:{query:'XPC'}});
    assert.equal(JSON.parse(response.content[0].text).results[0].name,'XPC');
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
    assert.equal((await client.listTools()).tools.length,5);
    const response=await client.callTool({name:'get_apple_technology',arguments:{id:'accelerate'}});
    assert.equal(JSON.parse(response.content[0].text).name,'Accelerate');
    const absent=await client.callTool({name:'get_apple_technology',arguments:{id:'../../etc/passwd'}});
    assert.match(JSON.parse(absent.content[0].text).error,/not found/);
  } finally { await client?.close();child.kill('SIGTERM'); }
});
