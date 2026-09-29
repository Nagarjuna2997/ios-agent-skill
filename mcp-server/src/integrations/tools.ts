import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { integrations, getIntegration } from './registry.js';
import { inspectIntegrations } from './review.js';
import { resolveProjectRoot } from '../scan.js';
const id=z.string().min(1).max(64);
const path=z.string().min(1).max(4096);
const selection={path,infoPlist:z.string().min(1).optional().describe('Effective selected-target plist relative to project. Use a built plist when Xcode generates keys.'),entitlements:z.string().min(1).optional().describe('Effective selected-target entitlements relative to project.')};
export async function scaffoldIntegration(project: string, integration: string, operations?: string[]) {
 await resolveProjectRoot(project);
 const record=getIntegration(integration);
 if(operations?.some(op=>!record.operations.includes(op)))throw Error('Unsupported operation; inspect get_system_integration first.');
 const content=await readFile(new URL(`../../data/integrations/${record.template}`,import.meta.url),'utf8');
 return {mode:'preview',written:false,integration:record,requestedOperations:operations??record.operations,files:[{path:record.template,content}],instructions:['Review the complete preview; the template includes the integration’s starter operations, not only the requested subset.','Add only needed components to your selected app target. No files or project settings have been changed.','For picker-only Contacts or Photos use, omit the direct-access service and its authorization request.','Apply the listed conditional permissions only for operations you retain. Build and test denied, restricted, cancelled and success flows.'],limitations:record.limitations};
}
export function registerIntegrationTools(server: McpServer) {
 const annotations={readOnlyHint:true,destructiveHint:false,openWorldHint:false};
 const result=async (work:()=>unknown|Promise<unknown>)=>{try{return {content:[{type:'text' as const,text:JSON.stringify(await work(),null,2)}]};}catch(error){return {isError:true,content:[{type:'text' as const,text:error instanceof Error?error.message:String(error)}]};}};
 server.registerTool('list_system_integrations',{description:'Use this when adding or reviewing Apple integrations. List supported Apple system integration workflows, conditional permissions and verification limits.',inputSchema:{},annotations},async()=>result(()=>integrations));
 server.registerTool('get_system_integration',{description:'Use this when adding or reviewing Apple integrations. Get a supported integration’s APIs, guide routes, operations, permissions and device verification requirements.',inputSchema:{integration:id},annotations},async({integration})=>result(()=>getIntegration(integration)));
 server.registerTool('scaffold_system_integration',{description:'Use this when adding or reviewing Apple integrations. Return a reusable Swift file preview for a supported system integration. Read-only: never writes or overwrites project files. iOS 17+ starter; app-specific wiring and device tests required.',inputSchema:{path,integration:id,operations:z.array(z.string()).max(20).optional()},annotations},async({path,integration,operations})=>result(()=>scaffoldIntegration(path,integration,operations)));
 server.registerTool('review_system_integrations',{description:'Use this when adding or reviewing Apple integrations. Review concrete API usage, selected privacy configuration and entitlements; reuse App Intents checks. Unknown target/configuration is reported, not treated as missing.',inputSchema:selection,annotations},async(input)=>result(()=>inspectIntegrations(input.path,input)));
 server.registerTool('check_apple_permissions',{description:'Use this when adding or reviewing Apple integrations. Report required versus detected privacy keys for concrete API operations. Picker-only Photos, Maps coordinates and system sharing do not imply broad data access.',inputSchema:selection,annotations},async(input)=>result(async()=>{const r=await inspectIntegrations(input.path,input);return {permissions:r.permissions,findings:r.findings.filter(f=>f.rule==='missing-purpose-string'),limitations:r.limitations};}));
 server.registerTool('check_apple_capabilities',{description:'Use this when adding or reviewing Apple integrations. Check selected entitlements separately from usage descriptions for concrete HealthKit, Apple Pay, CloudKit and push usage. Associated-domain provisioning needs manual verification.',inputSchema:selection,annotations},async(input)=>result(async()=>{const r=await inspectIntegrations(input.path,input);return {capabilities:r.capabilities,findings:r.findings.filter(f=>f.rule==='missing-integration-capability'),limitations:r.limitations};}));
 server.registerTool('recommend_system_integrations',{description:'Use this when adding or reviewing Apple integrations. Suggest verification of integrations already evidenced in source. Does not recommend unrelated features or infer product requirements.',inputSchema:selection,annotations},async(input)=>result(async()=>{const r=await inspectIntegrations(input.path,input);return {recommendations:r.detected.map(i=>({...i,nextStep:'Review configuration and run the listed verification steps before adding new access.'})),findings:r.findings,limitations:r.limitations};}));
}
