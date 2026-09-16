#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { VERSION } from './version.js';
import { withDevelopmentFeedback } from './development-feedback.js';
import { issueReportTool, prepareIssueReport } from './issue-report.js';
import { privateFeedbackTool, createPrivateFeedback } from './private-feedback.js';
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const cli = () => require.resolve('@nagarjuna2002/ios-agent/dist/index.js');
if (args.includes('--version')) console.log(VERSION);
else if (args.includes('--help')) console.log(`ios-agent-mcp ${VERSION}\nOne MCP connection: Swift reviews, Apple references, app creation and simulator tools.\nRequires Node 20+. Simulator operations require macOS/Xcode.\nUsage: ios-agent-mcp [--project PATH]\n       ios-agent-mcp new MyApp --brief "Your idea" --xcodegen\n       ios-agent-mcp loop init --project PATH --brief BRIEF.md --checks checks.json\n       ios-agent-mcp loop resume --project PATH\n       ios-agent-mcp loop status --project PATH\nThe starter requires your coding agent to implement the app features.`);
else if (args[0] === 'loop') {
  try { await (await import('./app-loop.js')).appLoop(args.slice(1)); } catch(error) { console.error(error instanceof Error?error.message:String(error));process.exitCode=1; }
}
else if ((args[0] === 'new' || args[0] === 'assets')) {
  const child = (await import('node:child_process')).spawn(process.execPath,[cli(),...args],{stdio:'inherit'});
  child.on('error',e=>{console.error(e.message);process.exitCode=1;});
  child.on('exit',code=>{process.exitCode=code ?? 1;});
} else {
  const clients: Client[] = [];
  const close = async () => { await Promise.allSettled(clients.map(c=>c.close())); };
  try {
    const paths = [fileURLToPath(new URL('./index.js',import.meta.url)),fileURLToPath(new URL('./knowledge-server.js',import.meta.url)),require.resolve('@nagarjuna2002/ios-simulator-mcp')];
    for (const [i,path] of paths.entries()) {
      const client = new Client({name:'ios-agent-unified',version:VERSION});
      clients.push(client);
      await client.connect(new StdioClientTransport({command:process.execPath,args:[path,...(i===0?args:[])],stderr:'inherit',env:Object.fromEntries(Object.entries(process.env).filter((pair): pair is [string,string]=>pair[1]!==undefined))}));
    }
    const catalog = await Promise.all(clients.map(c=>c.listTools()));
    const owners = new Map<string,Client>();
    const tools = catalog.flatMap((list,i)=>list.tools.map(tool=>{if(owners.has(tool.name))throw Error(`Duplicate tool ${tool.name}`);owners.set(tool.name,clients[i]!);return tool;}));
    tools.push({name:'create_app',description:'Create an editable Swift app starter, implementation brief and optional XcodeGen specification/icon layers. Writes a NEW project; does not implement the full app idea. Then use source retrieval, review and simulator tools to implement and verify it.',inputSchema:{type:'object',properties:{name:{type:'string'},directory:{type:'string',description:'Parent directory for the new project'},brief:{type:'string'},xcodegen:{type:'boolean',default:true}},required:['name','directory','brief'],additionalProperties:false}});
    tools.push(issueReportTool, privateFeedbackTool);
    const privateFeedback=createPrivateFeedback();
    const server = new Server({name:'ios-agent-mcp',version:VERSION},{capabilities:{tools:{},resources:{}}});
    server.setRequestHandler(ListToolsRequestSchema,async()=>({tools}));
    server.setRequestHandler(ListResourcesRequestSchema,()=>clients[0]!.listResources());
    server.setRequestHandler(ReadResourceRequestSchema,request=>clients[0]!.readResource(request.params));
    server.setRequestHandler(CallToolRequestSchema,async (request,extra)=>{
      if(request.params.name==='private_feedback') {
        try { return {content:[{type:'text',text:JSON.stringify(await privateFeedback(request.params.arguments),null,2)}]}; }
        catch { return {isError:true,content:[{type:'text',text:'Private feedback rejected. Use a valid configured destination and preview, then obtain explicit approval. No arbitrary text or diagnostics accepted.'}]}; }
      }
      if(request.params.name==='prepare_issue_report') {
        try { return {content:[{type:'text',text:JSON.stringify(prepareIssueReport(request.params.arguments),null,2)}]}; }
        catch { return {isError:true,content:[{type:'text',text:'Invalid report categories. Free text, logs, source, paths and credentials are not accepted.'}]}; }
      }
      if(request.params.name==='create_app') {
        try {
          const input=z.object({name:z.string().min(1),directory:z.string().min(1),brief:z.string().min(1),xcodegen:z.boolean().default(true)}).strict().parse(request.params.arguments);
          const result=await promisify(execFile)(process.execPath,[cli(),'new',input.name,'--into',input.directory,'--brief',input.brief,...(input.xcodegen?['--xcodegen']:[])],{timeout:30000,maxBuffer:1024*1024});
          return {content:[{type:'text',text:result.stdout || 'App starter created.'}]};
        } catch(error) {return withDevelopmentFeedback({isError:true,content:[{type:'text',text:error instanceof Error?error.message:String(error)}]});}
      }
      const owner=owners.get(request.params.name);
      if(!owner)throw Error('Unknown tool');
      const result=await owner.callTool(request.params,undefined,{timeout:21*60*1000,signal:extra.signal});
      return withDevelopmentFeedback(result);
    });
    process.once('SIGINT',()=>{void close().finally(()=>process.exit(0));});
    process.once('SIGTERM',()=>{void close().finally(()=>process.exit(0));});
    server.onclose=()=>{void close();};
    await server.connect(new StdioServerTransport());
  } catch(error) {await close();throw error;}
}
