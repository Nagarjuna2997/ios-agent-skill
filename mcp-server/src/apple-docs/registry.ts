import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import type {Tool} from '@modelcontextprotocol/sdk/types.js';
import {discover,publicInventory,run} from './discovery.js';
export function category(tool:Pick<Tool,'name'|'description'>){const text=tool.name+' '+(tool.description??'');for(const [kind,pattern] of [['documentation',/documentation/i],['simulator',/simulator/i],['build',/build|test/i],['diagnostics',/diagnostic|issue/i],['symbol',/symbol/i],['project',/project|workspace/i],['navigation',/navigate|search|read/i],['sdk',/sdk/i]] as const)if(pattern.test(text))return kind;return 'unknown';}
export function documentationTool(tools:Tool[]){return tools.filter(t=>category(t)==='documentation'&&/search/i.test(t.name+' '+(t.description??''))).find(t=>{const p=t.inputSchema.properties as Record<string,{type?:string;items?:{type?:string}}>|undefined;return p?.query?.type==='string'&&(t.inputSchema.required??[]).every(k=>k==='query')&&(!p.frameworks||(p.frameworks.type==='array'&&p.frameworks.items?.type==='string'));});}
export type BridgeFactory=()=>Client;
export async function withBridge<T>(developer:string|undefined,action:(client:Client)=>Promise<T>,factory:BridgeFactory=()=>new Client({name:'ios-agent-apple-docs',version:'1.0.0'})){
 const client=factory();try{await client.connect(new StdioClientTransport({command:'/usr/bin/xcrun',args:['mcpbridge'],stderr:'pipe',env:{...Object.fromEntries(Object.entries(process.env).filter((x):x is [string,string]=>x[1]!==undefined)),...(developer?{DEVELOPER_DIR:developer}:{})}}),{timeout:15000});return await action(client);}finally{await client.close();}
}
export async function inspectClient(client:Client){
 const tools:Tool[]=[];let cursor:string|undefined;let pages=0;
 do{const page=await client.listTools(cursor?{cursor}:{},{timeout:15000});tools.push(...page.tools);cursor=page.nextCursor;if(++pages>=10&&cursor)throw Error('tool_catalog_limit');}while(cursor);
 const capabilities=client.getServerCapabilities()??{};
 const resources=capabilities.resources?await client.listResources({}, {timeout:15000}).catch(()=>({status:'unavailable'})):null;
 const prompts=capabilities.prompts?await client.listPrompts({}, {timeout:15000}).catch(()=>({status:'unavailable'})):null;
 return {server:client.getServerVersion(),capabilities,tools:tools.map(t=>({...t,category:category(t)})),resources,prompts,documentationTool:documentationTool(tools)?.name??null,authorization:'not_verified_by_discovery'};
}
export async function xcodeRegistry(){const inventory=await discover();const selected=inventory.installations.find(x=>x.active);let bridge=false;try{if(selected)bridge=Boolean((await run('/usr/bin/xcrun',['--find','mcpbridge'],selected.developer)).trim());}catch{}
 if(!bridge)return {status:'unavailable',environment:publicInventory(inventory),fix:'Select a full Xcode installation with MCP support; check xcode-select and xcrun --find mcpbridge.'};
 try{return {status:'available',environment:publicInventory(inventory),...(await withBridge(selected?.developer,inspectClient))};}catch{return {status:'handshake_or_discovery_failed',environment:publicInventory(inventory),fix:'Open Xcode, enable external agents in Intelligence settings, and approve access to a sample workspace. Tool discovery is not authorization.'};}}
export function summarizeRegistry(registry:Awaited<ReturnType<typeof xcodeRegistry>>){if(!('tools' in registry))return registry;const {tools,resources,prompts,...summary}=registry;return {...summary,toolCount:tools.length,toolNames:tools.map(t=>t.name),resourcesExposed:resources!==null,promptsExposed:prompts!==null};}
export async function xcodeStatus(){return summarizeRegistry(await xcodeRegistry());}
export async function doctorXcode(){const registry=await xcodeRegistry();let runtimes:unknown={status:'unavailable'};try{if(process.platform==='darwin')runtimes=JSON.parse(await run('/usr/bin/xcrun',['simctl','list','runtimes','--json']));}catch{}return {registry:summarizeRegistry(registry),simulatorRuntimes:runtimes,documentationQuery:'not_attempted; use docs symbol SwiftUI.NavigationStack to distinguish authorization and fallback',offline:'SDK fallback is local. Xcode bridge offline behavior requires separate network-isolated verification.'};}
export async function xcodeCLI(args:string[]){if(!['status','tools','doctor'].includes(args[0]??''))throw Error('Use xcode-mcp status|tools or doctor xcode');console.log(JSON.stringify(args[0]==='doctor'?await doctorXcode():args[0]==='status'?await xcodeStatus():await xcodeRegistry(),null,2));}
