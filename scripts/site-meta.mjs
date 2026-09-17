#!/usr/bin/env node
/** Build-only discovery layer. Original article body bytes are preserved. */
import {fs,path,ROOT,SITE,BASE,REPO,NAME,esc,walk,relative,eligible,urlFor,nodes,attr,text,clean,parse,select,meta,canonical,short,dates,frontMatter,marked,html,group,shell,records} from './site-discovery/lib.mjs';
const mapFile=path.join(SITE,'pages.json');
const bootstrap=!fs.existsSync(mapFile)||process.argv.includes('--update-map');
const map=fs.existsSync(mapFile)?JSON.parse(fs.readFileSync(mapFile,'utf8')):{};
const changes=[];
// Markdown is a source format, not a second duplicate crawl URL.
for(const p of walk(SITE).filter(p=>p.endsWith('.md')&&eligible(relative(p)))){
 const {data,body}=frontMatter(fs.readFileSync(p,'utf8'),relative(p));
 fs.writeFileSync(p.replace(/\.md$/,'.html'),shell(data.title,await marked.parse(body),relative(p).replace(/\.md$/,'.html')));
}
const docIndexes=walk(path.join(ROOT,'docs')).filter(p=>/(?:README|[^/]*index[^/]*)\.md$/i.test(path.basename(p))).sort();
const docs=new Map();
for(const p of docIndexes){
 docs.set(path.relative(ROOT,p).split(path.sep).join('/'),fs.readFileSync(p,'utf8').match(/^#\s+(.+)$/m)?.[1]||path.basename(p));
 const s=fs.readFileSync(p,'utf8');
 for(const m of s.matchAll(/\[([^\]]+)\]\(([^\s)#]+)(?:#[^)]*)?\)/g)){
  if(/^[a-z]+:/i.test(m[2]))continue;
  const target=path.resolve(path.dirname(p),m[2]);
  if(target.startsWith(path.join(ROOT,'docs')+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile()&&target.endsWith('.md'))docs.set(path.relative(ROOT,target).split(path.sep).join('/'),m[1]);
 }
}
fs.writeFileSync(path.join(SITE,'docs-index.html'),shell('Documentation index','<p>Browse the repository’s documentation indexes and their linked source guides on GitHub.</p><ul>'+[...docs].map(([p,t])=>'<li><a href="'+REPO+'/blob/main/'+p+'">'+esc(t)+'</a></li>').join('')+'</ul>'));
if(!fs.existsSync(path.join(SITE,'pages.html')))fs.writeFileSync(path.join(SITE,'pages.html'),shell('Site map','<p>Every public page on this website.</p>'));
const files=walk(SITE).filter(p=>p.endsWith('.html')&&eligible(relative(p))).sort();
const titles=new Set(),descriptions=new Set();
for(const p of files){
 const key=relative(p),isMd=fs.existsSync(p.replace(/\.html$/,'.md'));
 if(isMd)continue;
 if(!map[key]&&bootstrap){
  const d=parse(fs.readFileSync(p,'utf8'));
  let title=short(clean(text(select(d,'title')[0]||{})).replace(/\s*[—–|]\s*iOS Agent Skill$/,''),59)||short(path.basename(p,'.html'),59);
  let description=short(meta(d,'description')[0]||clean(text(select(d,'p')[0]||{}))||`Explore ${title} in the iOS Agent Skill project.`,159);
  if(titles.has(title))title=short(title,46)+' · '+String(files.indexOf(p)+1);
  if(descriptions.has(description))description=short(`${title}: ${description}`,159);
  map[key]={title,description};
 }
 if(!map[key])throw Error(`${key}: add title and description to site/pages.json (use --update-map to seed new entries)`);
 titles.add(map[key].title);descriptions.add(map[key].description);
}
fs.writeFileSync(mapFile,JSON.stringify(map,null,2)+'\n');
let pages=records().sort((a,b)=>a.file.localeCompare(b.file));
const publicPages=pages.filter(p=>!p.draft);
fs.writeFileSync(path.join(SITE,'pages.html'),shell('Site map','<p>Every public page on this website.</p>'+['Pages','Install guides','Blog','Docs'].map(g=>'<section><h2>'+g+'</h2><ul>'+publicPages.filter(p=>group(p.file)===g).map(p=>'<li><a href="'+esc(p.file)+'">'+esc(p.title)+'</a></li>').join('')+'</ul></section>').join('')));
const verification=JSON.parse(fs.readFileSync(path.join(SITE,'verification.json'),'utf8'));
const footer='<!-- discovery-nav:start --><div role="navigation" aria-label="Site discovery">'+[['Home',''],['Install','install.html'],['Community','community.html'],...(fs.existsSync(path.join(SITE,'blog'))?[['Blog','blog.html']]:[]),['Docs index','docs-index.html'],['Site map','pages.html'],['GitHub',REPO],['npm','https://www.npmjs.com/package/ios-agent-mcp']].map(([t,p])=>'<a href="'+(/^https:/.test(p)?p:new URL(p,BASE).href)+'">'+t+'</a>').join(' · ')+'</div><!-- discovery-nav:end -->';
for(const p of pages){
 const file=path.join(SITE,p.file);let source=fs.readFileSync(file,'utf8');
 const match=source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);if(!match)throw Error(`${p.file}: missing head`);
 const d=parse(source),head=select(d,'head')[0],before=html.serialize(head);let fields=[];
 head.childNodes=head.childNodes.filter(n=>!(n.nodeName==='#comment'&&n.data.trim().startsWith('Verification slot:')));
 function upsert(tag,attrs,content){const existing=(head.childNodes||[]).filter(n=>n.tagName===tag&&(tag==='title'||(attrs.name?attr(n,'name')===attrs.name:attrs.property?attr(n,'property')===attrs.property:attrs.rel?attr(n,'rel')===attrs.rel&&(!attrs.type||attr(n,'type')===attrs.type):attrs.id?attr(n,'id')===attrs.id:false)));const markup='<'+tag+Object.entries(attrs).map(([k,v])=>' '+k+'="'+esc(v)+'"').join('')+'>'+(content===undefined?'':content+'</'+tag+'>');const node=html.parseFragment(markup).childNodes[0];const unchanged=existing.length===1&&html.serializeOuter(existing[0])===html.serializeOuter(node);if(!unchanged){for(const n of existing)head.childNodes.splice(head.childNodes.indexOf(n),1);head.childNodes.push(node);fields.push(attrs.name||attrs.property||attrs.rel||attrs.id||tag);}}
 upsert('title',{},esc(p.title));upsert('meta',{name:'description',content:p.description});upsert('link',{rel:'canonical',href:p.url});
 const image=p.image?new URL(p.image,BASE).href:meta(d,'og:image')[0]||new URL('assets/readme-hero.jpg',BASE).href;
 const article=group(p.file)==='Blog',tech=group(p.file)==='Docs';
 for(const [k,v] of Object.entries({title:p.title,description:p.description,url:p.url,type:article||tech?'article':'website',image,site_name:NAME}))upsert('meta',{property:'og:'+k,content:v});
 for(const [k,v] of Object.entries({card:'summary_large_image',title:p.title,description:p.description,image,url:p.url}))upsert('meta',{name:'twitter:'+k,content:v});
 upsert('meta',{name:'robots',content:p.draft?'noindex,follow':'index,follow'});
 upsert('link',{rel:'alternate',type:'application/atom+xml',href:new URL('feed.xml',BASE).pathname,title:NAME});
 let schema=p.file==='index.html'||group(p.file)==='Install guides'?{'@context':'https://schema.org','@type':'SoftwareSourceCode',name:NAME,codeRepository:REPO,programmingLanguage:['Swift','TypeScript'],license:'https://spdx.org/licenses/MIT.html',url:p.url}:article||tech?{'@context':'https://schema.org','@type':article?'Article':'TechArticle',headline:p.title,image,datePublished:p.datePublished||p.published,dateModified:p.modified,author:{'@type':'Person',name:'Nagarjuna'},mainEntityOfPage:p.url,url:p.url}:{'@context':'https://schema.org','@type':'CollectionPage',name:p.title,url:p.url};
 // Keep unrelated structured data; replace old page-identity schemas to avoid conflicting headlines/dates.
 head.childNodes=head.childNodes.filter(n=>{if(n.tagName!=='script'||attr(n,'type')!=='application/ld+json')return true;try{const v=JSON.parse((n.childNodes||[]).map(x=>x.value||'').join(''));return !['Article','TechArticle','BlogPosting','CollectionPage','WebPage','SoftwareSourceCode'].includes(v['@type']);}catch{throw Error(`${p.file}: invalid existing JSON-LD`);}});
 upsert('script',{id:'site-discovery-schema',type:'application/ld+json'},JSON.stringify(schema).replace(/</g,'\\u003c'));
 if(p.file==='index.html')for(const [key,tag] of [['google','google-site-verification'],['bing','msvalidate.01']]){if(verification[key])upsert('meta',{name:tag,content:verification[key]});}
 let built=html.serialize(head);if(p.file==='index.html')for(const [key,tag]of[['google','google-site-verification'],['bing','msvalidate.01']])if(!verification[key]&&!meta(d,tag).length)built+='<!-- Verification slot: set '+key+' in site/verification.json -->';
 source=source.slice(0,match.index)+match[0].replace(match[1],()=>built)+source.slice(match.index+match[0].length);
 source=source.replace(/<html\b([^>]*)>/i,(_,a)=>'<html'+a.replace(/\s+lang\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/ig,'')+' lang="en">');
 source=source.replace(/<!-- discovery-nav:start -->[\s\S]*?<!-- discovery-nav:end -->/g,'');
 const prefix=path.posix.relative(path.posix.dirname(p.file),'.');const pageFooter=footer.replaceAll(BASE,prefix?prefix+'/':'./');
 if(/<\/footer>/i.test(source))source=source.replace(/<\/footer>/i,pageFooter+'</footer>');else source=source.replace(/<\/body>/i,'<footer>'+pageFooter+'</footer></body>');
 fs.writeFileSync(file,source);changes.push({file:p.file,fields:[...new Set(fields)],headChanged:before!==built});
}
fs.writeFileSync(path.join(SITE,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+publicPages.map(p=>`  <url><loc>${esc(p.url)}</loc><lastmod>${p.modified}</lastmod></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(SITE,'robots.txt'),['*','GPTBot','ClaudeBot','Google-Extended','PerplexityBot','Bingbot','Applebot-Extended','CCBot'].map(a=>'User-agent: '+a+'\nAllow: /\n').join('\n')+'\nSitemap: '+new URL('sitemap.xml',BASE).href+'\n');
const readme=fs.readFileSync(path.join(ROOT,'README.md'),'utf8');const bold=readme.match(/^\*\*(.+?)\*\*\s*$/m);if(!bold)throw Error('README: missing bold one-liner');const after=readme.slice(bold.index+bold[0].length).split(/\n\s*\n/).map(x=>x.trim()).find(x=>x&&!/^[\[#!<|]/.test(x));const summary=bold[1]+' '+(after?.match(/^.*?[.!?](?:\s|$)/)?.[0].trim()||after||'');
fs.writeFileSync(path.join(SITE,'llms.txt'),'# '+NAME+'\n\n'+summary+'\n\n'+['Pages','Install guides','Blog','Docs'].map(g=>'## '+g+'\n\n'+publicPages.filter(p=>group(p.file)===g).map(p=>'- ['+p.title.replace(/[\[\]]/g,'')+']('+p.url+')').join('\n')).join('\n\n')+'\n');
fs.writeFileSync(path.join(SITE,'llms-full.txt'),'# '+NAME+'\n\n'+summary+'\n\n'+publicPages.map(p=>{const d=parse(fs.readFileSync(path.join(SITE,p.file),'utf8'));return '# '+p.title+'\n'+p.url+'\n\n'+text(select(d,'main')[0]||select(d,'body')[0]).replace(/[ \t]+$/gm,'').replace(/\n{3,}/g,'\n\n').trim();}).join('\n\n---\n\n')+'\n');
const blogPages=publicPages.filter(p=>p.file.startsWith('blog/'));const entries=(blogPages.length?blogPages:publicPages).sort((a,b)=>b.modified.localeCompare(a.modified)||a.url.localeCompare(b.url));
fs.writeFileSync(path.join(SITE,'feed.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><id>'+BASE+'</id><title>'+NAME+'</title><link rel="self" href="'+BASE+'feed.xml"/><link href="'+BASE+'"/><updated>'+entries[0].modified+'</updated><author><name>Nagarjuna</name></author>'+entries.map(p=>'<entry><id>'+esc(p.url)+'</id><title>'+esc(p.title)+'</title><link href="'+esc(p.url)+'"/><published>'+p.published+'</published><updated>'+p.modified+'</updated><summary>'+esc(p.description)+'</summary></entry>').join('')+'</feed>\n');
if(process.env.INDEXNOW_KEY){if(!/^[A-Za-z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY))throw Error('INDEXNOW_KEY: invalid key format');fs.writeFileSync(path.join(SITE,process.env.INDEXNOW_KEY+'.txt'),process.env.INDEXNOW_KEY);}
const out=path.join(ROOT,'.site-discovery');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'changes.json'),JSON.stringify(changes,null,2));
console.log(`Generated discovery for ${publicPages.length} public pages (${pages.length-publicPages.length} drafts); ${docs.size} documentation links. Details: .site-discovery/changes.json`);
