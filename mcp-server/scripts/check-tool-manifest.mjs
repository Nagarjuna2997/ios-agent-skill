import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
const client=new Client({name:'manifest-check',version:'1'});
try {
 await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js']}));
 const {tools}=await client.listTools();
 const manifest=JSON.parse(await readFile('mcp.json','utf8'));
 assert.deepEqual(tools.map(t=>t.name).sort(),manifest.tools.map(t=>t.name).sort());
 console.log(`OK - manifest matches ${tools.length} registered tools`);
} finally {await client.close();}
