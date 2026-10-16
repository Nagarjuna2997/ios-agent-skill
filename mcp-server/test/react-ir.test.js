import {test} from 'node:test';import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';import {renderSwiftUI} from '../dist/app-ir/swiftui.js';import {sha256} from '../dist/app-ir/schema.js';
const source=`function Card() { return <section style={{padding:24, backgroundColor:'#DDE8D6', borderRadius:24}}><h2>Cedar Loop</h2><details><summary>Before you go</summary><p>Bring water.</p></details></section>; }
export default function App() { return <main style={{display:'flex', flexDirection:'column', gap:12}}><h1>Weekend trails</h1><Card /></main>; }`;
test('static React components lower through IR to native disclosure and retain original source evidence',()=>{
 const ir=reactToIR(source);assert.equal(ir.sources[0].sha256,sha256(source));assert.equal(ir.sources[0].adapter,'react-static@1');assert.equal(ir.limitations.length,0);assert.ok(ir.nodes.some(n=>n.text==='Cedar Loop'));
 const native=renderSwiftUI(ir).source;assert.match(native,/DisclosureGroup/);assert.match(native,/Cedar Loop/);assert.doesNotMatch(native,/WKWebView/);
 const card=ir.nodes.find(n=>n.text==='Cedar Loop'),e=card.evidence[0];assert.equal(Buffer.from(source).subarray(e.start,e.end).toString(),'<h2>Cedar Loop</h2>');
});
test('Unicode source offsets and repeated components are deterministic and unique',()=>{
 const text='// café\nfunction Card(){return <p>Hello</p>} export default function App(){return <div><Card/><Card/></div>}';const a=reactToIR(text);assert.deepEqual(a,reactToIR(text));const rows=a.nodes.filter(n=>n.text==='Hello');assert.equal(rows.length,2);assert.notEqual(rows[0].id,rows[1].id);for(const row of rows){const e=row.evidence[0];assert.equal(Buffer.from(text).subarray(e.start,e.end).toString(),'<p>Hello</p>');}
});
test('dynamic React is rejected, never executed or silently dropped',()=>{
 for(const s of [
 'import X from "https://example.com/x"; export default function App(){return <X/>}',
 'export default function App(){fetch("https://example.com");return <p>Hi</p>}',
 'export default function App(){return <p>{process.env.SECRET}</p>}',
 'export default function App(){return <button onClick={()=>alert(1)}>Go</button>}',
 'export default function App(){return <div {...props}/>}',
 'export default function App(props){return <p>Hi</p>}',
 'export default async function App(){return <p>Hi</p>}',
 'export default function App(){return <App/>}',
 'export default function App(){return <Unknown/>}',
 'export default function App(){return <p style={{color: palette.color}}>Hi</p>}',
 'export default function App(){return <div>',
 ])assert.throws(()=>reactToIR(s));
});
test('unsupported HTML/CSS remains an explicit limitation blocking native generation',()=>{
 for(const body of ['<img src="photo.png"/>','<p className="title">Hi</p>','<p style={{position:"absolute"}}>Hi</p>']) {const ir=reactToIR(`export default function App(){return ${body}}`);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir),/unsupported/);}
});
test('multiline JSX text follows source whitespace and fragments retain hierarchy',()=>{
 const ir=reactToIR('"use client"; export default function App(){return <><p>First\n  second</p><p>Last</p></>}');assert.deepEqual(ir.nodes.filter(n=>n.kind==='text').map(n=>n.text),['First second','Last']);
});

test('React style values cannot inject extra HTML CSS declarations',()=>{
 for(const style of ["color:'#000000;background-color:#ffffff'","padding:'1px;gap:30px'"])assert.throws(()=>reactToIR(`export default function App(){return <p style={{${style}}}>Hi</p>}`),/declaration separators/);
});

test('demo React and HTML fixtures share the same native nodes and styles',async()=>{
 const {importReact}=await import('../dist/app-ir/react.js');const {importHTML}=await import('../dist/app-ir/html.js');
 const base=new URL('../../benchmarks/universal/html-disclosure/',import.meta.url);
 const a=await importReact(new URL('App.tsx',base).pathname,'FieldNotes'),b=await importHTML(new URL('index.html',base).pathname,'FieldNotes');
 const clean=ir=>ir.nodes.map(({evidence,...n})=>n);assert.deepEqual(clean(a),clean(b));
 assert.equal(renderSwiftUI(a).source,renderSwiftUI(b).source);
});

test('style names and duplicate attributes cannot alter declaration semantics',()=>{
 for(const body of ['<p style={{"color:#000000;backgroundColor":"#ffffff"}}>Hi</p>', '<p style={{color:"#000000",color:"#ffffff"}}>Hi</p>', '<p id="one" id="two">Hi</p>'])assert.throws(()=>reactToIR(`export default function App(){return ${body}}`));
});

test('JSX entities and nonbreaking whitespace cannot silently change text or wrapping',()=>{
 for(const text of ['Fish &notit; Chips','A&nbsp;B','A\u00a0B'])assert.throws(()=>reactToIR(`export default function App(){return <p>${text}</p>}`));
 for(const [text,expected] of [['Fish &amp; Chips','Fish & Chips'],['A &notit B','A &notit B'],['A &lt; B','A < B']])assert.equal(reactToIR(`export default function App(){return <p>${text}</p>}`).nodes.find(n=>n.kind==='text').text,expected);
});

test('installed CLI path exposes React inspection without building or executing input',async()=>{
 const {spawnSync}=await import('node:child_process');
 const result=spawnSync(process.execPath,[new URL('../dist/unified.js',import.meta.url).pathname,'app-ir','inspect-react',new URL('../../benchmarks/universal/html-disclosure/App.tsx',import.meta.url).pathname,'FieldNotes'],{encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).sources[0].adapter,'react-static@1');
});

test('literal props compose with distinct callsite provenance, escaped text and style tokens',()=>{
 const source=`function Card({title: label, size}) {return <h1 style={{fontSize:size,color:'#123456'}}>{label}</h1>}
 function Wrapper(props){return <Card title={props.name} size={36}/>}
 export default function App(){return <main><Wrapper name={'A < B & C'}/><Wrapper name="Second"/></main>}`;
 const ir=reactToIR(source),rows=ir.nodes.filter(n=>n.kind==='text');
 assert.deepEqual(rows.map(n=>n.text),['A < B & C','Second']);assert.equal(rows[0].style.fontSize,36);
 assert.equal(ir.limitations.length,0);assert.match(renderSwiftUI(ir).source,/A < B & C/);
 const snippets=rows.map(row=>row.evidence.map(e=>Buffer.from(source).subarray(e.start,e.end).toString()));
 assert.ok(snippets[0].some(s=>s==="'A < B & C'"));assert.ok(!snippets[0].some(s=>s==='name="Second"'));
 assert.ok(snippets[1].some(s=>s==='name="Second"'));assert.ok(!snippets[1].some(s=>s==="'A < B & C'"));
});
test('JS expression strings retain literal entities',()=>{
 const ir=reactToIR(`function Text(props){return <p>{props.text}</p>} export default function App(){return <Text text={'&amp; <tag> "quoted"'}/>} `);
 assert.equal(ir.nodes.find(n=>n.kind==='text').text,'&amp; <tag> "quoted"');
});
test('unsupported prop semantics fail closed',()=>{
 for(const [param,value,expression] of [
 ['{x}',null,'x'],['{x="default"}','"a"','x'],['{...rest}','"a"','rest.x'],['p','"a"',"p['x']"],['p','"a"','p.x.toUpperCase()'],['p','{{a:1}}','p.x'],['p','{true}','p.x'],['p','{process.env.SECRET}','p.x']
 ])assert.throws(()=>reactToIR(`function C(${param}){return <p>{${expression}}</p>} export default function App(){return <C ${value===null?'':'x='+value}/>}`));
 for(const attrs of ['x="a" x="b"','key="x" x="a"','ref="x"','{...props}'])assert.throws(()=>reactToIR(`function C(p){return <p>Hi</p>} export default function App(){return <C ${attrs}/>} `));
});
test('prop-based style injection is rejected and unsupported CSS stays explicit',()=>{
 assert.throws(()=>reactToIR(`function C({color}){return <p style={{color:color}}>Hi</p>} export default function App(){return <C color="#000000;background:red"/>}`),/separators/);
 const ir=reactToIR(`function C({position}){return <p style={{position:position}}>Hi</p>} export default function App(){return <C position="absolute"/>}`);assert.ok(ir.limitations.length);assert.throws(()=>renderSwiftUI(ir));
});
test('literal-prop benchmark fixture renders the identical baseline native source',async()=>{
 const {importReact}=await import('../dist/app-ir/react.js');const {importHTML}=await import('../dist/app-ir/html.js');
 const base=new URL('../../benchmarks/universal/html-disclosure/',import.meta.url);
 const a=await importReact(new URL('App.props.tsx',base).pathname,'FieldNotes'),b=await importHTML(new URL('index.html',base).pathname,'FieldNotes');
 assert.equal(renderSwiftUI(a,{instrumentTypography:true}).source,renderSwiftUI(b,{instrumentTypography:true}).source);
});
test('many static or literal-prop siblings do not inflate ancestor provenance',()=>{
 for(const hasProps of [false,true]){
  const source=`function C(${hasProps?'p':''}){return <p>${hasProps?'{p.x}':'Hello'}</p>} export default function App(){return <main>${Array.from({length:25},(_,i)=>hasProps?`<C x="${i}"/>`:'<C/>').join('')}</main>}`;
  const ir=reactToIR(source);assert.equal(ir.nodes.filter(n=>n.kind==='text').length,25);
  assert.ok(ir.nodes.every(n=>n.evidence.length<=20));
 }
});
test('literal props reject characters that HTML would silently normalize or discard',()=>{
 for(const value of ['A\u0000B','A\u2028B','A\u2029B','A\nB','A\tB','A\u007fB'])assert.throws(()=>reactToIR(`function C(p){return <p>{p.x}</p>} export default function App(){return <C x={${JSON.stringify(value)}}/>}`),/control characters/);
});
