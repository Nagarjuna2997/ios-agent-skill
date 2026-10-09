// Studio delegates planning/build/refinement to exactly the CLI agent loop.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
async function moduleFrom(studio, name) {
  return import(pathToFileURL(path.join(studio.repo, 'mcp-server/dist/agent', name + '.js')).href);
}
export async function agentFingerprint(studio, id) {
  const {snapshotFiles, snapshotHash} = await moduleFrom(studio, 'remote');
  return snapshotHash(await snapshotFiles(path.join(studio.dir(id), 'project')));
}
export async function executeAgent(studio, p, kind, message, signal) {
  if (p.provider !== 'claude') throw Error('The shared build agent currently requires Claude Code. Select Claude explicitly; existing Codex projects keep their original engine.');
  const [{runAgent}, {ClaudeCodeBrain}, {ProcessRunner}, {loadState}] = await Promise.all(['loop','brain','runner','state'].map(n => moduleFrom(studio,n)));
  const root = path.join(studio.dir(p.id), 'project');
  const processRunner = new ProcessRunner();
  const runner = {run(command,args,options={}) { if(signal.aborted) throw Error('Cancelled'); return processRunner.run(command,args,{...options,signal}); }};
  const previous = await loadState(root);
  let pendingLog = Promise.resolve();
  const result = await runAgent({projectDir:root,brain:new ClaudeCodeBrain({runner}),runner,
    ...(previous ? {resume:true} : {description:p.brief}), planOnly:kind==='plan', maxVisualRepairs:1,
    ...(kind==='refine' ? {refine:message} : {}),
    ...(kind==='build' && !previous?.milestones?.created ? {design:message || 'first'} : {}),
    sink:line => { pendingLog = pendingLog.then(() => studio.log(p,line)); },
  });
  await pendingLog;
  if (signal.aborted) throw Error('Cancelled');
  const plan = JSON.parse(await fs.readFile(path.join(root,'.ios-agent/plan.json'),'utf8'));
  p.agentPlan = plan;
  p.plan = {summary:plan.summary,screens:plan.screens.map(s=>s.title),criteria:plan.features};
  p.status = kind==='plan' && result.state.failure==='plan only' ? 'planned' : result.state.status;
  p.error = p.status==='failed' ? result.state.failure : null;
  p.evidence = null;
  if (result.state.captureSourceHash && result.state.captureSourceHash === await agentFingerprint(studio,p.id)) {
    const screens={}, paths={};
    for(const shot of result.state.screenshots) {
      const key = `${shot.screen}-${shot.device || 'iphone'}-${shot.variant || 'light'}`;
      if(!/^[a-z0-9-]+$/.test(key) || !/^\.ios-agent\/screenshots\/[a-zA-Z0-9_.-]+\.png$/.test(shot.path)) throw Error('Invalid screenshot path');
      const {digest} = await moduleFrom(studio,'remote');
      screens[key]=digest(await fs.readFile(path.join(root,shot.path))); paths[key]=shot.path;
    }
    p.evidence = {sourceHash:result.state.captureSourceHash,screens,paths,date:new Date().toISOString(),scope:'Shared ios-build loop. Consult RUN_REPORT.md for separate build, test and visual findings.'};
  }
  p.messages.push({role:'assistant',text:kind==='plan' ? plan.summary : `Run ${result.state.status}. ${result.state.failure || 'Build, test and visual results are in RUN_REPORT.md.'}`});
  await studio.save(p);
}
