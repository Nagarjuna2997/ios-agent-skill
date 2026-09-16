import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateFeedback} from '../dist/private-feedback.js';
const report={feature:'simulator',symptom:'timeout'};
test('private preview sends nothing; approval can send only exact preview categories once',async()=>{
 const calls=[];const tool=createPrivateFeedback({endpoint:'https://feedback.example/reports',fetchImpl:async(u,o)=>{calls.push(JSON.parse(o.body));return new Response(JSON.stringify({status:'submitted',receipt:'00000000-0000-4000-8000-000000000000'}));}});
 const p=await tool({action:'preview',report});assert.equal(calls.length,0);assert.equal(p.submitted,false);
 await assert.rejects(tool({action:'submit',previewId:p.previewId,userApproved:false}));
 await assert.rejects(tool({action:'submit',previewId:p.previewId,userApproved:true,logs:'SECRET'}));
 assert.equal(calls.length,0);
 const sent=await tool({action:'submit',previewId:p.previewId,userApproved:true});assert.equal(sent.submitted,true);assert.deepEqual(calls,[p.payload]);
 await assert.rejects(tool({action:'submit',previewId:p.previewId,userApproved:true}));assert.equal(calls.length,1);
});
test('unconfigured, expiry, arbitrary data and insecure endpoints cannot submit',async()=>{
 assert.equal((await createPrivateFeedback({endpoint:undefined})({action:'preview',report})).status,'not-configured');
 await assert.rejects(createPrivateFeedback({endpoint:'http://example/reports'})({action:'preview',report}));
 const tool=createPrivateFeedback({endpoint:'https://example/reports',now:()=>time});let time=0;
 await assert.rejects(tool({action:'preview',report:{...report,logs:'SECRET'}}));
 const p=await tool({action:'preview',report});time=900001;await assert.rejects(tool({action:'submit',previewId:p.previewId,userApproved:true}));
});
test('lost or malformed replies never claim submission and never silently retry',async()=>{
 for(const f of [async()=>{throw Error('PRIVATE_ERROR')},async()=>new Response('{}'),async()=>new Response('',{status:503})]){
  const tool=createPrivateFeedback({endpoint:'https://example/reports',fetchImpl:f});const p=await tool({action:'preview',report});
  const r=await tool({action:'submit',previewId:p.previewId,userApproved:true});assert.equal(r.submitted,false);assert.equal(r.status,'unconfirmed');assert.ok(!JSON.stringify(r).includes('PRIVATE_ERROR'));
  await assert.rejects(tool({action:'submit',previewId:p.previewId,userApproved:true}));
 }
});
