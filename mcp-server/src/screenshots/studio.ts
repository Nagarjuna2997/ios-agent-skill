import {mkdir,writeFile,readdir,rm,lstat} from 'node:fs/promises';
import {resolve,dirname,join,relative,isAbsolute} from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {z} from 'zod';
import {profiles,profileSource,getTemplate} from './catalog.js';
import {boundedFile,imageInput,hash,rgbPNG} from './input.js';
import {loadFonts,typography,LoadedFont} from './text.js';
import {reviewColorSystem} from '../colors/review.js';
import {contrast} from '../colors/math.js';
const path=z.string().min(1).max(4096);
const copy=z.string().max(240).refine(s=>!/[\u0000-\u001f]/u.test(s),'Copy must be plain, single-paragraph text');
export const screenSchema=z.object({image:path,headline:copy.optional(),description:copy.optional(),subtitle:copy.optional(),badge:copy.optional(),additionalImages:z.array(path).max(2).optional()}).strict();
export const recipeSchema=z.object({projectPath:path.optional(),inputDirectory:path.optional(),screens:z.array(screenSchema).min(1).max(10).optional(),appName:copy.default('Your app'),templates:z.array(z.string().min(1).max(40)).min(1).max(8).default(['minimal']),profile:z.enum(['iphone-portrait','iphone-landscape','ipad-portrait','ipad-landscape']).default('iphone-portrait'),locale:z.string().regex(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/).default('en-US'),direction:z.enum(['ltr','rtl']).optional(),accent:z.string().regex(/^#[\da-fA-F]{6}$/).optional(),fontPaths:z.array(path).min(1).max(8).optional(),iconPath:path.optional(),outputDirectory:path}).strict();
export type Recipe=z.infer<typeof recipeSchema>;
type Screen=z.infer<typeof screenSchema>;
type Box={x:number;y:number;width:number;height:number};
type TextEvidence={text:string;lines:string[];bounds:Box;size:number;contrast:number;fontHashes:string[]};
type Entry={file:string;sha256:string;template:string;locale:string;profile:Recipe['profile'];width:number;height:number;sources:{sha256:string;width:number;height:number;placement:Box}[];texts:TextEvidence[];warnings:string[]};
type Manifest={schemaVersion:1;renderDate:string;renderer:string;profileSource:typeof profileSource;recipe:Recipe;entries:Entry[];preview:string;previewHash:string};
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const rect=(b:Box,fill:string,r=0)=>`<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${r}" fill="${fill}"/>`;
const fit=(w:number,h:number,b:Box):Box=>{const scale=Math.min(b.width/w,b.height/h);return {x:b.x+(b.width-w*scale)/2,y:b.y+(b.height-h*scale)/2,width:w*scale,height:h*scale};};
function safeCopy(screen:Screen,appName:string){const headline=(screen.headline??screen.description??appName).trim();if(!headline)throw Error('Supply a nonempty headline, description or app name.');for(const text of [headline,screen.subtitle,screen.badge])if(text&&/(?:#1|\bbest\b|\bfastest\b|\bmost secure\b)/i.test(text))throw Error('Unsupported superiority claim. Use factual supplied screen copy.');return {headline,subtitle:screen.subtitle??'',badge:screen.badge??''};}
export async function resolveRecipe(input:unknown):Promise<Recipe>{
 const r=recipeSchema.parse(input);new Intl.Locale(r.locale);
 if(!r.screens){if(!r.inputDirectory)throw Error('Supply screens or inputDirectory.');const dir=await lstat(r.inputDirectory);if(!dir.isDirectory()||dir.isSymbolicLink())throw Error('Expected a local screenshot directory.');const files=(await readdir(r.inputDirectory)).filter(f=>/\.(png|jpe?g)$/i.test(f)).sort();if(!files.length||files.length>10)throw Error('Screenshot folders must contain 1–10 images.');r.screens=files.map(f=>({image:resolve(r.inputDirectory!,f),headline:r.appName}));}
 r.screens.forEach(s=>safeCopy(s,r.appName));
 if(new Set(r.templates).size!==r.templates.length)throw Error('Duplicate templates would collide.');r.templates.forEach(getTemplate);
 if(!r.accent&&r.projectPath){const review=await reviewColorSystem(r.projectPath);const candidates=review.detectedColors.filter(c=>c.kind==='asset:light');r.accent=candidates.find(c=>/accent/i.test(c.role??''))?.color??candidates[0]?.color;}
 r.accent??='#5268D8';r.direction??=/^(ar|he|fa|ur)(-|$)/i.test(r.locale)?'rtl':'ltr';
 // Store absolute input paths for local reproducibility. This manifest is private until the user shares it.
 r.screens=r.screens.map(s=>({...s,image:resolve(s.image),additionalImages:s.additionalImages?.map(p=>resolve(p))}));r.fontPaths=r.fontPaths?.map(p=>resolve(p));if(r.iconPath)r.iconPath=resolve(r.iconPath);return r;
}
async function render(r:Recipe,screen:Screen,template:string,fonts:LoadedFont[]){
 const t=getTemplate(template),{width:w,height:h}=profiles[r.profile],landscape=w>h;
 const margin=Math.round(w*.065),gap=Math.round(w*.035),dark=template==='dark-premium';
 const bg=dark?'#111827':'#F3F4F8',panel=dark?'#182235':'#FFFFFF',fg=dark?'#FFFFFF':'#172033';
 const titleSize=Math.round(Math.min(w*.077,h*.09)),bodySize=Math.round(titleSize*.47),labelSize=Math.round(titleSize*.38);
 const copy=safeCopy(screen,r.appName),rtl=r.direction==='rtl';
 let textBox:Box={x:margin,y:h*.055,width:w-margin*2,height:h*.26};
 let imageBox:Box={x:margin,y:h*.37,width:w-margin*2,height:h*.57};
 if(landscape||t.layout==='split'){const textWidth=w*.42;textBox={x:rtl?w-margin-textWidth:margin,y:h*.15,width:textWidth,height:h*.67};imageBox={x:rtl?margin:w*.55,y:h*.08,width:w*.38,height:h*.84};}
 else if(t.layout==='floating'){textBox.y=h*.08;textBox.width=w*.77;imageBox={x:w*.14,y:h*.39,width:w*.78,height:h*.55};}
 else if(t.layout==='full-bleed'){textBox={x:margin,y:h*.045,width:w-2*margin,height:h*.22};imageBox={x:w*.025,y:h*.30,width:w*.95,height:h*.68};}
 else if(t.layout==='card'){imageBox={x:w*.13,y:h*.39,width:w*.74,height:h*.54};}
 if(landscape&&t.layout==='split'){
  textBox={x:rtl?w*.63:margin,y:h*.23,width:w*.30,height:h*.65};
  imageBox={x:rtl?margin:w*.42,y:h*.065,width:w*.51,height:h*.87};
 }
 if(t.layout==='feature'){
  if(landscape){textBox={x:margin,y:h*.14,width:w*.36,height:h*.72};imageBox={x:w*.51,y:h*.12,width:w*.42,height:h*.76};}
  else {textBox={x:w*.10,y:h*.075,width:w*.80,height:h*.28};imageBox={x:w*.065,y:h*.415,width:w*.82,height:h*.52};}
 }
 if(landscape&&t.layout==='full-bleed'){
  textBox={x:margin,y:h*.05,width:w*.85,height:h*.31};imageBox={x:margin,y:h*.44,width:w-2*margin,height:h*.50};
 }
 const images=[screen.image,...(screen.additionalImages??[])];
 if((t.layout==='comparison'&&images.length!==2)||(t.layout==='multi-device'&&images.length<2))throw Error(`${template} needs ${template==='comparison'?'exactly two':'two or three'} supplied screenshots per screen.`);
 if(!['comparison','multi-device'].includes(t.layout)&&images.length!==1)throw Error(`${template} accepts one screenshot per screen.`);
 const defs=`<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${r.accent}"/><stop offset="1" stop-color="#DDE4FF"/></linearGradient><radialGradient id="glow"><stop stop-color="${r.accent}" stop-opacity=".5"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient></defs>`;
 let svg=defs+rect({x:0,y:0,width:w,height:h},t.background==='gradient'?'url(#bg)':bg);
 if(t.background==='radial')svg+=`<ellipse cx="${w*.8}" cy="${h*.5}" rx="${w*.85}" ry="${h*.5}" fill="url(#glow)"/>`;
 if(t.layout==='card')svg+=rect({x:w*.07,y:h*.35,width:w*.86,height:h*.62},'#E2E5ED',w*.05);
 // Size the opaque panel to actual text instead of leaving empty slots.
 const texts:TextEvidence[]=[];let textSVG='',cursor=textBox.y;
 const addText=(text:string,size:number,maxHeight:number)=>{
  if(!text)return;
  const box={x:textBox.x,y:cursor,width:textBox.width,height:maxHeight};
  const shaped=typography(text,fonts,box,size,fg,r.direction!);
  const used=Math.max(size*1.3,shaped.lines.length*size*1.3);
  texts.push({text,lines:shaped.lines,bounds:{...box,height:used},size,contrast:contrast(fg,panel),fontHashes:shaped.fontHashes});
  textSVG+=shaped.svg;cursor+=used+bodySize*.42;
 };
 addText(copy.headline,titleSize,textBox.height*.62);
 addText(copy.subtitle,bodySize,textBox.y+textBox.height-cursor-(copy.badge?labelSize*1.8:0));
 addText(copy.badge,labelSize,textBox.y+textBox.height-cursor);
 svg+=rect({x:textBox.x-gap*.5,y:textBox.y-gap*.5,width:textBox.width+gap,height:cursor-textBox.y+gap*.35},panel,w*.025)+textSVG;
 if(r.iconPath){const icon=await imageInput(r.iconPath);const side=Math.min(margin*.65,h*.025);svg+=`<image href="${icon.dataURL}" x="${w-margin-side}" y="${h*.012}" width="${side}" height="${side}" preserveAspectRatio="xMidYMid meet"/>`;}
 const sources:Entry['sources']=[],warnings:string[]=[];
 for(const [i,path]of images.entries()){
  const img=await imageInput(path),slot={...imageBox,x:imageBox.x+i*(imageBox.width+gap)/images.length,width:(imageBox.width-gap*(images.length-1))/images.length};
  const frame=fit(img.width,img.height,{x:slot.x+12,y:slot.y+12,width:slot.width-24,height:slot.height-24});
  // Keep the supplied image rectangular and intact inside a rounded neutral bezel. No camera covers app pixels.
  svg+=rect({x:frame.x-11,y:frame.y-7,width:frame.width+22,height:frame.height+22},'#00000022',24);
  svg+=rect({x:frame.x-9,y:frame.y-9,width:frame.width+18,height:frame.height+18},'#22252B',22);
  svg+=`<image href="${img.dataURL}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" preserveAspectRatio="xMidYMid meet"/>`;
  sources.push({sha256:img.hash,width:img.width,height:img.height,placement:frame});if(img.transparent)warnings.push('Source transparency flattened onto white; source file unchanged.');
 }
 const raster=new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svg}</svg>`,{font:{loadSystemFonts:false}}).render();
 return {png:rgbPNG(w,h,raster.pixels),evidence:{template,locale:r.locale,profile:r.profile,width:w,height:h,sources,texts,warnings}};
}
async function newDirectory(destination:string,work:(stage:string)=>Promise<void>){
 const target=resolve(destination);try{await lstat(target);throw Error('Output already exists; choose a new directory.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const parent=dirname(target);await mkdir(parent,{recursive:true});
 // mkdir exclusively reserves the destination, without replacing a racing directory.
 await mkdir(target);try{await work(target);}catch(e){await rm(target,{recursive:true,force:true});throw e;}
 return target;
}
async function contactSheet(stage:string,entries:Entry[]){
 const cols=Math.min(5,entries.length),tileW=224,tileH=480,rows=Math.ceil(entries.length/cols),w=cols*tileW,h=rows*tileH;
 let svg=rect({x:0,y:0,width:w,height:h},'#E7E9F0');
 for(const [i,e]of entries.entries()){const b=await boundedFile(join(stage,e.file));const thumb=new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${tileH}"><image href="data:image/png;base64,${b.toString('base64')}" width="${tileW}" height="${tileH}" preserveAspectRatio="xMidYMid meet"/></svg>`).render().asPng();svg+=`<image href="data:image/png;base64,${thumb.toString('base64')}" x="${(i%cols)*tileW+8}" y="${Math.floor(i/cols)*tileH+8}" width="${tileW-16}" height="${tileH-16}" preserveAspectRatio="xMidYMid meet"/>`;}
 const pixels=new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svg}</svg>`,{font:{loadSystemFonts:false}}).render().pixels;
 const png=rgbPNG(w,h,pixels);await writeFile(join(stage,'preview.png'),png,{flag:'wx'});
 const gallery=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Screenshot Studio preview</title><style>body{background:#eee;color:#172033;font:16px system-ui;margin:32px}section{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0;width:220px}img{width:100%}figcaption{overflow-wrap:anywhere}</style><h1>Local screenshot preview</h1><p>Inspect every image. Dimension checks are not Apple approval.</p><section>${entries.map(e=>`<figure><a href="${esc(e.file)}"><img src="${esc(e.file)}" alt="${esc(e.texts[0]?.text??e.file)}"></a><figcaption>${esc(e.locale)} / ${esc(e.template)} / ${esc(e.file.split('/').at(-1)!)}</figcaption></figure>`).join('')}</section></html>`;
 await writeFile(join(stage,'preview.html'),gallery,{flag:'wx'});return hash(png);
}
export async function generateSet(input:unknown){
 const r=await resolveRecipe(input),fonts=await loadFonts(r.fontPaths);let manifest:Manifest|undefined;
 const outputDirectory=await newDirectory(r.outputDirectory,async stage=>{
  const entries:Entry[]=[];
  for(const template of r.templates)for(const [i,screen]of r.screens!.entries()){
   const file=`${r.locale}/${template}/${r.profile}/${String(i+1).padStart(2,'0')}.png`,result=await render(r,screen,template,fonts);
   await mkdir(dirname(join(stage,file)),{recursive:true});await writeFile(join(stage,file),result.png,{flag:'wx'});entries.push({file,sha256:hash(result.png),...result.evidence});
  }
  manifest={schemaVersion:1,renderDate:new Date().toISOString(),renderer:'resvg-js@2.6.2; fontkit@2.0.4; pngjs@7.0.0',profileSource,recipe:r,entries,preview:'preview.png',previewHash:await contactSheet(stage,entries)};
  await writeFile(join(stage,'screenshot-set.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  const validation=await inspectSet(stage);if(!validation.passed)throw Error('Generated set validation failed: '+validation.errors.join('; '));
 });
 return {outputDirectory,count:manifest!.entries.length,manifest:join(outputDirectory,'screenshot-set.json'),preview:join(outputDirectory,'preview.html'),validation:await inspectSet(outputDirectory)};
}
const boxSchema=z.object({x:z.number().finite().nonnegative(),y:z.number().finite().nonnegative(),width:z.number().finite().positive(),height:z.number().finite().positive()});
const digest=z.string().regex(/^[a-f0-9]{64}$/);
const entrySchema=z.object({file:z.string().max(512),sha256:digest,template:z.string(),locale:z.string(),profile:z.enum(['iphone-portrait','iphone-landscape','ipad-portrait','ipad-landscape']),width:z.number(),height:z.number(),sources:z.array(z.object({sha256:digest,width:z.number().positive(),height:z.number().positive(),placement:boxSchema})).min(1).max(3),texts:z.array(z.object({text:z.string(),lines:z.array(z.string()),bounds:boxSchema,size:z.number().positive(),contrast:z.number().min(1).max(21),fontHashes:z.array(digest).min(1)})).min(1).max(3),warnings:z.array(z.string())});
async function readManifest(dir:string){const parsed=JSON.parse((await boundedFile(join(dir,'screenshot-set.json'),2*1024*1024)).toString());return z.object({schemaVersion:z.literal(1),renderDate:z.string(),renderer:z.string(),profileSource:z.unknown(),recipe:recipeSchema,entries:z.array(entrySchema).min(1).max(80),preview:z.literal('preview.png'),previewHash:digest}).parse(parsed);}
async function confinedFile(dir:string,file:string){if(isAbsolute(file)||file.includes('\\')||file.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Unsafe manifest path.');const full=resolve(dir,file);if(relative(resolve(dir),full).startsWith('..'))throw Error('Unsafe manifest path.');let cursor=resolve(dir);for(const part of file.split('/')){cursor=join(cursor,part);if((await lstat(cursor)).isSymbolicLink())throw Error('Symlinks are not allowed in sets.');}return full;}
export async function inspectSet(directory:string){
 const m=await readManifest(directory),errors:string[]=[],warnings:string[]=[],seen=new Set<string>(),sourceSets=new Map<string,string>();
 const expected=new Set(m.recipe.templates.flatMap(t=>(m.recipe.screens??[]).map((_,i)=>`${m.recipe.locale}/${t}/${m.recipe.profile}/${String(i+1).padStart(2,'0')}.png`)));
 for(const [i,e]of m.entries.entries()){
  try{
   if(!expected.has(e.file))throw Error('Filename does not match recipe sequence.');if(!e.file.startsWith(`${e.locale}/${e.template}/${e.profile}/`))throw Error('Filename metadata mismatch.');if(seen.has(e.file))throw Error('Duplicate output filename.');seen.add(e.file);getTemplate(e.template);
   if(e.locale!==m.recipe.locale||!m.recipe.templates.includes(e.template)||e.profile!==m.recipe.profile)throw Error('Inconsistent locale, template or profile.');
   const p=profiles[e.profile],bytes=await boundedFile(await confinedFile(directory,e.file));
   if(hash(bytes)!==e.sha256)throw Error('Output hash mismatch.');
   if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes[25]!==2)throw Error('Output must be opaque RGB PNG.');
   const img=await imageInput(await confinedFile(directory,e.file));
   if(img.width!==p.width||img.height!==p.height||e.width!==p.width||e.height!==p.height)throw Error('Profile dimensions mismatch.');
   for(const s of e.sources){const b=s.placement;if(b.x+b.width>p.width||b.y+b.height>p.height||Math.abs(b.width/b.height-s.width/s.height)>.00001)throw Error('Image bounds/aspect-ratio mismatch.');}
   for(const t of e.texts){const b=t.bounds;if(b.x<p.width*.02||b.y<p.height*.01||b.x+b.width>p.width*.98||b.y+b.height>p.height*.99||t.size<24||t.contrast<4.5)throw Error('Text safe margin, size or contrast failed.');if(e.sources.some(s=>overlap(b,s.placement)))throw Error('Text overlaps supplied UI.');}
   const signature=e.template+e.sources.map(s=>s.sha256).join(':');if(sourceSets.has(signature))warnings.push(`${e.file}: repeats source image(s) from ${sourceSets.get(signature)}; confirm intentional.`);else sourceSets.set(signature,e.file);
   warnings.push(...e.warnings.map(w=>`${e.file}: ${w}`));
  }catch(error){errors.push(`${i+1} ${e.file}: ${error instanceof Error?error.message:String(error)}`);}
 }
 if(m.entries.length!==m.recipe.templates.length*(m.recipe.screens?.length??0))errors.push('Entry count does not match recipe.');
 try{if(hash(await boundedFile(await confinedFile(directory,m.preview)))!==m.previewHash)errors.push('Preview hash mismatch.');}catch{errors.push('Preview missing or unreadable.');}
 return {passed:errors.length===0,checked:m.entries.length,errors,warnings,scope:'PNG dimensions, hashes and recorded rendering geometry. Not a pixel-level UI review, authenticated evidence or Apple approval.'};
}
const overlap=(a:Box,b:Box)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
export async function previewSet(directory:string){const validation=await inspectSet(directory);if(!validation.passed)throw Error('Set validation failed: '+validation.errors.join('; '));return {contactSheet:resolve(directory,'preview.png'),gallery:resolve(directory,'preview.html'),validation};}
export async function exportSet(directory:string,outputDirectory:string){const validation=await inspectSet(directory);if(!validation.passed)throw Error('Set validation failed: '+validation.errors.join('; '));const m=await readManifest(directory);await newDirectory(outputDirectory,async stage=>{for(const e of m.entries){const b=await boundedFile(await confinedFile(directory,e.file));if(hash(b)!==e.sha256)throw Error('Output changed during export.');await mkdir(dirname(join(stage,e.file)),{recursive:true});await writeFile(join(stage,e.file),b,{flag:'wx'});}await writeFile(join(stage,'export.json'),JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),profileSource,entries:m.entries,validation},null,2),{flag:'wx'});});return {outputDirectory:resolve(outputDirectory),validation};}
export async function localizeSet(directory:string,locale:string,copy:Pick<Screen,'headline'|'subtitle'|'badge'>[],outputDirectory:string,fontPaths?:string[]){const m=await readManifest(directory);if(copy.length!==m.recipe.screens?.length)throw Error('Supply translated copy for every screen in order.');return generateSet({...m.recipe,locale,direction:undefined,fontPaths:fontPaths??m.recipe.fontPaths,outputDirectory,screens:m.recipe.screens.map((s,i)=>({...s,headline:copy[i]!.headline,subtitle:copy[i]!.subtitle??'',badge:copy[i]!.badge??'',description:undefined}))});}
