// Local Universal IR workspace. Imported source is parsed, never executed.
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {pathToFileURL} from 'node:url';
export class UniversalStudio {
  constructor(root,repo,acquireNative){this.acquireNative=acquireNative;this.nativeBusy=false;this.root=path.join(root,'universal');this.repo=repo;this.jobs=new Map();this.controllers=new Map();}
  async module(name){return import(pathToFileURL(path.join(this.repo,'mcp-server/dist',name+'.js')).href);}
  dir(id){if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))throw Error('Invalid conversion ID');return path.join(this.root,id);}
  async save(row){const dir=this.dir(row.id),tmp=path.join(dir,randomUUID()+'.tmp');await fs.writeFile(tmp,JSON.stringify(row,null,2),{flag:'wx'});await fs.rename(tmp,path.join(dir,'report.json'));}
  async init(){await fs.mkdir(this.root,{recursive:true});for(const entry of await fs.readdir(this.root,{withFileTypes:true})){if(!entry.isDirectory()||entry.name.startsWith('.pending-'))continue;const r=await this.get(entry.name);if(['generating','building','launching','capturing'].includes(r.status)){r.status='interrupted';r.error='Studio stopped before this operation completed. No success inferred.';await this.save(r);}}}
  async get(id){const dir=this.dir(id);if((await fs.lstat(dir)).isSymbolicLink())throw Error('Invalid conversion directory');return JSON.parse(await fs.readFile(path.join(dir,'report.json'),'utf8'));}
  async list(){const rows=[];for(const e of await fs.readdir(this.root,{withFileTypes:true}))if(e.isDirectory()&&!e.name.startsWith('.pending-'))rows.push(await this.get(e.name));return rows.sort((a,b)=>b.created.localeCompare(a.created));}
  async create({adapter,name,source}){
    if(!['html','react','vue','svelte'].includes(adapter)||typeof name!=='string'||!/^[A-Z][A-Za-z0-9]{0,39}$/.test(name)||typeof source!=='string'||Buffer.byteLength(source)>262144)throw Error('Choose HTML, React, Vue or Svelte, a simple app name and source under 256 KiB');
    const parser=await this.module('app-ir/'+adapter);
    const ir=adapter==='html'?parser.htmlToIR(source,'input.html',name):adapter==='react'?parser.reactToIR(source,'input.tsx',name):adapter==='vue'?parser.vueToIR(source,'input.vue',name):parser.svelteToIR(source,'input.svelte',name);
    return this.persist(ir,adapter,name,source);
  }
  async persist(ir,adapter,name,source,files){
    const id=randomUUID(),dir=this.dir(id),staging=await fs.mkdtemp(path.join(this.root,'.pending-'));
    const row={id,name,adapter,created:new Date().toISOString(),status:'inspected',limitations:ir.limitations,tests:'not-run',visualFidelity:'not-evaluated'};
    try{
      await fs.writeFile(path.join(staging,'input.txt'),source,{flag:'wx'});
      await fs.writeFile(path.join(staging,'ir.json'),JSON.stringify(ir,null,2),{flag:'wx'});
      if(files)await fs.writeFile(path.join(staging,'inputs.json'),JSON.stringify(files),{flag:'wx'});
      await fs.writeFile(path.join(staging,'report.json'),JSON.stringify(row,null,2),{flag:'wx'});
      await fs.rename(staging,dir);return row;
    }finally{await fs.rm(staging,{recursive:true,force:true});}
  }
  async createProject({name,entry,files}){
    if(typeof name!=='string'||!/^[A-Z][A-Za-z0-9]{0,39}$/.test(name)||typeof entry!=='string'||!Array.isArray(files)||!files.length||files.length>32)throw Error('Choose an app name, entry path and 1–32 TSX files');
    const names=new Set();let size=0;
    for(const file of files){
      if(!file||typeof file.path!=='string'||!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.tsx$/.test(file.path)||typeof file.source!=='string')throw Error('Uploaded files require simple relative .tsx paths');
      const key=file.path.toLowerCase();if(names.has(key))throw Error('Duplicate or case-ambiguous source paths');names.add(key);size+=Buffer.byteLength(file.source);
    }
    if(size>262144||!files.some(f=>f.path===entry))throw Error('Entry must match an uploaded file and total source must be under 256 KiB');
    const staging=await fs.mkdtemp(path.join(tmpdir(),'ios-universal-input-'));
    try{
      for(const file of files){const target=path.join(staging,file.path);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,file.source,{flag:'wx'});}
      const {importReact}=await this.module('app-ir/react');const ir=await importReact(path.join(staging,entry),name);
      const base=path.posix.dirname(entry);
      for(const source of ir.sources)source.path=path.posix.join(base,source.path);
      return await this.persist(ir,'react',name,files.find(f=>f.path===entry).source,files);
    }finally{await fs.rm(staging,{recursive:true,force:true});}
  }
  async generate(id){
    if(this.jobs.has(id))throw Error('Conversion already running');
    this.jobs.set(id,true);let row;
    try{
      row=await this.get(id);if(row.status!=='inspected')throw Error('Create a new conversion to preserve existing source and evidence');
      row.status='generating';await this.save(row);
      const {generateProject}=await this.module('app-ir/swiftui');
      const ir=JSON.parse(await fs.readFile(path.join(this.dir(id),'ir.json'),'utf8'));
      await generateProject(ir,path.join(this.dir(id),'project'));
      row.status='generated-unverified';
    }catch(error){if(row && row.status==='generating'){row.status='failed';row.error=error.message;}else throw error;}finally{try{if(row)await this.save(row);}finally{this.jobs.delete(id);}}
    return row;
  }
  async fingerprint(id){const {snapshotFiles,snapshotHash}=await this.module('agent/remote');return snapshotHash(await snapshotFiles(path.join(this.dir(id),'project')));}
  async simulators(){
    const [{ProcessRunner},{detectToolchain}]=await Promise.all(['agent/runner','agent/toolchain'].map(n=>this.module(n)));
    const environment=await detectToolchain(new ProcessRunner());
    return environment.simulators.filter(s=>s.isAvailable).map(({udid,name,runtime,state})=>({udid,name,runtime,state}));
  }
  async startBuild(id,options={}){
    if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>k!=='udid')||
      (options.udid!==undefined&&(typeof options.udid!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(options.udid))))throw Error('Choose an available simulator UUID');
    if(this.nativeBusy)throw Error('A native conversion is already running');
    const release=this.acquireNative?.()??(()=>{});this.nativeBusy=true;
    try {
    const row=await this.get(id);
    if(!['generated-unverified','preview-ready','failed','interrupted','cancelled'].includes(row.status))throw Error('Generate a project first');
    await fs.stat(path.join(this.dir(id),'project','.ios-agent','spec.json'));
    if(this.jobs.has(id))throw Error('Conversion already running');
    const controller=new AbortController();this.controllers.set(id,controller);
    this.jobs.set(id,true);row.status='building';delete row.error;delete row.capture;
    try{await this.save(row);}catch(error){this.jobs.delete(id);this.controllers.delete(id);throw error;}
    const task=this.executeBuild(row,controller.signal,{...options}).finally(()=>{this.jobs.delete(id);this.controllers.delete(id);this.nativeBusy=false;release();});
    this.jobs.set(id,task);task.catch(()=>{});return row;
    }catch(error){this.nativeBusy=false;release();throw error;}
  }
  async executeBuild(row,signal,options={}){
    const run={id:randomUUID(),...(options.udid?{requestedUDID:options.udid}:{}),started:new Date().toISOString(),status:'running',tests:'not-run',visualFidelity:'not-evaluated'};
    row.runs??=[];row.runs.push(run);const project=path.join(this.dir(row.id),'project');
    try{
      const [{ProcessRunner},{buildProject},{runApp,screenshot},{detectToolchain,chooseSimulator}]=await Promise.all(['agent/runner','agent/build','agent/simulator','agent/toolchain'].map(n=>this.module(n)));
      const processRunner=new ProcessRunner();const runner={run:(c,a,o={})=>{if(signal.aborted)throw Error('Cancelled');return processRunner.run(c,a,{...o,signal});}};
      run.sourceHash=await this.fingerprint(row.id);run.environment=await detectToolchain(runner);
      const device=chooseSimulator(run.environment.simulators,options.udid);if(!device)throw Error(options.udid?'The selected simulator is unavailable; refresh the device list':'Install an available iOS simulator runtime');run.udid=device.udid;await this.save(row);
      run.build=await buildProject(project,runner,{udid:run.udid});await this.save(row);
      if(!run.build.success)throw Error(run.build.toolError??'Native build failed; inspect the recorded build diagnostics');
      row.status='launching';await this.save(row);run.launch=await runApp(project,runner,{udid:run.udid});
      if(run.launch.udid!==run.udid)throw Error('Simulator destination changed');
      // simctl launch returns before the first frame. This bounded delay reduces
      // launch-transition captures; it is not proof of visual readiness.
      run.captureDelayMs=2000;await this.save(row);await delay(run.captureDelayMs,undefined,{signal});
      row.status='capturing';await this.save(row);const shot=await screenshot(project,runner,run.launch.udid,'universal');
      if(signal.aborted)throw Error('Cancelled');
      if(await this.fingerprint(row.id)!==run.sourceHash)throw Error('Source changed during native verification; screenshot is stale');
      const {sha256}=await this.module('app-ir/schema');
      const bytes=await fs.readFile(shot.path);
      const captures=path.join(this.dir(row.id),'captures');await fs.mkdir(captures,{recursive:true});
      if(!(await fs.realpath(captures)).startsWith(await fs.realpath(this.dir(row.id))+path.sep))throw Error('Capture directory escapes workspace');
      await fs.writeFile(path.join(captures,run.id+'.png'),bytes,{flag:'wx'});
      run.capture={runId:run.id,sourceHash:run.sourceHash,sha256:sha256(bytes)};
      row.capture={...run.capture};
      run.status='preview-ready';row.status='preview-ready';
    }catch(error){row.status=signal.aborted?'cancelled':'failed';row.error=error.message;run.status=row.status;run.error=error.message;delete row.capture;}
    finally{run.finished=new Date().toISOString();await this.save(row);}
  }
  cancel(id){this.controllers.get(id)?.abort();}
  async image(id,runId){
    const row=await this.get(id);let capture;
    if(runId!==undefined){
      if(typeof runId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(runId))throw Error('Invalid capture run ID');
      const run=row.runs?.find(r=>r.id===runId);
      if(run?.status!=='preview-ready'||run.capture?.runId!==runId)throw Error('No archived capture for this run');
      capture=run.capture;
    }else{
      if(row.status!=='preview-ready'||!row.capture)throw Error('No verified current capture');
      capture=row.capture;
      if(await this.fingerprint(id)!==capture.sourceHash)throw Error('Source changed; rebuild before viewing this capture');
    }
    if(capture.runId!==undefined&&!/^[a-f0-9-]{36}$/.test(capture.runId))throw Error('Invalid capture run ID');
    // Older records have only the original current screenshot, not immutable history.
    const file=capture.runId?path.join(this.dir(id),'captures',capture.runId+'.png'):path.join(this.dir(id),'project','.ios-agent','screenshots','universal.png');
    const real=await fs.realpath(file);if(!real.startsWith(await fs.realpath(this.dir(id))+path.sep))throw Error('Capture escapes workspace');
    const st=await fs.stat(real);if(!st.isFile()||st.size>16000000)throw Error('Invalid capture');
    const bytes=await fs.readFile(real);const {sha256}=await this.module('app-ir/schema');
    if(sha256(bytes)!==capture.sha256)throw Error('Capture changed');return bytes;
  }
  async exportProject(id){
    if(this.jobs.has(id))throw Error('Wait for this conversion to finish');
    this.jobs.set(id,true);let staging;
    try{
      const row=await this.get(id);
      const {snapshotFiles,snapshotHash}=await this.module('agent/remote');
      const files=await snapshotFiles(path.join(this.dir(id),'project'));const hash=snapshotHash(files);
      staging=await fs.mkdtemp(path.join(this.dir(id),'export-'));
      const target=path.join(staging,'NativeProject');await fs.mkdir(target);
      for(const file of files){
        if(path.isAbsolute(file.path)||file.path.split('/').includes('..'))throw Error('Unsafe export path');
        const out=path.join(target,file.path);await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,file.content,{flag:'wx'});
      }
      await fs.writeFile(path.join(target,'UNIVERSAL-EXPORT.json'),JSON.stringify({name:row.name,adapter:row.adapter,sourceHash:hash,tests:row.tests,visualFidelity:row.visualFidelity},null,2));
      const {ProcessRunner}=await this.module('agent/runner');
      const archive=path.join(staging,'project.zip');
      const result=await new ProcessRunner().run('ditto',['-c','-k','--norsrc','--keepParent',target,archive],{timeoutMs:60000});
      if(result.exitCode!==0||result.timedOut||result.spawnError)throw Error('Project ZIP export requires macOS ditto: '+(result.spawnError??result.stderr));
      if(await this.fingerprint(id)!==hash)throw Error('Source changed during export; retry');
      return await fs.readFile(archive);
    }finally{try{if(staging)await fs.rm(staging,{recursive:true,force:true});}finally{this.jobs.delete(id);}}
  }
  async source(id){const row=await this.get(id),dir=this.dir(id);let swift=null;try{swift=await fs.readFile(path.join(dir,'project',row.name,'Views/RootView.swift'),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}let files;try{files=JSON.parse(await fs.readFile(path.join(dir,'inputs.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}return {files,input:await fs.readFile(path.join(dir,'input.txt'),'utf8'),ir:JSON.parse(await fs.readFile(path.join(dir,'ir.json'),'utf8')),swift};}
}
