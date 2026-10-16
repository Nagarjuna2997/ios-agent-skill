import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectVerifiedCapture} from '../dist/app-ir/test-capture.js';
const entry=()=>({testIdentifier:'InteractionTests/testMeasuredGeometry()',attachments:[{exportedFileName:'capture-1.png',suggestedHumanReadableName:'verified-collapsed_0.png',deviceId:'device',isAssociatedWithFailure:false}]});
test('selects only the verified native test capture',()=>assert.equal(selectVerifiedCapture([entry()],'device','passed'),'capture-1.png'));
test('missing, duplicate, wrong-state and failed test captures cannot pass',()=>{
 assert.throws(()=>selectVerifiedCapture([],'device','passed'));
 assert.throws(()=>selectVerifiedCapture([entry(),entry()],'device','passed'));
 assert.throws(()=>selectVerifiedCapture([entry()],'device','failed'));
 const e=entry();e.testIdentifier='InteractionTests/testDisclosureAndContent()';assert.throws(()=>selectVerifiedCapture([e],'device','passed'));
});
test('rejects foreign device, failure attachments and unsafe paths',()=>{
 for(const patch of [{deviceId:'other'},{isAssociatedWithFailure:true},{exportedFileName:'../capture.png'},{exportedFileName:'/tmp/capture.png'}]){
  const e=entry();Object.assign(e.attachments[0],patch);assert.throws(()=>selectVerifiedCapture([e],'device','passed'));
 }
});
test('probe and ordinary captures cannot substitute for each other',()=>{
 const e=entry();e.attachments.push({...e.attachments[0],exportedFileName:'probe.png',suggestedHumanReadableName:'verified-typography_0.png'});
 assert.equal(selectVerifiedCapture([e],'device','passed','typography'),'probe.png');
 assert.equal(selectVerifiedCapture([e],'device','passed'),'capture-1.png');
 assert.throws(()=>selectVerifiedCapture([entry()],'device','passed','typography'));
});
