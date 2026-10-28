import {lstat,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {directory,update,read,ignore} from './store.js';
import {inspectMemory,setMemory} from './memory.js';
import {recommend} from './usage.js';
import {GROUPS,PROFILES,configuration} from './registry.js';
export interface Settings {version:1;profile?:string;previous?:string|null}
export async function settings(root:string){const v=await read<Settings>(root,'settings.json',{version:1});if(v.version!==1||(v.profile&&!PROFILES[v.profile]))throw Error('Invalid local profile settings');return v;}
export async function effectiveConfiguration(args:string[],env:NodeJS.ProcessEnv=process.env){
 const i=args.indexOf('--project');const root=i>=0?args[i+1]:undefined;
 if(i>=0&&(!root||root.startsWith('--')))throw Error('--project requires a path');
 const explicit=args.some(a=>a==='--tool-profile'||a==='--tool-groups')||env.IOS_AGENT_TOOL_GROUPS!==undefined||env.IOS_AGENT_TOOL_PROFILE!==undefined;
 const local=root&&!explicit?await settings(root):undefined;
 return configuration(args.filter(a=>a!=='--record-usage'),{...env,...(local?.profile?{IOS_AGENT_TOOL_PROFILE:local.profile}:{})});
}
export async function efficiencyCLI(args:string[]){
 const [command,operation]=args;const idx=args.indexOf('--project');const root=idx>=0?args[idx+1]:undefined;
 if(command==='tool-groups'){console.log(JSON.stringify({groups:GROUPS.map(({id,name})=>({id,name})),profiles:PROFILES,effective:await effectiveConfiguration(args.slice(1))},null,2));return;}
 if(!root)throw Error('Specify --project PATH; state is always project-local');
 if(command==='memory'){
  if(operation==='enable'||operation==='disable'){await setMemory(root,operation==='enable');console.log(`Memory ${operation}d`);}
  else if(operation==='inspect')console.log(JSON.stringify(await inspectMemory(root),null,2));
  else if(operation==='clear'){await ignore(root);await update(root,'memory.json',{version:1,enabled:false,facts:[]},v=>v,true);console.log('Memory cleared and disabled. Previous state retained in memory.json.recovery for manual diagnosis/removal.');}
  else if(operation==='diagnose'){const dir=await directory(root);for(const name of ['memory.json','memory.json.lock']){try{const s=await lstat(join(dir,name));console.log(JSON.stringify({name,size:s.size,symlink:s.isSymbolicLink()}));if(name.endsWith('.lock')&&!s.isSymbolicLink())console.log(await readFile(join(dir,name),'utf8'));}catch(e){console.log(`${name}: ${(e as NodeJS.ErrnoException).code??'invalid'}`);}}try{await inspectMemory(root);console.log('Schema valid');}catch{console.log('Schema invalid: clear preserves a recovery copy. Never delete a live writer lock.');}}
  else throw Error('Use memory inspect|enable|disable|clear|diagnose --project PATH');
 }else if(command==='tool-profile'){
  if(operation==='recommend')console.log(JSON.stringify(await recommend(root),null,2));
  else if(operation==='apply'){const r=await recommend(root);if(!r.profile)throw Error('No narrower profile supported by at least three observed sessions');await ignore(root);await update<Settings>(root,'settings.json',{version:1},v=>{if(v.previous!==undefined)throw Error('Restore prior recommendation before applying another');return {version:1,profile:r.profile!,previous:v.profile??null};});console.log('Recommendation applied for future connections with --project. Explicit CLI/environment selections override it.');}
  else if(operation==='restore'){await ignore(root);await update<Settings>(root,'settings.json',{version:1},v=>v.previous===undefined?v:{version:1,...(v.previous?{profile:v.previous}:{})});console.log('Prior local selection restored for future connections');}
  else throw Error('Use tool-profile recommend|apply|restore --project PATH');
 }
}
