import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {createInbox,validateReport} from './server.mjs';
const report={version:'2.7.0',feature:'simulator',symptom:'unexpected-error',platform:'macos'};
test('rejects private text and malformed versions',()=>{
 for(const x of [{...report,logs:'secret'},{...report,version:'secret'},{...report,feature:'appname'},null])assert.throws(()=>validateReport(x));
});
test('issue delivery, persisted deduplication and request limits',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'inbox-test-'));let mutations=0;
 const inbox=createInbox({token:'test-only',statePath:join(dir,'state.json'),fetchImpl:async(url,options)=>{
  if(url.includes('/search/'))return {ok:true,json:async()=>({total_count:0})};
  mutations++;assert.match(url,/Nagarjuna2997\/ios-agent-skill\/issues$/);assert.match(JSON.parse(options.body).body,/not a verified bug/);return {ok:true};
 }});
 inbox.listen(0,'127.0.0.1');await once(inbox,'listening');
 const url=`http://127.0.0.1:${inbox.address().port}/reports`;
 const post=body=>fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 try{
 assert.equal((await post({...report,logs:'private'})).status,400);
 assert.equal((await post(report)).status,201);
 assert.equal((await (await post(report)).json()).status,'duplicate');
 assert.equal((await post({...report,feature:'installation'})).status,429);
 assert.equal(mutations,1);
 }finally{inbox.closeAllConnections();await new Promise(r=>inbox.close(r));await inbox.drain();await rm(dir,{recursive:true,force:true});}
});

test('reported version drives the public body and grouping',()=>{
 const old=validateReport({...report,version:'1.2.3'});
 assert.match(old.preview.body,/Package: ios-agent-mcp 1\.2\.3/);
 assert.notEqual(old.key,validateReport({...report,version:'1.2.4'}).key);
 assert.equal(old.key,validateReport({...report,version:'1.2.3'}).key);
});

test('disconnected clients cannot release queued job capacity',async()=>{
 const {request}=await import('node:http');
 const dir=await mkdtemp(join(tmpdir(),'inbox-queue-'));
 let unblock;const gate=new Promise(r=>{unblock=r;});
 const inbox=createInbox({token:'test-only',statePath:join(dir,'state.json'),fetchImpl:async()=>{await gate;return {ok:true,json:async()=>({total_count:1})};}});
 let received=0,allReceived;const ready=new Promise(r=>{allReceived=r;});
 inbox.on('request',req=>req.on('end',()=>{if(++received===16)allReceived();}));
 inbox.listen(0,'127.0.0.1');await once(inbox,'listening');
 const url=`http://127.0.0.1:${inbox.address().port}/reports`,clients=[];
 try{
 for(let i=0;i<16;i++){
  const req=request(url,{method:'POST',headers:{'content-type':'application/json'}});req.on('error',()=>{});req.end(JSON.stringify(report));clients.push(req);
 }
 await ready;clients.forEach(c=>c.destroy());
 const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(report)});
 assert.equal(response.status,429);
 }finally{unblock();clients.forEach(c=>c.destroy());inbox.closeAllConnections();await new Promise(r=>inbox.close(r));await inbox.drain();await rm(dir,{recursive:true,force:true});}
});
