import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const app=(bindings,attrs='')=>`function Card({${bindings}}){return <h1>{title}</h1>} export default function App(){return <main><Card ${attrs}/></main>}`;
const swift=s=>renderSwiftUI(reactToIR(s)).source;
test('omitted and renamed defaults lower identically to explicit props',()=>{
 assert.equal(swift(app('title="Hello"')),swift(app('title','title="Hello"')));
 assert.equal(swift(app('heading: title="Hello"')),swift(app('title','title="Hello"')));
 assert.equal(swift(app('title=`Hello ${2+3}`')),swift(app('title','title="Hello 5"')));
});
test('explicit falsy literals take precedence over defaults',()=>{
 for(const value of ['{0}','""','"Other"'])assert.equal(swift(app('title="Fallback"',`title=${value}`)),swift(app('title',`title=${value}`)));
});
test('unsupported defaults fail even when overridden, without execution',()=>{
 for(const value of ['fetch("https://example.com")','other','undefined','null','{}','[1]','true','1/0']){
  for(const attrs of ['', 'title="Safe"'])assert.throws(()=>reactToIR(app(`title=${value}`,attrs)));
 }
 assert.throws(()=>reactToIR(app('first="Hello",title=first')));
 assert.throws(()=>reactToIR(app('title="Hello",...rest')));
 assert.throws(()=>reactToIR(app('title="Hello"').replace('}){','}={}){')));
});
test('default expression retains its original byte provenance',()=>{
 const source=app('title="🌲 Default"');const ir=reactToIR(source);
 const node=ir.nodes.find(n=>n.text==='🌲 Default');assert.ok(node);
 assert.ok(node.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes('"🌲 Default"')));
});
