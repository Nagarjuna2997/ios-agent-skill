import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {docsService,requestSchema} from './service.js';
export function registerAppleDocs(server:McpServer){
 const output=(value:unknown)=>({content:[{type:'text' as const,text:JSON.stringify(value)}]});
 for(const [name,description,action] of [
 ['apple_docs_status','Discover installed Xcode, SDKs and local Apple documentation; does not prove bridge authorization.',()=>docsService.status()],
 ['apple_docs_frameworks','List frameworks present in installed SDKs, grouped by SDK.',()=>docsService.frameworks()],
 ['apple_docs_platform_support','Inspect dynamically installed SDK/platform inventory; not API availability.',()=>docsService.status()],
 ['apple_docs_sdk_diff','Compare installed Xcode SDK inventories; not a symbol-level API diff.',()=>docsService.diff()]
 ] as const)server.registerTool(name,{description:description+' Use before generating Apple API code.',inputSchema:{}},async()=>output(await action()));
 for(const kind of ['search','lookup_symbol','availability','related_symbols','examples'])server.registerTool('apple_docs_'+kind,{description:`Retrieve bounded Apple documentation evidence for ${kind}. Use before uncertain Apple API generation or repair. Search-based, not exact semantic validation. Falls back to installed SDK declarations; online requires explicit opt-in. Never send app code, diagnostics or personal data in query.`,inputSchema:requestSchema.shape},async input=>output(await docsService.query(input,kind)));
}
