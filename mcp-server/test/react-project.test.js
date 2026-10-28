import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {importReact,reactToIR} from '../dist/app-ir/react.js';
import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
import {sha256} from '../dist/app-ir/schema.js';
async function fixture(t,files){const root=await mkdtemp(join(tmpdir(),'react-modules-'));t.after(()=>rm(root,{recursive:true,force:true}));for(const [name,source]of Object.entries(files)){await mkdir(join(root,name,'..'),{recursive:true});await writeFile(join(root,name),source);}return root;}
const entry='import Card from "./components/Card"; export default function App(){return <main><Card title="🌲 Café"/></main>}';
const card='export default function Card({title}){return <section><h1>{title}</h1></section>}';
test('local React component modules produce native source with original-file byte provenance',async t=>{
 const files={'App.tsx':entry,'components/Card.tsx':card};const root=await fixture(t,files);const ir=await importReact(join(root,'App.tsx'));
 assert.equal(ir.sources.length,2);assert.equal(ir.limitations.length,0);assert.match(renderSwiftUI(ir).source,/🌲 Café/);
 for(const s of ir.sources)assert.equal(s.sha256,sha256(files[s.path]));
 const heading=ir.nodes.find(n=>n.text==='🌲 Café');assert.ok(new Set(heading.evidence.map(e=>e.source)).size===2);
 for(const e of heading.evidence){const s=ir.sources.find(s=>s.id===e.source);const text=Buffer.from(files[s.path]).subarray(e.start,e.end).toString();assert.ok(text.startsWith('<')||text.startsWith('"')||text.startsWith('title='),text);}
 assert.deepEqual(ir,await importReact(join(root,'App.tsx')));
});
test('single-file import preserves existing IR exactly',async t=>{const source='export default function App(){return <p>Hi</p>}';const root=await fixture(t,{'App.tsx':source});assert.deepEqual(await importReact(join(root,'App.tsx')),reactToIR(source));});
test('named and transitive components resolve without loading application code',async t=>{
 const root=await fixture(t,{'App.tsx':'import {Card} from "./Card.tsx"; export default function App(){return <main><Card/></main>}', 'Card.tsx':'import Label from "./Label"; export function Card(){return <section><Label/></section>}', 'Label.tsx':'export default function Label(){return <p>Hello</p>}'});assert.match(renderSwiftUI(await importReact(join(root,'App.tsx'))).source,/Hello/);
});
for(const [label,files]of Object.entries({
 alias:{'App.tsx':entry.replace('import Card','import Other').replace('<Card','<Other'),'components/Card.tsx':card},
 traversal:{'App.tsx':entry.replace('./components/Card','../Card')},
 cycle:{'App.tsx':entry,'components/Card.tsx':'import Card from "./Card";export default function Card(){return <p>Hi</p>}'},
 sideEffect:{'App.tsx':entry,'components/Card.tsx':card+';globalThis.universalUnsafe=true;'},
 hiddenComponent:{'App.tsx':entry,'components/Card.tsx':'export default function Card(){return <App/>}'},
 dependencyPackage:{'App.tsx':entry,'components/Card.tsx':'import {useState} from "react";'+card},
 collision:{'App.tsx':entry+' function Shared(){return <p>A</p>}','components/Card.tsx':card+' function Shared(){return <p>B</p>}'},
 missingExport:{'App.tsx':entry,'components/Card.tsx':card.replace('export default ','')},
 dynamicImport:{'App.tsx':entry,'components/Card.tsx':card+';import("./private")'},
}))test('module linking rejects '+label,async t=>{const root=await fixture(t,files);await assert.rejects(importReact(join(root,'App.tsx')));});
test('symlink source modules are not followed',async t=>{const root=await fixture(t,{'App.tsx':entry,'actual.tsx':card});await mkdir(join(root,'components'));await symlink(join(root,'actual.tsx'),join(root,'components/Card.tsx'));await assert.rejects(importReact(join(root,'App.tsx')));});
test('Unicode in removed import comments does not shift source evidence',async t=>{
 const source=entry.replace('import Card','import /* 🌲 */ Card');const root=await fixture(t,{'App.tsx':source,'components/Card.tsx':card});const ir=await importReact(join(root,'App.tsx'));const sourceID=ir.sources.find(s=>s.path==='App.tsx').id;
 for(const n of ir.nodes)for(const e of n.evidence.filter(e=>e.source===sourceID)){const text=Buffer.from(source).subarray(e.start,e.end).toString();assert.ok(!text.includes('�'));assert.ok(text.startsWith('<')||text.startsWith('"')||text.startsWith('export')||text.startsWith('title='),text);}
});
