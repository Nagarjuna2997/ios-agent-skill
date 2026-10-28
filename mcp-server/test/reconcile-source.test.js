import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,symlink,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {reconcileSource,reconcileFiles} from '../dist/app-ir/reconcile.js';
import {sha256} from '../dist/app-ir/schema.js';
for(const [base,local,generated,outcome,candidate] of [
 ['A','A','A','unchanged','A'],['A','B','A','keep-local','B'],['A','A','B','use-generated','B'],
 ['A','B','B','converged','B'],['A','B','C','conflict',null],['A','','A','keep-local',''],
 ['a\nb','x\nb','a\ny','conflict',null],['A\r\n','A\r\n','A\n','use-generated','A\n'],
])test('reconcile '+outcome+' '+JSON.stringify([base,local,generated]),()=>{
 const r=reconcileSource(...[base,local,generated].map(s=>Buffer.from(s)));assert.equal(r.outcome,outcome);
 assert.equal(r.candidate?.toString()??null,candidate);assert.equal(r.candidateHash,candidate===null?null:sha256(candidate));
});
test('reconciliation rejects binary, malformed UTF-8 and oversized input',()=>{
 for(const bad of [Buffer.from([0]),Buffer.from([0xff]),Buffer.alloc(262145,65)])assert.throws(()=>reconcileSource(Buffer.from('A'),bad,Buffer.from('A')));
});
test('review bundle keeps exact inputs and never overwrites existing output or sources',async t=>{
 const root=await mkdtemp(join(tmpdir(),'reconcile-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const files=['base','local','generated'].map(n=>join(root,n));await Promise.all(files.map((p,i)=>writeFile(p,['base','local','generated'][i])));
 const out=join(root,'review');const r=await reconcileFiles(...files,out);assert.equal(r.outcome,'conflict');await assert.rejects(access(join(out,'candidate.swift')));
 const report=JSON.parse(await readFile(join(out,'report.json')));assert.equal(report.tests,'not-run');assert.equal(report.status,'requires-review');
 assert.equal(await readFile(join(out,'local.swift'),'utf8'),'local');await assert.rejects(reconcileFiles(...files,out),/EEXIST/);
 await symlink(files[0],join(root,'link'));await assert.rejects(reconcileFiles(join(root,'link'),files[1],files[2],join(root,'bad')));
 await assert.rejects(access(join(root,'bad')));assert.equal(await readFile(files[1],'utf8'),'local');
 await writeFile(files[2],'base');await reconcileFiles(...files,join(root,'safe'));assert.equal(await readFile(join(root,'safe/candidate.swift'),'utf8'),'local');
});
test('CLI emits a reviewable conflict with exit 2 and safe candidate with exit 0',async t=>{
 const {spawnSync}=await import('node:child_process');const root=await mkdtemp(join(tmpdir(),'reconcile-cli-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const files=['base','local','generated'].map(n=>join(root,n));await Promise.all(files.map((p,i)=>writeFile(p,['base','local','generated'][i])));
 const cli=new URL('../dist/unified.js',import.meta.url);const {fileURLToPath}=await import('node:url');
 const run=out=>spawnSync(process.execPath,[fileURLToPath(cli),'app-ir','reconcile',...files,out],{encoding:'utf8',timeout:15000});
 const conflict=run(join(root,'conflict'));assert.equal(conflict.status,2,conflict.stderr);assert.equal(JSON.parse(conflict.stdout).outcome,'conflict');
 await writeFile(files[1],'base');const safe=run(join(root,'safe'));assert.equal(safe.status,0,safe.stderr);assert.equal(JSON.parse(safe.stdout).outcome,'use-generated');assert.equal(await readFile(join(root,'safe/candidate.swift'),'utf8'),'generated');
});
