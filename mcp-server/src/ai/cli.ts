import {readFile,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadConfig,saveConfig} from './config.js';
import {cloudAdapter,keyNames} from './providers.js';
import {appleAdapter} from './apple.js';
import {models} from './registry.js';
import {route} from './router.js';
import {saveState,loadState,stateSchema} from './handoff.js';
import {orchestrate} from './orchestrator.js';
export async function aiCLI(args:string[]){
 const path=resolve('.ios-agent-ai.json');const config=await loadConfig(path);
 const adapters=[appleAdapter(),...(['openai','anthropic','gemini'] as const).map(p=>cloudAdapter(p,process.env[keyNames[p]]))];
 if(args[0]==='models'){console.log(JSON.stringify({snapshot:'2026-09-29',models,availability:'Run doctor for account discovery; catalog presence does not prove access.'},null,2));return;}
 if(args[0]==='config'){
  if(args.length===1){console.log(JSON.stringify(config,null,2));return;}
  if(args.length!==3)throw Error('Usage: ai config KEY VALUE. Keys and enum values are validated; credentials belong in environment variables.');
  const key=args[1]!;const raw=args[2]!;let value:unknown=raw;
  if(['allowFallback'].includes(key))value=raw==='true'?true:raw==='false'?false:raw;
  if(['allowedCloudProviders','fallbackOrder'].includes(key))value=raw?raw.split(','):[];
  if(key==='maxRetries')value=Number(raw);
  await saveConfig(path,{...config,[key]:value});console.log('Saved local AI configuration with a backup when replacing a file.');return;
 }
 if(args[0]==='doctor'){
  const results=[];
  for(const adapter of adapters){const configured=adapter.provider==='apple'||Boolean(process.env[keyNames[adapter.provider]]);if(!configured){results.push({provider:adapter.provider,status:'not-configured'});continue;}
   try{results.push({provider:adapter.provider,status:'discovered',models:await adapter.list()});}catch{results.push({provider:adapter.provider,status:'unavailable',action:'Check local model availability or provider credentials/account policy.'});}
  }console.log(JSON.stringify({results,fallback:config.allowFallback,privacy:config.privacy},null,2));return;
 }
 if(args[0]==='handoff'&&args.length===3){if(args[1]==='save'){const stat=await lstat(args[2]!);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>1_000_000)throw Error('Invalid state input');await saveState('.ios-agent-ai-state.json',JSON.parse(await readFile(args[2]!,'utf8')),process.cwd());console.log('Saved local handoff. No data sent.');return;}if(args[1]==='inspect'){console.log(JSON.stringify(await loadState(args[2]!,process.cwd()),null,2));return;}}
 if(args[0]==='collaborate'&&args.length===2){const checkpoint=await loadState(args[1]!,process.cwd());console.log(JSON.stringify(await orchestrate('.ios-agent-ai-state-stages',process.cwd(),stateSchema.parse(checkpoint.state),config,adapters),null,2));return;}
 if(args[0]==='ask'&&args.length===2){
  // An explicit file is the only input; no implicit repo scan, environment capture or source upload.
  const file=resolve(args[1]!);const stat=await lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>200000)throw Error('Provide a regular prompt file smaller than 200 KB.');
  const result=await route(config,adapters,await readFile(file,'utf8'));console.log(JSON.stringify(result,null,2));return;
 }
 throw Error('Usage: ios-agent-mcp ai models|doctor|config [KEY VALUE]|ask PROMPT_FILE. Cloud requests require privacy cloud-permitted and an allowedCloudProviders list.');
}
