#!/usr/bin/env node
import {fs,path,ROOT,BASE,git,urlFor,eligible,records} from './site-discovery/lib.mjs';
const key=process.env.INDEXNOW_KEY;
if(!key){console.log('IndexNow not configured: set the INDEXNOW_KEY repository secret. No request sent.');process.exit(0);}
if(!/^[A-Za-z0-9-]{8,128}$/.test(key))throw Error('Invalid INDEXNOW_KEY format');
const pages=records().filter(p=>!p.draft);
const before=process.env.BEFORE_SHA;
let urls;
if(before&&/^[a-f0-9]{40}$/.test(before)&&!/^0+$/.test(before)&&git(['cat-file','-t',before])==='commit'){
 const changed=git(['diff','--name-only',before,'HEAD']).split('\n');
 const rendererChanged=changed.some(p=>/^(scripts\/|content\/|docs\/|frameworks\.json|README\.md|site\/pages\.json|site\/verification\.json)/.test(p));
 urls=rendererChanged?pages.map(p=>p.url):changed.filter(p=>p.startsWith('site/')&&/\.(html|md)$/.test(p)&&eligible(p.slice(5))).map(p=>urlFor(p.slice(5).replace(/\.md$/,'.html')));
 // Indexes and the homepage aggregate changes, including daily download counts.
 urls.push(BASE,BASE+'pages.html',BASE+'docs-index.html');
}else urls=pages.map(p=>p.url); // Manual/scheduled runs have no trustworthy before SHA.
urls=[...new Set(urls)].filter(u=>u.startsWith(BASE));
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({host:new URL(BASE).host,keyLocation:BASE+'<key>.txt',urlList:urls},null,2));process.exit(0);}
const keyLocation=BASE+key+'.txt';
let verified=false;
for(let attempt=0;attempt<6;attempt++){
 try{const r=await fetch(keyLocation,{signal:AbortSignal.timeout(15000)});if(r.status===200&&(await r.text()).trim()===key){verified=true;break;}}catch{}
 if(attempt<5)await new Promise(resolve=>setTimeout(resolve,10000));
}
if(!verified)throw Error('Published IndexNow key file did not verify; no URLs submitted.');
for(let i=0;i<urls.length;i+=10000){
 const batch=urls.slice(i,i+10000);
 const r=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:new URL(BASE).host,key,keyLocation,urlList:batch}),signal:AbortSignal.timeout(30000)});
 if(![200,202].includes(r.status))throw Error(`IndexNow returned HTTP ${r.status}`);
 console.log(`IndexNow received ${batch.length} URLs (HTTP ${r.status}); receipt does not mean indexed.`);
}
