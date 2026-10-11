/** Bounded static project selection. Never executes manifests, scripts or package resolution. */
import {readdir, readFile, lstat, realpath} from 'node:fs/promises';
import {join, relative, resolve, sep, posix} from 'node:path';
import * as plist from 'plist';
import {parse as yaml} from 'yaml';
import {projectPaths, list} from '../release/project.js';
import {version} from './scopes.js';
import {appIntentsCode} from '../analyzers/app-intents.js';
import {SourceFile} from '../analyzers/types.js';
export interface Target {name:string; configuration:string; deploymentTarget:string|null; source:string; files:SourceFile[]; settings:Record<string,any>; compilerEligible:boolean; limitations:string[]}
export async function inventory(path:string) {
 const root=await realpath(path), files=new Map<string,string>(), limitations:string[]=[];
 let count=0,bytes=0;
 async function walk(dir:string):Promise<void>{
  if(++count>2000){limitations.push('Directory inventory limit reached.');return;}
  for(const e of await readdir(dir,{withFileTypes:true})){
   const p=join(dir,e.name);
   if(e.isSymbolicLink()){limitations.push('Symlink omitted: '+relative(root,p));continue;}
   if(e.isDirectory()){if(!['.git','.build','.swiftpm','node_modules','Pods','Carthage','DerivedData','build','.ios-agent'].includes(e.name))await walk(p);continue;}
   if(!e.isFile()||! /\.(swift|pbxproj|xcproj|xcconfig|plist|xcprivacy|entitlements|strings)$|(?:^|\/)project\.ya?ml$/.test(p))continue;
   const size=(await lstat(p)).size;
   if(size>4_000_000||bytes+size>64_000_000||files.size>=4000){limitations.push('File inventory limit reached.');continue;}
   bytes+=size;files.set(relative(root,p).split(sep).join('/'),await readFile(p,'utf8'));
  }
 }
 await walk(root);return {root,files,limitations:[...new Set(limitations)]};
}
export async function containedFile(root:string,path:string):Promise<string>{
 const p=await realpath(resolve(root,path));if(!p.startsWith(root+sep))throw Error('Selected file must remain inside project.');
 if((await lstat(p)).size>4_000_000)throw Error('Selected file exceeds limit.');return p;
}
export function resolveTargets(files:Map<string,string>, environment?:string):Target[]{
 const targets:Target[]=[];
 const swift=[...files].filter(([p])=>p.endsWith('.swift')&&!p.endsWith('Package.swift')).map(([path,content])=>({path,content}));
 const make=(name:string,configuration:string,source:string,settings:Record<string,any>,selected:SourceFile[],limitations:string[],compilerEligible=false)=>{
  const v=environment??settings.IPHONEOS_DEPLOYMENT_TARGET;
  targets.push({name,configuration,source,settings,files:selected,deploymentTarget:version(String(v))?String(v):null,compilerEligible:compilerEligible&&!limitations.length,limitations});
 };
 for(const [path,text] of files){
  if(!path.endsWith('.xcodeproj/project.pbxproj'))continue;
  try{
   const parsed=plist.parseOpenStep(text) as any,objects=parsed.objects??{},project=objects[parsed.rootObject];
   const configs=(id:string)=>list(objects[id]?.buildConfigurations).map(id=>objects[id]).filter(Boolean);
   const filePath=projectPaths(objects,posix.dirname(posix.dirname(path)));
   for(const id of list(project?.targets)){
    const t=objects[id];if(t?.isa!=='PBXNativeTarget')continue;
    const reasons:string[]=[],paths:string[]=[];
    if(list(t.fileSystemSynchronizedGroups).length)reasons.push('Synchronized source groups need Xcode source membership resolution.');
    for(const phaseId of list(t.buildPhases)){
     const phase=objects[phaseId];if(phase?.isa==='PBXShellScriptBuildPhase')reasons.push('Generated/script inputs are unresolved.');
     if(phase?.isa!=='PBXSourcesBuildPhase')continue;
     for(const buildId of list(phase.files)){
      const b=objects[buildId],p=filePath(b?.fileRef);
      if(!p||b.platformFilter||b.platformFilters||b.settings){reasons.push('Conditional or unresolved source membership.');continue;}
      if(!p.endsWith('.swift'))reasons.push('Non-Swift source requires Xcode compilation.');else if(files.has(p))paths.push(p);else reasons.push('Missing source: '+p);
     }
    }
    for(const c of configs(t.buildConfigurationList)){
     const pc=configs(project?.buildConfigurationList).find(x=>x.name===c.name),settings={...pc?.buildSettings,...c.buildSettings},r=[...reasons];
     if(!/iphone/.test(String(settings.SDKROOT??'')+String(settings.SUPPORTED_PLATFORMS??''))&&!settings.IPHONEOS_DEPLOYMENT_TARGET)continue;
     if(c.baseConfigurationReference||pc?.baseConfigurationReference||Object.keys(settings).some(k=>k.includes('['))){r.push('xcconfig/conditional settings unresolved.');if(!environment)settings.IPHONEOS_DEPLOYMENT_TARGET=undefined;}
     if(files.has(path.replace('project.pbxproj','project.xcproj')))r.push('JSON project schema unresolved.');
     if(list(t.packageProductDependencies).length||list(t.dependencies).length)r.push('Target/package dependencies require the original build context.');
     if(['EXCLUDED_SOURCE_FILE_NAMES','INCLUDED_SOURCE_FILE_NAMES','SWIFT_OBJC_BRIDGING_HEADER','OTHER_SWIFT_FLAGS','SWIFT_ACTIVE_COMPILATION_CONDITIONS','SWIFT_DEFAULT_ACTOR_ISOLATION','SWIFT_UPCOMING_FEATURE_FLAGS'].some(k=>settings[k]))r.push('Custom source/compiler settings require Xcode resolution.');
     make(String(t.name),String(c.name),path,settings,swift.filter(f=>paths.includes(f.path)),r,true);
    }
   }
  }catch{make(path,'unknown',path,{},[],['Unparseable project.']);}
 }
 if(targets.length)return targets;
 for(const [path,text] of files){
  if(/(?:^|\/)project\.ya?ml$/.test(path)){
   try{const p=yaml(text),base=posix.dirname(path);for(const [name,t] of Object.entries(p.targets??{}) as [string,any][]){
    if(t.platform!=='iOS')continue;
    const r:string[]=[],paths=list(t.sources).map(s=>typeof s==='string'?s:s.path).filter((s):s is string=>typeof s==='string');
    if(p.include||p.options?.settingPresets||list(t.sources).some(s=>typeof s!=='string'&&Object.keys(s).some(k=>k!=='path')))r.push('XcodeGen includes/source options need resolution.');
    const settings={...p.settings?.base,...t.settings?.base,IPHONEOS_DEPLOYMENT_TARGET:t.deploymentTarget??p.options?.deploymentTarget?.iOS??t.settings?.base?.IPHONEOS_DEPLOYMENT_TARGET??p.settings?.base?.IPHONEOS_DEPLOYMENT_TARGET};
    if(p.settings?.configs||t.settings?.configs)r.push('XcodeGen configuration overrides unresolved.');
    if(r.length)settings.IPHONEOS_DEPLOYMENT_TARGET=undefined;
    make(name,'base',path,settings,swift.filter(f=>paths.some(s=>{const p=posix.normalize(posix.join(base,s));return f.path===p||f.path.startsWith(p+'/');})),r);
   }}catch{make(path,'unknown',path,{},[],['Unparseable XcodeGen specification.']);}
  }
 }
 if(targets.length)return targets;
 for(const [path,text] of files)if(posix.basename(path)==='Package.swift'){
  const code=appIntentsCode(text), platform=/platforms\s*:\s*\[[^\]]*\]/.exec(code);
  const call=platform && /\.iOS\s*\(([^)]*)\)/.exec(platform[0]);
  const raw=call&&platform?text.slice(platform.index+call.index,platform.index+call.index+call[0].length):'';
  const m=/^\.iOS\s*\(\s*(?:\.v(\d+(?:_\d+)*)|"(\d+(?:\.\d+)*)")\s*\)$/.exec(raw);
  const minimum=/^\s*#if\b/m.test(code)?undefined:m?.[1]?.replaceAll('_','.')??m?.[2];
  make('Package','platforms',path,{IPHONEOS_DEPLOYMENT_TARGET:minimum},swift.filter(f=>f.path.startsWith(posix.join(posix.dirname(path),'Sources')+'/')),['Package target/dependency graph is not evaluated; static source review only.']);
 }
 if(!targets.length)make('project','environment','IPHONEOS_DEPLOYMENT_TARGET',{},swift,['No project target graph detected; compiler disabled.']);
 return targets;
}
