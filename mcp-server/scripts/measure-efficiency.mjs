import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Component measurement only: no model calls, no estimated token/cost savings.
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {PROFILES} from '../dist/efficiency/registry.js';
const results=[];
for(const profile of Object.keys(PROFILES)){
 const client=new Client({name:'efficiency-measurement',version:'1'});const start=performance.now();
 try{await client.connect(new StdioClientTransport({command:process.execPath,args:['dist/unified.js','--tool-profile',profile],stderr:'pipe'}));const {tools}=await client.listTools();results.push({profile,tools:tools.length,schemaBytes:Buffer.byteLength(JSON.stringify(tools)),connectionMs:Math.round(performance.now()-start),modelTokens:null,cost:null});}finally{await client.close();}
}
const registrySha256=createHash('sha256').update(await readFile(new URL('../src/efficiency/registry.ts',import.meta.url))).digest('hex');
console.log(JSON.stringify({registrySha256,kind:'component-schema-measurement',node:process.version,results,notice:'Serialized UTF-8 schema bytes, not token usage. Connection includes all child discovery. No scored model comparison performed.'},null,2));
