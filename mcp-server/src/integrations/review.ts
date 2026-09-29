import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { resolveProjectRoot, readSwiftFiles } from '../scan.js';
import { appIntentsCode, analyzeAppIntents } from '../analyzers/app-intents.js';
import { isSupportFile, Finding } from '../analyzers/types.js';
import { parsePropertyList } from '../release/project.js';
import { permissionEvidence } from './permissions.js';
import { integrations } from './registry.js';
export interface Selection { infoPlist?: string; entitlements?: string; }
const markers: Record<string, RegExp> = {
 calendar:/\b(?:EKEvent|EKEventEditViewController|requestFullAccessToEvents|requestWriteOnlyAccessToEvents)\b/,
 reminders:/\b(?:EKReminder|requestFullAccessToReminders)\b/,
 contacts:/\b(?:CNContactStore|CNContactPickerViewController)\b/,
 photos:/\b(?:PhotosPicker|PHPhotoLibrary|PHAsset)\b/,
 camera:/\b(?:AVCaptureSession|AVCaptureDevice|UIImagePickerController)\b/,
 maps:/\b(?:MKMapItem|MKMapView|MKLocalSearch|MKDirections)\b|\bMap\s*\{/,
 files:/\b(?:fileImporter|fileExporter|UIDocumentPickerViewController)\b/,
 sharing:/\b(?:ShareLink|UIActivityViewController)\b/,
 shortcuts:/\b(?:AppIntent|AppEntity|AppShortcutsProvider|INIntent)\b/,
 notifications:/\bUNUserNotificationCenter\b/,
};
export async function inspectIntegrations(path: string, selection: Selection = {}) {
 const root=await realpath(await resolveProjectRoot(path));
 const files=(await readSwiftFiles(root)).filter(f=>!isSupportFile(f.path)&&!/(^|\/)(Tests?|Fixtures?|Previews)\//i.test(f.path));
 const limitations=['Lexical evidence, not Swift typechecking or a complete target graph. Conditional branches are included; wrappers, Objective-C and generated source may be missed.', 'Unnecessary permissions, denied-state UX and availability need flow review; absence of a pattern is not proof of a defect.', 'Simulator success does not verify hardware, real accounts, Siri or notification delivery.'];
 const configFiles: string[]=[];let truncated=false,dirs=0;
 async function walk(dir:string):Promise<void>{
  if(++dirs>1000){truncated=true;return;}
  for(const e of await readdir(dir,{withFileTypes:true})){
   if(configFiles.length>=200){truncated=true;return;}
   if(e.isSymbolicLink()){truncated=true;continue;}
   if(e.isDirectory()&&!['.git','node_modules','.build','build','DerivedData','Pods','Carthage'].includes(e.name))await walk(join(dir,e.name));
   else if(e.isFile()&&/\.(plist|entitlements|pbxproj|xcconfig|xcproj)$/.test(e.name))configFiles.push(relative(root,join(dir,e.name)));
  }
 }
 await walk(root);
 async function configuration(explicit:string|undefined,suffix:string){
  const choices=configFiles.filter(p=>p.endsWith(suffix));
  const projectSettings=configFiles.some(p=>/\.(pbxproj|xcconfig|xcproj)$/.test(p));
  const selected=explicit ?? (!truncated&&!projectSettings&&choices.length===1?choices[0]:undefined);
  if(!selected)return {status:'unknown' as const,values:{} as Record<string,unknown>,file:null};
  const full=await realpath(resolve(root,selected));
  if(full!==root&&!full.startsWith(root+sep))throw Error('Configuration must remain inside the project.');
  if((await lstat(full)).size>512*1024)throw Error('Configuration exceeds size limit.');
  try{return {status:'resolved' as const,values:parsePropertyList(await readFile(full)) as Record<string,unknown>,file:relative(root,full)};}
  catch{limitations.push('Selected configuration could not be parsed; missing-key diagnostics suppressed.');return {status:'unknown' as const,values:{} as Record<string,unknown>,file:relative(root,full)};}
 }
 const privacy=await configuration(selection.infoPlist,'Info.plist'),capabilities=await configuration(selection.entitlements,'.entitlements');
 if(privacy.status==='unknown')limitations.push('Select the effective built Info.plist with infoPlist to prove missing keys; Xcode generated keys, xcconfig inheritance and multi-target selection are not resolved here.');
 if(capabilities.status==='unknown')limitations.push('Select the effective entitlements file to prove missing capabilities; provisioning profiles and server setup are not inspected.');
 const detected=integrations.flatMap(i=>{
  const evidence=files.flatMap(f=>{const code=appIntentsCode(f.content),m=markers[i.id]!.exec(code);return m?[{file:f.path,line:code.slice(0,m.index).split('\n').length,api:m[0]}]:[];});
  return evidence.length?[{id:i.id,name:i.name,evidence,verification:i.verification,limitations:i.limitations}]:[];
 });
 const required=files.flatMap(f=>permissionEvidence(f.content).map(e=>({ ...e,file:f.path,status:privacy.status==='unknown'?'unknown':typeof privacy.values[e.key]==='string'&&(privacy.values[e.key] as string).trim()?'present':'missing-or-empty'})));
 const findings:Finding[]=required.filter(e=>e.status==='missing-or-empty').map(e=>({file:e.file,line:e.line,rule:'missing-purpose-string',severity:'serious',message:`${e.key} is missing or empty in the selected configuration.`,consequence:'The detected operation may be denied or terminate at runtime.',fix:'Add a specific user-facing reason to the effective app Info.plist; verify selected target and configuration.',doc:'docs/integrations/README.md',excerpt:e.operation}));
 const entitlementRules: Array<[string,RegExp]>=[
  ['com.apple.developer.healthkit',/\bHKHealthStore\s*\(/],
  ['com.apple.developer.in-app-payments',/\bPKPaymentAuthorization(?:Controller|ViewController)\s*\(/],
  ['com.apple.developer.icloud-services',/\bCKContainer\b/],
  ['aps-environment',/\bregisterForRemoteNotifications\s*\(/],
 ];
 const requiredCapabilities=files.flatMap(f=>entitlementRules.flatMap(([key,re])=>{const m=re.exec(appIntentsCode(f.content));if(!m)return [];const value=capabilities.values[key];const valid=key==='com.apple.developer.healthkit'?value===true:key==='aps-environment'?['development','production'].includes(String(value)):Array.isArray(value)&&(key==='com.apple.developer.icloud-services'?value.includes('CloudKit'):value.length>0&&value.every(v=>typeof v==='string'&&/^merchant\.[A-Za-z0-9.-]+$/.test(v)));return [{key,file:f.path,line:f.content.slice(0,m.index).split('\n').length,status:capabilities.status==='unknown'?'unknown':valid?'present':'missing-or-invalid'}];}));
 for(const e of requiredCapabilities.filter(e=>e.status==='missing-or-invalid'))findings.push({file:e.file,line:e.line,rule:'missing-integration-capability',severity:'serious',message:`Selected entitlements do not enable ${e.key}.`,consequence:'The detected integration may fail even when privacy permission is granted.',fix:'Enable the capability on the selected target and verify provisioning; do not substitute a privacy string.',doc:'docs/integrations/README.md',excerpt:e.key});
 for(const file of files){
  const code=appIntentsCode(file.content), m=/\brequestAccess\s*\(\s*to:\s*\.(?:event|reminder)\b/.exec(code);
  if(m)findings.push({file:file.path,line:code.slice(0,m.index).split('\n').length,rule:'eventkit-legacy-authorization-review',severity:'minor',message:'Legacy EventKit authorization path detected.',consequence:'The legacy request is deprecated on iOS 17; this may be a valid older-OS fallback.',fix:'Use iOS 17 full/write-only access APIs on current OS paths; preserve required older-OS guards.',doc:'docs/frameworks/services/eventkit.md',excerpt:m[0]});
 }
 findings.push(...analyzeAppIntents(files));
 return {detected,permissions:{configuration:privacy.file,status:privacy.status,required,detectedKeys:Object.keys(privacy.values).filter(k=>/^NS.*UsageDescription$/.test(k))},capabilities:{configuration:capabilities.file,status:capabilities.status,required:requiredCapabilities,detectedKeys:Object.keys(capabilities.values)},findings,limitations};
}
