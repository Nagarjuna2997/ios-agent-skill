import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as html from 'parse5';
import YAML from 'yaml';
import {marked} from 'marked';
import {XMLParser, XMLValidator} from 'fast-xml-parser';
export {fs,path,html,YAML,marked,XMLParser,XMLValidator};
export const ROOT=process.env.SITE_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const SITE=path.join(ROOT,'site');
export const BASE='https://nagarjuna2997.github.io/ios-agent-skill/';
export const REPO='https://github.com/Nagarjuna2997/ios-agent-skill';
export const NAME='iOS Agent Skill';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[]):[];}
export const relative=p=>path.relative(SITE,p).split(path.sep).join('/');
export const eligible=p=>!p.startsWith('assets/') && !/(^|\/)404(?:\.html?|\.md)$/.test(p);
export const urlFor=p=>new URL(p.replace(/(^|\/)index\.html$/,'$1'),BASE).href;
export function nodes(n,predicate){return [...(predicate(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>nodes(c,predicate))];}
export const attr=(n,name)=>n?.attrs?.find(a=>a.name===name)?.value;
export function text(n){if(n.nodeName==='#text')return n.value; if(['script','style','nav','footer','template','noscript'].includes(n.tagName))return '';return (n.childNodes||[]).map(text).join(['p','li','h1','h2','h3','div','section','pre','tr'].includes(n.tagName)?'\n':'');}
export const clean=s=>String(s).replace(/\s+/g,' ').trim();
export const parse=s=>html.parse(s);
export const select=(d,tag)=>nodes(d,n=>n.tagName===tag);
export const meta=(d,name)=>select(d,'meta').filter(n=>attr(n,'name')===name||attr(n,'property')===name).map(n=>attr(n,'content'));
export const canonical=d=>select(d,'link').filter(n=>attr(n,'rel')==='canonical').map(n=>attr(n,'href'));
export function short(s,n){s=clean(s);return s.length<=n?s:s.slice(0,n-1).replace(/\s+\S*$/,'')+'…';}
export function git(args){try{return execFileSync('git',args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch{return '';}}
export function dates(file,dependencies=[]){const own=git(['log','--format=%cI','--',file]).split('\n').filter(Boolean);const rows=dependencies.length?git(['log','--format=%cI','--',file,...dependencies]).split('\n').filter(Boolean):own;const fallback=git(['log','-1','--format=%cI']);if(!fallback)throw Error('A Git checkout is required for lastmod');return {modified:rows[0]||fallback,published:own.at(-1)||rows.at(-1)||fallback};}
export function sourcesFor(file){
 const sources=[];
 // Generated articles also change when their source changes without a checked-in render.
 const visuals=path.join(ROOT,'content/guides/visuals.json');
 if(file.startsWith('guides/')&&fs.existsSync(visuals)){
  const source=Object.keys(JSON.parse(fs.readFileSync(visuals,'utf8'))).find(p=>'guides/'+p.replace(/^docs\//,'').replace(/\.md$/,'').replaceAll('/','-')+'.html'===file);
  if(source)sources.push(source);
  sources.push('content/guides/visuals.json','scripts/guide-visuals.py','scripts/render-library.py');
 }
 if(file.startsWith('series/'))sources.push('content/'+file.replace(/\.html$/,'.md'),'content/blog/series.json','content/series/diagrams.json','content/series/related-reading.json','scripts/render-series.py');
 if(file.startsWith('blog/'))sources.push('content/blog/articles.json','scripts/render-blog.py');
 if(['docs-index.html','pages.html'].includes(file))sources.push('scripts/site-meta.mjs');
 return sources.filter(p=>fs.existsSync(path.join(ROOT,p)));
}
export function frontMatter(s,file){const m=s.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!m)throw Error(`${file}: Markdown needs YAML front matter (title, description)`);const data=YAML.parse(m[1]);if(!data||typeof data.title!=='string'||typeof data.description!=='string')throw Error(`${file}: front matter needs title and description`);if(data.draft!==undefined&&typeof data.draft!=='boolean')throw Error(`${file}: draft must be a YAML boolean`);return {data,body:s.slice(m[0].length)};}
export const readMap=()=>JSON.parse(fs.readFileSync(path.join(SITE,'pages.json'),'utf8'));
export const group=p=>/^blog\//.test(p)?'Blog':/^install(?:[/.]|\.html)/.test(p)?'Install guides':/^(?:guides|docs|series)\//.test(p)||p==='docs-index.html'?'Docs':'Pages';
export function metadata(d){return {title:clean(text(select(d,'title')[0]||{})),description:meta(d,'description')[0]||clean(text(select(d,'p')[0]||{}))};}
export function records(){const map=readMap();return walk(SITE).filter(p=>/\.html$/.test(p)&&eligible(relative(p))).map(p=>{const key=relative(p);const md=p.replace(/\.html$/,'.md');const f=fs.existsSync(md)?frontMatter(fs.readFileSync(md,'utf8'),relative(md)).data:map[key];if(!f)throw Error(`${key}: missing site/pages.json entry`);if(typeof f.title!=='string'||typeof f.description!=='string'||(f.draft!==undefined&&typeof f.draft!=='boolean'))throw Error(`${key}: invalid metadata field types`);return {file:key,...f,url:urlFor(key),...dates(fs.existsSync(md)?'site/'+relative(md):'site/'+key,sourcesFor(key))};});}
export function shell(title,body,file='index.html'){const prefix=path.posix.relative(path.posix.dirname(file),'.');const pre=prefix?prefix+'/':'./';return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><link rel="stylesheet" href="'+pre+'playground.css'+'"><link rel="stylesheet" href="'+pre+'ios-polish.css'+'"><link rel="stylesheet" href="'+pre+'navigation.css'+'"><script src="'+pre+'appearance.js'+'" defer></script></head><body class="subpage"><div class="wrap"><nav aria-label="Main navigation"><a href="'+pre+'index.html">iOS Agent Skill</a><button class="appearance-toggle" type="button" aria-label="Use dark appearance" aria-pressed="false"><span aria-hidden="true">☾</span><span class="appearance-label">Dark mode</span></button></nav><main id="main"><h1>'+esc(title)+'</h1>'+body+'</main><footer></footer></div></body></html>';}
