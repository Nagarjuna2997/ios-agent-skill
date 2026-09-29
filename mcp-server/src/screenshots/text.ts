import {create,Font} from 'fontkit';
import {boundedFile,hash} from './input.js';
export interface LoadedFont {font:Font;hash:string;}
export async function loadFonts(paths?:string[]):Promise<LoadedFont[]>{
 const candidates=paths??(process.platform==='darwin'?['/System/Library/Fonts/Supplemental/Arial.ttf']:process.platform==='win32'?['C:/Windows/Fonts/arial.ttf']:['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']);
 const fonts:LoadedFont[]=[];
 for(const path of candidates){const b=await boundedFile(path,40*1024*1024),parsed=create(b);for(const font of ('fonts' in parsed?parsed.fonts:[parsed]))fonts.push({font,hash:hash(b)});}
 if(!fonts.length)throw Error('Supply a local fontPaths array containing fonts licensed for your use.');return fonts;
}
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function typography(text:string,fonts:LoadedFont[],box:{x:number;y:number;width:number;height:number},size:number,color:string,direction:'ltr'|'rtl'){
 if(!text)return {svg:'',lines:[],bounds:box,fontHashes:[]};
 // Full Unicode bidi segmentation is not implemented. Fail closed instead of reversing digits/brands.
 if((direction==='rtl'&&[...text].some(c=>/[\p{Number}\p{Ps}\p{Pe}]/u.test(c)||(/\p{Letter}/u.test(c)&&!/[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(c))))||(direction==='ltr'&&/[\u0590-\u08FF]/u.test(text)))throw Error('Mixed-direction copy is unsupported. Use a single-direction text run using Arabic/Hebrew letters, without numbers, other scripts or paired brackets.');
 if(/[\u202A-\u202E\u2066-\u2069]/u.test(text))throw Error('Explicit bidi control characters are unsupported. Supply plain copy.');
 // Require one font to cover the complete text, preserving connected-script shaping.
 const chosen=fonts.find(f=>[...text].every(c=>/\s/u.test(c)||f.font.hasGlyphForCodePoint(c.codePointAt(0)!)));
 if(!chosen)throw Error('Missing glyph coverage. Supply a local font covering this locale.');
 const font=chosen.font,scale=size/font.unitsPerEm;
 const shape=(s:string)=>font.layout(s,undefined,undefined,undefined,direction);
 const width=(s:string)=>shape(s).positions.reduce((n,p)=>n+p.xAdvance,0)*scale;
 const words=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(s=>s.segment);
 const lines:string[]=[];let current='';
 for(const part of words){const next=current+part;if(width(next)>box.width){if(!current.trim())throw Error('Text cannot fit in its safe region.');let split=current.lastIndexOf(' ');if(split>0){lines.push(current.slice(0,split).trim());current=current.slice(split+1)+part;}else{lines.push(current);current=part;}}else current=next;}
 if(current.trim())lines.push(current.trim());
 const lineHeight=size*1.3;
 if(lines.length*lineHeight>box.height)throw Error('Text overflow: shorten copy or choose a larger text region.');
 let svg='';
 for(const [lineIndex,line]of lines.entries()){
  const run=shape(line),advance=width(line);let x=direction==='rtl'?box.x+box.width-advance:box.x;
  const baseline=box.y+size+lineIndex*lineHeight;
  for(const [i,glyph] of run.glyphs.entries()){
   const p=run.positions[i]!,gx=x+p.xOffset*scale,gy=baseline-p.yOffset*scale,b=glyph.bbox;
   if(gx+b.minX*scale<box.x-1||gx+b.maxX*scale>box.x+box.width+1||gy-b.maxY*scale<box.y-1||gy-b.minY*scale>box.y+box.height+1)throw Error('Glyph overflows safe text bounds. Shorten copy.');
   svg+=`<path fill="${color}" d="${escape(glyph.path.toSVG())}" transform="translate(${gx} ${gy}) scale(${scale} ${-scale})"/>`;
   x+=p.xAdvance*scale;
  }
 }
 return {svg,lines,bounds:box,fontHashes:[chosen.hash]};
}
