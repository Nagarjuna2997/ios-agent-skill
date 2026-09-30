import {join,relative,basename} from 'node:path';
import {readFile,readdir,stat} from 'node:fs/promises';
import {z} from 'zod';
import {discover,publicInventory,type Inventory} from './discovery.js';
import {XcodeBackend,type Backend,type Doc} from './bridge.js';
export const requestSchema=z.object({query:z.string().trim().min(1).max(240).regex(/^[\w .:+()\-]+$/),framework:z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/).optional(),online:z.boolean().default(false)}).strict();
// In-memory only: bounded, version-keyed, no user source or archive persistence.
export class DocsService {
 private cache=new Map<string,unknown>();private fingerprint='';
 constructor(private inventory:()=>Promise<Inventory>=discover,private backend:(developer?:string)=>Backend=d=>new XcodeBackend(d),private sdkSearch=searchSDK){}
 async status(){const i=await this.inventory();return {...publicInventory(i),installationStatus:i.documentation.length?'installed':'not_detected',backend:'xcode-mcp',backendAccess:'requires live query; installation alone does not prove access',archiveBundled:false};}
 async query(input:unknown,kind='search'){
 const p=requestSchema.parse(input);if(!p.framework&&/^[A-Za-z][A-Za-z0-9_]*\.[A-Za-z][A-Za-z0-9_]*$/.test(p.query))p.framework=p.query.split('.')[0];const i=await this.inventory();
 if(i.fingerprint!==this.fingerprint){this.cache.clear();this.fingerprint=i.fingerprint;}
 const key=JSON.stringify([p,kind,i.fingerprint]);if(this.cache.has(key))return this.cache.get(key);
 const selected=i.installations.find(x=>x.active);
 const provenance={xcode:selected?.version??'unavailable',documentationVersions:i.documentation.map(x=>x.version),inventoryHash:i.fingerprint};
 const query=kind==='search'?p.query:`${p.query} ${kind.replaceAll('_',' ')} platform availability deprecation`;
 let failure='documentation_tool_unavailable';let documents:Doc[]=[];
 if(selected)try{documents=await this.backend(selected.developer).search(query,p.framework);}catch(e){failure=e instanceof Error&&/^[a-z_]+$/.test(e.message)?e.message:'documentation_backend_failed';}
 let source='xcode-mcp';
 if(!documents.length){source='installed-sdk';try{documents=selected?await this.sdkSearch(selected.developer,p.query,p.framework):[];}catch{failure='sdk_evidence_unavailable';documents=[];}}
 // Online retrieval is explicit and constrained to Apple's documented symbol URL.
 if(!documents.length&&p.online&&p.framework){source='apple-online';documents=await onlineSymbol(p.framework,p.query);}
 const result={status:documents.length?'evidence_found':'unavailable',source:documents.length?source:'none',...provenance,query:p.query,documents,limitations:['Search evidence is not exact symbol resolution or automatic code validation.','Availability/deprecation must be present in retrieved evidence; missing values are unknown.','Xcode controls its own documentation source/network behavior; bridge results do not prove offline access.'],...(!documents.length?{reason:failure,next:'Enable Xcode external tools and approve a sample workspace. Install Developer Documentation in Xcode Settings > Components. Model-only answers must be labelled unverified.'}:{})};
 if(documents.length){if(this.cache.size>=100)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,result);}return result;
 }
 async frameworks(){const i=await this.inventory();const selected=i.installations.find(x=>x.active);if(!selected)return {status:'unavailable',frameworks:[]};return {source:'installed-sdk',xcode:selected.version,frameworks:await sdkFrameworks(selected.developer)};}
 async diff(){const i=await this.inventory();return {source:'xcode-sdk-inventory',installations:publicInventory(i).installations,status:i.installations.length>1?'inventory_comparison':'needs_multiple_xcodes',limitations:['SDK inventory comparison only. No symbol-level API additions/removals inferred.']};}
}
async function sdkRoots(developer:string){const roots:string[]=[];for(const platform of await readdir(join(developer,'Platforms')).catch(()=>[])) {const base=join(developer,'Platforms',platform,'Developer/SDKs');for(const sdk of await readdir(base).catch(()=>[])){if(sdk.endsWith('.sdk'))roots.push(join(base,sdk));}}return roots;}
async function sdkFrameworks(developer:string){const result:{sdk:string;frameworks:string[]}[]=[];for(const sdk of await sdkRoots(developer)){const files=await readdir(join(sdk,'System/Library/Frameworks')).catch(()=>[]);result.push({sdk:basename(sdk),frameworks:files.filter(x=>x.endsWith('.framework')).map(x=>x.slice(0,-10))});}return result;}
export async function searchSDK(developer:string,query:string,framework?:string):Promise<Doc[]>{
 const parts=query.split('.');const fw=framework??(parts.length>1?parts[0]:undefined);const symbol=parts.at(-1)!;
 if(!fw||!/^\w+$/.test(symbol)||!/^\w+$/.test(fw))return [];
 const result:Doc[]=[];let visited=0,bytes=0;const deadline=Date.now()+3000;
 for(const sdk of await sdkRoots(developer)){const root=join(sdk,'System/Library/Frameworks',fw+'.framework');
 const walk=async(dir:string,depth:number):Promise<void>=>{if(depth>4||visited>600||bytes>20_000_000||Date.now()>deadline||result.length>=5)return;for(const entry of await readdir(dir,{withFileTypes:true}).catch(()=>[])){if(visited++>600||bytes>20_000_000||Date.now()>deadline||result.length>=5)break;const file=join(dir,entry.name);if(entry.isDirectory())await walk(file,depth+1);else if(entry.isFile()&&/\.(swiftinterface|h)$/.test(entry.name)){const size=(await stat(file)).size;if(size>5_000_000||bytes+size>20_000_000)continue;bytes+=size;const lines=(await readFile(file,'utf8')).split('\n');const n=lines.findIndex(l=>new RegExp('\\b'+symbol+'\\b').test(l));if(n>=0)result.push({title:`${fw}.${symbol} (${basename(sdk)})`,uri:`sdk://${basename(sdk)}/${relative(sdk,file)}`,contents:lines.slice(Math.max(0,n-5),n+8).join('\n').slice(0,2400),kind:'declaration-match-not-docs',score:0});}}};await walk(root,0);}
 return result;
}
async function onlineSymbol(framework:string,query:string):Promise<Doc[]>{const symbol=query.split('.').at(-1)!;if(!/^\w+$/.test(symbol))return [];const uri=`https://developer.apple.com/documentation/${framework.toLowerCase()}/${symbol.toLowerCase()}`;try{const response=await fetch(uri,{signal:AbortSignal.timeout(8000),redirect:'error'});if(!response.ok)return [];const reader=response.body?.getReader();if(!reader)return [];let body='';while(body.length<64000){const {done,value}=await reader.read();if(done)break;body+=new TextDecoder().decode(value);}await reader.cancel();const text=body.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();if(text.length<200||/requires javascript/i.test(text))return [];return [{title:query,uri,contents:text.slice(0,2400),kind:'online-page-excerpt',score:0}];}catch{return [];}}
export const docsService=new DocsService();
export async function docsCLI(args:string[]){const [command,...rest]=args;const query=rest.filter(x=>!x.startsWith('--')).join(' ');const methods:Record<string,string>={search:'search',symbol:'symbol',availability:'availability',related:'related_symbols',examples:'examples'};let value:unknown;if(command==='status')value=await docsService.status();else if(command==='frameworks')value=await docsService.frameworks();else if(command==='diff')value=await docsService.diff();else if(command&&methods[command])value=await docsService.query({query,online:rest.includes('--online')},methods[command]);else throw Error('Usage: docs status|search QUERY|symbol Framework.Symbol|availability Framework.Symbol|frameworks|diff');console.log(JSON.stringify(value,null,2));}
