import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {htmlToIR,importHTML} from '../dist/app-ir/html.js';
import {AppIRSchema,sha256} from '../dist/app-ir/schema.js';
import {renderSwiftUI,generateProject,swiftString} from '../dist/app-ir/swiftui.js';
const fixture = () => htmlToIR('<!doctype html><title>Demo</title><body><h1>Welcome</h1><details><summary>More</summary><p>Details</p></details></body>');
test('HTML import preserves text, disclosure semantics, deterministic identity and source hashes',()=>{
 const a=fixture(); assert.deepEqual(a,fixture()); assert.equal(a.screens[0].title,'Demo');
 assert.equal(a.nodes.find(n=>n.kind==='disclosure').text,'More'); assert.equal(a.limitations.length,0);
 assert.ok(a.requirements.every(r=>r.status==='unknown')); assert.equal(a.sources[0].sha256.length,64);
});
test('UTF-8 source ranges refer to bytes, not UTF-16 offsets',()=>{
 const html='<body><p>🌲 Café</p></body>', ir=htmlToIR(html), node=ir.nodes.find(n=>n.text);
 const e=node.evidence[0]; assert.equal(Buffer.from(html).subarray(e.start,e.end).toString(),'<p>🌲 Café</p>');
});
for(const [name,modify] of [
 ['version',ir=>{ir.schemaVersion='2.0.0';}],
 ['duplicate IDs',ir=>{ir.nodes.push(ir.nodes[0]);}],
 ['missing child',ir=>{ir.nodes.at(-1).children.push('absent');}],
 ['cycle',ir=>{ir.nodes.at(-1).children.push(ir.nodes.at(-1).id);}],
 ['unreachable node',ir=>{ir.nodes.push({...ir.nodes[0],id:'orphan'});}],
 ['source path traversal',ir=>{ir.sources[0].path='../secret';}],
 ['bad evidence bounds',ir=>{ir.nodes[0].evidence[0].end=999999;}],
 ['missing source',ir=>{ir.nodes[0].evidence[0].source='missing';}],
 ['unexplained inference',ir=>{ir.nodes[0].evidence[0].certainty='inferred';}],
 ['unexpected field',ir=>{ir.apiKey='private';}],
]) test(`IR rejects ${name}`,()=>{const ir=fixture();modify(ir);assert.throws(()=>AppIRSchema.parse(ir));});
test('unsupported JS, CSS, assets and links are surfaced, never silently converted',()=>{
 const ir=htmlToIR('<head><style>body{color:red}</style><script>throw Error()</script></head><body><img src="https://example.com/x.png"><a href="/private">Account</a><div style="position:absolute">Test</div></body>');
 assert.ok(ir.limitations.length>=5); assert.throws(()=>renderSwiftUI(ir),/unsupported/);
});
test('bounds prevent oversized inputs and deep hierarchy',()=>{
 assert.throws(()=>htmlToIR('a'.repeat(262145)),/256 KiB/);
 assert.throws(()=>htmlToIR('<div>'.repeat(55)+'Text'+'</div>'.repeat(55)),/depth/);
});
test('renderer produces native disclosure, dynamic type and escaped source without a web wrapper',()=>{
 const ir=fixture(), render=renderSwiftUI(ir);
 assert.match(render.source,/DisclosureGroup/); assert.doesNotMatch(render.source,/WKWebView/);
 assert.match(render.source,/@ScaledMetric/); assert.equal(render.mappings.length,ir.nodes.length);
 assert.equal(swiftString('"\\(danger)\n'),'"\\"\\\\(danger)\\u{a}"');
});
test('file imports refuse symlinks, FIFOs and oversized files before parsing',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ir-reader-'));
 try {await writeFile(join(dir,'input.html'),'<p>Hello</p>'); await symlink(join(dir,'input.html'),join(dir,'alias.html'));
 await assert.rejects(importHTML(join(dir,'alias.html'))); await assert.rejects(importHTML(dir));
 await writeFile(join(dir,'big.html'),'a'.repeat(262145));await assert.rejects(importHTML(join(dir,'big.html')),/256 KiB/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
test('real benchmark is fully understood by this subset',async()=>{
 const source=await readFile(new URL('../../benchmarks/universal/html-disclosure/index.html',import.meta.url),'utf8');
 const ir=htmlToIR(source,'index.html','FieldNotes'); assert.deepEqual(ir.limitations,[]); assert.equal(ir.sources[0].sha256,sha256(source));
 assert.match(renderSwiftUI(ir).source,/Cedar Loop/);
});
test('generation refuses an existing destination without modifying its contents',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ir-existing-')); try {await writeFile(join(dir,'keep'),'original');
 await assert.rejects(generateProject(fixture(),dir),/EEXIST/);assert.equal(await readFile(join(dir,'keep'),'utf8'),'original');
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('comparison records hashes, differences and explicit crops without claiming a visual pass',async()=>{
 const {PNG}=await import('pngjs'),{comparePNGs}=await import('../dist/app-ir/compare.js');
 const a=new PNG({width:2,height:2});a.data.fill(255); const original=PNG.sync.write(a);
 assert.equal(comparePNGs(original,original).report.meanAbsoluteChannelError,0);
 a.data[0]=0;const b=PNG.sync.write(a);const result=comparePNGs(original,b);
 assert.equal(result.report.changedPixelFraction,0.25);assert.equal(result.report.verdict,'requires-review');
 assert.throws(()=>comparePNGs(original,b,{reference:{x:0,y:0,width:9,height:9},native:{x:0,y:0,width:2,height:2}}),/Crop/);
 const bomb=Buffer.from(original);bomb.writeUInt32BE(10000000,16);assert.throws(()=>comparePNGs(bomb,b),/pixel budget/);
});
test('default flex rows and styled/interactive summaries cannot silently change behavior',()=>{
 for(const html of ['<div style="display:flex"><p>A</p><p>B</p></div>','<details><summary onclick="alert(1)">More<img src="logo.png"></summary><p>X</p></details>']){
 const ir=htmlToIR(html);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir),/unsupported/);
 }
 assert.equal(htmlToIR('<strong>Important</strong>').nodes.find(n=>n.text==='Important').style.bold,true);
});
test('root attributes, uppercase flex and inline flows fail closed; explicit normal resets weight',()=>{
 for(const html of ['<html hidden><body>Visible?</body></html>','<html style="color:#ff0000"><body>X</body></html>','<div style="DISPLAY:flex"><span>A</span><span>B</span></div>','<span>A</span><span>B</span>']){
 const ir=htmlToIR(html);assert.ok(ir.limitations.length,html);assert.throws(()=>renderSwiftUI(ir),/unsupported/);
 }
 assert.match(renderSwiftUI(htmlToIR('<div style="font-weight:bold"><p style="font-weight:normal">Plain</p></div>')).source,/fontWeight\(\.regular\)/);
});
