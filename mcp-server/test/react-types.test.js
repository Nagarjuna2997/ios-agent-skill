import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {reactToIR,importReact} from '../dist/app-ir/react.js';import {renderSwiftUI} from '../dist/app-ir/swiftui.js';
const plain='function Card({title}){return <h1>{title}</h1>} export default function App(){return <main><Card title="Hello"/></main>}';
const typed='import type {ReactNode} from "react"; import type {NeverRead} from "./missing"; interface Props {title: string} type Result = ReactNode; function Card({title}: Props): Result {return <h1>{title}</h1>} export default function App(){return <main><Card title="Hello"/></main>}';
test('erased interfaces, aliases and explicit type imports preserve runtime output',()=>{
 const ir=reactToIR(typed);assert.equal(renderSwiftUI(ir).source,renderSwiftUI(reactToIR(plain)).source);
 for(const n of ir.nodes)for(const e of n.evidence)assert.ok(Buffer.from(typed).subarray(e.start,e.end).toString().length>0);
});
test('type syntax never excuses unsupported runtime behavior',()=>{
 for(const source of ['import {type NeverRead} from "./missing";'+plain,'import {Props} from "./missing";'+plain,'enum Mode {A,B};'+plain,'namespace AppTypes {export const unsafe=fetch("https://example.com")}'+plain,'declare class External {}'+plain,typed.replace('<Card title="Hello"/>','<Card title={fetch("https://example.com")}/>'),typed.replace('import type {ReactNode}','import {ReactNode}')])assert.throws(()=>reactToIR(source));
});
test('type-only dependencies are not opened and original module evidence is retained',async t=>{
 const root=await mkdtemp(join(tmpdir(),'react-types-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const entry='import type Private from "../../not-readable"; import Card from "./Card";export default function App(){return <Card title="🌲"/>}';
 const card='import type {External} from "nonexistent-package"; interface Props { title: string; } export default function Card({title}: Props){return <p>{title}</p>}';
 await writeFile(join(root,'App.tsx'),entry);await writeFile(join(root,'Card.tsx'),card);
 const ir=await importReact(join(root,'App.tsx'));assert.equal(ir.sources.length,2);assert.match(renderSwiftUI(ir).source,/🌲/);
 for(const n of ir.nodes)for(const e of n.evidence){const source=ir.sources.find(s=>s.id===e.source);const raw=source.path==='App.tsx'?entry:card;const slice=Buffer.from(raw).subarray(e.start,e.end).toString();assert.ok(slice.length);assert.ok(!slice.includes('�'));}
});

test('accepted type declarations erase under verbatimModuleSyntax',async()=>{
 const {default:ts}=await import('typescript');
 const output=ts.transpileModule(typed,{compilerOptions:{verbatimModuleSyntax:true,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve}}).outputText;
 assert.doesNotMatch(output,/from ["'](?:react|\.\/missing)["']/);
 const inline=ts.transpileModule('import {type T} from "./missing";',{compilerOptions:{verbatimModuleSyntax:true,module:ts.ModuleKind.ESNext}}).outputText;
 assert.match(inline,/import \{\} from/);
});

test('primitive hook types and input event annotations retain the existing runtime mapping',()=>{
 const plain='import {useState} from "react";export default function App(){const [name,setName]=useState("");return <main><input type="text" aria-label="Name" value={name} onChange={e=>setName(e.target.value)}/><p>{name}</p></main>}';
 const typed='import type {ChangeEvent} from "react";'+plain.replace('useState("")','useState<string>("")').replace('e=>setName','(e: ChangeEvent<HTMLInputElement>): void =>setName');
 assert.equal(renderSwiftUI(reactToIR(typed)).source,renderSwiftUI(reactToIR(plain)).source);
 assert.throws(()=>reactToIR(typed.replace('): void =>setName','): void =>fetch')));
 assert.throws(()=>reactToIR(typed.replace('(e: ChangeEvent','async (e: ChangeEvent')));
 assert.throws(()=>reactToIR(typed.replace('useState<string>','useState<Promise<string>>')));
 assert.throws(()=>reactToIR(typed.replace('useState<string>','useState<boolean>')),/must match/);
});

test('matching boolean hook annotation preserves boolean transitions',()=>{
 const source='import {useState} from "react";export default function App(){const [saved,setSaved]=useState(false);return <button onClick={()=>setSaved(true)}>Save</button>}';
 assert.equal(renderSwiftUI(reactToIR(source.replace('useState(false)','useState<boolean>(false)'))).source,renderSwiftUI(reactToIR(source)).source);
});
