// Offline, unsigned native behavior evidence. This is not a visual-fidelity benchmark.
import {readFile,writeFile,mkdir,copyFile,readdir,rename,open,unlink} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {importReact} from '../../../mcp-server/dist/app-ir/react.js';
import {generateProject} from '../../../mcp-server/dist/app-ir/swiftui.js';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {Checkpoints} from '../../../mcp-server/dist/app-ir/checkpoints.js';
import {readSpec,writeSpec,regenerate} from '../../../mcp-server/dist/agent/project.js';
import {ProcessRunner} from '../../../mcp-server/dist/agent/runner.js';
import {buildProject} from '../../../mcp-server/dist/agent/build.js';
import {testProject} from '../../../mcp-server/dist/agent/testing.js';
import {runSetupCommand} from '../fidelity/commands.mjs';
import {testEvidence} from './evidence.mjs';
const [profilePath,output,flag]=process.argv.slice(2),resume=flag==='--resume';
if(!profilePath||!output||(flag&&!resume))throw Error('Usage: run.mjs PROFILE NEW_OUTPUT [--resume]');
const profile=JSON.parse(await readFile(resolve(profilePath),'utf8'));
if(profile.version!==1||profile.appearance!=='light'||profile.locale!=='en_US')throw Error('Unsupported profile');
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(output);
if(!resume)await mkdir(root,{recursive:false});
const lockPath=join(root,'run.lock');
let lock;
try{lock=await open(lockPath,'wx');}catch(error){
 if(!resume||error.code!=='EEXIST')throw error;
 const owner=JSON.parse(await readFile(lockPath,'utf8'));
 if(!Number.isInteger(owner.pid)||owner.pid<=0)throw Error('Invalid lock');
 try{process.kill(owner.pid,0);throw Error('Another runner is active');}catch(error){if(error.code!=='ESRCH')throw error;}
 await unlink(lockPath);lock=await open(lockPath,'wx');
}
await lock.writeFile(JSON.stringify({pid:process.pid}));await lock.close();
const runner=new ProcessRunner();
const report=resume?JSON.parse(await readFile(join(root,'report.json'),'utf8')):{version:1,status:'running',fixture:'react-boolean-state',profile,startedAt:new Date().toISOString(),commands:[]};
const save=async()=>{const temp=join(root,randomUUID()+'.tmp');await writeFile(temp,JSON.stringify(report,null,2));await rename(temp,join(root,'report.json'));};
const command=(c,args)=>runSetupCommand(runner,c,args,async value=>{report.commands.push(value);await save();});
async function files(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory())result.push(...await files(join(dir,e.name)));else if(e.isFile())result.push(join(dir,e.name));else throw Error('Unexpected symlink');}return result.sort();}
let udid;
try{
 report.status='running';report.phase='environment';await save();
 const xcode=await command('xcodebuild',['-version']),sdk=await command('xcrun',['--sdk','iphonesimulator','--show-sdk-version']);
 if(xcode!==`Xcode ${profile.xcode}\nBuild version ${profile.xcodeBuild}`||sdk!==profile.sdk)throw Error('Pinned Xcode/SDK unavailable');
 const runtimes=JSON.parse(await command('xcrun',['simctl','list','runtimes','--json']));
 const runtime=runtimes.runtimes.find(r=>r.identifier===profile.runtime&&r.isAvailable);if(!runtime)throw Error('Pinned simulator runtime unavailable');
 const inputs=[...await files(here),...await files(resolve(here,'../../../mcp-server/dist')),resolve(here,'../fidelity/commands.mjs')];
 const hashes=[];for(const path of inputs)hashes.push([path.slice(resolve(here,'../../..').length),sha256(await readFile(path))]);
 const environment={xcode,sdk,runtime:runtime.identifier,runtimeBuild:runtime.buildversion,host:await command('sw_vers',['-buildVersion'])};
 const contract=sha256(JSON.stringify({profile,environment,hashes}));
 if(resume&&contract!==report.contract)throw Error('Inputs or environment changed; use a new output directory');
 report.contract=contract;report.environment=environment;delete report.error;await save();
 const journal=new Checkpoints(root,contract);
 report.phase='simulator-setup';await save();
 udid=await command('xcrun',['simctl','create','ios-agent-react-state-'+Date.now(),profile.deviceType,profile.runtime]);report.simulator=udid;await save();
 await command('xcrun',['simctl','boot',udid]);await command('xcrun',['simctl','bootstatus',udid,'-b']);
 await command('xcrun',['simctl','ui',udid,'appearance',profile.appearance]);
 await command('xcrun',['simctl','status_bar',udid,'override','--time','9:41','--batteryState','charged','--batteryLevel','100']);
 report.phase='generation';await save();
 const project=await journal.stage('generate',async()=>{
  const ir=await importReact(join(here,'App.tsx'),'TripChecklist'),folder=join(root,'app-'+randomUUID());
  await generateProject(ir,folder);const spec=await readSpec(folder);spec.tests=true;await writeSpec(folder,spec);
  for(const suffix of ['Tests','UITests'])await mkdir(join(folder,'TripChecklist'+suffix),{recursive:true});
  await copyFile(join(here,'InteractionTests.swift'),join(folder,'TripChecklistUITests/InteractionTests.swift'));await regenerate(folder,spec,runner);
  const scheme=join(folder,'TripChecklist.xcodeproj/xcshareddata/xcschemes/TripChecklist.xcscheme');
  await writeFile(scheme,(await readFile(scheme,'utf8')).replace(/<TestableReference[^>]*><BuildableReference[^>]*BuildableName="TripChecklistTests.xctest"[^>]*\/><\/TestableReference>/g,''));
  return {value:{folder,sourceHash:ir.sources[0].sha256,irHash:sha256(JSON.stringify(ir))},files:await files(folder)};
 });report.project=project;report.phase='build';await save();
 report.build=await journal.stage('build',async()=>{
  const value=await buildProject(project.folder,runner,{udid});report.build=value;await save();if(!value.success)throw Error('Native build failed');
  return {value,files:[value.logPath,...await files(value.appPath)]};
 });await save();report.phase='tests';await save();
 for(const [key,size] of [['large','large'],['xxxl','extra-extra-extra-large']]){
  await command('xcrun',['simctl','ui',udid,'content_size',size]);
  report[key]=await testEvidence({root,folder:project.folder,key,journal,files,
   runTests:()=>testProject(project.folder,runner,udid),record:async tests=>{report[key]={tests};await save();},
   exportAttachments:(bundle,destination)=>command('xcrun',['xcresulttool','export','attachments','--path',bundle,'--output-path',destination]),
  });await save();
 }
 report.status='native-behavior-passed';report.visualFidelity='not-evaluated';
}catch(error){report.status='failed';report.error=error.message;process.exitCode=1;}
finally{
 if(udid){await runner.run('xcrun',['simctl','shutdown',udid]);await runner.run('xcrun',['simctl','delete',udid]);}
 await save();await unlink(lockPath);console.log(JSON.stringify({status:report.status,report:join(root,'report.json')}));
}
