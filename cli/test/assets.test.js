import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {assetFiles, defaultTokens, generateAssets} from '../dist/assets.js';
test('all four traits and alpha are preserved without personal attribution',()=>{
 const files=assetFiles({version:1,colors:{AccentColor:{light:'#12345680',dark:'#FFFFFF',highContrastLight:'#000000',highContrastDark:'#FFFFFF'}}});
 const result=JSON.parse(files['AccentColor.colorset/Contents.json']);
 assert.equal(result.colors.length,4);
 assert.deepEqual(result.colors[3].appearances,[{appearance:'luminosity',value:'dark'},{appearance:'contrast',value:'high'}]);
 assert.equal(result.colors[0].color.components.alpha,(128/255).toFixed(8));
 assert.equal(result.info.author,'xcode');
});
test('reject missing appearances, path traversal, case collisions and unknown schema',()=>{
 for(const value of [{version:2,colors:defaultTokens.colors},{version:1,colors:{AccentColor:{light:'#fff'}}},{version:1,colors:{...defaultTokens.colors,'../Escape':defaultTokens.colors.AccentColor}},{version:1,colors:{...defaultTokens.colors,accentcolor:defaultTokens.colors.AccentColor}}]) assert.throws(()=>assetFiles(value));
});
test('writes a new catalog and refuses to replace an existing catalog or symlink',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'assets-test-'));
 try {
  const input=path.join(root,'tokens.json'),output=path.join(root,'Assets.xcassets');
  fs.writeFileSync(input,JSON.stringify(defaultTokens));
  assert.equal(generateAssets(input,output).length,4);
  assert.throws(()=>generateAssets(input,output),/already exists/);
  assert.equal(fs.readFileSync(path.join(output,'Contents.json'),'utf8'),assetFiles(defaultTokens)['Contents.json']);
  fs.symlinkSync(path.join(root,'missing'),path.join(root,'Link.xcassets'));
  assert.throws(()=>generateAssets(input,path.join(root,'Link.xcassets')));
  assert.equal(fs.existsSync(path.join(root,'missing')),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

import {rasterizeIcon} from '../dist/icon.js';
import {PNG} from 'pngjs';
test('ordered vector layers rasterize as opaque 1024 RGB icon',()=>{
 const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${body}</svg>`;
 const data=rasterizeIcon([svg('<rect width="1024" height="1024" fill="#ff0000"/>'),svg('<rect width="512" height="512" fill="#0000ff"/>')],'#FFFFFF');
 assert.equal(data[25],2); // PNG IHDR RGB, no alpha channel
 const png=PNG.sync.read(data);
 assert.equal(png.width,1024); assert.equal(png.height,1024);
 assert.deepEqual([...png.data.subarray(0,4)],[0,0,255,255]);
 assert.deepEqual([...png.data.subarray(png.data.length-4)],[255,0,0,255]);
 assert.throws(()=>rasterizeIcon([svg('<image href="file:///etc/passwd"/>')],'#FFFFFF'));
 assert.throws(()=>rasterizeIcon(['<svg width="10" height="20"></svg>'],'#FFFFFF'));
});

test('premultiplied translucent layers preserve brightness',()=>{
 const png=PNG.sync.read(rasterizeIcon(['<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="red" opacity="0.5"/></svg>'],'#FFFFFF'));
 assert.deepEqual([...png.data.subarray(0,4)],[255,127,127,255]);
});
