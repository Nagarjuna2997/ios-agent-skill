import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export async function productHash(root) {
  const rows=[];let bytes=0,count=0;
  if((await fs.lstat(root)).isSymbolicLink())throw Error('Symbolic app product is unsupported');
  async function walk(folder,relative=''){
    for(const item of await fs.readdir(folder,{withFileTypes:true})){
      const file=path.join(folder,item.name),name=relative+item.name;
      if(item.isSymbolicLink())throw Error('Symbolic app product input is unsupported');
      if(item.isDirectory())await walk(file,name+'/');
      else if(item.isFile()){
        bytes+=(await fs.stat(file)).size;
        if(++count>10000 || bytes>1000000000)throw Error('App product exceeds verification limits');
        rows.push([name,createHash('sha256').update(await fs.readFile(file)).digest('hex')]);
      }
    }
  }
  await walk(root);
  return createHash('sha256').update(JSON.stringify(rows.sort((a,b)=>a[0].localeCompare(b[0])))).digest('hex');
}
export async function builtProduct(studio,p){
  const root=path.join(studio.dir(p.id),'project');
  const folder=path.join(root,p.template==='agent'?'.ios-agent/DerivedData':'.build','Build/Products/Debug-iphonesimulator');
  const apps=(await fs.readdir(folder,{withFileTypes:true})).filter(e=>e.isDirectory()&&e.name.endsWith('.app')&&!e.name.endsWith('-Runner.app'));
  if(apps.length!==1)throw Error('Expected exactly one built application');
  const file=await fs.realpath(path.join(folder,apps[0].name));
  if(!file.startsWith((await fs.realpath(root))+path.sep))throw Error('App product escapes project');
  return { path:path.relative(root,file), hash:await productHash(file) };
}
