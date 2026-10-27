import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';
import {AppIRSchema} from '../dist/app-ir/schema.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const app=body=>`import {useState} from 'react';export default function App(){const [ready,setReady]=useState(false);return <main>${body}<button onClick={()=>setReady(!ready)}>Toggle</button></main>}`;
test('conditional sections retain both branches and generate native conditional views',()=>{
 const ir=reactToIR(app('{ready ? <section><h1>Ready</h1><p>Plan</p></section> : <p>Empty</p>}'));
 assert.equal(ir.schemaVersion,'1.3.0');assert.equal(ir.limitations.length,0);
 const c=ir.nodes.find(n=>n.kind==='conditional');assert.equal(c.condition.state,'state-1');assert.equal(c.children.length,2);
 assert.ok(ir.nodes.some(n=>n.text==='Ready'));assert.ok(ir.nodes.some(n=>n.text==='Empty'));
 const swift=renderSwiftUI(ir).source;assert.match(swift,/@ViewBuilder private var/);assert.match(swift,/if state_node_state_1/);assert.doesNotMatch(swift,/\.hidden\(|\.opacity\(0/);
});
test('null, conjunction and negation keep absent branches out of the native view hierarchy',()=>{
 for(const expression of ['ready && <p>Yes</p>','ready ? <p>Yes</p> : null','!ready && <p>Yes</p>']){
  const ir=reactToIR(app(`{${expression}}`)),c=ir.nodes.find(n=>n.kind==='conditional');assert.equal(c.children.length,1);
  assert.equal(expression.startsWith('!')?c.condition.whenTrue:c.condition.whenFalse,null);assert.match(renderSwiftUI(ir).source,/EmptyView\(\)/);
 }
});
test('nested conditional sections and reusable children preserve state and source provenance',()=>{
 const source=app('{ready ? <section>{!ready && <p>Nested</p>}</section> : <p>No</p>}');
 const ir=reactToIR(source);assert.equal(ir.nodes.filter(n=>n.kind==='conditional').length,2);
 for(const node of ir.nodes.filter(n=>n.kind==='conditional'))assert.ok(node.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes('useState(false)')));
 assert.equal(ir.limitations.length,0);renderSwiftUI(ir);
 const composed=`import {useState} from 'react';function Frame(p){return <section>{p.children}</section>}function Content(){return <p>Content</p>}export default function App(){const [ready,setReady]=useState(false);return <Frame>{ready && <Content/>}</Frame>}`;
 assert.equal(reactToIR(composed).nodes.filter(n=>n.kind==='conditional').length,1);
});
test('unsupported branch behavior is rejected even when initially inactive',()=>{
 for(const body of ['{ready && <span>A</span>}{ready && <span>B</span>}','{ready ? <p>Good</p> : <details><summary>Bad</summary><p>Hidden</p></details>}','{ready ? <p>A</p> : fetch("https://example.com")}','{ready ? null : null}','{ready || <p>A</p>}','<p>{ready && <span>Inline</span>}</p>','{ready ? <><p>A</p><p>B</p></> : null}'])assert.throws(()=>reactToIR(app(body)),undefined,body);
 const component=`import {useState} from 'react';function Label(){return <span>Inline</span>}export default function App(){const [ready,setReady]=useState(false);return <main>{ready && <Label/>}</main>}`;
 assert.throws(()=>reactToIR(component),/block root/);
});
test('conditional schema rejects dangling states, mismatched children, styling and lifecycle bypasses',()=>{
 const base=reactToIR(app('{ready ? <p>A</p> : <p>B</p>}'));
 for(const change of [ir=>ir.schemaVersion='1.2.0',ir=>ir.nodes.find(n=>n.kind==='conditional').condition.state='missing',ir=>ir.nodes.find(n=>n.kind==='conditional').children.reverse(),ir=>ir.nodes.find(n=>n.kind==='conditional').style.padding=5,ir=>{const c=ir.nodes.find(n=>n.kind==='conditional');const child=ir.nodes.find(n=>n.id===c.children[0]);child.kind='disclosure';}]){
  const ir=structuredClone(base);change(ir);assert.equal(AppIRSchema.safeParse(ir).success,false);
 }
});
test('discarded children are validated without leaking conditional mappings',()=>{
 const source=`import {useState} from 'react';function Frame(p){return <p>Only this</p>}export default function App(){const [ready,setReady]=useState(false);return <Frame>{ready && <p>Ignored</p>}</Frame>}`;
 const ir=reactToIR(source);assert.equal(ir.nodes.some(n=>n.kind==='conditional'),false);renderSwiftUI(ir);
});
