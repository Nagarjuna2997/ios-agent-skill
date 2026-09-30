import {withBridge,inspectClient,documentationTool,type BridgeFactory} from './registry.js';
import {z} from 'zod';
export const Document=z.object({title:z.string(),uri:z.string(),contents:z.string(),kind:z.string(),score:z.number()});
export type Doc=z.infer<typeof Document>;
export interface Backend {search(query:string,framework?:string):Promise<Doc[]>}
export function normalize(value:unknown):Doc[]{const parsed=z.object({documents:z.array(Document).max(1000)}).parse(value);return parsed.documents.slice(0,5).map(d=>({...d,contents:d.contents.slice(0,2400)}));}
export class XcodeBackend implements Backend {
 constructor(private developer?:string,private factory?:BridgeFactory){}
 async search(query:string,framework?:string){return withBridge(this.developer,async client=>{
 const registry=await inspectClient(client);const tool=documentationTool(registry.tools);
 if(!tool)throw Error('documentation_tool_unavailable');
 const supportsFrameworks=Boolean(tool.inputSchema.properties?.frameworks);
 const r=await client.callTool({name:tool.name,arguments:{query,...(framework&&supportsFrameworks?{frameworks:[framework]}:{})}},undefined,{timeout:20000});
 if(r.isError)throw Error('xcode_documentation_denied_or_failed');
 if(r.structuredContent)return normalize(r.structuredContent);
 const content=r.content as {type:string;text?:string}[];
 for(const c of content)if(c.type==='text'&&c.text){try{return normalize(JSON.parse(c.text));}catch{}}
 throw Error('malformed_documentation_response');
 },this.factory);}
}
