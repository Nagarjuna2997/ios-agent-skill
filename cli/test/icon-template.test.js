import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {generateAssets} from '../dist/assets.js';
const template=fileURLToPath(new URL('../../templates/app-icon/',import.meta.url));
for(const [mode,rgb] of [['default',[36,87,219]],['dark',[16,27,53]],['mono',[52,52,52]]]){
 test(`shipped ${mode} icon pack exports an opaque correctly layered catalog`,()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'icon-template-'));
  try{
   const output=path.join(root,'Assets.xcassets');
   generateAssets(path.join(template,'tokens.json'),output,path.join(template,mode));
   const icon=path.join(output,'AppIcon.appiconset');
   const manifest=JSON.parse(fs.readFileSync(path.join(icon,'Contents.json'),'utf8'));
   assert.equal(manifest.images[0].platform,'ios');
   const png=PNG.sync.read(fs.readFileSync(path.join(icon,manifest.images[0].filename)));
   assert.equal(png.width,1024);assert.equal(png.height,1024);
   assert.deepEqual([...png.data.subarray(0,4)],[...rgb,255]);
   const center=(350*1024+350)*4;
   assert.notDeepEqual([...png.data.subarray(center,center+3)],rgb,'symbol must remain visible');
   for(let i=3;i<png.data.length;i+=4)assert.equal(png.data[i],255);
   assert.throws(()=>generateAssets(path.join(template,'tokens.json'),output,path.join(template,mode)),/exist/i);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
 });
}
