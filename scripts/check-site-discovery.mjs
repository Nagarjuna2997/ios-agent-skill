#!/usr/bin/env node
import {fs,path,ROOT,SITE,BASE,NAME,REPO,walk,relative,eligible,urlFor,parse,select,attr,text,clean,meta,canonical,records,frontMatter,XMLParser,XMLValidator} from './site-discovery/lib.mjs';
import Ajv from './site-discovery/node_modules/ajv/dist/ajv.js';
const errors=[];const fail=(file,field)=>errors.push(`${file}: ${field}`);
let pages;try{pages=records();}catch(e){console.error(e.message);process.exit(1);}
for(const p of walk(SITE).filter(p=>p.endsWith('.md')&&eligible(relative(p)))){try{frontMatter(fs.readFileSync(p,'utf8'),relative(p));if(!fs.existsSync(p.replace(/\.md$/,'.html')))fail(relative(p),'missing generated HTML');}catch(e){errors.push(e.message);}}
function xml(file){try{const s=fs.readFileSync(path.join(SITE,file),'utf8');const valid=XMLValidator.validate(s);if(valid!==true)throw Error(valid.err.msg);return new XMLParser({ignoreAttributes:false}).parse(s);}catch(e){fail(file,e.message);return {};}}
const sitemap=xml('sitemap.xml');const rawUrls=sitemap.urlset?.url;const urls=rawUrls?(Array.isArray(rawUrls)?rawUrls:[rawUrls]):[];const locs=urls.map(x=>x.loc);
if(new Set(locs).size!==locs.length)fail('sitemap.xml','duplicate URLs');
const llms=fs.existsSync(path.join(SITE,'llms.txt'))?fs.readFileSync(path.join(SITE,'llms.txt'),'utf8'):'';
if((llms.match(/^# /gm)||[]).length!==1)fail('llms.txt','must have one H1');
const ajv=new Ajv({allErrors:true});const validate=ajv.compile({type:'object',required:['@context','@type'],properties:{'@context':{const:'https://schema.org'},'@type':{enum:['SoftwareSourceCode','Article','TechArticle','CollectionPage']},url:{type:'string',pattern:'^https://'},name:{type:'string',minLength:1},headline:{type:'string',minLength:1},datePublished:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}'},dateModified:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}'},author:{type:'object',required:['@type','name'],properties:{'@type':{const:'Person'},name:{const:'Nagarjuna'}}}},allOf:[{if:{properties:{'@type':{const:'SoftwareSourceCode'}}},then:{required:['name','codeRepository','programmingLanguage','license','url'],properties:{codeRepository:{const:REPO},programmingLanguage:{const:['Swift','TypeScript']},license:{const:'https://spdx.org/licenses/MIT.html'}}}},{if:{properties:{'@type':{enum:['Article','TechArticle']}}},then:{required:['headline','datePublished','dateModified','author','mainEntityOfPage','url']}}]});
const titles=new Map(),descriptions=new Map(),graph=new Map();
for(const p of pages){
 const d=parse(fs.readFileSync(path.join(SITE,p.file),'utf8'));
 const titleNodes=select(d,'title'),title=clean(text(titleNodes[0]||{}));
 if(titleNodes.length!==1||!title)fail(p.file,'missing or duplicate title');
 if(title.length>=60)fail(p.file,'title must be under 60 characters');
 if(titles.has(title))fail(p.file,`duplicate title with ${titles.get(title)}`);titles.set(title,p.file);
 const descriptionsFound=meta(d,'description'),description=descriptionsFound[0];
 if(descriptionsFound.length!==1||!description)fail(p.file,'missing or duplicate description');
 if(description?.length>=160)fail(p.file,'description must be under 160 characters');
 if(descriptions.has(description))fail(p.file,`duplicate description with ${descriptions.get(description)}`);descriptions.set(description,p.file);
 if(title!==p.title||description!==p.description)fail(p.file,'metadata differs from pages.json/front matter');
 const cs=canonical(d);if(cs.length!==1||cs[0]!==p.url)fail(p.file,'missing, duplicate or incorrect canonical');
 if(attr(select(d,'html')[0],'lang')!=='en')fail(p.file,'missing lang="en"');
 for(const k of ['og:title','og:description','og:url','og:type','og:image','og:site_name','twitter:card','twitter:title','twitter:description','twitter:image','twitter:url'])if(meta(d,k).length!==1||!meta(d,k)[0])fail(p.file,`missing or duplicate ${k}`);
 for(const [k,v]of Object.entries({'og:title':title,'og:description':description,'og:url':p.url,'og:site_name':NAME,'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description,'twitter:url':p.url,'twitter:image':meta(d,'og:image')[0]}))if(meta(d,k)[0]!==v)fail(p.file,`incorrect ${k}`);
 if(!/^https:\/\//.test(meta(d,'og:image')[0]||''))fail(p.file,'og:image must be absolute HTTPS');
 if(meta(d,'robots').length!==1||meta(d,'robots')[0]!== (p.draft?'noindex,follow':'index,follow'))fail(p.file,'incorrect robots directive');
 const feed=select(d,'link').filter(n=>attr(n,'rel')==='alternate'&&attr(n,'type')==='application/atom+xml');if(feed.length!==1||new URL(attr(feed[0],'href'),p.url).href!==BASE+'feed.xml')fail(p.file,'missing or incorrect Atom alternate');
 const schemas=select(d,'script').filter(n=>attr(n,'type')==='application/ld+json');if(!schemas.length)fail(p.file,'missing JSON-LD');let own;
 for(const s of schemas){try{const v=JSON.parse((s.childNodes||[]).map(x=>x.value||'').join(''));if(attr(s,'id')==='site-discovery-schema')own=v;}catch{fail(p.file,'invalid JSON-LD JSON');}}
 if(!own||!validate(own))fail(p.file,'JSON-LD schema invalid: '+ajv.errorsText(validate.errors));
 if(own&&own.url!==p.url)fail(p.file,'JSON-LD url differs from canonical');
 if(!p.draft){if(!locs.includes(p.url))fail(p.file,'missing from sitemap.xml');if(!llms.includes(']('+p.url+')'))fail(p.file,'missing from llms.txt');if(urls.find(x=>x.loc===p.url)?.lastmod!==p.modified)fail(p.file,'sitemap lastmod differs from last git commit');}
 else if(locs.includes(p.url)||llms.includes(']('+p.url+')'))fail(p.file,'draft must not appear in public discovery');
 const nav=select(d,'footer').flatMap(f=>select(f,'div')).find(n=>attr(n,'aria-label')==='Site discovery');if(!nav)fail(p.file,'missing footer discovery navigation');
 if(nav){const targets=select(nav,'a').map(a=>new URL(attr(a,'href'),p.url).href);for(const u of [BASE,BASE+'install.html',BASE+'community.html',BASE+'docs-index.html',BASE+'pages.html',REPO,'https://www.npmjs.com/package/ios-agent-mcp'])if(!targets.includes(u))fail(p.file,'footer missing '+u);}
 const links=select(d,'a').map(a=>{try{return new URL(attr(a,'href'),p.url).href.split('#')[0];}catch{return '';}});graph.set(p.url,links);
}
for(const loc of locs)if(!pages.some(p=>!p.draft&&p.url===loc))fail('sitemap.xml',`unexpected URL ${loc}`);
const mapLinks=graph.get(BASE+'pages.html')||[];
for(const p of pages.filter(p=>!p.draft))if(!mapLinks.includes(p.url))fail(p.file,'not linked from pages.html');
const reachable=new Set([BASE]);for(let depth=0;depth<2;depth++)for(const url of [...reachable])for(const link of graph.get(url)||[])reachable.add(link);
for(const p of pages.filter(p=>!p.draft))if(!reachable.has(p.url))fail(p.file,'not reachable within two clicks from home');
const feed=xml('feed.xml');if(!feed.feed?.entry)fail('feed.xml','missing Atom entries');if(feed.feed?.['@_xmlns']!=='http://www.w3.org/2005/Atom')fail('feed.xml','incorrect Atom namespace');
const robots=fs.existsSync(path.join(SITE,'robots.txt'))?fs.readFileSync(path.join(SITE,'robots.txt'),'utf8'):'';
for(const bot of ['*','GPTBot','ClaudeBot','Google-Extended','PerplexityBot','Bingbot','Applebot-Extended','CCBot'])if(!robots.includes(`User-agent: ${bot}\nAllow: /`))fail('robots.txt',`missing allow for ${bot}`);
if(!robots.includes('Sitemap: '+BASE+'sitemap.xml'))fail('robots.txt','missing sitemap');
if(!fs.existsSync(path.join(SITE,'llms-full.txt')))fail('llms-full.txt','missing');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${pages.length} pages; metadata, local JSON-LD schemas, sitemap, llms, Atom, robots and two-click reachability.`);
