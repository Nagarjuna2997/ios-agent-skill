import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readdir,readFile,stat} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {homedir} from 'node:os';
import {createHash} from 'node:crypto';
import {parse} from 'plist';
const parsePlist=(text:string)=>parse(text) as Record<string,any>;
export type Run=(command:string,args:string[],developer?:string)=>Promise<string>;
export const run:Run=async(command,args,developer)=>(await promisify(execFile)(command,args,{timeout:20000,maxBuffer:2_000_000,env:{...process.env,...(developer?{DEVELOPER_DIR:developer}:{})}})).stdout;
export async function directories(root:string){try{return (await readdir(root,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>join(root,x.name));}catch{return [];}}
export async function plist(path:string,execute:Run=run):Promise<Record<string,any>>{try{return JSON.parse(await execute('/usr/bin/plutil',['-convert','json','-o','-',path]));}catch{try{return parsePlist(await execute('/usr/bin/plutil',['-convert','xml1','-o','-',path]));}catch{return {};}}}
export interface Installation {developer:string;name:string;version:string;sdks:string;active:boolean}
export interface Inventory {host:string;macOS:string;installations:Installation[];documentation:{location:string;version:string;xcodeVersion:string;fingerprint:string;catalogVersionCandidates?:string[]}[];fingerprint:string}
export async function discover(options:{run?:Run;platform?:string;applicationRoots?:string[];assetRoots?:string[]}={}):Promise<Inventory>{
 const execute=options.run??run;const host=options.platform??process.platform;
 const safe=async(c:string,a:string[],d?:string)=>{try{return (await execute(c,a,d)).trim();}catch{return '';}};
 if(host!=='darwin')return {host,macOS:'',installations:[],documentation:[],fingerprint:'unsupported-host'};
 const selected=process.env.DEVELOPER_DIR || await safe('/usr/bin/xcode-select',['-p']);
 const candidates=new Set<string>(selected?[selected]:[]);
 for(const root of options.applicationRoots??['/Applications',join(homedir(),'Applications')])for(const app of await directories(root))if(app.endsWith('.app'))candidates.add(join(app,'Contents/Developer'));
 const installations:Installation[]=[];
 for(const developer of candidates){const version=await safe('/usr/bin/xcodebuild',['-version'],developer);if(!version.startsWith('Xcode '))continue;installations.push({developer,name:basename(developer.replace(/\/Contents\/Developer\/?$/,'')),version,sdks:await safe('/usr/bin/xcodebuild',['-showsdks'],developer),active:developer===selected});}
 const documentation:Inventory['documentation']=[];
 const roots=options.assetRoots??[process.env.IOS_AGENT_APPLE_DOCS_ROOT??'', '/System/Library/AssetsV2','/Library/AssetsV2',join(homedir(),'Library/AssetsV2')].filter(Boolean);
 for(const root of roots){const containers=basename(root).includes('AppleDeveloperDocumentation')?[root]:(await directories(root)).filter(p=>basename(p).includes('AppleDeveloperDocumentation'));
 for(const container of containers)for(const asset of await directories(container)){if(!asset.endsWith('.asset'))continue;const location=join(asset,'AssetData');try{await stat(location);}catch{continue;}
 const info=await plist(join(asset,'Info.plist'),execute);const props=info.MobileAssetProperties??{};
 let metadata='';try{metadata=await readFile(join(location,'config.json'),'utf8');}catch{}
 const timestamps=await Promise.all(['','documentation-db','documentation-cache'].map(async p=>{try{const s=await stat(join(location,p));return [p,s.mtimeMs,s.size];}catch{return [p,'missing'];}}));
 const catalog=await plist(join(container,'com_apple_MobileAsset_AppleDeveloperDocumentation.xml'),execute);
 const candidates=[...new Set<string>((Array.isArray(catalog.Assets)?catalog.Assets:[]).filter((x:any)=>x.XcodeVersion===props.XcodeVersion&&x.OSVersion===props.OSVersion&&typeof x.Build==='string').map((x:any)=>x.Build))];
 const fingerprint=createHash('sha256').update(asset+JSON.stringify(info)+metadata+JSON.stringify(timestamps)+JSON.stringify(candidates)).digest('hex');
 documentation.push({location,version:props.Build??props.DocumentationVersion??'unknown',xcodeVersion:props.XcodeVersion??'unknown',fingerprint,catalogVersionCandidates:candidates});}}
 const fingerprint=createHash('sha256').update(JSON.stringify({installations,documentation})).digest('hex');
 return {host,macOS:await safe('/usr/bin/sw_vers',['-productVersion']),installations,documentation,fingerprint};
}
export function publicInventory(value:Inventory){return {...value,installations:value.installations.map(({developer,...rest})=>({...rest,source:'installed Xcode'})),documentation:value.documentation.map(({location,...rest})=>({...rest,source:'Apple-managed local documentation'}))};}
