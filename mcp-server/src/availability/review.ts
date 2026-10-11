import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,relative,resolve} from 'node:path';
import {inventory,resolveTargets,Target} from './projects.js';
import {loadSDK} from './sdk.js';
import {analyzeAvailability} from '../analyzers/availability.js';
import {appIntentsCode} from '../analyzers/app-intents.js';
import {Finding} from '../analyzers/types.js';
const exec=promisify(execFile);
export interface AvailabilityReviewOptions {mode?:'auto'|'static';target?:string;configuration?:string;sdkPath?:string}
export function compilerFindings(stderr:string,root:string,files:Set<string>):Finding[]{
 const findings:Finding[]=[];
 for(const m of stderr.matchAll(/^(.+?):(\d+):(\d+): (?:error|warning): (.+?) is only available in iOS (\d+(?:\.\d+)*) or newer/gm)){
  const file=relative(root,resolve(root,m[1]));if(!files.has(file))continue;
  findings.push({file,line:Number(m[2]),severity:'blocker',rule:'missing-availability-guard',message:`[compiler] ${m[4]} requires iOS ${m[5]}.`,consequence:'The selected simulator typecheck rejected this use at the resolved deployment target.',fix:`Guard the use at iOS ${m[5]} or annotate the enclosing declaration and preserve an older-OS fallback. No automated edit applied.`,doc:'docs/tooling/deployment-guard.md',excerpt:m[4]});
 }
 return findings;
}
async function typecheck(root:string,target:Target,sdk:string){
 const cache=await mkdtemp(join(tmpdir(),'ios-availability-'));
 try{
  const flags=['--sdk','iphonesimulator','swiftc','-typecheck','-parse-as-library','-sdk',sdk,'-target',`${process.arch==='arm64'?'arm64':'x86_64'}-apple-ios${target.deploymentTarget}-simulator`,'-module-name','AvailabilityReview','-module-cache-path',cache];
  if(/^[56]$/.test(String(target.settings.SWIFT_VERSION)))flags.push('-swift-version',String(target.settings.SWIFT_VERSION));
  const {stderr}=await exec('/usr/bin/xcrun',[...flags,...target.files.map(f=>join(root,f.path))],{cwd:root,timeout:60000,maxBuffer:2_000_000});
  return {status:'passed' as const,findings:compilerFindings(stderr,root,new Set(target.files.map(f=>f.path)))};
 }catch(error){
  const e=error as {stderr?:string;killed?:boolean;code?:unknown};
  return {status:e.killed?'timeout' as const:'failed' as const,findings:compilerFindings(e.stderr??'',root,new Set(target.files.map(f=>f.path)))};
 }finally{await rm(cache,{recursive:true,force:true});}
}
export async function reviewAvailability(path:string,options:AvailabilityReviewOptions={}){
 const data=await inventory(path),targets=resolveTargets(data.files,process.env.IPHONEOS_DEPLOYMENT_TARGET).filter(t=>(!options.target||t.name===options.target)&&(!options.configuration||t.configuration===options.configuration));
 let sdk=options.sdkPath;
 if(!sdk&&process.platform==='darwin')try{sdk=(await exec('/usr/bin/xcrun',['--sdk','iphonesimulator','--show-sdk-path'],{timeout:10000})).stdout.trim();}catch{/* Static fallback is explicit below. */}
 const results=[];
 for(const t of targets){
  const imports=[...new Set(t.files.flatMap(f=>[...appIntentsCode(f.content).matchAll(/\bimport\s+([A-Za-z_]\w*)/g)].map(m=>m[1])))];
  const evidence=sdk?await loadSDK(sdk,imports):null;
  const limitations=[...data.limitations,...t.limitations,...(evidence?.limitations??['No local SDK: limited curated symbol fallback, not compiler verification.'])];
  if(!t.deploymentTarget)limitations.push('Deployment target not detected. Availability findings suppressed; no minimum assumed.');
  const shadowed=new Set(t.files.flatMap(f=>[...appIntentsCode(f.content).matchAll(/\b(?:struct|class|enum|actor|protocol|typealias|func|var|let)\s+(\w+)/g)].map(m=>m[1])));
  let staticFindings=t.files.flatMap(file=>{
   if(/^\s*#(?:if|elseif|else)\b/m.test(appIntentsCode(file.content))){limitations.push(`${file.path}: conditional compilation requires compiler evidence; static check skipped.`);return [];}
   return analyzeAvailability(file,{deploymentTarget:t.deploymentTarget,symbols:evidence?.symbols.filter(s=>!shadowed.has(s.name))});
  });
  let compiler:{status:string;findings:Finding[]}={status:'not-run',findings:[]};
  // Do not synthesize a partial invocation for complex targets. No project scripts,
  // package downloads, user flags or plugin executables are ever invoked.
  const safe=t.compilerEligible&&t.files.length>0&&t.files.length<=200&&!data.limitations.length&&imports.every(f=>evidence?.sources.some(p=>p.includes('/'+f+'.framework/'))||['Swift','Foundation','UIKit','Darwin','Dispatch','OSLog','Combine'].includes(f))&&!t.files.some(f=>/#externalMacro|#sourceLocation/.test(f.content));
  if(options.mode!=='static'&&process.platform==='darwin'&&sdk&&t.deploymentTarget&&safe){compiler=await typecheck(data.root,t,sdk);}
  else if(options.mode!=='static') limitations.push('Compiler not run: unavailable toolchain/target or unsupported project context.');
  if(compiler.status==='passed')staticFindings=staticFindings.filter(f=>f.rule!=='missing-availability-guard');
  if(compiler.status==='failed'||compiler.status==='timeout')limitations.push('Typecheck did not complete successfully; reported availability diagnostics are compiler evidence, remaining static candidates are not verified. Other compiler errors are outside this review.');
  staticFindings=staticFindings.filter(f=>!compiler.findings.some(c=>c.file===f.file&&c.line===f.line&&c.rule===f.rule));
  results.push({target:t.name,configuration:t.configuration,deploymentTarget:t.deploymentTarget??'not detected',source:t.source,mode:compiler.status==='passed'?'compiler':compiler.findings.length?'compiler+static':evidence?'static-sdk':'static-curated',compiler:compiler.status,filesChecked:t.files.length,sdk:sdk??null,sdkDeclarations:evidence?.symbols.length??0,findings:[...compiler.findings,...staticFindings],limitations:[...new Set(limitations)]});
 }
 return {targets:results,limitations:targets.length?[]:['No matching target/configuration found.'],notice:'Offline checks; static findings are candidates, not compiler verification. SDK scanning is bounded and does not resolve receivers, overloads or Objective-C APIs. Suggested fixes require developer review; model-based repairs use the developer’s own model. No network calls or source edits.'};
}
export function availabilityExit(report:Awaited<ReturnType<typeof reviewAvailability>>):number {
 if(report.targets.some(t=>t.findings.some(f=>f.severity==='blocker'||f.rule==='missing-availability-guard')))return 1;
 if(!report.targets.length||report.targets.some(t=>t.deploymentTarget==='not detected'||!t.filesChecked||t.compiler==='failed'||t.compiler==='timeout'||t.limitations.length))return 2;
 return 0;
}
export async function availabilityCLI(args:string[]){
 const value=(key:string)=>{const i=args.indexOf(key);return i<0?undefined:args[i+1];};
 const root=value('--path')??process.cwd();
 const report=await reviewAvailability(root,{mode:args.includes('--static')?'static':'auto',target:value('--target'),configuration:value('--configuration')});
 console.log(JSON.stringify(report,null,2));
 return availabilityExit(report);
}
