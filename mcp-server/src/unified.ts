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
import { groupFor, select, type Entry } from './efficiency/registry.js';
import { OutputStore } from './efficiency/output.js';
import { newUsage, recordTool, saveUsage } from './efficiency/usage.js';
import { effectiveConfiguration, efficiencyCLI } from './efficiency/cli.js';
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const cli = () => require.resolve('@nagarjuna2002/ios-agent/dist/index.js');
// Build and ship have their own --help; for every other command --help prints this text and runs nothing
// (before, `install-command --help` installed the file and `preflight --help` ran the checks).
const helpAware = new Set(['build','ship','app-ir','design']);
const wantsHelp = args.includes('--help') || args.includes('-h');
if (args[0] === '--version') console.log(VERSION);
else if (args[0] === '--help' || args[0] === '-h' || (wantsHelp && !helpAware.has(args[0] ?? ''))) console.log(`ios-agent-mcp ${VERSION}\nOne MCP connection: Swift reviews, Apple references, app creation and simulator tools.\nRequires Node 20+. Simulator operations require macOS/Xcode.\nUsage: ios-agent-mcp [--project PATH] [--tool-profile all|build|review|docs|design] [--tool-groups GROUPS] [--output-chars N] [--record-usage]\n       ios-agent-mcp tool-groups\n       ios-agent-mcp memory inspect|enable|disable|clear|diagnose --project PATH\n       ios-agent-mcp tool-profile recommend|apply|restore --project PATH\n       ios-agent-mcp build --help\n       ios-agent-mcp app-ir --help\n       ios-agent-mcp readiness --path PATH [--target NAME] [--configuration Release] [--metadata metadata.json]\n       ios-agent-mcp availability --path PATH [--target NAME] [--configuration Release] [--static]\n       ios-agent-mcp ship --help\n       ios-agent-mcp build "<app description>" [--out DIR] | --resume --out DIR | --refine "<change>" --out DIR\n       ios-agent-mcp preflight | capabilities list|verify | install-command [--global]\n       ios-agent-mcp new MyApp --brief "Your idea" --xcodegen\n       ios-agent-mcp loop init --project PATH --brief BRIEF.md --checks checks.json\n       ios-agent-mcp loop resume --project PATH\n       ios-agent-mcp loop status --project PATH\n       ios-agent-mcp design --help\n       ios-agent-mcp apple analyze|prepare --project PATH [--target NAME] [--configuration Release] [--json]\n       ios-agent-mcp ai models|doctor|config|ask|handoff|collaborate\n       ios-agent-mcp environment\n       ios-agent-mcp xcode-mcp status|tools\n       ios-agent-mcp doctor xcode\n       ios-agent-mcp docs status|search QUERY|symbol Framework.Symbol|availability Framework.Symbol|frameworks|diff\n       ios-agent-mcp simulator open UDID\n       ios-agent-mcp screenshots list|generate|variants|preview|inspect|export|localize\nbuild plans, writes, builds and screenshots a new app. new creates a starter only; loop drives an existing project to pass your own checks; design runs the design-contract and independent-review workflow for substantial work.`);
else if (['tool-groups','tool-profile','memory'].includes(args[0] ?? '')) { try { await efficiencyCLI(args); } catch(e) { console.error(e instanceof Error?e.message:String(e));process.exitCode=1; } }
else if (args[0] === 'xcode-mcp' || (args[0]==='doctor'&&args[1]==='xcode')) { try { await (await import('./apple-docs/registry.js')).xcodeCLI(args[0]==='doctor'?['doctor']:args.slice(1)); } catch { console.error('Xcode MCP inspection failed.');process.exitCode=1; } }
else if (args[0] === 'docs') { try { await (await import('./apple-docs/service.js')).docsCLI(args.slice(1)); } catch { console.error('Documentation request failed. Use docs status or docs search QUERY.');process.exitCode=1; } }
else if (args[0] === 'simulator') { try { await (await import('./platforms/simulator.js')).simulatorCLI(args.slice(1)); } catch { console.error('Simulator operation failed. Check exact UDID, runtime, app/output paths and installed CLI support.');process.exitCode=1; } }
else if (args[0] === 'environment') { console.log(JSON.stringify(await (await import('./platforms/apple.js')).discoverApple(),null,2)); }
else if (args[0] === 'ai') {
  try { await (await import('./ai/cli.js')).aiCLI(args.slice(1)); } catch(error) { const {ProviderFailure}=await import('./ai/providers.js');console.error(error instanceof ProviderFailure?error.code:'Invalid AI configuration or command. Use ai models, ai doctor, ai config, or ai ask PROMPT_FILE. Credentials belong in environment variables.');process.exitCode=1; }
}
else if (args[0] === 'screenshots') {
  try { await (await import('./screenshots/cli.js')).screenshotCLI(args.slice(1)); } catch(error) { console.error(error instanceof Error?error.message:String(error));process.exitCode=1; }
}
else if (args[0] === 'app-ir') {
  try { process.exitCode = await (await import('./app-ir/cli.js')).appIRCLI(args.slice(1)); } catch(error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode=1; }
}
else if (args[0] === 'readiness') {
  try {process.exitCode=await (await import('./analyzers/readiness.js')).readinessCLI(args.slice(1));} catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=2;}
}
else if (args[0] === 'availability') {
  try { process.exitCode=await (await import('./availability/review.js')).availabilityCLI(args.slice(1)); } catch(error) {console.error(error instanceof Error?error.message:String(error));process.exitCode=2;}
}
else if (args[0] === 'ship') {
  try { process.exitCode = await (await import('./release/ship.js')).shipCLI(args.slice(1)); } catch(error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode=1; }
}
else if (args[0] === 'apple') {
  try { await (await import('./release/package.js')).appleCLI(args.slice(1)); } catch { console.error('Local Apple analysis failed. Check selection, file access and package integrity. No external action performed.');process.exitCode=1; }
}
else if (['build','preflight','capabilities','install-command'].includes(args[0] ?? '')) {
  try {
    const agent = await import('./agent/cli.js');
    process.exitCode = args[0] === 'build' ? await agent.buildCLI(args.slice(1))
      : args[0] === 'preflight' ? await agent.preflightCLI()
      : args[0] === 'capabilities' ? await agent.capabilitiesCLI(args.slice(1))
      : await agent.installCommandCLI(args.slice(1));
  } catch(error) { console.error(error instanceof Error?error.message:String(error));process.exitCode=1; }
}
else if (args[0] === 'design') {
  try { process.exitCode = await (await import('./design/cli.js')).designCLI(args.slice(1)); } catch(error) { console.error(error instanceof Error?error.message:String(error));process.exitCode=1; }
}
else if (args[0] === 'loop') {
  try { await (await import('./app-loop.js')).appLoop(args.slice(1)); } catch(error) { console.error(error instanceof Error?error.message:String(error));process.exitCode=1; }
}
else if ((args[0] === 'new' || args[0] === 'assets')) {
  const child = (await import('node:child_process')).spawn(process.execPath,[cli(),...args],{stdio:'inherit'});
  child.on('error',e=>{console.error(e.message);process.exitCode=1;});
  child.on('exit',code=>{process.exitCode=code ?? 1;});
} else {
  const project = args[args.indexOf('--project')+1];
  const root = args.includes('--project') ? project : undefined;
  const recording = args.includes('--record-usage');
  if(recording&&!root)throw Error('--record-usage requires --project PATH');
  const config = await effectiveConfiguration(args);
  const outputs = new OutputStore(config.outputChars);
  const usage = newUsage();usage.modelCalls=null;const started=Date.now();
  const persistUsage=async(group?:string,bytes:number|null=null)=>{
    if(!recording||!root)return;
    const t=Date.now();try{if(group)await recordTool(root,usage.session,group,bytes);await saveUsage(root,usage);usage.overheadMs+=Date.now()-t;usage.elapsedMs=Date.now()-started;await saveUsage(root,usage);}catch{console.error('Local usage recording unavailable; operation outcome preserved.');}
  };
  const clients: Client[] = [];
  const close = async () => { await Promise.allSettled(clients.map(c=>c.close())); };
  try {
    const paths = [fileURLToPath(new URL('./index.js',import.meta.url)),fileURLToPath(new URL('./knowledge-server.js',import.meta.url)),require.resolve('@nagarjuna2002/ios-simulator-mcp')];
    for (const [i,path] of paths.entries()) {
      const client = new Client({name:'ios-agent-unified',version:VERSION});
      clients.push(client);
      await client.connect(new StdioClientTransport({command:process.execPath,args:[path,...(i===0?config.rest:[])],stderr:'inherit',env:Object.fromEntries(Object.entries(process.env).filter((pair): pair is [string,string]=>pair[1]!==undefined))}));
    }
    const catalog = await Promise.all(clients.map(c=>c.listTools()));
    const owners = new Map<string,Client>();
    const tools = catalog.flatMap((list,i)=>list.tools.map(tool=>{if(owners.has(tool.name))throw Error(`Duplicate tool ${tool.name}`);owners.set(tool.name,clients[i]!);return tool;}));
    tools.push({name:'create_app',description:'Create an editable Swift app starter, implementation brief and optional XcodeGen specification/icon layers. Writes a NEW starter project; does not implement the full app idea. To have the build agent plan, write, build and screenshot the whole app, use ios_create_project and the /ios-build workflow instead.',inputSchema:{type:'object',properties:{name:{type:'string'},directory:{type:'string',description:'Parent directory for the new project'},brief:{type:'string'},xcodegen:{type:'boolean',default:true}},required:['name','directory','brief'],additionalProperties:false}});
    tools.push(issueReportTool, privateFeedbackTool);
    const privateFeedback=createPrivateFeedback();
    const server = new Server({name:'ios-agent-mcp',version:VERSION},{capabilities:{tools:{},resources:{}}});

    server.setRequestHandler(ListResourcesRequestSchema,()=>clients[0]!.listResources());
    server.setRequestHandler(ReadResourceRequestSchema,async request=>{
      usage.resourceReads=(usage.resourceReads??0)+1;let bytes:number|null=null;
      try{const response=request.params.uri.startsWith('ios-agent-output:')?outputs.read(request.params.uri):await clients[0]!.readResource(request.params);bytes=Buffer.byteLength(JSON.stringify(response));return response;}
      finally{usage.resourceBytes=bytes===null||usage.resourceBytes===null?null:usage.resourceBytes+bytes;usage.responseBytes=bytes===null||usage.responseBytes===null?null:usage.responseBytes+bytes;await persistUsage();}
    });
    const dispatch = async (name:string, arguments_:Record<string,unknown>, signal?:AbortSignal):Promise<import('@modelcontextprotocol/sdk/types.js').CallToolResult> => {
      const request={params:{name,arguments:arguments_}};
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
        } catch(error) {return withDevelopmentFeedback({isError:true,content:[{type:'text' as const,text:error instanceof Error?error.message:String(error)}]});}
      }
      const owner=owners.get(request.params.name);
      if(!owner)throw Error('Unknown tool');
      const result=await owner.callTool(request.params,undefined,{timeout:21*60*1000,signal});
      return withDevelopmentFeedback(result) as import('@modelcontextprotocol/sdk/types.js').CallToolResult;
    };
    const registry:Entry[]=tools.map(tool=>({tool,groups:[groupFor(tool.name).id],dependencies:[],runtime:owners.has(tool.name)?'child-mcp':'unified',handler:(args,signal)=>dispatch(tool.name,args,signal)}));
    const selected=select(registry,config.groups), allowed=new Map(selected.map(e=>[e.tool.name,e]));
    const advertised=selected.map(e=>e.tool);usage.schemaBytes=Buffer.byteLength(JSON.stringify(advertised));
    console.error(JSON.stringify({efficiency:{profile:config.profile,groups:config.groups,outputChars:config.outputChars,recording,tools:advertised.length,schemaBytes:usage.schemaBytes}}));
    server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:advertised}));
    server.setRequestHandler(CallToolRequestSchema,async(request,extra)=>{
      const entry=allowed.get(request.params.name);
      if(!entry)throw Error('Tool unavailable in this connection. Reconnect with --tool-profile all to restore all tools.');
      usage.toolCalls=(usage.toolCalls??0)+1;
      let bytes:number|null=null;let failed=true;
      try{
        const result=await entry.handler(request.params.arguments??{},extra.signal);
        const response=outputs.bound(result,entry.groups.includes('apple-docs')&&entry.tool.annotations?.readOnlyHint===true&&!entry.tool.outputSchema);
        bytes=Buffer.byteLength(JSON.stringify(response));failed=result.isError===true;return response;
      }finally{
        if(failed)usage.failedToolCalls++;
        usage.responseBytes=bytes===null||usage.responseBytes===null?null:usage.responseBytes+bytes;usage.elapsedMs=Date.now()-started;
        await persistUsage(entry.groups[0]!,bytes);
      }
    });
    process.once('SIGINT',()=>{void close().finally(()=>process.exit(0));});
    process.once('SIGTERM',()=>{void close().finally(()=>process.exit(0));});
    server.onclose=()=>{void close();};
    await server.connect(new StdioServerTransport());
  } catch(error) {await close();throw error;}
}
