import {mkdir,readFile,writeFile,rename,lstat} from 'node:fs/promises';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {randomUUID} from 'node:crypto';
import {sha256} from './schema.js';
/** Trusted local runner journal. Atomic completed stages only; interrupted stages rerun.
 * Caller serializes access and pins all inputs/toolchains in contract. Never reuse a
 * result after an artifact changes. Hashes are integrity checks, not authentication.
 */
export class Checkpoints {
 constructor(readonly root:string,readonly contract:string,readonly afterCheckpoint?: (name:string)=>void){}
 async stage<T>(name:string,run:()=>Promise<{value:T;files:string[]}>):Promise<T>{
  if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid checkpoint name');
  const directory=join(this.root,'checkpoints');await mkdir(directory,{recursive:true});
  if((await lstat(directory)).isSymbolicLink())throw Error('Checkpoint directory is a symlink');
  const path=join(directory,name+'.json');let saved;
  try{if(!(await lstat(path)).isFile())throw Error('Invalid checkpoint file');saved=JSON.parse(await readFile(path,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
  const digest=async(file:string)=>{const full=resolve(this.root,file),rel=relative(resolve(this.root),full);if(!rel||rel.startsWith('..')||isAbsolute(rel))throw Error('Artifact outside run');if(!(await lstat(full)).isFile())throw Error('Invalid artifact');return sha256(await readFile(full));};
  if(saved){
   if(saved.contract!==this.contract||saved.hash!==sha256(JSON.stringify(saved.payload)))throw Error(`Checkpoint contract/integrity changed: ${name}`);
   if(!saved.payload||!Array.isArray(saved.payload.artifacts))throw Error('Invalid checkpoint');
   for(const item of saved.payload.artifacts)if(await digest(item.file)!==item.hash)throw Error(`Artifact changed: ${item.file}`);
   return saved.payload.value as T;
  }
  const result=await run();const artifacts=[];
  for(const file of result.files){const rel=relative(resolve(this.root),resolve(file));artifacts.push({file:rel,hash:await digest(rel)});}
  const payload={value:result.value,artifacts};const tmp=path+'.'+randomUUID()+'.tmp';
  await writeFile(tmp,JSON.stringify({contract:this.contract,payload,hash:sha256(JSON.stringify(payload))}),{flag:'wx'});await rename(tmp,path);this.afterCheckpoint?.(name);return result.value;
 }
}
