import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {create} from './create.mjs';
import {evaluate} from './oracle.mjs';
const cases=JSON.parse(await fs.readFile(new URL('./cases.json',import.meta.url),'utf8'));
for(const c of cases){const root=await fs.mkdtemp(path.join(os.tmpdir(),'launch-oracle-'));try{
 for(const reference of [false,true]){const dir=path.join(root,reference?'reference':'starter');await create(dir,c.id,reference);const result=await evaluate(dir,c.id);assert.equal(result.pass,reference||c.expected.length===0,JSON.stringify({id:c.id,reference,...result}));}
 console.log(c.id+': starter/reference expectations pass');
}finally{await fs.rm(root,{recursive:true,force:true});}}
// Mutation checks ensure acceptance isn't just “some asset exists”.
for(const mutation of ['color','logo','app']){const root=await fs.mkdtemp(path.join(os.tmpdir(),'launch-preservation-'));try{
 await create(root,'image-case',true);
 if(mutation==='color'){const p=path.join(root,'Assets.xcassets/Background.colorset/Contents.json');const c=JSON.parse(await fs.readFile(p));c.colors[0].color.components.red='0';await fs.writeFile(p,JSON.stringify(c));}
 if(mutation==='logo')await fs.writeFile(path.join(root,'Assets.xcassets/Logo.imageset/logo.png'),'replacement');
 if(mutation==='app')await fs.writeFile(path.join(root,'App.swift'),'// removed');
 assert.equal((await evaluate(root,'image-case')).pass,false,mutation+' must fail preservation');
 console.log(mutation+': destructive mutation rejected');
}finally{await fs.rm(root,{recursive:true,force:true});}}
