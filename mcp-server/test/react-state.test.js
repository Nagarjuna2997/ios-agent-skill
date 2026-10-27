import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';
import {AppIRSchema} from '../dist/app-ir/schema.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const app=(body,statements='const [saved,setSaved]=useState(false);')=>`import {useState} from 'react'; export default function App(){${statements}return <main>${body}</main>}`;
const fixture=app('<p>{saved ? "Saved" : "Not saved"}</p><button onClick={()=>setSaved(!saved)}>Toggle saved</button><button onClick={()=>setSaved(false)}>Reset</button>');

test('boolean state lowers to typed IR and native state without executing React',()=>{
 const ir=reactToIR(fixture);
 assert.equal(ir.schemaVersion,'1.1.0');assert.equal(ir.sources[0].adapter,'react-boolean-state@1');
 assert.deepEqual(ir.states.map(({id,initial})=>({id,initial})),[{id:'state-1',initial:false}]);
 assert.deepEqual(ir.nodes.find(n=>n.text==='Not saved').textBinding,{state:'state-1',whenTrue:'Saved',whenFalse:'Not saved'});
 assert.deepEqual(ir.nodes.filter(n=>n.kind==='button').map(n=>n.action),[{operation:'toggle',state:'state-1'},{operation:'set',state:'state-1',value:false}]);
 const swift=renderSwiftUI(ir).source;assert.match(swift,/@State private var state_node_state_1 = false/);assert.match(swift,/state_node_state_1.toggle\(\)/);assert.match(swift,/state_node_state_1 = false/);
 assert.match(swift,/Text\(verbatim: \(state_node_state_1 \? "Saved" : "Not saved"\)\)/);
 assert.doesNotMatch(swift,/WKWebView|JavaScriptCore/);assert.deepEqual(reactToIR(fixture),ir);
});
test('independent state and true initial values retain their own transitions',()=>{
 const ir=reactToIR(app('<p>{saved ? "Yes" : "No"}</p><p>{other ? "On" : "Off"}</p><button onClick={()=>setOther(true)}>Enable</button>','const [saved,setSaved]=useState(true);const [other,setOther]=useState(false);'));
 assert.deepEqual(ir.states.map(s=>s.initial),[true,false]);assert.equal(ir.nodes.find(n=>n.text==='Enable').action.state,'state-2');assert.equal(ir.nodes.find(n=>n.text==='Yes').textBinding.state,'state-1');
});
test('state content and actions retain Unicode byte offsets for hook and event evidence',()=>{
 const source='// café\n'+fixture, ir=reactToIR(source);
 const spans=row=>row.evidence.map(e=>Buffer.from(source).subarray(e.start,e.end).toString());
 assert.ok(spans(ir.states[0]).some(s=>s==='const [saved,setSaved]=useState(false);'));
 assert.ok(spans(ir.nodes.find(n=>n.kind==='button')).some(s=>s.includes('onClick={()=>setSaved(!saved)}')));
 assert.ok(spans(ir.nodes.find(n=>n.text==='Not saved')).some(s=>s.includes('useState(false)')));
});
test('children composition preserves entry scope but state cannot leak into child functions',()=>{
 const source=`import {useState} from 'react';function Frame(p){return <section>{p.children}</section>}export default function App(){const [saved,setSaved]=useState(false);return <Frame><p>{saved?'Saved':'Not saved'}</p><button onClick={()=>setSaved(true)}>Save</button></Frame>}`;
 const ir=reactToIR(source);assert.equal(ir.nodes.filter(n=>n.action).length,1);assert.equal(ir.limitations.length,0);
 assert.throws(()=>reactToIR(`import {useState} from 'react'; function Label(){return <p>{saved?'Yes':'No'}</p>}export default function App(){const [saved,setSaved]=useState(false);return <Label/>}`),/supported boolean state/);
});
test('unsupported hooks, initializers, bindings and imports fail before generation',()=>{
 for(const statement of ['let [saved,setSaved]=useState(false);','const [saved,setSaved]=useState(0);','const [saved,setSaved]=useState(()=>false);','const [saved,setSaved]=useState<boolean>(false);','const [saved,saved]=useState(false);','const [saved,setSaved,...rest]=useState(false);','const [saved,setSaved]=useState(false), x=1;','const [saved,setSaved]=useReducer(false);','const [useState,setSaved]=useState(false);']) assert.throws(()=>reactToIR(app('<p>Hi</p>',statement)));
 for(const imported of ['import React from "react";','import {useState as state} from "react";','import {useState,useEffect} from "react";','import {useState} from "./react";','import type {useState} from "react";'])assert.throws(()=>reactToIR(fixture.replace("import {useState} from 'react';",imported)));
 assert.throws(()=>reactToIR(fixture.replace("import {useState} from 'react';",'')));
 assert.throws(()=>reactToIR(app('<p>Hi</p>',Array.from({length:17},(_,i)=>`const [x${i},s${i}]=useState(false);`).join(''))),/state count/);
});
test('unsupported event expressions never become plausible native buttons',()=>{
 for(const callback of ['()=>alert(1)','()=>{setSaved(true);}','async()=>setSaved(true)','event=>setSaved(true)','()=>setSaved(saved)','()=>setSaved(!other)','()=>setSaved(true,false)','()=>setSaved(fetch("https://example.com"))','setSaved(true)'])assert.throws(()=>reactToIR(app(`<button onClick={${callback}}>Save</button>`)));
 for(const body of ['<button>Save</button>','<button onClick={()=>setSaved(true)}><strong>Save</strong></button>','<button onClick={()=>setSaved(true)}>{"Save"}</button>','<p onClick={()=>setSaved(true)}>Save</p>','<button onClick={()=>setSaved(true)} onClick={()=>setSaved(false)}>Save</button>'])assert.throws(()=>reactToIR(app(body)));
});
test('dynamic expressions, branch markup and whitespace normalization cannot silently change state text',()=>{
 for(const body of ['<p>{saved}</p>','<p>{saved ? fetch("https://example.com") : "No"}</p>','<p>{saved ? <span>Yes</span> : "No"}</p>','<p>Prefix {saved ? "Yes" : "No"}</p>','<p>{saved ? " Yes " : "No"}</p>','<p>{saved ? "Two  spaces" : "No"}</p>','<div>{saved ? "Yes" : "No"}</div>'])assert.throws(()=>reactToIR(app(body)));
});
test('IR rejects orphan transitions, inconsistent defaults and cross-version event fields',()=>{
 const mutate=f=>{const ir=reactToIR(fixture);f(ir);assert.throws(()=>AppIRSchema.parse(ir));};
 mutate(ir=>ir.schemaVersion='1.0.0');mutate(ir=>ir.states.push(ir.states[0]));mutate(ir=>ir.nodes.find(n=>n.action).action.state='missing');
 mutate(ir=>ir.nodes.find(n=>n.textBinding).text='Wrong');mutate(ir=>ir.nodes.find(n=>n.action).kind='text');mutate(ir=>ir.nodes.find(n=>n.action).children.push('missing'));
 mutate(ir=>ir.nodes.find(n=>n.action).text='');mutate(ir=>ir.states[0].evidence[0].end=fixture.length+1);
});
test('old static IR remains byte-for-byte generated the same and does not acquire state metadata',()=>{
 const ir=reactToIR('export default function App(){return <p>Hi</p>}');assert.equal(ir.schemaVersion,'1.0.0');assert.equal(ir.states,undefined);assert.doesNotMatch(renderSwiftUI(ir).source,/@State/);
});
test('inline controls cannot be reparented by intermediate HTML and silently lose inherited style',()=>{
 for(const tag of ['p','h1','h2','h3','span','strong'])assert.throws(()=>reactToIR(app(`<${tag} style={{color:'#FF0000'}}><button onClick={()=>setSaved(true)}>Save</button></${tag}>`)),/inline buttons/);
 assert.throws(()=>reactToIR(`import {useState} from 'react';function Label(p){return <p>{p.children}</p>}export default function App(){const [saved,setSaved]=useState(false);return <Label><button onClick={()=>setSaved(true)}>Save</button></Label>}`),/inline buttons/);
});
test('installed CLI exposes state through the same inspect and validation path',async()=>{
 const {spawnSync}=await import('node:child_process');
 const {mkdtemp,writeFile,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const root=await mkdtemp(join(tmpdir(),'react-state-cli-'));
 try{
  const cli=new URL('../dist/unified.js',import.meta.url).pathname;
  const result=spawnSync(process.execPath,[cli,'app-ir','inspect-react',new URL('../../benchmarks/universal/react-state/App.tsx',import.meta.url).pathname,'TripChecklist'],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr);const ir=JSON.parse(result.stdout);assert.equal(ir.sources[0].adapter,'react-boolean-state@1');assert.equal(ir.states.length,2);
  const path=join(root,'ir.json');await writeFile(path,result.stdout);
  const validated=spawnSync(process.execPath,[cli,'app-ir','validate',path],{encoding:'utf8',timeout:10000});assert.equal(validated.status,0,validated.stderr);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('functional boolean updater maps to existing atomic native toggle without executing code',()=>{
 for(const expression of ['previous=>!previous','(previous)=>(!previous)','saved=>!saved']){
  const source=app(`<p>{saved?'Saved':'Not saved'}</p><button onClick={()=>setSaved(${expression})}>Toggle</button>`);
  const ir=reactToIR(source);const button=ir.nodes.find(n=>n.kind==='button');
  assert.deepEqual(button.action,{operation:'toggle',state:ir.states[0].id});
  assert.ok(button.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes(expression)));
  assert.equal(renderSwiftUI(ir).source,renderSwiftUI(reactToIR(source.replace(expression,'!saved'))).source);
 }
});
test('functional updater rejects side effects, captured variables and altered callback semantics',()=>{
 for(const value of ['p=>!saved','p=>p','p=>!!p','p=>fetch(p)','async p=>!p','(p,q)=>!p','(...p)=>!p','(p=false)=>!p','({p})=>!p','(p:boolean)=>!p','p=>{return !p}','p=>(setSaved(false),!p)','p=>!other','p=>!p.value']){
  assert.throws(()=>reactToIR(app(`<button onClick={()=>setSaved(${value})}>Toggle</button>`)),undefined,value);
 }
});
