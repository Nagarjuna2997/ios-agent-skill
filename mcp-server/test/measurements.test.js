import {test} from 'node:test';
import assert from 'node:assert/strict';
import {measureLineBreaks,measureClipping} from '../dist/app-ir/measurements.js';
const capture=(lines)=>({version:1,lines:lines.map(text=>({text,confidence:1,box:{x:1,y:1,width:100,height:20}}))});
test('line breaks match by complete source transcript, not pixel similarity',()=>{
 assert.equal(measureLineBreaks(capture(['Hello world','See you']),capture(['Hello world','See you']),'Hello world See you').status,'passed');
 const r=measureLineBreaks(capture(['Hello world','See you']),capture(['Hello','world See you']),'Hello world See you');assert.equal(r.status,'failed');assert.equal(r.mismatches,2);
});
test('missing or low-confidence OCR remains unknown',()=>{
 assert.equal(measureLineBreaks(capture(['Hello']),capture(['Help']),'Hello').mismatches,null);
 const b=capture(['Hello']);b.lines[0].confidence=.3;assert.equal(measureLineBreaks(capture(['Hello']),b,'Hello').status,'unavailable');
});
const geometry=(frame,audit='passed')=>({version:1,viewport:{x:0,y:0,width:100,height:100},textClippingAudit:audit,elements:[{id:'heading',frame}]});
test('clipping reports horizontal overflow regions',()=>{const r=measureClipping(geometry({x:90,y:10,width:20,height:10}));assert.equal(r.status,'failed');assert.equal(r.clippedElements,1);assert.equal(r.regions[0].id,'heading');});
test('scrolling offscreen is distinct from clipping; partial viewport needs review',()=>{
 assert.equal(measureClipping(geometry({x:0,y:110,width:20,height:10})).regions[0].kind,'offscreen');
 assert.equal(measureClipping(geometry({x:0,y:95,width:20,height:10})).status,'unavailable');
});
test('audit failure and missing audit cannot pass geometry',()=>{
 const f={x:0,y:0,width:20,height:10};assert.equal(measureClipping(geometry(f,'failed')).status,'failed');assert.equal(measureClipping(geometry(f,'unavailable')).clippedElements,null);assert.equal(measureClipping(geometry(f)).status,'passed');
});
test('meaningful punctuation loss cannot pass as matching text',()=>{
 assert.equal(measureLineBreaks(capture(['Balance: -5']),capture(['Balance: 5']),'Balance: -5').status,'unavailable');
});

test('empty and malformed OCR is unavailable, not a verifier crash',()=>{
 for(const value of [{version:1,lines:[]},null,{version:1,lines:[{text:'x'}]}])assert.equal(measureLineBreaks(capture(['Hello']),value,'Hello').status,'unavailable');
});
