import test from 'node:test';
import assert from 'node:assert/strict';
import {access, mkdir, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sha256} from '../dist/app-ir/schema.js';
import {reviewProjectDirectories,applyReviewedProject,reviewProjectFile} from '../dist/app-ir/project-reconcile.js';

async function fixture(t) {
 const root=await mkdtemp(join(tmpdir(),'regenerated-project-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const dirs=['base','local','next'].map(d=>join(root,d));
 await Promise.all(dirs.map(d=>mkdir(d)));
 const set=async (tree,p,bytes)=>{await mkdir(dirname(join(dirs[tree],p)),{recursive:true});await writeFile(join(dirs[tree],p),bytes)};
 return {root,dirs,set};
}

test('whole-project review preserves a local edit and merges a separate incoming Swift edit; updates asset and membership',async t=>{
 const {root,dirs,set}=await fixture(t);
 const base='struct Title {\nlet title = "Before"\n// line one\n// line two\n// line three\n// line four\n// line five\n}\n';
 const local=base.replace('// line five','func help() {}'), next=base.replace('Before','After');
 for(const [i,s] of [base,local,next].entries()){
   await set(i,'App/View.swift',s);await set(i,'App.xcodeproj/project.pbxproj',i===2?'member View + Map':'member View');
   await set(i,'App/Tile.imageset/tile.png',Buffer.from([0,0xff,i===2?6:1]));
   await set(i,'.ios-agent/source-map.json',JSON.stringify({files:[{path:'App/View.swift',sha256:sha256(i===2?next:base),mappings:[{}]}]}));
 }
 await set(1,'App/User.swift','local view');await set(2,'App/Map.swift','map');await set(0,'App/Old.swift','delete');await set(1,'App/Old.swift','delete');
 await set(1,'.env','private');await set(1,'Config/Secrets.xcconfig','private');
 const r=await reviewProjectDirectories(...dirs), item=reviewProjectFile(r,'App/View.swift');
 assert.equal(item.entry.change,'merged');assert.match(item.candidate,/After/);assert.match(item.candidate,/func help/);
 assert.equal(r.report.blockers.length,0);assert.ok(!JSON.stringify(r.report).includes('.env'));
 assert.ok(r.report.files.some(f=>f.change==='invalidate-source-map'));
 const out=join(root,'out');
 await applyReviewedProject(r,r.report.reviewId,out,dirs);
 assert.equal(await readFile(join(out,'App/View.swift'),'utf8'),item.candidate);
 assert.equal(await readFile(join(out,'App.xcodeproj/project.pbxproj'),'utf8'),'member View + Map');
 assert.equal(await readFile(join(out,'App/User.swift'),'utf8'),'local view');
 assert.equal((await readFile(join(out,'App/Tile.imageset/tile.png')))[2],6);
 assert.deepEqual(JSON.parse(await readFile(join(out,'.ios-agent/source-map.json'))).files,[]);
 await assert.rejects(access(join(out,'App/Old.swift')));await assert.rejects(access(join(out,'Config/Secrets.xcconfig')));
 assert.equal(await readFile(join(dirs[1],'App/View.swift'),'utf8'),local);
 await assert.rejects(applyReviewedProject(r,r.report.reviewId,out,dirs),/EEXIST/);
 await assert.rejects(applyReviewedProject(r,r.report.reviewId,join(dirs[1],'output'),dirs),/outside all inputs/);
});

test('conflict, modify/delete, duplicate path, symlink and stale review never create a project',async t=>{
 const {root,dirs,set}=await fixture(t);const out=join(root,'out');
 await set(0,'A.swift','base');await set(1,'A.swift','local');await set(2,'A.swift','regen');
 await set(0,'B','base');await set(2,'B','next');
 const r=await reviewProjectDirectories(...dirs);
 assert.deepEqual(r.report.blockers,['A.swift','B']);
 await assert.rejects(applyReviewedProject(r,r.report.reviewId,out,dirs),/conflicting/);
 await assert.rejects(access(out));
 await set(1,'Extra','local');const changed=await reviewProjectDirectories(...dirs);
 await assert.rejects(applyReviewedProject(changed,r.report.reviewId,out,dirs),/Stale/);
 await set(1,'Local','file');await set(2,'local/nested','file');await assert.rejects(reviewProjectDirectories(...dirs),/Conflicting output/);
 await symlink(join(root,'base'),join(dirs[1],'link'));await assert.rejects(reviewProjectDirectories(...dirs),/symlink/);
});

test('CLI compares and applies only a fresh hash; an existing destination cannot be changed',async t=>{
 const {root,dirs,set}=await fixture(t);await set(0,'Copy.swift','A');await set(1,'Copy.swift','A');await set(2,'Copy.swift','B');
 const binary=fileURLToPath(new URL('../dist/unified.js',import.meta.url));
 const cli=(...args)=>spawnSync(process.execPath,[binary,'app-ir','reconcile-project',...dirs,...args],{encoding:'utf8'});
 const r=cli();assert.equal(r.status,0,r.stderr);
 const {reviewId}=JSON.parse(r.stdout);assert.equal(JSON.parse(cli('--file','Copy.swift').stdout).candidate,'B');
 const out=join(root,'accepted');assert.equal(cli('--approve',reviewId,'--out',out).status,0);
 await set(2,'New','changed');assert.notEqual(cli('--approve',reviewId,'--out',join(root,'stale')).status,0);
 assert.equal(await readFile(join(out,'Copy.swift'),'utf8'),'B');await assert.rejects(access(join(root,'stale')));
});
