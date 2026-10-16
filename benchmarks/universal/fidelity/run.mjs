// Framework-independent evidence/gate calls; only makeCandidate is this fixture's adapter.
import {readFile,writeFile,mkdir,copyFile,rename} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {importHTML} from '../../../mcp-server/dist/app-ir/html.js';
import {generateProject} from '../../../mcp-server/dist/app-ir/swiftui.js';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {comparePNGs} from '../../../mcp-server/dist/app-ir/compare.js';
import {repairWithGate} from '../../../mcp-server/dist/app-ir/visual-gate.js';
import {readSpec,writeSpec,regenerate} from '../../../mcp-server/dist/agent/project.js';
import {ProcessRunner} from '../../../mcp-server/dist/agent/runner.js';
import {buildProject} from '../../../mcp-server/dist/agent/build.js';
import {testProject} from '../../../mcp-server/dist/agent/testing.js';
import {runApp,screenshot} from '../../../mcp-server/dist/agent/simulator.js';
const [profilePath,output]=process.argv.slice(2);
if(!profilePath||!output)throw Error('Usage: node benchmarks/universal/fidelity/run.mjs PROFILE_JSON NEW_OUTPUT');
const profile=JSON.parse(await readFile(resolve(profilePath),'utf8'));
if(profile.version!==1||profile.state!=='collapsed'||profile.locale!=='en_US'||profile.appearance!=='light'||profile.contentSize!=='large')throw Error('Unsupported capture profile');
const root=resolve(output);await mkdir(root,{recursive:false});
const runner=new ProcessRunner();
const command=async(c,args)=>{const r=await runner.run(c,args,{timeoutMs:120000});if(r.exitCode!==0)throw Error(`${c} failed: ${r.stderr.slice(0,1000)}`);return r.stdout.trim();};
const atomic=async(path,value)=>{await writeFile(path+'.tmp',JSON.stringify(value,null,2));await rename(path+'.tmp',path);};
const report={version:1,profile,startedAt:new Date().toISOString(),status:'running',runs:[]};
const save=()=>atomic(join(root,'report.json'),report);
await save();let udid,browser;
try{
 const xcode=await command('xcodebuild',['-version']);const sdk=await command('xcrun',['--sdk','iphonesimulator','--show-sdk-version']);
 if(xcode!==`Xcode ${profile.xcode}\nBuild version ${profile.xcodeBuild}`||sdk!==profile.sdk)throw Error('Installed Xcode/SDK does not match profile; no scoring performed');
 const runtimes=JSON.parse(await command('xcrun',['simctl','list','runtimes','--json']));const runtime=runtimes.runtimes.find(r=>r.identifier===profile.runtime&&r.isAvailable);
 if(!runtime)throw Error('Pinned simulator runtime unavailable; no scoring performed');
 const playwright=await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
 browser=await playwright.chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 report.environment={xcode,sdk,runtimeBuild:runtime.buildversion,browser:browser.version(),host:await command('sw_vers',['-buildVersion'])};await save();
 udid=await command('xcrun',['simctl','create',`ios-agent-fidelity-${Date.now()}`,profile.deviceType,profile.runtime]);
 await command('xcrun',['simctl','boot',udid]);await command('xcrun',['simctl','bootstatus',udid,'-b']);
 await command('xcrun',['simctl','ui',udid,'appearance',profile.appearance]);
 await command('xcrun',['simctl','ui',udid,'content_size',profile.contentSize]);
 await command('xcrun',['simctl','status_bar',udid,'override','--time','9:41','--dataNetwork','wifi','--wifiMode','active','--wifiBars','3','--batteryState','charged','--batteryLevel','100']);
 const fixture=resolve(dirname(fileURLToPath(import.meta.url)),'../html-disclosure');
 const ir=await importHTML(join(fixture,'index.html'),'FieldNotes');
 let reference, pins, crops;
 async function makeCandidate(name,disclosureStyle){
  const folder=join(root,name);const generation=await generateProject(ir,folder,{disclosureStyle});
  const row={name,sourceHash:generation.sourceHash,folder};report.runs.push(row);await save();
  const spec=await readSpec(folder);spec.tests=true;await writeSpec(folder,spec);
  for(const suffix of ['Tests','UITests'])await mkdir(join(folder,'FieldNotes'+suffix),{recursive:true});
  await copyFile(join(fixture,'InteractionTests.swift'),join(folder,'FieldNotesUITests/InteractionTests.swift'));await regenerate(folder,spec,runner);
  const scheme=join(folder,'FieldNotes.xcodeproj/xcshareddata/xcschemes/FieldNotes.xcscheme');
  await writeFile(scheme,(await readFile(scheme,'utf8')).replace(/<TestableReference[^>]*><BuildableReference[^>]*BuildableName="FieldNotesTests.xctest"[^>]*\/><\/TestableReference>/g,''));
  row.build=await buildProject(folder,runner,{udid});await save();if(!row.build.success)throw Error('Candidate did not build; evidence retained');
  row.tests=await testProject(folder,runner,udid);await save();
  await runApp(folder,runner,{udid,launchArguments:['-AppleLanguages','(en)','-AppleLocale','en_US']});await new Promise(r=>setTimeout(r,1500));
  const shot=await screenshot(folder,runner,udid,'collapsed-large');const native=await readFile(shot.path);row.screenshot=shot;await save();
  if(!reference){
   const width=native.readUInt32BE(16),height=native.readUInt32BE(20),cropHeight=height-(profile.safeAreaTop+profile.safeAreaBottom)*profile.scale;
   if(!Number.isInteger(cropHeight)||cropHeight<=0)throw Error('Invalid safe-area normalization');
   crops={reference:{x:0,y:0,width,height:cropHeight},native:{x:0,y:profile.safeAreaTop*profile.scale,width,height:cropHeight}};
   const page=await browser.newPage({viewport:{width:width/profile.scale,height:cropHeight/profile.scale},deviceScaleFactor:profile.scale,locale:'en-US',colorScheme:'light',reducedMotion:'reduce'});
   await page.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
   await page.goto(pathToFileURL(join(fixture,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
   reference=await page.screenshot({path:join(root,'reference.png')});await page.close();
   pins={device:profile.deviceType,os:runtime.identifier+' '+runtime.buildversion,xcode,appearance:profile.appearance,contentSize:profile.contentSize,locale:profile.locale,orientation:'portrait',state:profile.state,width,height,scale:profile.scale,fontConfiguration:profile.fontConfiguration,referenceRenderer:report.environment.browser+' host '+report.environment.host,normalizationHash:sha256(JSON.stringify(crops))};
   report.pins=pins;report.normalization=crops;await save();
  }
  const comparison=comparePNGs(reference,native,crops);row.comparison=comparison.report;await writeFile(join(folder,'difference.png'),comparison.diff);
  // Additional Dynamic Type capture and audit, independently reported; never inferred from the large image.
  await command('xcrun',['simctl','ui',udid,'content_size','extra-extra-extra-large']);
  try {row.xxlTests=await testProject(folder,runner,udid);await runApp(folder,runner,{udid,launchArguments:['-AppleLanguages','(en)','-AppleLocale','en_US']});await new Promise(r=>setTimeout(r,1500));row.xxlScreenshot=await screenshot(folder,runner,udid,'collapsed-xxxl');}
  finally{await command('xcrun',['simctl','ui',udid,'content_size',profile.contentSize]);}
  const checksPassed=row.tests.status==='passed'&&row.xxlTests.status==='passed';
  const artifacts={native:sha256(native),diff:sha256(comparison.diff),reference:sha256(reference),xxxl:sha256(await readFile(row.xxlScreenshot.path)),build:sha256(await readFile(row.build.logPath)),tests:sha256(await readFile(join(folder,row.tests.logPath))),xxxlTests:sha256(await readFile(join(folder,row.xxlTests.logPath)))};
  row.artifacts=artifacts;await save();
  // Text-line extraction and viewport geometry are not yet measured: no false acceptance.
  return {version:1,sourceHash:row.sourceHash,referenceHash:artifacts.reference,screenshotHash:artifacts.native,pins,build:'passed',functionality:checksPassed?'passed':'failed',accessibility:checksPassed?'passed':'unavailable',layout:'unavailable',typography:'unavailable',testsPassed:Math.min(row.tests.passed,row.xxlTests.passed),accessibilityIssues:checksPassed?0:null,clippedElements:null,lineBreakMismatches:null,meanError:comparison.report.meanAbsoluteChannelError,changedFraction:comparison.report.changedPixelFraction,artifactsHash:sha256(JSON.stringify(artifacts))};
 }
 const baseline=await makeCandidate('baseline','platform');report.baseline=baseline;await save();
 report.repair=await repairWithGate({directory:join(root,'repairs'),baseline,policy:profile.policy,maxAttempts:1,verifyCandidate:async attempt=>{
  // Only one implemented repair strategy. Never repeat identical candidates to fill the cap.
  if(attempt!==1)throw Error('No additional validated repair strategy');return makeCandidate(`candidate-${attempt}`,'leading');
 }});
 report.status=report.repair.outcome;
 report.limitations=['Layout/clipping geometry and line-break extraction remain unavailable, preventing automatic acceptance.','Accessibility audit plus queried labels/traits does not replace a manual VoiceOver navigation session.','No model/provider call; one deterministic native disclosure repair strategy.'];await save();
 process.exitCode=report.status==='accepted'?0:report.status==='requires-review'?2:1;
}catch(error){report.status='failed';report.error=error.message;process.exitCode=1;}
finally{if(browser)await browser.close();if(udid){await runner.run('xcrun',['simctl','shutdown',udid]);await runner.run('xcrun',['simctl','delete',udid]);}await save();console.log(JSON.stringify({status:report.status,report:join(root,'report.json')},null,2));}
