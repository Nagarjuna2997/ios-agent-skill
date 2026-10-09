import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Studio } from '../engine.mjs';
test('shared-agent Studio projects persist the explicit provider without legacy scaffolding', async () => {
 const dir = await mkdtemp(path.join(tmpdir(),'studio-shared-'));
 try {
 const studio = new Studio(dir, process.cwd());
 await assert.rejects(studio.create('Example','A sample app','codex','agent'), /requires Claude/);
 const p = await studio.create('Example','A sample app','claude','agent');
 assert.equal(p.template,'agent'); assert.equal((await studio.get(p.id)).provider,'claude');
 assert.equal(p.plan,null);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test('shared bridge resumes created projects without reselecting design', async () => {
 const {mkdir,writeFile} = await import('node:fs/promises');
 const {executeAgent} = await import('../agent-bridge.mjs');
 const dir = await mkdtemp(path.join(tmpdir(),'studio-agent-resume-'));
 try {
 const modules = path.join(dir,'mcp-server/dist/agent'); await mkdir(modules,{recursive:true});
 await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
 await writeFile(path.join(modules,'loop.js'),'export async function runAgent(o) { if(o.design) throw Error("unexpected design re-selection"); return {state:{status:"stopped",failure:"provider unavailable"}}; }');
 await writeFile(path.join(modules,'brain.js'),'export class ClaudeCodeBrain {}');
 await writeFile(path.join(modules,'runner.js'),'export class ProcessRunner {}');
 await writeFile(path.join(modules,'state.js'),'export async function loadState(){ return {milestones:{created:"now"},builds:[]}; }');
 const root = path.join(dir,'workspace'); await mkdir(path.join(root,'project/.ios-agent'),{recursive:true});
 await writeFile(path.join(root,'project/.ios-agent/plan.json'),JSON.stringify({appName:'Probe',summary:'Sample',screens:[],features:[]}));
 const studio = {repo:dir,dir:()=>root,async log(){},async save(){}};
 const p = {id:'test',provider:'claude',brief:'Sample',messages:[]};
 await executeAgent(studio,p,'build',undefined,new AbortController().signal);
 assert.equal(p.status,'stopped');
 } finally {await rm(dir,{recursive:true,force:true});}
});
