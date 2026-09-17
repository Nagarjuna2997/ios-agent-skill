import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import {execFileSync,spawnSync} from 'node:child_process';
import {fs,path,ROOT,parse,select,html} from './lib.mjs';
function fixture(){
 const r=fs.mkdtempSync(path.join(os.tmpdir(),'site-discovery-'));
 fs.mkdirSync(path.join(r,'site/blog'),{recursive:true});fs.mkdirSync(path.join(r,'docs'),{recursive:true});
 fs.writeFileSync(path.join(r,'README.md'),'# Test\n\n**Build and review Swift apps.**\n\nUse focused checks to inspect your app. More text.\n');
 fs.writeFileSync(path.join(r,'site/verification.json'),'{}');
 const page='<html><head><title>Unique fixture page</title></head><body><main><h1>Visible body</h1><p>First paragraph describing the fixture page.</p><pre>if (a &lt; b) { value++ }</pre></main><footer>Original footer</footer></body></html>';
 fs.writeFileSync(path.join(r,'site/index.html'),page);
 fs.writeFileSync(path.join(r,'site/blog/first.md'),'---\ntitle: First article\ndescription: A distinct short article description.\n---\n\n# Original heading\n\nOriginal article body.');
 execFileSync('git',['init','-q'],{cwd:r});execFileSync('git',['add','.'],{cwd:r});execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','fixture'],{cwd:r});
 return r;
}
function run(r,script,args=[]){return spawnSync(process.execPath,[path.join(ROOT,'scripts',script),...args],{env:{...process.env,SITE_ROOT:r,INDEXNOW_KEY:''},encoding:'utf8'});}
const output=r=>r.stdout+r.stderr;
test('build is idempotent, preserves original main bytes, indexes Markdown and validates',()=>{
 const r=fixture();try{
  const before=fs.readFileSync(path.join(r,'site/index.html'),'utf8').match(/<main>[\s\S]*?<\/main>/)[0];
  let result=run(r,'site-meta.mjs');assert.equal(result.status,0,output(result));
  const first=fs.readFileSync(path.join(r,'site/index.html'),'utf8');assert.ok(first.includes(before));
  assert.equal(run(r,'site-meta.mjs').status,0);assert.equal(fs.readFileSync(path.join(r,'site/index.html'),'utf8'),first);
  const check=run(r,'check-site-discovery.mjs');assert.equal(check.status,0,output(check));
  assert.ok(fs.readFileSync(path.join(r,'site/feed.xml'),'utf8').includes('First article'));
  assert.ok(fs.readFileSync(path.join(r,'site/llms.txt'),'utf8').includes('Use focused checks to inspect your app.'));
 }finally{fs.rmSync(r,{recursive:true,force:true});}
});
test('missing metadata, duplicate titles and stale discovery fail with filename',()=>{
 const r=fixture();try{assert.equal(run(r,'site-meta.mjs').status,0);
  const p=path.join(r,'site/blog/first.html');let s=fs.readFileSync(p,'utf8');s=s.replace(/<meta name="description"[^>]*>/,'').replace('<title>First article</title>','<title>Unique fixture page</title>');fs.writeFileSync(p,s);
  fs.writeFileSync(path.join(r,'site/sitemap.xml'),'<?xml version="1.0"?><urlset></urlset>');
  const check=run(r,'check-site-discovery.mjs');assert.notEqual(check.status,0);assert.match(output(check),/blog\/first.html: missing or duplicate description/);assert.match(output(check),/duplicate title/);assert.match(output(check),/missing from sitemap/);
 }finally{fs.rmSync(r,{recursive:true,force:true});}
});
test('unregistered future HTML fails, front matter drafts and assets stay out of discovery',()=>{
 const r=fixture();try{assert.equal(run(r,'site-meta.mjs').status,0);
  fs.writeFileSync(path.join(r,'site/new.html'),'<html><head><title>New page</title></head><body><p>New description</p></body></html>');
  let result=run(r,'site-meta.mjs');assert.notEqual(result.status,0);assert.match(output(result),/new.html: add title and description/);
  result=run(r,'site-meta.mjs',['--update-map']);assert.equal(result.status,0,output(result));
  fs.writeFileSync(path.join(r,'site/blog/draft.md'),'---\ntitle: Draft article\ndescription: Unfinished content not intended for discovery.\ndraft: true\n---\n\nDraft body.');
  fs.mkdirSync(path.join(r,'site/assets'));fs.writeFileSync(path.join(r,'site/assets/hidden.html'),'<p>Asset</p>');fs.writeFileSync(path.join(r,'site/404.html'),'<p>Not found</p>');
  result=run(r,'site-meta.mjs');assert.equal(result.status,0,output(result));
  const sitemap=fs.readFileSync(path.join(r,'site/sitemap.xml'),'utf8');assert.ok(!/draft|hidden|404/.test(sitemap));
  assert.match(fs.readFileSync(path.join(r,'site/blog/draft.html'),'utf8'),/noindex,follow/);
  result=run(r,'check-site-discovery.mjs');assert.equal(result.status,0,output(result));
 }finally{fs.rmSync(r,{recursive:true,force:true});}
});
test('source-only guide edits refresh Git lastmod and metadata-map edits notify IndexNow',()=>{
 const r=fixture();try{
  fs.mkdirSync(path.join(r,'site/guides'),{recursive:true});fs.mkdirSync(path.join(r,'content/guides'),{recursive:true});
  fs.writeFileSync(path.join(r,'docs/topic.md'),'# Topic\nOriginal source.');
  fs.writeFileSync(path.join(r,'content/guides/visuals.json'),JSON.stringify({'docs/topic.md':{}}));
  fs.writeFileSync(path.join(r,'site/guides/topic.html'),'<html><head><title>Topic guide</title></head><body><p>Topic description.</p></body></html>');
  execFileSync('git',['add','.'],{cwd:r});execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','source'],{cwd:r});
  assert.equal(run(r,'site-meta.mjs').status,0);
  const before=execFileSync('git',['rev-parse','HEAD'],{cwd:r,encoding:'utf8'}).trim();
  fs.appendFileSync(path.join(r,'docs/topic.md'),'\nNew example.');
  execFileSync('git',['add','docs/topic.md'],{cwd:r});execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','source only'],{cwd:r,env:{...process.env,GIT_AUTHOR_DATE:'2028-01-01T00:00:00Z',GIT_COMMITTER_DATE:'2028-01-01T00:00:00Z'}});
  assert.equal(run(r,'site-meta.mjs').status,0);
  assert.match(fs.readFileSync(path.join(r,'site/sitemap.xml'),'utf8'),/guides\/topic.html<\/loc><lastmod>2028-01-01/);
  execFileSync('git',['add','site/pages.json'],{cwd:r});execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','metadata'],{cwd:r});
  const onlyMap=execFileSync('git',['rev-parse','HEAD~1'],{cwd:r,encoding:'utf8'}).trim();
  const result=spawnSync(process.execPath,[path.join(ROOT,'scripts/site-indexnow.mjs'),'--dry-run'],{env:{...process.env,SITE_ROOT:r,INDEXNOW_KEY:'testkey12345678',BEFORE_SHA:onlyMap},encoding:'utf8'});
  assert.equal(result.status,0,output(result));assert.ok(JSON.parse(result.stdout).urlList.some(u=>u.endsWith('/blog/first.html')));
 }finally{fs.rmSync(r,{recursive:true,force:true});}
});
