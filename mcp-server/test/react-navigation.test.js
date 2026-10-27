import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reactToIR} from '../dist/app-ir/react.js';
import {AppIRSchema} from '../dist/app-ir/schema.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const imports=`import {MemoryRouter,Routes,Route,Link} from 'react-router-dom';`;
const routes=(body,initial='/',extra='')=>`${imports}${extra}export default function App(){return <MemoryRouter initialEntries={["${initial}"]}><Routes>${body}</Routes></MemoryRouter>}`;
const fixture=routes('<Route path="/" element={<main><h1>Walks</h1><Link to="/walk">Open walk</Link></main>}/><Route path="/walk" element={<main><h1>Cedar Loop</h1><Link to="/">All walks</Link></main>}/>');

test('explicit memory routes lower to independent IR screens and native push destinations',()=>{
 const ir=reactToIR(fixture);assert.equal(ir.schemaVersion,'1.2.0');assert.equal(ir.sources[0].adapter,'react-memory-router@1');
 assert.deepEqual(ir.navigation,{initialScreen:'screen-1',routes:[{screen:'screen-1',path:'/'},{screen:'screen-2',path:'/walk'}]});
 assert.equal(ir.screens.length,2);assert.equal(new Set(ir.nodes.map(n=>n.id)).size,ir.nodes.length);
 assert.deepEqual(ir.nodes.filter(n=>n.kind==='link').map(n=>n.action),[{operation:'navigate',screen:'screen-2'},{operation:'navigate',screen:'screen-1'}]);
 const swift=renderSwiftUI(ir).source;assert.match(swift,/NavigationStack\(path: \$routePath\)/);assert.match(swift,/NavigationLink\(value: "screen-2"\)/);
 assert.match(swift,/navigationDestination\(for: String.self\)/);assert.doesNotMatch(swift,/WKWebView|JavaScriptCore/);assert.deepEqual(reactToIR(fixture),ir);
});
test('initial route need not be the first declaration',()=>{
 const ir=reactToIR(fixture.replace('initialEntries={["/"]}','initialEntries={["/walk"]}'));
 assert.equal(ir.navigation.initialScreen,'screen-2');assert.match(renderSwiftUI(ir).source,/routeScreen\("screen-2"\)/);
});
test('reusable components and Unicode source traceability survive per-route lowering',()=>{
 const source='// café\n'+routes('<Route path="/" element={<Page title="Accueil"><Link to="/walk">Café walk</Link></Page>}/><Route path="/walk" element={<Page title="Cèdre"><p>Quiet</p></Page>}/>','/', 'function Page(p){return <main><h1>{p.title}</h1>{p.children}</main>}');
 const ir=reactToIR(source),node=ir.nodes.find(n=>n.text==='Café walk');assert.ok(node);
 const slices=node.evidence.map(e=>Buffer.from(source).subarray(e.start,e.end).toString());assert.ok(slices.some(s=>s.includes('<Link to="/walk">')));
 assert.ok(slices.some(s=>s.includes('<Route path="/"')));assert.equal(ir.limitations.length,0);
});
test('entry state remains shared across route screens without executing source',()=>{
 const source=fixture.replace(imports,imports+`import {useState} from 'react';`).replace('function App(){return','function App(){const [saved,setSaved]=useState(false);return').replace('<h1>Walks</h1>','<h1>Walks</h1><p>{saved?"Saved":"Not saved"}</p><button onClick={()=>setSaved(true)}>Save</button>').replace('<h1>Cedar Loop</h1>','<h1>Cedar Loop</h1><p>{saved?"Saved":"Not saved"}</p>');
 const ir=reactToIR(source);assert.equal(ir.states.length,1);assert.equal(ir.nodes.filter(n=>n.textBinding?.state==='state-1').length,2);assert.equal(ir.nodes.find(n=>n.text==='Save').action.state,'state-1');
 assert.equal((renderSwiftUI(ir).source.match(/@State private var state_node_state_1/g)||[]).length,1);
});
test('route ownership and version contracts reject malformed IR',()=>{
 for(const change of [ir=>ir.schemaVersion='1.1.0',ir=>ir.navigation.initialScreen='absent',ir=>ir.navigation.routes.pop(),ir=>ir.navigation.routes[1].path='/',ir=>ir.navigation.routes[1].screen='screen-1',ir=>ir.navigation.routes[1].screen='missing',ir=>ir.nodes.find(n=>n.kind==='link').action.screen='missing',ir=>ir.nodes.find(n=>n.kind==='link').kind='button',ir=>ir.nodes.find(n=>n.kind==='link').children=['absent'],ir=>ir.nodes.find(n=>n.kind==='link').action={operation:'toggle',state:'absent'},ir=>delete ir.navigation]){
  const ir=reactToIR(fixture);change(ir);assert.throws(()=>AppIRSchema.parse(ir));
 }
});
test('route structures and unsupported router features fail closed',()=>{
 for(const source of [fixture.replace('initialEntries={["/"]}',''),fixture.replace('["/"]','["/","/walk"]'),fixture.replace('["/"]','["/unknown"]'),fixture.replace('<Routes>','<Routes location="/">'),fixture.replace('path="/walk"','path="/:id"'),fixture.replace('path="/walk"','path="/walk/"'),fixture.replace('path="/walk"','path="/"'),fixture.replace('path="/walk"','path="/WALK"').replace('path="/"','path="/walk"'),fixture.replace('element={<main><h1>Cedar Loop','loader={fetch("https://example.com")} element={<main><h1>Cedar Loop'),fixture.replace('<Routes>','<Routes><Route path="/x" element={doWork()}/>'),fixture.replace('<MemoryRouter','<BrowserRouter').replace('</MemoryRouter>','</BrowserRouter>')])assert.throws(()=>reactToIR(source));
 assert.throws(()=>reactToIR(routes(Array.from({length:31},(_,i)=>`<Route path="/s${i}" element={<p>Screen</p>}/>`).join(''),'/s0')),/route count/);
});
test('links cannot silently become external URLs, replace actions or dynamic events',()=>{
 for(const replacement of ['to="https://example.com"','to="/walk?filter=one"','to="/walk#item"','to="walk"','to="/missing"','to="/"','to="/walk" replace','to="/walk" target="_blank"','to="/walk" reloadDocument','to="/walk" onClick={()=>fetch("https://example.com")}','to={"/walk"}','to="/walk" to="/"','style={{color:"#FFFFFF"}}'])assert.throws(()=>reactToIR(fixture.replace('to="/walk"',replacement)));
 for(const label of ['<strong>Open</strong>','{"Open"}','<button>Open</button>',''])assert.throws(()=>reactToIR(fixture.replace('Open walk',label)));
 assert.throws(()=>reactToIR(fixture.replace('<Link to="/walk">Open walk</Link>','<p><Link to="/walk">Open walk</Link></p>')),/inline/);
});
test('nested routers, component-local lifecycle and shadowed imports are not inferred',()=>{
 for(const source of [fixture.replace('Open walk</Link>','Open walk</Link><details><summary>More</summary><p>Info</p></details>'),fixture.replace('<h1>Walks</h1>','<Routes/>'),fixture.replace(imports,imports+'function Link(){return <p>Fake</p>}'),fixture.replace(imports,imports+'function Page(Link){return <Link to="/walk">Open</Link>}').replace('<Link to="/walk">Open walk</Link>','<Page Link="fake"/>'),fixture.replace(imports,imports.replace('Link}','Link as Jump}'))])assert.throws(()=>reactToIR(source));
});
test('static single-screen rendering retains its original output',()=>{
 const ir=reactToIR('export default function App(){return <p>Hi</p>}');assert.equal(ir.navigation,undefined);assert.equal(ir.schemaVersion,'1.0.0');
 assert.doesNotMatch(renderSwiftUI(ir).source,/routeScreen|routePath|NavigationStack/);
});

test('pre-navigation HTML and boolean-state fixtures retain identical SwiftUI bytes',async()=>{
 const {readFile}=await import('node:fs/promises');const {htmlToIR}=await import('../dist/app-ir/html.js');const {sha256}=await import('../dist/app-ir/schema.js');
 const html=await readFile(new URL('../../benchmarks/universal/html-disclosure/index.html',import.meta.url),'utf8');
 const state=await readFile(new URL('../../benchmarks/universal/react-state/App.tsx',import.meta.url),'utf8');
 // Recorded from the parent d9513cc renderer, not from the new implementation.
 assert.equal(sha256(renderSwiftUI(htmlToIR(html)).source),'c98c0ad763997246347714598ccde41cd5dafadb448107027186e7a27e6facb3');
 assert.equal(sha256(renderSwiftUI(reactToIR(state)).source),'9fbdccaec6bc415c1db9eab7f39f06e0a3de30828aacb1fcd18a2d57fb1d6e07');
});
