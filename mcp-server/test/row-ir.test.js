import {test} from 'node:test';import assert from 'node:assert/strict';
import {htmlToIR} from '../dist/app-ir/html.js';import {reactToIR} from '../dist/app-ir/react.js';
import {vueToIR} from '../dist/app-ir/vue.js';import {svelteToIR} from '../dist/app-ir/svelte.js';
import {AppIRSchema} from '../dist/app-ir/schema.js';import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const markup='<main style="display:flex;flex-direction:row;align-items:center;gap:8px"><p>Trail</p><p>6 km</p></main>';
test('explicit centered flex rows share native generation across static adapters',()=>{
 const html=htmlToIR(markup);assert.equal(html.schemaVersion,'1.5.0');assert.equal(html.limitations.length,0);
 const swift=renderSwiftUI(html).source;assert.match(swift,/HStack\(alignment: .center, spacing: 8\)/);
 for(const ir of [vueToIR(`<template>${markup}</template>`),svelteToIR(markup)])assert.equal(renderSwiftUI(ir).source,swift);
 const react=reactToIR('export default function App(){return <main style={{display:"flex",flexDirection:"row",alignItems:"center",gap:8}}><p>Trail</p><p>6 km</p></main>}');
 assert.equal(renderSwiftUI(react).source,swift);
});
test('row children retain intrinsic sizing and default CSS gap is zero',()=>{
 const ir=htmlToIR(markup.replace(';gap:8px',''));const row=ir.nodes.find(n=>n.kind==='row');assert.equal(row.style.gap,0);
 const source=renderSwiftUI(ir).source;
 for(const id of row.children){const start=source.indexOf(`private var node_${id.replaceAll('-','_')}:`);const end=source.indexOf('\n    }',start);assert.doesNotMatch(source.slice(start,end),/frame\(maxWidth/);}
});
test('ambiguous and unsupported flex behavior blocks generation',()=>{
 for(const text of [markup.replace(';align-items:center',''),markup.replace('align-items:center','align-items:stretch'),markup.replace('flex-direction:row','flex-direction:row;flex-direction:column'),markup.replace('gap:8px','flex-wrap:wrap'),markup.replace('gap:8px','justify-content:space-between'),markup.replace('<main','<p').replace('</main>','</p>')])assert.throws(()=>renderSwiftUI(htmlToIR(text)));
});
test('rows require new schema while older layouts remain unchanged',()=>{
 const ir=htmlToIR(markup);assert.equal(AppIRSchema.safeParse({...ir,schemaVersion:'1.4.0'}).success,false);
 assert.equal(htmlToIR('<main><p>Hello</p></main>').schemaVersion,'1.0.0');
});
test('rows coexist with string state and existing action contracts',()=>{
 const ir=reactToIR('import {useState} from "react";export default function App(){const [name,setName]=useState("Hi");return <main style={{display:"flex",flexDirection:"row",alignItems:"center"}}><p>{name}</p><button onClick={()=>setName("Bye")}>Change</button></main>}');
 assert.equal(ir.schemaVersion,'1.5.0');assert.equal(ir.states[0].initial,'Hi');assert.match(renderSwiftUI(ir).source,/HStack/);
});
test('colored buttons and conditional branch roots use intrinsic row sizing',()=>{
 const ir=reactToIR('import {useState} from "react";export default function App(){const [ready,setReady]=useState(false);return <main style={{display:"flex",flexDirection:"row",alignItems:"center"}}><button style={{color:"#000000",backgroundColor:"#FFFFFF"}} onClick={()=>setReady(true)}>Go</button>{ready ? <p>Ready</p> : <p>Waiting</p>}</main>}');
 const source=renderSwiftUI(ir).source;
 const conditional=ir.nodes.find(n=>n.kind==='conditional');
 const ids=[ir.nodes.find(n=>n.kind==='button').id,...conditional.children];
 for(const id of ids){const start=source.indexOf(`private var node_${id.replaceAll('-','_')}:`);const end=source.indexOf('\n    }',start);assert.doesNotMatch(source.slice(start,end),/frame\(maxWidth/);}
 assert.match(source,/frame\(minHeight: 44, alignment:/);
});
test('unmapped nested row sizing blocks generation rather than expanding implicitly',()=>{
 for(const child of ['<section><p>Nested</p></section>','<details><summary>More</summary><p>Text</p></details>'])assert.throws(()=>renderSwiftUI(htmlToIR(markup.replace('<p>Trail</p>',child))),/Unsupported row child/);
 const ir=reactToIR('import {useState} from "react";export default function App(){const [ready,setReady]=useState(false);return <main style={{display:"flex",flexDirection:"row",alignItems:"center"}}>{ready ? <section><p>Nested</p></section> : <p>Waiting</p>}</main>}');
 assert.throws(()=>renderSwiftUI(ir),/Unsupported row child/);
});
