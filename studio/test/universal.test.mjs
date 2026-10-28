import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {UniversalStudio} from '../universal.mjs';
import {serve} from '../server.mjs';
async function workspace(t){const root=await mkdtemp(join(tmpdir(),'universal-studio-'));t.after(()=>rm(root,{recursive:true,force:true}));const u=new UniversalStudio(root,resolve('.'));await u.init();return {u,root};}
test('Studio imports actual React IR and generates editable SwiftUI without claiming build success',async t=>{
 const {u}=await workspace(t);const row=await u.create({adapter:'react',name:'StudioSample',source:'export default function App(){return <main><h1>Hello</h1></main>}'});
 assert.equal(row.status,'inspected');const result=await u.generate(row.id);assert.equal(result.status,'generated-unverified');assert.equal(result.tests,'not-run');
 const data=await u.source(row.id);assert.match(data.swift,/Text\(verbatim: "Hello"\)/);assert.equal(data.ir.sources[0].adapter,'react-static@1');
 assert.equal((await u.list()).length,1);await assert.rejects(u.generate(row.id),/preserve/);assert.equal((await u.get(row.id)).status,'generated-unverified');
});
test('unsupported source remains inspectable but cannot produce a plausible native project',async t=>{
 const {u}=await workspace(t);const r=await u.create({adapter:'html',name:'Unsupported',source:'<main><script>throw Error("must never execute")</script><p>Hello</p></main>'});
 assert.ok(r.limitations.length);assert.equal((await u.generate(r.id)).status,'failed');assert.equal((await u.source(r.id)).swift,null);
 await assert.rejects(u.create({adapter:'angular',name:'App',source:'<p>Hello</p>'}));await assert.rejects(u.create({adapter:'html',name:'../outside',source:'test'}));await assert.rejects(u.get('../outside'));
});
test('restart marks interrupted work honestly and retains inspected source',async t=>{
 const {u,root}=await workspace(t);const r=await u.create({adapter:'html',name:'Recover',source:'<main><p>Kept</p></main>'});r.status='generating';await u.save(r);const next=new UniversalStudio(root,resolve('.'));await next.init();assert.equal((await next.get(r.id)).status,'interrupted');assert.match((await next.source(r.id)).input,/Kept/);
});
test('Universal HTTP endpoints retain Studio authorization and source is not served as executable HTML',async t=>{
 const {root}=await workspace(t);const app=await serve({port:0,root,repo:resolve('.')});t.after(()=>new Promise(r=>app.server.close(r)));
 const page=await(await fetch(app.origin+'/universal')).text();const token=/name="studio-token" content="([a-f0-9]+)"/.exec(page)[1];
 assert.equal((await fetch(app.origin+'/api/universal')).status,403);
 const headers={'x-studio-token':token,'content-type':'application/json'};
 assert.equal((await fetch(app.origin+'/api/universal',{headers:{...headers,origin:'https://attacker.example'}})).status,403);
 const r=await fetch(app.origin+'/api/universal',{method:'POST',headers,body:JSON.stringify({adapter:'html',name:'HTTPApp',source:'<main><p>Actual source</p></main>'})});assert.equal(r.status,201);const row=await r.json();
 const data=await fetch(app.origin+'/api/universal/'+row.id+'/source',{headers});assert.match(data.headers.get('content-type'),/application\/json/);assert.match((await data.json()).input,/Actual source/);
 assert.equal((await fetch(app.origin+'/api/universal/'+row.id+'/unknown',{headers})).status,405);
});
test('native job records outcomes and refuses stale or modified screenshots',async t=>{
 const {u}=await workspace(t);const row=await u.create({adapter:'html',name:'CaptureApp',source:'<main><p>Capture</p></main>'});await u.generate(row.id);
 const original=u.module.bind(u);let launches=0;u.module=async name=>{
  if(name==='agent/runner')return {ProcessRunner:class{}};
  if(name==='agent/toolchain')return {detectToolchain:async()=>({testDouble:true,simulators:[{udid:'test-double'}]}),chooseSimulator:s=>s[0]};
  if(name==='agent/build')return {buildProject:async(root,runner,options)=>{assert.equal(options.udid,'test-double');return {success:true,errors:[]};}};
  if(name==='agent/simulator')return {runApp:async(root,runner,options)=>{assert.equal(options.udid,'test-double');launches++;return {udid:'test-double'};},screenshot:async root=>{const {mkdir,writeFile}=await import('node:fs/promises');const folder=join(root,'.ios-agent/screenshots');await mkdir(folder,{recursive:true});const file=join(folder,'universal.png');await writeFile(file,'synthetic-image');return {path:file};}};
  return original(name);
 };
 await u.startBuild(row.id);await u.jobs.get(row.id);const done=await u.get(row.id);assert.equal(done.status,'preview-ready');assert.equal(done.tests,'not-run');assert.equal(done.visualFidelity,'not-evaluated');assert.equal(launches,1);assert.equal((await u.image(row.id)).toString(),'synthetic-image');
 const {appendFile}=await import('node:fs/promises');await appendFile(join(u.dir(row.id),'project','CaptureApp/Views/RootView.swift'),'\n// changed');await assert.rejects(u.image(row.id),/Source changed/);
});
test('native build failure cannot launch or produce a preview',async t=>{
 const {u}=await workspace(t);const row=await u.create({adapter:'html',name:'FailedApp',source:'<main><p>Failed</p></main>'});await u.generate(row.id);
 const original=u.module.bind(u);u.module=async name=>{
  if(name==='agent/runner')return {ProcessRunner:class{}};
  if(name==='agent/toolchain')return {detectToolchain:async()=>({testDouble:true,simulators:[{udid:'test-double'}]}),chooseSimulator:s=>s[0]};
  if(name==='agent/build')return {buildProject:async()=>({success:false,errors:[{message:'synthetic compiler error'}]})};
  if(name==='agent/simulator')return {runApp:async()=>{assert.fail('must not launch');}};
  return original(name);
 };
 await u.startBuild(row.id);await u.jobs.get(row.id);const done=await u.get(row.id);assert.equal(done.status,'failed');assert.equal(done.runs[0].build.success,false);assert.equal(done.capture,undefined);await assert.rejects(u.image(row.id),/No verified current capture/);
});
test('native ownership excludes other conversions, releases on cancellation and permits retry',async t=>{
 const {u}=await workspace(t);let leased=false;u.acquireNative=()=>{assert.equal(leased,false);leased=true;return ()=>{leased=false;};};
 const rows=[];for(const name of ['First','Second']){const r=await u.create({adapter:'html',name,source:'<main><p>Hello</p></main>'});await u.generate(r.id);rows.push(r);}
 u.executeBuild=async(row,signal)=>{await new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));row.status='cancelled';await u.save(row);};
 await u.startBuild(rows[0].id);assert.equal(leased,true);await assert.rejects(u.startBuild(rows[1].id),/already running/);
 const job=u.jobs.get(rows[0].id);u.cancel(rows[0].id);await job;assert.equal(leased,false);
 await u.startBuild(rows[0].id);const retry=u.jobs.get(rows[0].id);u.cancel(rows[0].id);await retry;assert.equal(leased,false);
 await assert.rejects(u.startBuild('invalid'));assert.equal(leased,false);
});
test('server shares native reservation with existing Studio actions and live preview',async t=>{
 const {root}=await workspace(t);const app=await serve({port:0,root,repo:resolve('.')});t.after(()=>new Promise(r=>app.server.close(r)));
 const row=await app.universal.create({adapter:'html',name:'Lease',source:'<main><p>Lease</p></main>'});await app.universal.generate(row.id);
 app.studio.reserved=true;await assert.rejects(app.universal.startBuild(row.id),/active Studio/);app.studio.reserved=false;
 app.universal.executeBuild=async(r,signal)=>new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));
 await app.universal.startBuild(row.id);assert.equal(app.studio.reserved,true);
 await assert.rejects(app.live.start('anything'),/active task/);await assert.rejects(app.studio.exclusive(()=>{}),/active task/);
 const job=app.universal.jobs.get(row.id);app.universal.cancel(row.id);await job;assert.equal(app.studio.reserved,false);
});
test('project export contains editable source and excludes local secrets and evidence', {skip:process.platform!=='darwin'},async t=>{
 const {u}=await workspace(t);const r=await u.create({adapter:'html',name:'ExportApp',source:'<main><p>Export</p></main>'});await u.generate(r.id);
 const {mkdir,writeFile}=await import('node:fs/promises');const project=join(u.dir(r.id),'project');await writeFile(join(project,'ExportApp','.env'),'PRIVATE');await mkdir(join(project,'.ios-agent','screenshots'),{recursive:true});await writeFile(join(project,'.ios-agent','screenshots','secret.png'),'PRIVATE');
 const zip=await u.exportProject(r.id);const file=join(u.dir(r.id),'check.zip');await writeFile(file,zip);
 const {ProcessRunner}=await u.module('agent/runner');const listing=await new ProcessRunner().run('unzip',['-Z1',file]);assert.equal(listing.exitCode,0);assert.match(listing.stdout,/ExportApp\/Views\/RootView.swift/);assert.match(listing.stdout,/project.yml/);assert.match(listing.stdout,/UNIVERSAL-EXPORT.json/);assert.doesNotMatch(listing.stdout,/\.env|secret.png|DerivedData/);
 assert.equal(u.jobs.size,0);u.jobs.set(r.id,true);await assert.rejects(u.exportProject(r.id),/finish/);u.jobs.delete(r.id);
});
test('Studio Vue import shares generator and refuses unsupported template behavior',async t=>{
 const {u}=await workspace(t);const r=await u.create({adapter:'vue',name:'VueSample',source:'<template><main><h1>From Vue</h1></main></template>'});assert.equal((await u.generate(r.id)).status,'generated-unverified');assert.match((await u.source(r.id)).swift,/From Vue/);
 await assert.rejects(u.create({adapter:'vue',name:'VueUnsafe',source:'<template><p>{{ secret }}</p></template>'}),/interpolation/);
});
test('uploaded React modules produce one native project and preserve each source',async t=>{
 const {u}=await workspace(t);const files=[{path:'App.tsx',source:'import Card from "./Card";export default function App(){return <main><Card/></main>}'},{path:'Card.tsx',source:'export default function Card(){return <p>Imported module</p>}'}];
 const r=await u.createProject({name:'Modules',entry:'App.tsx',files});assert.equal((await u.generate(r.id)).status,'generated-unverified');const data=await u.source(r.id);assert.deepEqual(data.files,files);assert.equal(data.ir.sources.length,2);assert.match(data.swift,/Imported module/);
 for(const paths of [['../App.tsx'],['/App.tsx'],['App.tsx','app.tsx'],['a/../../App.tsx']])await assert.rejects(u.createProject({name:'Modules',entry:paths[0],files:paths.map(path=>({path,source:'export default function App(){return <p>Hi</p>}'}))}));
 await assert.rejects(u.createProject({name:'Modules',entry:'missing.tsx',files}));
});
test('an interrupted import staging directory never becomes a broken saved conversion',async t=>{
 const {u,root}=await workspace(t);const {mkdir,writeFile}=await import('node:fs/promises');const pending=join(u.root,'.pending-interrupted');await mkdir(pending);await writeFile(join(pending,'input.txt'),'unfinished');const next=new UniversalStudio(root,resolve('.'));await next.init();assert.deepEqual(await next.list(),[]);
 const r=await next.createProject({name:'Complete',entry:'App.tsx',files:[{path:'App.tsx',source:'export default function App(){return <p>Ready</p>}'}]});assert.match((await next.source(r.id)).input,/Ready/);assert.equal((await next.list()).length,1);
});
test('folder upload endpoint requires token and rejects path escape over HTTP',async t=>{
 const {root}=await workspace(t);const app=await serve({port:0,root,repo:resolve('.')});t.after(()=>new Promise(r=>app.server.close(r)));
 const page=await(await fetch(app.origin+'/universal')).text();const token=/name="studio-token" content="([a-f0-9]+)"/.exec(page)[1];
 const body=JSON.stringify({name:'HttpFolder',entry:'App.tsx',files:[{path:'App.tsx',source:'export default function App(){return <p>Folder</p>}'}]});
 assert.equal((await fetch(app.origin+'/api/universal/project',{method:'POST',headers:{'content-type':'application/json'},body})).status,403);
 const headers={'content-type':'application/json','x-studio-token':token};
 const response=await fetch(app.origin+'/api/universal/project',{method:'POST',headers,body});assert.equal(response.status,201);assert.equal((await response.json()).status,'inspected');
 assert.equal((await fetch(app.origin+'/api/universal/project',{method:'POST',headers,body:body.replaceAll('App.tsx','../App.tsx')})).status,400);
});
test('nested uploaded entries retain IR paths matching their original files',async t=>{
 const {u}=await workspace(t);const files=[{path:'src/App.tsx',source:'import Card from "./Card";export default function App(){return <main><Card/></main>}'},{path:'src/Card.tsx',source:'export default function Card(){return <p>Nested</p>}'}];const r=await u.createProject({name:'Nested',entry:'src/App.tsx',files});const data=await u.source(r.id);
 const {sha256}=await u.module('app-ir/schema');for(const s of data.ir.sources){const original=data.files.find(f=>f.path===s.path);assert.ok(original,s.path);assert.equal(s.sha256,sha256(original.source));}
 assert.deepEqual(data.ir.sources.map(s=>s.path),['src/App.tsx','src/Card.tsx']);
});
test('Studio Svelte uses shared IR and native generation without executing expressions',async t=>{
 const {u}=await workspace(t);const r=await u.create({adapter:'svelte',name:'SvelteSample',source:'<main><h1>From Svelte</h1></main>'});assert.equal((await u.generate(r.id)).status,'generated-unverified');assert.match((await u.source(r.id)).swift,/From Svelte/);
 await assert.rejects(u.create({adapter:'svelte',name:'UnsafeSvelte',source:'<p>{fetch("https://invalid.example")}</p>'}),/expressions/);
});
test('Studio retains controlled input contracts and native binding without inventing test results',async t=>{
 const {u}=await workspace(t);
 const source="import {useState} from 'react';export default function App(){const [name,setName]=useState('');return <main><input type=\"text\" aria-label=\"Name\" value={name} onChange={e=>setName(e.target.value)}/><p>{name}</p></main>}";
 const row=await u.create({adapter:'react',name:'EditableName',source});
 const generated=await u.generate(row.id);assert.equal(generated.status,'generated-unverified');
 const data=await u.source(row.id);assert.equal(data.ir.schemaVersion,'1.4.0');assert.match(data.swift,/TextField\("", text: \$state_/);assert.match(data.swift,/accessibilityLabel\(Text\(verbatim: "Name"\)\)/);assert.equal(generated.tests,'not-run');assert.equal(generated.visualFidelity,'not-evaluated');
 await assert.rejects(u.create({adapter:'react',name:'UnsupportedInput',source:source.replace('e.target.value','e.target.value.trim()')}));
 assert.equal((await u.list()).length,1);
});
test('explicit simulator selection is validated and never falls back to a different device',async t=>{
 const {u}=await workspace(t),chosen='11111111-1111-1111-1111-111111111111',missing='22222222-2222-2222-2222-222222222222';
 const row=await u.create({adapter:'html',name:'DeviceSelection',source:'<main><p>Hello</p></main>'});await u.generate(row.id);
 const original=u.module.bind(u);let builds=0;
 u.module=async name=>{
  if(name==='agent/runner')return {ProcessRunner:class{}};
  if(name==='agent/toolchain')return {detectToolchain:async()=>({simulators:[{udid:chosen,name:'Synthetic iPad',runtime:'synthetic',state:'Shutdown',isAvailable:true},{udid:missing,isAvailable:false}]}),chooseSimulator:(rows,id)=>rows.find(r=>r.isAvailable&&r.udid===id)};
  if(name==='agent/build')return {buildProject:async(root,runner,options)=>{assert.equal(options.udid,chosen);builds++;return {success:false,errors:[{message:'synthetic stop after selected build'}]};}};
  return original(name);
 };
 assert.deepEqual(await u.simulators(),[{udid:chosen,name:'Synthetic iPad',runtime:'synthetic',state:'Shutdown'}]);
 for(const options of [null,{udid:'invalid'},{udid:123},{unexpected:true}])await assert.rejects(u.startBuild(row.id,options),/simulator UUID/);
 assert.equal(u.nativeBusy,false);
 await u.startBuild(row.id,{udid:missing});await u.jobs.get(row.id);assert.equal(builds,0);assert.match((await u.get(row.id)).error,/selected simulator is unavailable/);
 await u.startBuild(row.id,{udid:chosen});await u.jobs.get(row.id);assert.equal(builds,1);assert.equal((await u.get(row.id)).runs.at(-1).requestedUDID,chosen);assert.equal((await u.get(row.id)).runs.at(-1).udid,chosen);
});
test('simulator discovery is authenticated and build endpoint passes the explicit selection',async t=>{
 const {root}=await workspace(t);const app=await serve({port:0,root,repo:resolve('.')});t.after(()=>new Promise(r=>app.server.close(r)));
 const page=await(await fetch(app.origin+'/universal')).text();const token=/name="studio-token" content="([a-f0-9]+)"/.exec(page)[1];const headers={'x-studio-token':token,'content-type':'application/json'};
 app.universal.simulators=async()=>[{udid:'test-device'}];
 assert.equal((await fetch(app.origin+'/api/universal/simulators')).status,403);
 assert.deepEqual(await(await fetch(app.origin+'/api/universal/simulators',{headers})).json(),[{udid:'test-device'}]);
 app.universal.startBuild=async(id,options)=>({id,...options,status:'synthetic-dispatch'});
 const response=await fetch(app.origin+'/api/universal/test-id/build',{method:'POST',headers,body:JSON.stringify({udid:'selected'})});assert.equal(response.status,202);assert.equal((await response.json()).udid,'selected');
});
test('cancellation during launch settling prevents a screenshot and releases native ownership',async t=>{
 const {u}=await workspace(t);const row=await u.create({adapter:'html',name:'CancelSettling',source:'<main><p>Hello</p></main>'});await u.generate(row.id);
 const original=u.module.bind(u);
 u.module=async name=>{
  if(name==='agent/runner')return {ProcessRunner:class{}};
  if(name==='agent/toolchain')return {detectToolchain:async()=>({simulators:[{udid:'test'}]}),chooseSimulator:s=>s[0]};
  if(name==='agent/build')return {buildProject:async()=>({success:true,errors:[]})};
  if(name==='agent/simulator')return {runApp:async()=>{queueMicrotask(()=>u.cancel(row.id));return {udid:'test'};},screenshot:async()=>assert.fail('cancelled capture must not run')};
  return original(name);
 };
 await u.startBuild(row.id);await u.jobs.get(row.id);const done=await u.get(row.id);assert.equal(done.status,'cancelled');assert.equal(done.capture,undefined);assert.equal(u.nativeBusy,false);
});
