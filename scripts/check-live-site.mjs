#!/usr/bin/env node
import {BASE,XMLParser,XMLValidator,parse,canonical} from './site-discovery/lib.mjs';
const errors=[];
const res=await fetch(BASE+'sitemap.xml',{signal:AbortSignal.timeout(30000)});
if(res.status!==200)throw Error(`sitemap.xml: HTTP ${res.status}`);
const raw=await res.text();if(XMLValidator.validate(raw)!==true)throw Error('sitemap.xml: invalid XML');
const data=new XMLParser().parse(raw);const list=data.urlset?.url;const urls=(Array.isArray(list)?list:list?[list]:[]).map(x=>x.loc);
if(!urls.length)throw Error('sitemap.xml: no URLs');
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<urls.length){const url=urls[cursor++];
  if(typeof url!=='string'||!url.startsWith(BASE)){errors.push(`${url}: outside expected site`);continue;}
  try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(r.status!==200){errors.push(`${url}: HTTP ${r.status}`);continue;}
   const cs=canonical(parse(await r.text()));if(cs.length!==1||cs[0]!==url)errors.push(`${url}: missing, duplicate or incorrect canonical`);
  }catch(e){errors.push(`${url}: ${e.message}`);}
 }
}));
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`PASS: ${urls.length} live URLs return 200 and matching canonical tags.`);
