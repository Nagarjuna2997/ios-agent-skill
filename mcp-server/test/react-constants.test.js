import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const swift=s=>renderSwiftUI(reactToIR(s)).source;
test('constant primitive composition matches explicitly expanded source',()=>{
 const source='function Card({name}){const title=`Hello ${name}`; const size=12+4;return <p style={{fontSize:size}}>{title}</p>} export default function App(){const name="🌲";return <Card name={name}/>}';
 const expanded='export default function App(){return <p style={{fontSize:16}}>Hello 🌲</p>}';
 assert.equal(swift(source),swift(expanded));
 const ir=reactToIR(source);const text=ir.nodes.find(n=>n.text==='Hello 🌲');
 assert.ok(text.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes('const title=')));
});
test('component instances keep independent constant scopes',()=>{
 const source='function Card({name}){const title=`Hello ${name}`;return <p>{title}</p>}export default function App(){return <main><Card name="One"/><Card name="Two"/></main>}';
 const ir=reactToIR(source);assert.deepEqual(ir.nodes.filter(n=>n.kind==='text').map(n=>n.text),['Hello One','Hello Two']);
});
test('constants coexist with entry state without inventing reactive expressions',()=>{
 const source='import {useState} from "react";export default function App(){const title="Save";const [saved,setSaved]=useState(false);return <main><h1>{title}</h1><button onClick={()=>setSaved(true)}>Done</button></main>}';
 assert.equal(reactToIR(source).states.length,1);
 assert.throws(()=>reactToIR(source.replace('return <main>','const derived=saved;return <main>')));
});
test('unsupported declarations and side effects fail even when unused',()=>{
 for(const declaration of ['let title="Hi";','const title=fetch("https://example.com");','const title=Date.now();','const title={a:1};','const title=true;','const a=b;const b="Hi";','const title="Hi";title="Bye";','const title="Hi",other="There";','const {title}={title:"Hi"};','const App="Shadow";','const useState="Shadow";']){
  assert.throws(()=>reactToIR(`export default function App(){${declaration}return <p>Hi</p>}`));
 }
 assert.throws(()=>reactToIR('function Card({title}){const title="Shadow";return <p>{title}</p>} export default function App(){return <Card title="Hi"/>}'));
});
