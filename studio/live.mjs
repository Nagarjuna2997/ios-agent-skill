import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { sourceMap } from './custom.mjs';
import { projectText, schemeText } from './project.mjs';
export function validateInput(command){
 if(!command||!['tap','swipe','type','relaunch'].includes(command.action))throw Error('Unsupported preview action');
 const out={action:command.action};
 if(command.action==='tap'||command.action==='swipe')for(const key of command.action==='tap'?['x','y']:['x','y','endX','endY']){if(typeof command[key]!=='number'||!Number.isFinite(command[key])||command[key]<0||command[key]>1)throw Error('Coordinates must be normalized');out[key]=command[key];}
 if(command.action==='type'){if(typeof command.text!=='string'||!command.text||command.text.length>500)throw Error('Enter up to 500 characters');out.text=command.text;}
 return out;
}
export class LivePreview {
 constructor(studio){this.studio=studio;this.session=null;}
 status(){const s=this.session;return s?{project:s.project,state:s.state,error:s.error,inputError:s.inputError,frame:s.frameNumber,completed:s.completed,queued:s.next,device:s.device}: {state:'stopped'};}
 async start(id){
  const studio=this.studio;
  if(studio.jobs.size||studio.reserved)throw Error('Stop the active task or live preview first');
  studio.reserved=true;
  let preparationDir;
  try {
   const p=await studio.get(id);
   if(p.template!=='custom')throw Error('Live preview currently requires a custom app project');
   if(!p.evidence||p.evidence.sourceHash!==await studio.fingerprint(id))throw Error('Run app checks before starting live preview');
   const key=randomBytes(32).toString('hex'), sessionID=randomUUID();
   const dir=path.join(studio.dir(id),'live',sessionID), project=path.join(dir,'project');
   preparationDir=dir;
   await fs.mkdir(dir,{recursive:true});
   await fs.cp(path.join(studio.dir(id),'project'),project,{recursive:true,filter:f=>!f.split(path.sep).some(s=>['.build','.ios-agent','xcuserdata'].includes(s))});
   const sources=await sourceMap(project);
   await fs.writeFile(path.join(project,'AppProject.xcodeproj/project.pbxproj'),projectText(Object.keys(sources),p.name,p.bundle));
   await fs.writeFile(path.join(project,'AppProject.xcodeproj/xcshareddata/xcschemes/AppProject.xcscheme'),schemeText());
   await fs.writeFile(path.join(project,'UITests/AcceptanceTests.swift'),await fs.readFile(path.join(studio.repo,'studio/templates/LivePreviewTests.swift')));
   if(p.evidence.sourceHash!==await studio.fingerprint(id))throw Error('Source changed while preparing preview');
   const devices=JSON.parse(await studio.runner('xcrun',['simctl','list','devices','available','--json']));
   const phones=Object.entries(devices.devices).filter(([r])=>r.includes('iOS')).flatMap(([,ds])=>ds).filter(d=>d.isAvailable&&d.deviceTypeIdentifier?.includes('iPhone'));
   const device=phones.find(d=>d.state==='Booted')??phones[0];if(!device)throw Error('Install an iOS simulator runtime in Xcode');
   const controller=new AbortController();
   const session={id:sessionID,project:id,key,controller,state:'starting',error:null,queue:[],next:0,completed:0,frameNumber:0,frame:null,device:device.name,stopping:false};
   this.session=session;
   const env={TEST_RUNNER_STUDIO_PREVIEW_URL:studio.origin+'/driver/'+sessionID,TEST_RUNNER_STUDIO_PREVIEW_TOKEN:key,...(p.backend==='local'?await studio.backend.environment(id,studio.origin,'preview'):{})};
   let output='';
   session.done=studio.runner('xcodebuild',['test','-project','AppProject.xcodeproj','-scheme','AppProject','-destination','platform=iOS Simulator,id='+device.udid,'-derivedDataPath',path.join(dir,'build'),'-parallel-testing-enabled','NO','-collect-test-diagnostics','never','-maximum-test-execution-time-allowance','1250','CODE_SIGNING_ALLOWED=NO'],{cwd:project,signal:controller.signal,timeout:1500000,env,onText:s=>{output=(output+s).slice(-50000);}})
   .then(()=>{session.state='stopped';})
   .catch(e=>{session.state=session.stopping?'stopped':'failed';session.error=session.stopping?null:e.message.replaceAll(key,'[redacted]').replaceAll(env.TEST_RUNNER_STUDIO_BACKEND_TOKEN??'__none__','[redacted]').slice(-4000);})
   .finally(async()=>{clearTimeout(session.stopTimer);session.frame=null;studio.reserved=false;await fs.writeFile(path.join(dir,'driver.log'),output.replaceAll(key,'[redacted]').replaceAll(env.TEST_RUNNER_STUDIO_BACKEND_TOKEN??'__none__','[redacted]'));await fs.rm(path.join(dir,'build'),{recursive:true,force:true});await fs.rm(project,{recursive:true,force:true});}).catch(()=>{session.state='failed';session.error='Preview stopped; its local cleanup could not complete.';});
   return this.status();
  } catch(e){if(preparationDir)await fs.rm(preparationDir,{recursive:true,force:true});studio.reserved=false;if(this.session?.state==='starting'){this.session.state='failed';this.session.error='Could not prepare live preview';}throw e;}
 }
 input(id,command){const s=this.session;if(!s||s.project!==id||s.state!=='ready'||s.stopping)throw Error('Live preview is not ready');if(s.queue.length>=8)throw Error('Wait for queued input to finish');const c=validateInput(command);c.id=++s.next;s.queue.push(c);return {id:c.id};}
 authorize(id,token){const s=this.session;return !!s&&s.id===id&&s.key===token&&['starting','ready','stopping'].includes(s.state);}
 command(){const s=this.session;return s.stopping?{action:'stop'}:(s.queue.shift()??{action:'wait'});}
 frame(bytes,completed,inputError){const s=this.session;if(bytes.length>8000000||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid preview frame');s.inputError=inputError==='Tap a text field in the simulator before sending text.'?inputError:null;s.frame=bytes;s.completed=Number(completed)||0;s.frameNumber++;if(!s.stopping)s.state='ready';}
 async stop(){const s=this.session;if(!s||['stopped','failed'].includes(s.state))return this.status();s.stopping=true;s.state='stopping';s.stopTimer=setTimeout(()=>s.controller.abort(),5000);await s.done;return this.status();}
}
