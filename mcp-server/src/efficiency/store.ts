/** Project-local, bounded, fail-closed state. Locks are never stolen from live writers. */
import {mkdir, lstat, readFile, open, rename, rm, realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
export const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export async function directory(root:string) {
 await mkdir(root,{recursive:true}); const canonical=await realpath(root);
 for(const p of [join(canonical,'.ios-agent'),join(canonical,'.ios-agent','efficiency')]){
  await mkdir(p,{mode:0o700}).catch(e=>{if(e.code!=='EEXIST')throw e;});
  const st=await lstat(p);if(st.isSymbolicLink()||!st.isDirectory())throw Error('Unsafe efficiency state directory');
 }
 return join(canonical,'.ios-agent','efficiency');
}
export async function read<T>(root:string,name:string,fallback:T):Promise<T>{
 let canonical:string;try{canonical=await realpath(root);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return fallback;throw e;}
 for(const p of [join(canonical,'.ios-agent'),join(canonical,'.ios-agent','efficiency')]){try{const st=await lstat(p);if(st.isSymbolicLink()||!st.isDirectory())throw Error('Unsafe state directory');}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return fallback;throw e;}}
 return readAt(join(canonical,'.ios-agent','efficiency'),name,fallback);
}
async function readAt<T>(dir:string,name:string,fallback:T):Promise<T>{
 if(!/^[a-z-]+\.json$/.test(name))throw Error('Invalid state name');
 const path=join(dir,name);
 try {const st=await lstat(path);if(!st.isFile()||st.isSymbolicLink()||st.size>500000)throw Error('Unsafe or oversized state');return JSON.parse(await readFile(path,'utf8'));}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return fallback;throw Error(`Cannot read ${name}; preserve it for diagnosis, then use clear to recover.`);}
}
export async function update<T>(root:string,name:string,fallback:T,fn:(v:T)=>T|Promise<T>,clear=false):Promise<T>{
 const dir=await directory(root),lock=join(dir,`${name}.lock`);let handle;
 for(let i=0;i<100;i++){try{handle=await open(lock,'wx',0o600);break;}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,20));}}
 if(!handle)throw Error('Efficiency state busy. If a writer crashed, diagnose and remove its lock only after it has exited.');
 const tmp=join(dir,`.${randomUUID()}.tmp`);
 try{
  await handle.writeFile(JSON.stringify({pid:process.pid,at:new Date().toISOString()}));
  if(clear){const source=join(dir,name);await rename(source,join(dir,`${name}.recovery`)).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  const v=await fn(clear?fallback:await readAt(dir,name,fallback));const text=JSON.stringify(v,null,2);if(Buffer.byteLength(text)>500000)throw Error('State exceeds retention bound');
  const f=await open(tmp,'wx',0o600);try{await f.writeFile(text);await f.sync();}finally{await f.close();}await rename(tmp,join(dir,name));return v;
 }finally{await rm(tmp,{force:true});await handle.close();await rm(lock,{force:true});}
}
export async function ignore(root:string){
 const dir=await directory(root); // Serialize ignore edits with the same lock discipline.
 await update(root,'ignore.json',{version:1},async v=>{
  const p=join(dir,'..','.gitignore');
  const f=await open(p,'wx',0o600).catch(e=>{if(e.code!=='EEXIST')throw e;return null;});
  if(f){try{await f.writeFile('*\n');}finally{await f.close();}}
  else {const s=await lstat(p);if(!s.isFile()||s.isSymbolicLink())throw Error('Unsafe .ios-agent/.gitignore');const contents=await readFile(p,'utf8');if(!contents.split(/\r?\n/).includes('*'))throw Error('Add * to .ios-agent/.gitignore before enabling local state');}
  return v;
 });
}
