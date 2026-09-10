import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

test('runtime tools are discoverable over stdio without Xcode execution and invalid device flags are rejected',async()=>{
  const client=new Client({name:'simulator-test',version:'1.0.0'});
  const transport=new StdioClientTransport({command:process.execPath,args:[new URL('../dist/index.js',import.meta.url).pathname]});
  try{
    await client.connect(transport);
    const tools=await client.listTools();
    assert.equal(tools.tools.length,14);
    for(const name of ['simulator_environment','simulator_show','simulator_preview_start','simulator_preview_stop']) assert.ok(tools.tools.some(t=>t.name===name));
    const invalid=await client.callTool({name:'simulator_show',arguments:{udid:'--help'}});
    assert.equal(invalid.isError,true);
  }finally{await client.close();}
});
