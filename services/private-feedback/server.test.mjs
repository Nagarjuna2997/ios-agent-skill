import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createInbox,repository} from './server.mjs';
const payload={version:'2.7.0',feature:'installation',symptom:'timeout'};
async function fixture(t,reply){
 const dir=await mkdtemp(join(tmpdir(),'private-feedback-'));const calls=[];
 const server=createInbox({token:'TEST_ONLY',statePath:join(dir,'state.json'),fetchImpl:async(url,opts)=>{calls.push({url,opts});return reply(url,opts)}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{await server.drain();await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});
 const send=data=>fetch(`http://127.0.0.1:${server.address().port}/reports`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
 return {calls,send};
}
const okay=(url)=>new Response(JSON.stringify(url.endsWith('/issues')?{number:1}:{private:true,full_name:repository}));
test('only private target receives category report; duplicates do not create another issue',async t=>{
 const {calls,send}=await fixture(t,okay);const r=await send(payload);assert.equal(r.status,201);const body=await r.json();assert.equal(body.status,'submitted');assert.ok(body.receipt);assert.equal(Object.keys(body).length,2);
 const again=await send(payload);assert.equal((await again.json()).status,'duplicate');assert.equal(calls.filter(c=>c.opts.method==='POST').length,1);
 assert.ok(calls.every(c=>c.url.startsWith(`https://api.github.com/repos/${repository}`)));
});
test('public or unverifiable target is refused before issue creation',async t=>{
 const {calls,send}=await fixture(t,()=>new Response(JSON.stringify({private:false,full_name:repository})));
 assert.equal((await send(payload)).status,503);assert.equal(calls.filter(c=>c.opts.method==='POST').length,0);
});
test('arbitrary diagnostics never reach GitHub',async t=>{
 const {calls,send}=await fixture(t,okay);assert.equal((await send({...payload,logs:'PRIVATE_SENTINEL'})).status,400);assert.equal(calls.length,0);
});
test('uncertain GitHub write is reserved, never treated as confirmed duplicate',async t=>{
 const {calls,send}=await fixture(t,(url)=>{if(url.endsWith('/issues'))throw Error('Lost response');return okay(url)});
 assert.equal((await send(payload)).status,503);const second=await send(payload);assert.equal(second.status,503);assert.equal((await second.json()).status,'unconfirmed');assert.equal(calls.filter(c=>c.opts.method==='POST').length,1);
});
test('peer quota limits repeated submissions',async t=>{
 const {calls,send}=await fixture(t,okay);for(let i=0;i<5;i++)await send({...payload,version:`2.7.${i}`});assert.equal((await send({...payload,version:'2.7.6'})).status,429);assert.equal(calls.filter(c=>c.opts.method==='POST').length,5);
});
