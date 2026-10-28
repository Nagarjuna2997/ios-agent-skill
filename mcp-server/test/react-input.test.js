import {test} from 'node:test';import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';import {AppIRSchema} from '../dist/app-ir/schema.js';import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const app=body=>`import {useState} from 'react';export default function App(){const [name,setName]=useState("Café");const [ready,setReady]=useState(false);return <main>${body}</main>}`;
const input='<input type="text" aria-label="Your name" placeholder="Enter name" value={name} onChange={event=>setName(event.target.value)}/>';
test('controlled React input becomes native string state with accessible text field and reactive text',()=>{
 const source=app(input+'<p>{name}</p><button onClick={()=>setReady(!ready)}>Toggle</button>');const ir=reactToIR(source),field=ir.nodes.find(n=>n.kind==='textfield');assert.equal(ir.schemaVersion,'1.4.0');assert.equal(field.text,'Your name');assert.equal(field.placeholder,'Enter name');assert.equal(ir.states.find(s=>s.id===field.stringBinding).initial,'Café');
 const swift=renderSwiftUI(ir).source;assert.match(swift,/TextField\("", text: \$state_node_state_1/);assert.match(swift,/accessibilityLabel\(Text\(verbatim: "Your name"\)\)/);assert.match(swift,/Text\(verbatim: collapsedInputText\(state_node_state_1\)\)/);assert.match(swift,/state_node_state_2.toggle\(\)/);
 assert.ok(field.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString()===input));
});
test('currentTarget and empty initial state are supported without placeholder inference',()=>{
 const ir=reactToIR(app(input.replace('event.target','event.currentTarget').replace(' placeholder="Enter name"','')).replace('"Café"','""'));assert.equal(ir.states[0].initial,'');assert.equal(ir.nodes.find(n=>n.kind==='textfield').placeholder,undefined);
});
for(const [label,change] of Object.entries({uncontrolled:s=>s.replace('value={name}','defaultValue="Hi"'),password:s=>s.replace('type="text"','type="password"'),noLabel:s=>s.replace('aria-label="Your name"',''),computedLabel:s=>s.replace('aria-label="Your name"','aria-label={name}'),sideEffect:s=>s.replace('event.target.value','fetch("/secret")'),transform:s=>s.replace('event.target.value','event.target.value.trim()'),wrongSetter:s=>s.replace('setName(event','setReady(event'),wrongValue:s=>s.replace('value={name}','value={ready}'),shadow:s=>s.replaceAll('event','setName'),async:s=>s.replace('event=>','async event=>'),spread:s=>s.replace('type="text"','{...props}'),missingHandler:s=>s.replace('onChange={event=>setName(event.target.value)}',''),maxLength:s=>s.replace('/>','maxLength="4"/>')}))test('input rejects '+label,()=>assert.throws(()=>reactToIR(app(change(input)))));
test('string states cannot become boolean conditions or actions',()=>{
 for(const body of ['<p>{name?"Yes":"No"}</p>','{name&&<p>Yes</p>}','<button onClick={()=>setName(true)}>Set</button>','<button onClick={()=>setName(!name)}>Set</button>'])assert.throws(()=>reactToIR(app(body)));
});
test('manual IR cannot cross state types, versions or field semantics',()=>{
 const base=reactToIR(app(input+'<p>{name}</p>'));
 for(const modify of [ir=>ir.schemaVersion='1.3.0',ir=>ir.states[0].initial=true,ir=>ir.nodes.find(n=>n.kind==='textfield').stringBinding='missing',ir=>ir.nodes.find(n=>n.kind==='textfield').text='',ir=>ir.nodes.find(n=>n.kind==='textfield').action={operation:'set',state:'state-1',value:true},ir=>ir.nodes.find(n=>n.kind==='column').placeholder='bad']){const ir=structuredClone(base);modify(ir);assert.throws(()=>AppIRSchema.parse(ir));}
});
test('conditional text inputs preserve entry-owned string state while hiding inactive controls',()=>{const ir=reactToIR(app('{ready?<section>'+input+'</section>:null}'));assert.equal(ir.schemaVersion,'1.4.0');assert.match(renderSwiftUI(ir).source,/if state_node_state_2/);});
test('single-line contracts reject imported and hand-authored multiline initial values',()=>{
 assert.throws(()=>reactToIR(app(input).replace('"Café"',JSON.stringify('first\nsecond'))));
 const ir=reactToIR(app(input));ir.states[0].initial='first\nsecond';assert.throws(()=>AppIRSchema.parse(ir));
});
test('controlled input state survives route mappings without changing ownership',()=>{
 const source=`import {useState} from 'react';import {MemoryRouter,Routes,Route,Link} from 'react-router-dom';export default function App(){const [name,setName]=useState('');return <MemoryRouter initialEntries={["/"]}><Routes><Route path="/" element={<main>${input}<Link to="/preview">Preview</Link></main>}/><Route path="/preview" element={<main><p>{name}</p></main>}/></Routes></MemoryRouter>}`;
 const ir=reactToIR(source);assert.equal(ir.schemaVersion,'1.4.0');assert.equal(ir.screens.length,2);assert.equal(ir.states.length,1);assert.equal(ir.nodes.filter(n=>n.stringBinding===ir.states[0].id).length,2);assert.match(renderSwiftUI(ir).source,/NavigationStack/);
});
test('literal reset buttons preserve string types, escaping and state provenance',()=>{
 const ir=reactToIR(app(input+'<button onClick={()=>setName("")}>Clear name</button><button onClick={()=>setName("Café")}>Reset name</button>'));
 const buttons=ir.nodes.filter(n=>n.kind==='button');assert.deepEqual(buttons.map(n=>n.action.value),['','Café']);assert.ok(buttons.every(n=>n.action.state===ir.states[0].id));
 const swift=renderSwiftUI(ir).source;assert.match(swift,/state_node_state_1 = ""/);assert.match(swift,/state_node_state_1 = "Café"/);
 const escaped=reactToIR(app('<button onClick={()=>setName(\'say "hello"\')}>Set</button>'));
 assert.ok(renderSwiftUI(escaped).source.includes('state_node_state_1 = "say \\"hello\\""'));
});
test('string assignment rejects computed values, wrong types, control characters and optional calls',()=>{
 for(const expr of ['setName(name)','setName(prev=>prev+"!")','setReady("bad")','setName("a\\nb")','setName?.("")','setName(12)'])assert.throws(()=>reactToIR(app(`<button onClick={()=>${expr}}>Reset</button>`)));
 const ir=reactToIR(app('<button onClick={()=>setName("")}>Clear</button>'));
 for(const value of [true,'a\nb']){const bad=structuredClone(ir);bad.nodes.find(n=>n.action).action.value=value;assert.throws(()=>AppIRSchema.parse(bad));}
});
test('reusable controlled fields borrow entry state and setter identity without creating component state',()=>{
 const source=`import {useState} from 'react';function Field({value,change}){return <section><input type="text" aria-label="Name" value={value} onChange={e=>change(e.target.value)}/><p>{value}</p><button onClick={()=>change("")}>Clear</button></section>}export default function App(){const [name,setName]=useState("Maya");return <main><Field value={name} change={setName}/></main>}`;
 const inline=`import {useState} from 'react';export default function App(){const [name,setName]=useState("Maya");return <main><section><input type="text" aria-label="Name" value={name} onChange={e=>setName(e.target.value)}/><p>{name}</p><button onClick={()=>setName("")}>Clear</button></section></main>}`;
 assert.equal(renderSwiftUI(reactToIR(source)).source,renderSwiftUI(reactToIR(inline)).source);
 const ir=reactToIR(source);assert.equal(ir.states.length,1);assert.ok(ir.nodes.filter(n=>n.stringBinding).every(n=>n.stringBinding===ir.states[0].id));assert.equal(ir.nodes.find(n=>n.kind==='button').action.state,ir.states[0].id);
 const field=ir.nodes.find(n=>n.kind==='textfield');assert.ok(field.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes('value={name}')));
 assert.throws(()=>reactToIR(source.replace('change={setName}','change={value=>setName(value)}')));
 assert.throws(()=>reactToIR(source.replace('useState("Maya")','useState(false)')));
});
test('borrowed setters preserve explicit boolean actions and cannot cross state identities',()=>{
 const source=`import {useState} from 'react';function Toggle(props){return <button onClick={()=>props.update(!props.value)}>Toggle</button>}export default function App(){const [saved,setSaved]=useState(false);const [other,setOther]=useState(false);return <main><Toggle value={saved} update={setSaved}/></main>}`;
 const ir=reactToIR(source);assert.equal(ir.nodes.find(n=>n.kind==='button').action.state,ir.states[0].id);
 assert.throws(()=>reactToIR(source.replace('update={setSaved}','update={setOther}')));
});
test('borrowed setter resolution respects event-parameter and component-name shadowing',()=>{
 const source=`import {useState} from 'react';function Field(props){return <input type="text" aria-label="Name" value={props.value} onChange={props=>props.change(props.target.value)}/>}export default function App(){const [name,setName]=useState("");return <main><Field value={name} change={setName}/></main>}`;
 assert.throws(()=>reactToIR(source),/shadows its setter/);
 assert.throws(()=>reactToIR(source.replace('props.change(props.target','(props.change)(props.target')),/shadows its setter/);
 assert.doesNotThrow(()=>reactToIR(source.replace('props=>props.change(props.target.value)','event=>props.change(event.target.value)')));
 const shadow=`import {useState} from 'react';function Child(){return <p>Global</p>}function Wrapper({Child}){return <Child/>}export default function App(){const [name,setName]=useState("");return <main><Wrapper Child={name}/></main>}`;
 assert.throws(()=>reactToIR(shadow),/shadows a router\/component/);
});
