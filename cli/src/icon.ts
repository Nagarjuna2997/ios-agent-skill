import fs from 'node:fs';
import path from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {PNG} from 'pngjs';

/** Offline rasterization of a bounded set of square SVG layers, back to front. */
export function rasterizeIcon(layers: string[], background: string): Buffer {
  if (!layers.length || layers.length > 16 || !/^#[0-9a-fA-F]{6}$/.test(background)) throw Error('Require 1–16 SVG layers and opaque #RRGGBB background.');
  const output = Buffer.alloc(1024*1024*4);
  const rgb=[1,3,5].map(i=>parseInt(background.slice(i,i+2),16));
  for(let i=0;i<output.length;i+=4){output[i]=rgb[0];output[i+1]=rgb[1];output[i+2]=rgb[2];output[i+3]=255;}
  for(const svg of layers){
    if(Buffer.byteLength(svg)>1024*1024)throw Error('SVG layer exceeds 1 MiB.');
    // Only self-contained vector shapes. Fonts and external images are deliberately unsupported.
    if(/@import|url\(\s*["']?(?!#)|<!|<\s*(?:image|text|foreignObject|script)\b|\b(?:href|xlink:href)\s*=/i.test(svg))throw Error('Use self-contained SVG paths/shapes without text, images, entities or references.');
    const renderer=new Resvg(svg,{fitTo:{mode:'width',value:1024},font:{loadSystemFonts:false}});
    if(renderer.width!==renderer.height || renderer.width<=0)throw Error('SVG layers must have square dimensions.');
    const rendered=renderer.render();
    if(rendered.width!==1024 || rendered.height!==1024)throw Error('Expected 1024 square raster.');
    const pixels=rendered.pixels;
    for(let i=0;i<output.length;i+=4){const alpha=pixels[i+3]/255;for(let c=0;c<3;c++)output[i+c]=Math.round(pixels[i+c]+output[i+c]*(1-alpha));}
  }
  const png = new PNG({width:1024,height:1024});
  png.data = output;
  return PNG.sync.write(png,{colorType:2,inputColorType:6});
}

export function iconCatalogFiles(layers:string[], background:string):Record<string,string|Buffer>{
  return {'AppIcon.appiconset/AppIcon.png':rasterizeIcon(layers,background),'AppIcon.appiconset/Contents.json':JSON.stringify({images:[{filename:'AppIcon.png',idiom:'universal',platform:'ios',size:'1024x1024'}],info:{version:1,author:'xcode'}},null,2)+'\n'};
}

export function iconFiles(directory:string, background:string):Record<string,string|Buffer>{
  const manifestPath=path.join(directory,'manifest.json');
  const stat=fs.lstatSync(manifestPath);
  if(!stat.isFile() || stat.isSymbolicLink() || stat.size>16384)throw Error('Invalid icon manifest.');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.format!=='ios-agent-svg-layer-starter' || manifest.version!==1 || !Array.isArray(manifest.layers) || manifest.layers.length>16)throw Error('Unsupported icon layer manifest.');
  const layers=manifest.layers.map((name:unknown)=>{
    if(typeof name!=='string' || !/^[A-Za-z0-9_-]+\.svg$/.test(name))throw Error('Invalid layer filename.');
    const file=path.join(directory,name), stat=fs.lstatSync(file);
    if(!stat.isFile() || stat.isSymbolicLink() || stat.size>1024*1024)throw Error('Invalid SVG layer file.');
    return fs.readFileSync(file,'utf8');
  });
  return iconCatalogFiles(layers,background);
}
