import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rm,mkdir,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {renderEvidence} from './render-evidence.mjs';
test('viewer escapes untrusted report text, displays unknown evidence and refuses overwrite',async()=>{const root=await mkdtemp(join(tmpdir(),'viewer-'));try{await writeFile(join(root,'report.json'),JSON.stringify({status:'<script>alert(1)</script>',runs:[{folder:'/runner/missing',name:'<img onerror=x>'}]}));await renderEvidence(root,join(root,'view.html'));const html=await readFile(join(root,'view.html'),'utf8');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('unavailable'));assert.ok(html.includes("default-src 'none'"));await assert.rejects(renderEvidence(root,join(root,'view.html')),/EEXIST/);}finally{await rm(root,{recursive:true,force:true});}});
test('viewer rejects symlink evidence and path escape instead of reading outside artifact',async()=>{const root=await mkdtemp(join(tmpdir(),'viewer-'));try{await writeFile(join(root,'report.json'),JSON.stringify({status:'rejected',runs:[]}));await symlink('/etc/hosts',join(root,'reference.png'));await assert.rejects(renderEvidence(root,join(root,'view.html')),/Invalid evidence/);}finally{await rm(root,{recursive:true,force:true});}});

const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1kAAAAASUVORK5CYII=','base64');
const result=()=>({status:'passed',passed:3,failed:0,skipped:0});
const nativeReport=()=>({version:1,fixture:'react-boolean-state',status:'native-behavior-passed',visualFidelity:'not-evaluated',build:{success:true},large:{tests:result(),attachments:'/original/large-attachments'},xxxl:{tests:result()},environment:{sdk:'26.5'},profile:{deviceType:'iPhone-17-Pro'}});
const manifest=()=>[{testIdentifier:'BooleanStateTests/testToggle()',attachments:[{exportedFileName:'state.png',suggestedHumanReadableName:'initial-state',isAssociatedWithFailure:false}]}];
async function nativeFixture(callback){
 const root=await mkdtemp(join(tmpdir(),'native-viewer-'));
 try{
  const report=nativeReport(),attachments=manifest();
  await mkdir(join(root,'large-attachments'));
  await writeFile(join(root,'large-attachments','state.png'),png);
  async function render(){
   await writeFile(join(root,'report.json'),JSON.stringify(report));
   await writeFile(join(root,'large-attachments','manifest.json'),JSON.stringify(attachments));
   const output=join(root,'view.html');await rm(output,{force:true});
   const summary=await renderEvidence(root,output);
   return {summary,html:await readFile(output,'utf8')};
  }
  await callback({root,report,attachments,render});
 }finally{await rm(root,{recursive:true,force:true});}
}
test('native viewer renders recorded state tests and local screenshots without claiming fidelity',async()=>nativeFixture(async({render})=>{
 const {summary,html}=await render();
 assert.equal(summary.kind,'native-behavior');assert.equal(summary.runs,0);
 assert.ok(html.includes('Native behavior evidence'));assert.ok(html.includes('Large native tests'));assert.ok(html.includes('XXXL native tests'));
 assert.ok(html.includes('data:image/png;base64,'));assert.ok(html.includes('initial-state'));assert.ok(html.includes('iPhone-17-Pro'));
 assert.ok(html.includes('Visual fidelity was not evaluated'));assert.ok(html.includes('does not rerun tests or verify checkpoint hashes'));
 assert.ok(!html.includes('<h2>Source reference'));assert.ok(!html.includes('<h2>Repair decision'));
 assert.ok(html.includes('Screenshots unavailable'));
}));
test('native viewer distinguishes failed, incomplete and unavailable evidence',async()=>nativeFixture(async({root,report,render})=>{
 report.status='failed';report.build.success=false;report.error='<script>build failed</script>';delete report.xxxl;
 report.large.tests={status:'failed',passed:2,failed:1,skipped:0};
 await rm(join(root,'large-attachments','state.png'));
 let {html}=await render();assert.ok(html.includes('Recorded build</dt><dd>failed'));assert.ok(html.includes('&lt;script&gt;build failed'));
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('initial-state unavailable'));assert.ok(html.includes('Recorded status</dt><dd>unavailable'));
 report.status='running';delete report.build;delete report.large;
 ({html}=await render());assert.ok(html.includes('Recorded build</dt><dd>unavailable'));assert.ok(html.includes('<strong>running</strong>'));
}));
test('native viewer rejects contradictory passing counts and fidelity claims',async()=>nativeFixture(async({report,render})=>{
 for(const patch of [{passed:0},{failed:1},{skipped:1},{passed:-1},{passed:1.5},{status:'unknown'}]){
  report.large.tests={...result(),...patch};await assert.rejects(render(),/native test/);
 }
 report.large.tests=result();report.error='Native tests failed';await assert.rejects(render(),/completion/);delete report.error;
 report.build.errors=[{message:'Compile failed'}];await assert.rejects(render(),/completion/);delete report.build.errors;
 report.build.success=false;await assert.rejects(render(),/completion/);
 report.build.success=true;delete report.xxxl;await assert.rejects(render(),/completion/);
 report.xxxl={tests:result()};report.visualFidelity='passed';await assert.rejects(render(),/Unsupported native/);
}));
test('native attachment captions are escaped and failure attachments are identified',async()=>nativeFixture(async({attachments,render})=>{
 attachments[0].testIdentifier='<img src=x onerror=alert(1)>';
 attachments[0].attachments[0].suggestedHumanReadableName='" onload="alert(2)';
 attachments[0].attachments[0].isAssociatedWithFailure=true;
 const {html}=await render();assert.ok(html.includes('Failure attachment'));assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(html.includes('&quot; onload=&quot;'));
 assert.ok(!html.includes('<img src=x'));assert.ok(!html.includes('" onload="'));
}));
test('native viewer rejects escaping, duplicate and unidentified attachments',async()=>nativeFixture(async({attachments,render})=>{
 const a=attachments[0].attachments[0];
 for(const name of ['../outside.png','/outside.png','nested/state.png','..','a\\b.png']){
  a.exportedFileName=name;await assert.rejects(render(),/attachment/);
 }
 a.exportedFileName='state.png';attachments[0].attachments.push({...a});await assert.rejects(render(),/duplicate/);
 attachments[0].attachments.pop();delete a.isAssociatedWithFailure;await assert.rejects(render(),/failure identity/);
}));
test('native viewer bounds attachment counts and refuses parent symlink escapes',async()=>nativeFixture(async({root,attachments,render})=>{
 const a=attachments[0].attachments[0];attachments[0].attachments=Array.from({length:9},(_,i)=>({...a,exportedFileName:`state-${i}.png`}));
 await assert.rejects(render(),/Too many native screenshots/);
 attachments[0].attachments=Array.from({length:65},(_,i)=>({...a,exportedFileName:`state-${i}.txt`}));await assert.rejects(render(),/Too many native attachments/);
 attachments.splice(0,1,...Array.from({length:33},()=>({testIdentifier:'test',attachments:[]})));await assert.rejects(render(),/Invalid attachment manifest/);
 // The regular-file manifest itself must not bypass the root boundary through its parent.
 await rm(join(root,'large-attachments'),{recursive:true});
 const outside=await mkdtemp(join(tmpdir(),'outside-viewer-'));
 try{
  await writeFile(join(outside,'manifest.json'),'[]');await symlink(outside,join(root,'large-attachments'));
  await assert.rejects(renderEvidence(root,join(root,'view.html')),/Evidence escapes root/);
 }finally{await rm(outside,{recursive:true,force:true});}
}));

test('native viewer labels an absent attachment manifest unavailable',async()=>nativeFixture(async({root,render})=>{
 await render();await rm(join(root,'large-attachments','manifest.json'));
 const output=join(root,'missing.html');await renderEvidence(root,output);
 const html=await readFile(output,'utf8');assert.ok(html.includes('Screenshots unavailable'));assert.ok(!html.includes('data:image/png'));
}));

test('navigation reports show their own fixture identity and exact native counts',async()=>nativeFixture(async({report,render})=>{
 report.fixture='react-memory-router';report.expectedTests=3;
 const {html,summary}=await render();assert.equal(summary.kind,'native-behavior');
 assert.ok(html.includes('react-memory-router'));assert.ok(html.includes('Expected tests per size'));
 assert.ok(html.includes('Visual fidelity was not evaluated'));assert.ok(!html.includes('Source reference'));
}));
test('known fixtures reject reduced passing subsets and unknown fixture claims',async()=>nativeFixture(async({report,render})=>{
 for(const fixture of ['react-boolean-state','react-memory-router','react-controlled-text']){
  report.fixture=fixture;report.large.tests={...result(),passed:1};
  await assert.rejects(render(),/Contradictory native completion/);
  report.large.tests=result();report.expectedTests=1;await assert.rejects(render(),/test-count contract/);delete report.expectedTests;
 }
 report.fixture='arbitrary-react';await assert.rejects(render(),/Unsupported native fixture/);
}));
test('viewer preserves infrastructure diagnostics even when repair returned requires-review',async()=>{
 const root=await mkdtemp(join(tmpdir(),'viewer-'));try{
  await writeFile(join(root,'report.json'),JSON.stringify({status:'requires-review',repair:{outcome:'requires-review',attempts:[]},candidateFailure:{category:'infrastructure_failure',message:'discovery <failed>'},runs:[{folder:'/runner/candidate',name:'candidate',build:{success:true,logPath:'build.log'}}]}));
  await renderEvidence(root,join(root,'view.html'));const html=await readFile(join(root,'view.html'),'utf8');assert.match(html,/infrastructure_failure/);assert.match(html,/discovery &lt;failed&gt;/);assert.match(html,/build.log/);assert.match(html,/requires-review/);assert.match(html,/unavailable/);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('controlled inputs retain a distinct native fixture identity without claiming fidelity',async()=>nativeFixture(async({report,render})=>{
 report.fixture='react-controlled-text';report.expectedTests=3;
 const {html,summary}=await render();assert.equal(summary.kind,'native-behavior');assert.ok(html.includes('react-controlled-text'));assert.ok(html.includes('Visual fidelity was not evaluated'));
}));
test('reset-input fixture requires four native tests and preserves the prior three-test fixture',async()=>nativeFixture(async({report,render})=>{
 report.fixture='react-controlled-text-reset';report.expectedTests=4;
 await assert.rejects(render(),/Contradictory native completion/);
 report.large.tests.passed=4;report.xxxl.tests.passed=4;
 const {html}=await render();assert.ok(html.includes('react-controlled-text-reset'));
}));
test('capture export errors remain explicit and escaped in the viewer',async()=>nativeFixture(async({report,render})=>{
 report.status='failed';report.large={tests:{...result(),status:'failed',passed:2,failed:1},attachmentError:'<script>export unavailable</script>'};
 const {html}=await render();assert.ok(html.includes('Capture export'));assert.ok(html.includes('&lt;script&gt;export unavailable&lt;/script&gt;'));assert.ok(!html.includes('<script>export unavailable</script>'));
}));
