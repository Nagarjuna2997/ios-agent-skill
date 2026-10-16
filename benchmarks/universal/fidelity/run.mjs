// One local HTML adapter; evidence, checkpoint and acceptance contracts are framework-independent.
import {readFile,writeFile,mkdir,copyFile,rename,readdir,open,unlink} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {importHTML} from '../../../mcp-server/dist/app-ir/html.js';
import {generateProject} from '../../../mcp-server/dist/app-ir/swiftui.js';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {comparePNGs} from '../../../mcp-server/dist/app-ir/compare.js';
import {repairWithGate,VisualEvidenceSchema} from '../../../mcp-server/dist/app-ir/visual-gate.js';
import {Checkpoints} from '../../../mcp-server/dist/app-ir/checkpoints.js';
import {measureLineBreaks,measureClipping} from '../../../mcp-server/dist/app-ir/measurements.js';
import {seedKnownGood,advanceKnownGood} from '../../../mcp-server/dist/app-ir/known-good.js';
import {readSpec,writeSpec,regenerate} from '../../../mcp-server/dist/agent/project.js';
import {ProcessRunner} from '../../../mcp-server/dist/agent/runner.js';
import {buildProject} from '../../../mcp-server/dist/agent/build.js';
import {testProject} from '../../../mcp-server/dist/agent/testing.js';
import {runApp,screenshot} from '../../../mcp-server/dist/agent/simulator.js';
const require=createRequire(new URL('../../../mcp-server/package.json',import.meta.url));const {PNG}=require('pngjs');
const [profilePath,output,flag]=process.argv.slice(2);const resume=flag==='--resume';
if(!profilePath||!output||(flag&&!resume))throw Error('Usage: run.mjs PROFILE_JSON OUTPUT [--resume]');
const profile=JSON.parse(await readFile(resolve(profilePath),'utf8'));
if(profile.version!==1||profile.state!=='collapsed'||profile.locale!=='en_US'||profile.appearance!=='light'||profile.contentSize!=='large')throw Error('Unsupported capture profile');
const root=resolve(output);if(!resume)await mkdir(root,{recursive:false});
// Only one runner may update a journal. A dead owner can be reclaimed on explicit resume.
const lockPath=join(root,'run.lock');let lock;
try{lock=await open(lockPath,'wx');}catch(e){
 if(!resume||e.code!=='EEXIST')throw e;
 const owner=JSON.parse(await readFile(lockPath,'utf8'));if(!Number.isInteger(owner.pid)||owner.pid<=0)throw Error('Invalid lock');
 try{process.kill(owner.pid,0);throw Error('Another runner is active');}catch(e){if(e.code!=='ESRCH')throw e;}
 await unlink(lockPath);lock=await open(lockPath,'wx');
}
await lock.writeFile(JSON.stringify({pid:process.pid}));await lock.close();
const runner=new ProcessRunner();
const command=async(c,args)=>{const r=await runner.run(c,args,{timeoutMs:120000});if(r.exitCode!==0)throw Error(`${c} failed: ${r.stderr.slice(0,1000)}`);return r.stdout.trim();};
const atomic=async(path,value)=>{const tmp=path+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2));await rename(tmp,path);};
const report=resume?JSON.parse(await readFile(join(root,'report.json'),'utf8')):{version:2,profile,startedAt:new Date().toISOString(),status:'running',runs:[]};
const save=()=>atomic(join(root,'report.json'),report);
const here=dirname(fileURLToPath(import.meta.url)),fixture=resolve(here,'../html-disclosure');
const files=async(dir)=>{const all=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='node_modules')continue;if(e.isDirectory())all.push(...await files(join(dir,e.name)));else if(e.isFile())all.push(join(dir,e.name));else throw Error('Unsupported symlink in evidence tree');}return all.sort();};
let udid,browser;
try{
 const xcode=await command('xcodebuild',['-version']),sdk=await command('xcrun',['--sdk','iphonesimulator','--show-sdk-version']);
 if(xcode!==`Xcode ${profile.xcode}\nBuild version ${profile.xcodeBuild}`||sdk!==profile.sdk)throw Error('Xcode/SDK profile mismatch');
 const runtimes=JSON.parse(await command('xcrun',['simctl','list','runtimes','--json']));const runtime=runtimes.runtimes.find(r=>r.identifier===profile.runtime&&r.isAvailable);if(!runtime)throw Error('Pinned runtime unavailable');
 const playwright=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
 browser=await playwright.chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const environment={xcode,sdk,runtimeBuild:runtime.buildversion,browser:browser.version(),host:await command('sw_vers',['-buildVersion'])};
 const inputs=[...await files(resolve(here,'../../../mcp-server/dist')),...await files(fixture),...await files(here)].filter(f=>!f.includes('/node_modules/'));
 const inputHashes=[];for(const f of inputs)inputHashes.push([f.slice(resolve(here,'../../..').length),sha256(await readFile(f))]);
 const contract=sha256(JSON.stringify({profile,environment,inputHashes}));
 if(resume&&report.contract!==contract)throw Error('Run inputs, verifier or environment changed; use a new output directory');
 report.contract=contract;report.environment=environment;report.status='running';await save();
 const journal=new Checkpoints(root,contract,name=>{if(process.env.FIDELITY_INTERRUPT_AFTER===name)throw Error('Injected interruption after '+name);});
 const ocr=await journal.stage('ocr-tool',async()=>{const path=join(root,'recognize-text');await command('xcrun',['swiftc',join(here,'RecognizeText.swift'),'-o',path]);return {value:path,files:[path]};});
 udid=await command('xcrun',['simctl','create',`ios-agent-fidelity-${Date.now()}`,profile.deviceType,profile.runtime]);
 report.simulator=udid;await save();
 await command('xcrun',['simctl','boot',udid]);await command('xcrun',['simctl','bootstatus',udid,'-b']);
 await command('xcrun',['simctl','ui',udid,'appearance',profile.appearance]);await command('xcrun',['simctl','ui',udid,'content_size',profile.contentSize]);
 await command('xcrun',['simctl','status_bar',udid,'override','--time','9:41','--dataNetwork','wifi','--wifiMode','active','--wifiBars','3','--batteryState','charged','--batteryLevel','100']);
 const recognize=async path=>{try{const result=await runner.run(ocr,[path],{timeoutMs:30000});if(result.exitCode!==0)throw Error('OCR failed');return JSON.parse(result.stdout);}catch{return {unavailable:true,reason:'Local Vision text recognition failed or exceeded 30 seconds; no typography pass inferred'};}};
 const ir=await importHTML(join(fixture,'index.html'),'FieldNotes');
 const normalize=async(input,rect,output)=>{const png=PNG.sync.read(await readFile(input)),out=new PNG({width:rect.width,height:rect.height});PNG.bitblt(png,out,rect.x,rect.y,rect.width,rect.height,0,0);await writeFile(output,PNG.sync.write(out));};
 async function makeCandidate(name,disclosureStyle){
  const generated=await journal.stage(name+'-generate',async()=>{
   const folder=join(root,name+'-'+randomUUID());const generation=await generateProject(ir,folder,{disclosureStyle});
   const spec=await readSpec(folder);spec.tests=true;await writeSpec(folder,spec);
   for(const suffix of ['Tests','UITests'])await mkdir(join(folder,'FieldNotes'+suffix),{recursive:true});
   await copyFile(join(fixture,'InteractionTests.swift'),join(folder,'FieldNotesUITests/InteractionTests.swift'));await regenerate(folder,spec,runner);
   const scheme=join(folder,'FieldNotes.xcodeproj/xcshareddata/xcschemes/FieldNotes.xcscheme');
   await writeFile(scheme,(await readFile(scheme,'utf8')).replace(/<TestableReference[^>]*><BuildableReference[^>]*BuildableName="FieldNotesTests.xctest"[^>]*\/><\/TestableReference>/g,''));
   return {value:{folder,sourceHash:generation.sourceHash},files:await files(folder)};
  });
  const folder=generated.folder;let row=report.runs.find(r=>r.name===name);if(!row){row={name,...generated};report.runs.push(row);}await save();
  row.build=await journal.stage(name+'-build',async()=>{const value=await buildProject(folder,runner,{udid});if(!value.success){row.build=value;await save();throw Error('Build failed; logs retained');}return {value,files:[value.logPath,...await files(value.appPath)]};});await save();
  for(const [suffix,size] of [['large','large'],['xxxl','extra-extra-extra-large']]){
   await command('xcrun',['simctl','ui',udid,'content_size',size]);
   row[suffix]=await journal.stage(name+'-'+suffix,async()=>{
    const tests=await testProject(folder,runner,udid);const log=join(folder,tests.logPath);
    await runApp(folder,runner,{udid,launchArguments:['-AppleLanguages','(en)','-AppleLocale','en_US']});await new Promise(r=>setTimeout(r,1500));
    const shot=await screenshot(folder,runner,udid,'collapsed-'+suffix);
    const text=await readFile(log,'utf8'),match=text.match(/IOS_AGENT_GEOMETRY:(\{[^\n]+\})/);
    let geometry=null;if(match)geometry=measureClipping(JSON.parse(match[1]));
    return {value:{tests,shot,geometry},files:[log,shot.path]};
   });await save();
  }
  await command('xcrun',['simctl','ui',udid,'content_size','large']);
  const native=await readFile(row.large.shot.path);
  const reference=await journal.stage('reference',async()=>{
   const width=native.readUInt32BE(16),height=native.readUInt32BE(20),cropHeight=height-(profile.safeAreaTop+profile.safeAreaBottom)*profile.scale;
   if(!Number.isInteger(cropHeight)||cropHeight<=0)throw Error('Invalid crop');
   const crops={reference:{x:0,y:0,width,height:cropHeight},native:{x:0,y:profile.safeAreaTop*profile.scale,width,height:cropHeight}};
   const page=await browser.newPage({viewport:{width:width/profile.scale,height:cropHeight/profile.scale},deviceScaleFactor:profile.scale,locale:'en-US',colorScheme:'light',reducedMotion:'reduce'});
   await page.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());await page.goto(pathToFileURL(join(fixture,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
   const path=join(root,'reference.png');await page.screenshot({path});
   const expected=await page.locator('body').innerText();await page.close();
   const recognized=await recognize(path);const ocrPath=join(root,'reference-text.json');await atomic(ocrPath,recognized);
   const pins={device:profile.deviceType,os:runtime.identifier+' '+runtime.buildversion,xcode,appearance:profile.appearance,contentSize:profile.contentSize,locale:profile.locale,orientation:'portrait',state:profile.state,width,height,scale:profile.scale,fontConfiguration:profile.fontConfiguration,referenceRenderer:environment.browser+' host '+environment.host,normalizationHash:sha256(JSON.stringify(crops))};
   return {value:{path,recognized,expected,crops,pins},files:[path,ocrPath]};
  });
  const evidence=await journal.stage(name+'-measurement',async()=>{
   const ref=await readFile(reference.path),comparison=comparePNGs(ref,native,reference.crops);
   const diff=join(folder,'difference.png');await writeFile(diff,comparison.diff);
   const normalized=join(folder,'normalized.png');await normalize(row.large.shot.path,reference.crops.native,normalized);
   const recognized=reference.recognized.unavailable?{unavailable:true,reason:'Reference recognition unavailable'}:await recognize(normalized);const typography=reference.recognized.unavailable||recognized.unavailable?{status:'unavailable',mismatches:null,reason:'Local OCR unavailable'}:measureLineBreaks(reference.recognized,recognized,reference.expected);
   const geometry=[row.large.geometry,row.xxxl.geometry];const layout=geometry.some(g=>g?.status==='failed')?'failed':geometry.every(g=>g?.status==='passed')?'passed':'unavailable';
   const clipped=geometry.every(g=>g?.clippedElements!==null&&g?.clippedElements!==undefined)?geometry.reduce((n,g)=>n+g.clippedElements,0):null;
   const measurement={comparison:comparison.report,typography,geometry,recognized};const measurementPath=join(folder,'measurement.json');await atomic(measurementPath,measurement);
   const checksPassed=row.large.tests.status==='passed'&&row.xxxl.tests.status==='passed';
   const artifacts={};for(const file of [row.build.logPath,join(folder,row.large.tests.logPath),join(folder,row.xxxl.tests.logPath),row.large.shot.path,row.xxxl.shot.path,diff,measurementPath])artifacts[file]=sha256(await readFile(file));
   return {value:{version:1,sourceHash:row.sourceHash,referenceHash:sha256(ref),screenshotHash:sha256(native),pins:reference.pins,build:'passed',functionality:checksPassed?'passed':'failed',accessibility:checksPassed?'passed':'unavailable',layout,typography:typography.status,testsPassed:Math.min(row.large.tests.passed,row.xxxl.tests.passed),accessibilityIssues:checksPassed?0:null,clippedElements:clipped,lineBreakMismatches:typography.mismatches,meanError:comparison.report.meanAbsoluteChannelError,changedFraction:comparison.report.changedPixelFraction,artifactsHash:sha256(JSON.stringify(artifacts))},files:[diff,normalized,measurementPath]};
  });row.evidence=evidence;await save();return evidence;
 }
 const baseline=await makeCandidate('baseline','platform');report.baseline=baseline;
 try{report.knownGood=seedKnownGood(baseline,profile.policy);}catch{report.knownGood=null;}
 report.repair=await repairWithGate({directory:join(root,'repairs'),baseline,policy:profile.policy,maxAttempts:1,resumeInterrupted:true,verifySavedEvidence:async saved=>{const current=await makeCandidate('candidate-1','leading');if(JSON.stringify(VisualEvidenceSchema.parse(current))!==JSON.stringify(VisualEvidenceSchema.parse(saved)))throw Error('Saved candidate evidence differs from verified checkpoints');},verifyCandidate:()=>makeCandidate('candidate-1','leading')});
 if(report.repair.acceptedAttempt){const candidate=report.repair.attempts.find(a=>a.number===report.repair.acceptedAttempt).evidence;report.knownGood=report.knownGood?advanceKnownGood(report.knownGood,candidate,profile.policy).baseline:seedKnownGood(candidate,profile.policy);}
 report.status=report.repair.outcome;report.limitations=['OCR cannot establish wrapping when source transcript or confidence differs.','Geometry covers text frames and Apple text-clipping audit, not arbitrary images, shadows or occlusion.','Known-good is null until baseline meets every quality requirement.'];await save();
 process.exitCode=report.status==='accepted'?0:report.status==='requires-review'?2:1;
}catch(error){report.status='failed';report.error=error.message;process.exitCode=1;}
finally{if(browser)await browser.close();if(udid){await runner.run('xcrun',['simctl','shutdown',udid]);await runner.run('xcrun',['simctl','delete',udid]);}await save();await unlink(lockPath);console.log(JSON.stringify({status:report.status,report:join(root,'report.json')},null,2));}
