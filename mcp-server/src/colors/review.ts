import { readdir,readFile,lstat } from 'node:fs/promises';
import { join,relative,basename } from 'node:path';
import { readSwiftFiles,resolveProjectRoot } from '../scan.js';
import { appIntentsCode } from '../analyzers/app-intents.js';
import { contrast,hex,toLCH } from './math.js';
export interface ColorEvidence {file:string;line:number;color:string;kind:string;role?:string;confidence:'high'|'medium';}
export interface ColorConcern {rule:string;file:string;line:number;message:string;confidence:'high'|'medium';severity:'advisory'|'concern';}
type Variants=Partial<Record<'light'|'dark'|'highContrastLight'|'highContrastDark',string>>;
const skip=new Set(['.git','.build','DerivedData','node_modules','Pods','Carthage','vendor','Vendor','build']);
export async function reviewColorSystem(path:string){
 const root=await resolveProjectRoot(path),files=await readSwiftFiles(root),detectedColors:ColorEvidence[]=[],concerns:ColorConcern[]=[],coverage:{file:string;name:string;variants:Variants}[]=[],limitations:string[]=[];
 const limit=2048;
 let visited=0;
 const addColor=(e:ColorEvidence)=>{if(detectedColors.length<limit)detectedColors.push(e);else if(!limitations.includes('Color evidence truncated at 2048 entries.'))limitations.push('Color evidence truncated at 2048 entries.');};
 const addConcern=(e:ColorConcern)=>{if(concerns.length<256)concerns.push(e);else if(!limitations.includes('Concerns truncated at 256 entries.'))limitations.push('Concerns truncated at 256 entries.');};
 async function walk(dir:string):Promise<void>{
  if(++visited>4000){limitations.push('Directory budget reached.');return;}
  for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
   if(e.isSymbolicLink())continue;
   const full=join(dir,e.name);
   if(e.isDirectory()&&!skip.has(e.name)&&!e.name.endsWith('.xcodeproj'))await walk(full);
   if(e.isFile()&&e.name==='Contents.json'&&dir.endsWith('.colorset')&&coverage.length<512){
    const file=relative(root,full);if((await lstat(full)).size>128*1024){limitations.push(`Oversize catalog: ${file}`);continue;}
    try {
     const data=JSON.parse(await readFile(full,'utf8')),variants:Variants={},ambiguous=new Set<string>();
     if(!Array.isArray(data.colors))throw Error();
     for(const entry of data.colors){
      const a=entry.appearances??[];
      if(entry.idiom!=='universal'||entry.color?.['color-space']!=='srgb'||!Array.isArray(a)||a.some((x:{appearance:string;value:string})=>!['luminosity','contrast'].includes(x.appearance)||!['dark','high'].includes(x.value))){limitations.push(`Unresolved color variant: ${file}`);continue;}
      const c=entry.color.components;
      const parse=(v:unknown)=>typeof v==='string'&&/^0x[\da-f]{2}$/i.test(v)?parseInt(v.slice(2),16)/255:typeof v==='string'&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)?Number(v):typeof v==='number'?v:NaN;
      const channels=['red','green','blue'].map(k=>parse(c?.[k])),alpha=parse(c?.alpha);
      if(alpha!==1||!channels.every(v=>Number.isFinite(v)&&v>=0&&v<=1)){limitations.push(`Non-opaque or unsupported components: ${file}`);continue;}
      const dark=a.some((x:{appearance:string;value:string})=>x.appearance==='luminosity'&&x.value==='dark'),high=a.some((x:{appearance:string;value:string})=>x.appearance==='contrast'&&x.value==='high');
      const key=high?(dark?'highContrastDark':'highContrastLight'):(dark?'dark':'light');
      if(ambiguous.has(key))continue;
      if(variants[key]){ambiguous.add(key);delete variants[key];limitations.push(`Ambiguous duplicate appearance: ${file}`);continue;}
      variants[key]=hex(channels as [number,number,number]);
     }
     coverage.push({file,name:basename(dir,'.colorset'),variants});
     for(const [appearance,color] of Object.entries(variants))addColor({file,line:1,color,kind:`asset:${appearance}`,role:basename(dir,'.colorset'),confidence:'high'});
     if(variants.light&&!data.colors.some((e:{appearances?:{appearance:string;value:string}[]})=>Array.isArray(e.appearances)&&e.appearances.some(a=>a.appearance==='luminosity'&&a.value==='dark')))addConcern({rule:'color-dark-coverage',file,line:1,message:'Any appearance has no explicit Dark variant. Confirm the same brand color is intentional and readable in both appearances.',confidence:'high',severity:'advisory'});
    }catch{limitations.push(`Unreadable or malformed color catalog: ${file}`);}
   }
  }
 }
 await walk(root);
 const numeric=/\b(Color|UIColor)\(\s*red:\s*([\d.]+)\s*,\s*green:\s*([\d.]+)\s*,\s*blue:\s*([\d.]+)(?:\s*,\s*(?:opacity|alpha):\s*([\d.]+))?\s*\)/g;
 for(const f of files){
  const code=appIntentsCode(f.content);if(!/\bimport\s+(SwiftUI|UIKit)\b/.test(code)||/\b(?:struct|class|enum|typealias)\s+(Color|UIColor)\b/.test(code))continue;
  const line=(i:number)=>f.content.slice(0,i).split('\n').length;
  for(const m of f.content.matchAll(numeric)){
   if(!code.slice(m.index,m.index+5).trim())continue;
   const channels=m.slice(2,5).map(Number);if(!channels.every(v=>v>=0&&v<=1)||m[5]&&Number(m[5])!==1)continue;
   addColor({file:f.path,line:line(m.index),color:hex(channels as [number,number,number]),kind:'literal',confidence:'high'});
  }
  for(const m of f.content.matchAll(/\b(?:Color|UIColor)\(hex:\s*"#?([\da-fA-F]{6})"\s*\)/g)){
   if(!code.slice(m.index,m.index+5).trim())continue;
   addColor({file:f.path,line:line(m.index),color:'#'+m[1].toUpperCase(),kind:'custom-hex-initializer (semantics unverified)',confidence:'medium'});
  }
  // Only direct named-color Text chains, with no intervening opacity/material modifiers.
  const pairs=/\bText\("[^"\\\n]*"\)\s*\.foregroundStyle\(Color\("([A-Za-z][A-Za-z0-9_]*)"\)\)\s*\.background\(Color\("([A-Za-z][A-Za-z0-9_]*)"\)\)/g;
  for(const m of f.content.matchAll(pairs)){
   if(code.slice(m.index,m.index+4)!=='Text')continue;
   const foreground=coverage.filter(c=>c.name===m[1]),background=coverage.filter(c=>c.name===m[2]);
   if(foreground.length!==1||background.length!==1)continue;
   for(const a of ['light','dark'] as const){const fg=foreground[0].variants[a],bg=background[0].variants[a];if(fg&&bg&&contrast(fg,bg)<2.95)addConcern({rule:'color-text-contrast',file:f.path,line:line(m.index),message:`Explicit ${a} pair ${m[1]} on ${m[2]} is ${contrast(fg,bg).toFixed(2)}:1, below even the 3:1 large-text threshold. Confirm target asset membership and rendered context.`,confidence:'medium',severity:'concern'});}
  }
  const literals=detectedColors.filter(c=>c.file===f.path&&c.kind==='literal');
  if(new Set(literals.map(c=>c.color)).size>=8)addConcern({rule:'color-literal-sprawl',file:f.path,line:literals[0].line,message:'Eight or more opaque RGB literals in this source. Consider semantic tokens; charts, artwork and custom branding may justify them.',confidence:'medium',severity:'advisory'});
 }
 const groups=new Map<string,ColorEvidence[]>();
 for(const e of detectedColors){const group=groups.get(e.color)||[];group.push(e);groups.set(e.color,group);}
 const duplicates=[...groups].filter(([,e])=>e.length>1).map(([color,evidence])=>({color,evidence}));
 const hues=['Red','Orange','Yellow','Green','Teal','Cyan','Blue','Indigo','Violet','Pink'];
 return {detectedColors,duplicates,likelyPaletteFamilies:[...new Set(detectedColors.map(c=>{const [,ch,h]=toLCH(c.color);return ch<.035?'Neutral / Minimal':hues[Math.floor(h/36)%10];}))],lightDarkCoverage:coverage,concerns,suggestedTokenConsolidation:duplicates.map(g=>({color:g.color,locations:g.evidence.length,recommendation:'Review shared semantic intent before consolidating; equal RGB does not imply equal meaning.'})),limitations:[...new Set([...limitations,'Lexical, bounded scan; not Swift type checking, target membership resolution or rendered contrast validation.','No inferred contrast for materials, gradients, dynamic providers, Display P3, alpha, inherited modifiers or runtime-generated colors.','Custom branding and Apple semantic colors are not errors. Role inconsistencies, excessive accents and replacement of system semantics require design context; not diagnosed automatically.','This project reviewer does not decode images; the generation tool separately supports explicit local PNG input.'])]};
}
