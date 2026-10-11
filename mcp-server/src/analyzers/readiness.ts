/** Local, selected-target evidence. Never supplies legal answers or predicts Apple approval. */
import {readFile} from 'node:fs/promises';
import {posix} from 'node:path';
import * as plist from 'plist';
import {z} from 'zod';
import {inventory,resolveTargets,containedFile,Target} from '../availability/projects.js';
import {projectPaths,list,parsePropertyList} from '../release/project.js';
import {permissionEvidence,entitlementEvidence,validEntitlement} from '../integrations/permissions.js';
import {appIntentsCode} from './app-intents.js';
import {Finding,isSupportFile} from './types.js';
import {reviewLaunchScreens} from './launch-screen.js';
const DOC='docs/tooling/app-store-readiness.md';
export const metadataSchema=z.object({name:z.string().max(1000).optional(),subtitle:z.string().max(1000).optional()}).strip();
export interface ReadinessOptions {project?:string;target?:string;configuration?:string;metadata?:z.infer<typeof metadataSchema>}
function finding(file:string,line:number,rule:string,message:string,fix:string,severity:Finding['severity']='serious'):Finding {
 return {file,line,rule,severity,message,fix,doc:DOC,excerpt:'',consequence:'Static readiness evidence requires review in the final built app; this is not an App Review verdict.'};
}
export function metadataFindings(input:unknown):Finding[]{
 const metadata=metadataSchema.parse(input),findings:Finding[]=[];
 for(const [key,value] of Object.entries(metadata)){
  if(!value)continue;
  if([...value].length>30)findings.push(finding('metadata.json',1,'metadata-length',`${key} exceeds 30 characters.`,`Shorten the ${key} and verify the final localized metadata in App Store Connect.`));
  if(/\bfree\b|(?:[$€£]\s*\d)|\b\d+(?:\.\d+)?\s*(?:USD|EUR|GBP)\b/i.test(value))findings.push(finding('metadata.json',1,'metadata-pricing-review',`${key} contains possible pricing wording; review against guideline 2.3.7.`,'Review the wording in context. A word match does not prove a violation or predict rejection.','minor'));
 }
 return findings;
}
const privacyRules:Array<[string,RegExp]>=[
 ['UserDefaults',/\bUserDefaults\s*(?:\.\s*standard\b|\(\s*suiteName\s*:)/],
 ['SystemBootTime',/\bProcessInfo\s*\.\s*processInfo\s*\.\s*systemUptime\b|\bmach_absolute_time\s*\(/],
 ['FileTimestamp',/\bFileManager\s*\.\s*default\s*\.\s*attributesOfItem\s*\(/],
 ['DiskSpace',/\b(?:URLResourceKey\s*\.\s*volumeAvailableCapacity(?:ForImportantUsage|ForOpportunisticUsage)?Key|FileAttributeKey\s*\.\s*systemFreeSize)\b/],
 ['ActiveKeyboards',/\bUITextInputMode\s*\.\s*activeInputModes\b/],
];
export function privacyEvidence(content:string){const code=appIntentsCode(content);return privacyRules.flatMap(([category,re])=>{const m=re.exec(code);return m?[{category:'NSPrivacyAccessedAPICategory'+category,line:code.slice(0,m.index).split('\n').length}]:[];});}
function resourceEvidence(t:Target,files:Map<string,string>){
 if(!t.source.endsWith('.pbxproj'))return {app:false,known:false,paths:[] as string[]};
 try{
  const p=plist.parseOpenStep(files.get(t.source)!) as any,objects=p.objects,project=objects[p.rootObject];
  const target=list(project.targets).map(id=>objects[id]).find(o=>o?.name===t.name);
  const filePath=projectPaths(objects,posix.dirname(posix.dirname(t.source))),paths:string[]=[];
  let known=!list(target?.fileSystemSynchronizedGroups).length;
  for(const id of list(target?.buildPhases)){
   const phase=objects[id];if(!phase||['PBXShellScriptBuildPhase','PBXCopyFilesBuildPhase'].includes(phase.isa))known=false;
   if(phase?.isa!=='PBXResourcesBuildPhase')continue;
   for(const id of list(phase.files)){const b=objects[id],p=filePath(b?.fileRef);if(!p||b.platformFilter||b.platformFilters||objects[b?.fileRef]?.lastKnownFileType==='folder'||objects[b?.fileRef]?.explicitFileType==='folder'){known=false;continue;}paths.push(p);}
  }
  return {app:target?.productType==='com.apple.product-type.application',known,paths};
 }catch{return {app:false,known:false,paths:[] as string[]};}
}
export async function reviewReadiness(path:string,options:ReadinessOptions={}){
 const inv=await inventory(path),project=options.project?.replace(/\/$/,'').replace(/\.xcodeproj$/,'.xcodeproj/project.pbxproj'),targets=resolveTargets(inv.files).filter(t=>(!project||t.source===project)&&(!options.target||t.name===options.target)&&(!options.configuration||t.configuration===options.configuration));
 const findings=options.metadata?metadataFindings(options.metadata):[],results=[];
 for(const t of targets){
  const resources=resourceEvidence(t,inv.files),limitations=[...inv.limitations,...t.limitations],issues:Finding[]=[];
  if(!resources.app){results.push({target:t.name,configuration:t.configuration,project:t.source,status:'unsupported-or-not-app',findings:issues,limitations:[...limitations,'Readiness requires a resolved Xcode application target.']});continue;}
  const configurationKnown=!limitations.some(s=>/xcconfig|conditional settings|JSON project|Generated\/script|Custom source/.test(s))&&!inv.limitations.length&&t.settings.INFOPLIST_PREPROCESS!=='YES';
  const base=posix.dirname(posix.dirname(t.source));
  async function dictionary(value:unknown){
   if(!configurationKnown||typeof value!=='string'||!value.trim())return null;
   let p=value.replace(/\$\((SRCROOT|PROJECT_DIR)\)|\$\{(SRCROOT|PROJECT_DIR)\}/g,'.');
   if(/\$[({]/.test(p)||posix.isAbsolute(p))return null;
   p=posix.normalize(posix.join(base,p));
   try{return parsePropertyList(await readFile(await containedFile(inv.root,p)));}catch{return null;}
  }
  let info=await dictionary(t.settings.INFOPLIST_FILE);
  if(configurationKnown&&t.settings.GENERATE_INFOPLIST_FILE==='YES'&&(!t.settings.INFOPLIST_FILE||info)){
   info??={};for(const [key,value] of Object.entries(t.settings))if(key.startsWith('INFOPLIST_KEY_'))info[key.slice(14)]=key==='INFOPLIST_KEY_ITSAppUsesNonExemptEncryption'&&['YES','NO'].includes(String(value))?value==='YES':value;
  }
  const localizedPurpose=[...inv.files.keys()].some(p=>p.endsWith('/InfoPlist.strings'));
  if(localizedPurpose)limitations.push('Localized InfoPlist.strings present; missing purpose-string assertions suppressed until built localization review.');
  const entitlements=await dictionary(t.settings.CODE_SIGN_ENTITLEMENTS);
  if(!info)limitations.push('Effective Info.plist unresolved; missing usage/export keys not inferred.');
  if(!entitlements)limitations.push('Effective entitlements unresolved; missing capability keys not inferred.');
  if(info){
   const value=info.ITSAppUsesNonExemptEncryption;
   if(value===undefined)issues.push(finding(t.source,1,'export-compliance-answer-needed','ITSAppUsesNonExemptEncryption is absent; an export-compliance answer is still needed.','Determine the correct answer from actual encryption use; do not automatically choose false. App Store Connect may collect the answer instead.','minor'));
   else if(typeof value==='string'&&/\$[({]/.test(value))limitations.push('Export-compliance answer has unresolved variables.');
   else if(typeof value!=='boolean')issues.push(finding(t.source,1,'export-compliance-type','ITSAppUsesNonExemptEncryption is not a Boolean.','Use a Boolean matching the developer’s assessed encryption use.'));
  }
  const manifestPaths=resources.paths.filter(p=>posix.basename(p)==='PrivacyInfo.xcprivacy');
  let manifest:Record<string,any>|null=null,manifestKnown=resources.known&&configurationKnown;
  if(manifestPaths.length===1){try{manifest=parsePropertyList(await readFile(await containedFile(inv.root,manifestPaths[0])));}catch{manifestKnown=false;limitations.push('Referenced privacy manifest unreadable/invalid; reasons not inferred.');}}
  if(manifestPaths.length>1){manifestKnown=false;limitations.push('Multiple privacy manifests; merge/bundle resolution needs Xcode.');}
  if(!resources.known)limitations.push('Privacy resource membership unresolved.');
  const entries=manifest?.NSPrivacyAccessedAPITypes;
  if(manifest&&entries!==undefined&&!Array.isArray(entries)){manifestKnown=false;issues.push(finding(manifestPaths[0],1,'privacy-reasons-shape','NSPrivacyAccessedAPITypes must be an array.','Use an array of API category/reason dictionaries.'));}
  for(const file of t.files){
   if(isSupportFile(file.path)||/(^|\/)(Tests?|Fixtures?|Previews)\//.test(file.path))continue;
   const code=appIntentsCode(file.content);
   if(/^\s*#(?:if|elseif)\b/m.test(code)){limitations.push(`${file.path}: conditional source skipped; active compilation branch unknown.`);continue;}
   if(info&&!localizedPurpose)for(const e of permissionEvidence(file.content)){
    const v=info[e.key];if(typeof v==='string'&&/\$[({]/.test(v)){limitations.push(`${e.key}: unresolved build setting.`);continue;}
    if(typeof v!=='string'||!v.trim())issues.push(finding(file.path,e.line,'missing-purpose-string',`${e.key} is missing or empty in ${t.name}/${t.configuration}.`,'Add a specific, truthful purpose string to this target’s effective Info.plist.'));
   }
   if(entitlements)for(const e of entitlementEvidence(file.content))if(!validEntitlement(e.key,entitlements[e.key])){
    if(JSON.stringify(entitlements[e.key]??'').includes('$')){limitations.push(`${e.key}: unresolved entitlement variable.`);continue;}
    issues.push(finding(file.path,e.line,'missing-integration-capability',`Selected entitlements do not enable ${e.key}.`,'Enable the matching capability and verify signing/provisioning; do not remove unrelated entitlements automatically.'));
   }
   if(manifestKnown)for(const e of privacyEvidence(file.content)){
    const declarations=Array.isArray(entries)?entries.filter(x=>x&&x.NSPrivacyAccessedAPIType===e.category):[];
    if(!declarations.some(x=>Array.isArray(x.NSPrivacyAccessedAPITypeReasons)&&x.NSPrivacyAccessedAPITypeReasons.length>0&&x.NSPrivacyAccessedAPITypeReasons.every((r:unknown)=>typeof r==='string'&&/^[A-Z0-9]{4}\.\d+$/.test(r))))issues.push(finding(file.path,e.line,'missing-required-reason',`${e.category} use has no nonempty reason declaration in this target’s privacy manifest.`,'Review the concrete use and choose an applicable Apple-approved reason; the tool does not select legal reasons or verify their applicability.'));
   }
  }
  findings.push(...issues);results.push({target:t.name,configuration:t.configuration,project:t.source,status:'static-review',findings:issues,limitations:[...new Set(limitations)]});
 }
 const launchCoverage:string[]=[];
 for(const t of targets.filter(t=>t.source.endsWith('.pbxproj'))){
  const launch=await reviewLaunchScreens(inv.root,{project:t.source,target:t.name,configuration:t.configuration});
  findings.push(...launch.findings);launchCoverage.push(...launch.coverage);
 }

 return {mode:'static',targets:results,findings,limitations:[...inv.limitations,...launchCoverage,...(targets.length?[]:['No matching target/configuration.'])],notice:'Local bounded Swift/source-configuration review, not App Store approval, binary scanning or validation of legal privacy reasons. Third-party binaries, wrappers, Objective-C, generated inputs and localized InfoPlist.strings require final archive review. No network, model call, signing or source edits.'};
}
export async function readinessCLI(args:string[]){
 const value=(k:string)=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
 const path=value('--path')??process.cwd(),metadataPath=value('--metadata');
 const metadata=metadataPath?metadataSchema.parse(JSON.parse(await readFile(await containedFile((await inventory(path)).root,metadataPath),'utf8'))):undefined;
 const report=await reviewReadiness(path,{project:value('--project'),target:value('--target'),configuration:value('--configuration'),metadata});console.log(JSON.stringify(report,null,2));
 return report.findings.some(f=>f.severity!=='minor')?1:!report.targets.length||report.limitations.length||report.targets.some(t=>t.status!=='static-review'||t.limitations.length)?2:0;
}
