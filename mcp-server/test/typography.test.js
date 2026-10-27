import {test} from 'node:test';import assert from 'node:assert/strict';
import {htmlToIR} from '../dist/app-ir/html.js';import {annotateTextRegions,compareTextRegions} from '../dist/app-ir/typography.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const region=(id='node-1',text='Hello world again',lines=[[0,1],[2]])=>({id,text,lines,truncated:false});
const snap=(...regions)=>({version:1,regions});
test('line verification uses traced word boundaries without OCR',()=>{
 const source=snap(region());assert.equal(compareTextRegions(source,source,true).status,'passed');
 const r=compareTextRegions(source,snap(region('node-1','Hello world again',[[0],[1,2]])),true);assert.equal(r.status,'failed');assert.equal(r.mismatches,2);
});
test('image-changing probes, missing regions, duplicate IDs and split words remain unknown',()=>{
 const source=snap(region());for(const candidate of [snap(),snap(region(),region()),snap(region('other')),snap(region('node-1','Hello world again',[[0,1],[1,2]]))])assert.equal(compareTextRegions(source,candidate,true).status,'unavailable');
 assert.equal(compareTextRegions(source,source,false).status,'unavailable');
});
test('text changes, signs and truncation cannot pass as typography matches',()=>{
 const source=snap(region('n','Balance -5',[[0,1]]));assert.equal(compareTextRegions(source,snap(region('n','Balance 5',[[0,1]])),true).status,'failed');
 assert.equal(compareTextRegions(source,snap({...source.regions[0],truncated:true}),true).status,'failed');
});
test('unsupported scripts and whitespace require review',()=>{
 for(const text of ['hello  world','مرحبا بالعالم','e\u0301 test']){const source=snap(region('n',text,[[0,1]]));assert.equal(compareTextRegions(source,source,true).status,'unavailable');}
});
test('source mapping uses byte ranges, including Unicode before a text element',()=>{
 const html='<!doctype html><html><head><title>é</title></head><body><p>Same</p><p>Same</p><details><summary>Open</summary><p>Hidden</p></details></body></html>';
 const ir=htmlToIR(html);const marked=annotateTextRegions(html,ir);for(const n of ir.nodes.filter(n=>n.kind!=='column'))assert.ok(marked.includes(`data-app-ir-node="${n.id}"`));assert.throws(()=>annotateTextRegions(html+' ',ir),/match/);
});
test('unmapped bare text is not guessed by its label',()=>{const html='<body>bare</body>';assert.throws(()=>annotateTextRegions(html,htmlToIR(html)),/traceable/);});
test('ordinary generated apps omit measurement instrumentation',()=>{
 const ir=htmlToIR('<body><p>Hello</p></body>');assert.ok(!renderSwiftUI(ir).source.includes('Text.LayoutKey'));const source=renderSwiftUI(ir,{instrumentTypography:true}).source;assert.ok(source.includes('Text.LayoutKey'));assert.ok(source.includes('MeasuredText(nodeID: "node-2"'));
});

test('column identifiers cannot override descendant traceability',()=>{
 const ir=htmlToIR('<body><p>Hello</p><p>World</p></body>');
 for(const options of [{},{instrumentTypography:true}]) {
  const source=renderSwiftUI(ir,options).source;
  for(const node of ir.nodes) assert.equal(source.includes(`.accessibilityIdentifier("${node.id}")`),node.kind!=='column');
 }
});
test('image-changing probes retain only provisional region details',()=>{
 const source=snap(region());const result=compareTextRegions(source,source,false);
 assert.equal(result.status,'unavailable');assert.equal(result.mismatches,null);assert.equal(result.regions.length,1);
});

test('untrusted probe text and truncation cannot establish failures',()=>{
 const source=snap(region());
 for(const candidate of [snap(region('node-1','Wrong words',[[0,1]])),snap({...region(),truncated:true})]) {
  const result=compareTextRegions(source,candidate,false);assert.equal(result.status,'unavailable');assert.equal(result.mismatches,null);
 }
});

test('typography observer does not replace native text drawing',()=>{
 const source=renderSwiftUI(htmlToIR('<body><p>Hello world</p></body>'),{instrumentTypography:true}).source;
 assert.ok(source.includes('.onPreferenceChange(Text.LayoutKey.self)'));
 assert.ok(!source.includes('.textRenderer('));assert.ok(!source.includes('context.draw('));
});

test('invalid typography preferences invalidate evidence without queued writes',()=>{
 const source=renderSwiftUI(htmlToIR('<body><p>Hello world</p></body>'),{instrumentTypography:true}).source;
 assert.ok(source.includes('guard layouts.count == 1 else { measurement = ""; return }'));
 assert.ok(source.includes('} else { measurement = "" }'));
 assert.ok(!source.includes('Task {'));
});
