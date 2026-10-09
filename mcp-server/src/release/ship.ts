/** Reviewable local preparation followed by explicitly approved Apple operations. */
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile, rename, readdir, lstat, realpath, rm, chmod } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import * as plist from 'plist';
import { z } from 'zod';
import { prepareRelease } from './package.js';
import { canonical, digest } from './model.js';
import { generateSet, inspectSet, recipeSchema } from '../screenshots/studio.js';
import { ProcessRunner, type CommandRunner } from '../agent/runner.js';

const label = z.string().min(1).max(150).regex(/^[^\x00-\x1f]+$/);
const https = z.string().url().refine(s => s.startsWith('https://'));
export const ShipConfig = z.object({
  schemaVersion: z.literal(1),
  project: label.optional(), workspace: label.optional(), scheme: label, target: label,
  configuration: label.default('Release'), bundleId: z.string().regex(/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/),
  teamId: z.string().regex(/^[A-Z0-9]{10}$/),
  version: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/), build: z.string().regex(/^\d+(?:\.\d+){0,2}$/),
  signing: z.enum(['automatic','manual']), allowProvisioningUpdates: z.boolean().default(false),
  provisioningProfiles: z.record(z.string(), label).optional(),
  metadata: z.object({ name: z.string().min(1).max(30), subtitle: z.string().max(30).optional(), description: z.string().min(1).max(4000), keywords: z.string().max(100).optional(), supportURL: https, privacyURL: https, locale: z.string().regex(/^[a-z]{2}(?:-[A-Za-z0-9]+)*$/), whatsNew: z.string().max(4000).optional() }).strict(),
  screenshots: z.array(recipeSchema.omit({outputDirectory:true,projectPath:true,inputDirectory:true})).min(1).max(10),
}).strict().superRefine((c,ctx)=>{
  if ((!c.project && !c.workspace) || (c.project && c.workspace)) ctx.addIssue({code:'custom',message:'Choose exactly one project or workspace'});
  if(c.signing==='manual' && !c.provisioningProfiles?.[c.bundleId]) ctx.addIssue({code:'custom',message:'Manual signing requires an explicit profile mapping for the app and its extensions'});
  if(c.screenshots.some(r=>!r.screens?.length)) ctx.addIssue({code:'custom',message:'Each screenshot set needs explicit real source screenshots'});
});
type Config=z.infer<typeof ShipConfig>;
type Manifest={schemaVersion:1;id:string;requestHash:string;config:Config;sourceHash:string;files:Record<string,string>;status:string};
type Receipt={archive?:string;archiveHash?:string;upload?:'in_progress'|'accepted'|'uncertain';at?:string};
const skip=new Set(['.git','.ios-agent','node_modules','DerivedData','build','.build','.DS_Store']);
async function fileHash(file:string){const h=createHash('sha256');for await(const chunk of createReadStream(file))h.update(chunk);return h.digest('hex');}
async function treeHash(root:string,source=false):Promise<string>{
  const entries:string[]=[];let count=0;
  async function walk(dir:string){for(const name of (await readdir(dir)).sort()){
    if(source&&(skip.has(name)||name.startsWith('.env')||/\.(p8|p12|pem|key|mobileprovision)$/.test(name)))continue;
    const full=join(dir,name),s=await lstat(full);if(s.isSymbolicLink())throw Error('Ship refuses symlinked source or archive inputs');
    if(s.isDirectory())await walk(full);else if(s.isFile()){if(++count>20000)throw Error('Ship evidence exceeds 20,000 files');entries.push(`${relative(root,full)}\0${await fileHash(full)}`);}
  }}await walk(root);return digest(entries.join('\n'));
}
async function confined(root:string,path:string){
  const full=resolve(root,path),rel=relative(root,full);if(!rel||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+(process.platform==='win32'?'\\':'/')))throw Error('Path must be inside project');
  let cursor=root;for(const part of rel.split(/[\\/]/)){cursor=join(cursor,part);if((await lstat(cursor)).isSymbolicLink())throw Error('Ship refuses symlink paths');}return full;
}
async function privateDir(dir:string){try{await mkdir(dir,{mode:0o700});}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}const s=await lstat(dir);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Unsafe ship directory');await chmod(dir,0o700);}
async function atomic(file:string,value:unknown){const temp=`${file}.${randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temp,file);}
async function readJSON(file:string){const s=await lstat(file);if(!s.isFile()||s.isSymbolicLink()||s.size>8*1024*1024)throw Error('Invalid ship JSON file');return JSON.parse(await readFile(file,'utf8'));}
async function shipRoot(root:string){await privateDir(join(root,'.ios-agent'));const dir=join(root,'.ios-agent','ship');await privateDir(dir);const ignore=join(dir,'.gitignore');try{await writeFile(ignore,'*\n',{flag:'wx',mode:0o600});}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;if(await readFile(ignore,'utf8')!=='*\n')throw Error('Ship privacy ignore file differs');}return dir;}

function planText(config:Config,id:string):string{return `# Release plan\n\n${config.metadata.name} ${config.version} (${config.build})\n\n- Bundle: ${config.bundleId}\n- Team: ${config.teamId}\n- Scheme: ${config.scheme} / ${config.configuration}\n- Signing: ${config.signing}\n- Apple provisioning changes allowed: ${config.allowProvisioningUpdates}\n- Review metadata.json, analysis.json and screenshot galleries. Privacy, age rating, export compliance and review access require developer answers.\n- Archive approval signs locally; provisioning updates may create/update Apple profiles and certificates.\n- Upload approval sends the signed archive to Apple for processing. It does not submit App Review, assign tester groups, or publish the app.\n- Metadata and screenshot sets are local drafts, not uploaded by this command.\n\nApproval ID: ${id}\n`;}
export async function prepareShip(projectRoot:string,input:unknown){
  const root=await realpath(resolve(projectRoot)),config=ShipConfig.parse(input);
  await confined(root,config.project??config.workspace!);
  // Resolve all source inputs locally; do not fetch marketing imagery or invent screenshots.
  for(const recipe of config.screenshots){for(const screen of recipe.screens??[]){screen.image=relative(root,await confined(root,screen.image));if(screen.additionalImages)screen.additionalImages=await Promise.all(screen.additionalImages.map(async p=>relative(root,await confined(root,p))));}if(recipe.iconPath)recipe.iconPath=relative(root,await confined(root,recipe.iconPath));if(recipe.fontPaths)recipe.fontPaths=await Promise.all(recipe.fontPaths.map(async p=>relative(root,await confined(root,p))));}
  const sourceHash=await treeHash(root,true);
  const inputHashes:Record<string,string>={};
  for(const recipe of config.screenshots) for(const path of [...recipe.screens!.flatMap(s=>[s.image,...(s.additionalImages??[])]),...(recipe.fontPaths??[]),...(recipe.iconPath?[recipe.iconPath]:[])]) inputHashes[path]=await fileHash(resolve(root,path));
  const requestHash=digest(canonical({config,sourceHash,inputHashes}));
  const base=await shipRoot(root);
  for(const name of await readdir(base)) if(/^[a-f0-9]{64}$/.test(name)) {
    const previous=await readJSON(join(base,name,'ship.json')) as Manifest;
    if(previous.requestHash===requestHash){await verifyShip(root,name);return {id:name,path:join(base,name),status:previous.status,reused:true};}
  }
  const stage=join(base,`stage-${randomUUID()}`);await privateDir(stage);
  try{
    const analysis=await prepareRelease({root,...(config.project?{project:config.project}:{workspace:config.workspace!}),target:config.target,configuration:config.configuration});
    if(analysis.status==='BLOCKED')throw Error('Release analysis is blocked; resolve target/configuration selection first');
    await atomic(join(stage,'metadata.json'),{...config.metadata,reviewRequired:true,privacyAnswers:'NOT_GENERATED',ageRating:'NOT_GENERATED',reviewNotes:'DEVELOPER_REQUIRED'});
    await atomic(join(stage,'analysis.json'),{package:relative(root,analysis.path),questions:analysis.questions,model:analysis.model});
    for(let i=0;i<config.screenshots.length;i++){
      const recipe=config.screenshots[i]!;
      await generateSet({...recipe,appName:config.metadata.name,outputDirectory:join(stage,`screenshots-${i+1}`),screens:recipe.screens!.map(s=>({...s,image:resolve(root,s.image),additionalImages:s.additionalImages?.map(p=>resolve(root,p))})),...(recipe.fontPaths?{fontPaths:recipe.fontPaths.map(p=>resolve(root,p))}:{}),...(recipe.iconPath?{iconPath:resolve(root,recipe.iconPath)}:{})});
      const check=await inspectSet(join(stage,`screenshots-${i+1}`));if(!check.passed)throw Error('Generated screenshot set failed validation');
    }
    for(const [path,hash] of Object.entries(inputHashes)) if(await fileHash(resolve(root,path))!==hash)throw Error('Screenshot input changed during preparation');
    if(sourceHash!==await treeHash(root,true))throw Error('Source changed during ship preparation');
    const files:Record<string,string>={};async function inventory(dir:string){for(const name of await readdir(dir)){const full=join(dir,name);if((await lstat(full)).isDirectory())await inventory(full);else files[relative(stage,full)]=await fileHash(full);}}await inventory(stage);
    const id=digest(canonical({config,sourceHash,files,requestHash})),dir=join(base,id);
    const manifest:Manifest={schemaVersion:1,id,requestHash,config,sourceHash,files,status:'PREPARED_REQUIRES_REVIEW'};await atomic(join(stage,'ship.json'),manifest);
    await writeFile(join(stage,'SHIP_PLAN.md'),planText(config,id),{mode:0o600});
    await rename(stage,dir);return {id,path:dir,status:manifest.status,reused:false};
  }catch(e){await rm(stage,{recursive:true,force:true});throw e;}
}
export async function verifyShip(root:string,id:string):Promise<Manifest>{
  if(!/^[a-f0-9]{64}$/.test(id))throw Error('Expected the full approval ID from SHIP_PLAN.md');
  const dir=await confined(root,`.ios-agent/ship/${id}`),m=await readJSON(join(dir,'ship.json')) as Manifest;
  const config=ShipConfig.parse(m.config);
  if(m.schemaVersion!==1||m.id!==id||digest(canonical({config,sourceHash:m.sourceHash,files:m.files,requestHash:m.requestHash}))!==id)throw Error('Ship plan integrity mismatch');
  if(await readFile(await confined(dir,'SHIP_PLAN.md'),'utf8')!==planText(config,id))throw Error('Release review document changed');
  if(m.sourceHash!==await treeHash(root,true))throw Error('Project changed; prepare a new release plan');
  for(const [path,hash] of Object.entries(m.files)){if(await fileHash(await confined(dir,path))!==hash)throw Error('Release artifact changed; prepare a new release plan');}
  return m;
}
function auth(env:NodeJS.ProcessEnv):string[]{
  const values=[env.ASC_KEY_PATH,env.ASC_KEY_ID,env.ASC_ISSUER_ID];if(values.some(Boolean)&&!values.every(Boolean))throw Error('Set all three ASC_KEY_PATH, ASC_KEY_ID and ASC_ISSUER_ID, or use your Xcode account');
  return values.every(Boolean)?['-authenticationKeyPath',resolve(values[0]!),'-authenticationKeyID',values[1]!,'-authenticationKeyIssuerID',values[2]!]:[];
}
export async function executeShip(projectRoot:string,id:string,action:'archive'|'upload',runner:CommandRunner=new ProcessRunner(),env:NodeJS.ProcessEnv=process.env){
  const root=await realpath(resolve(projectRoot)),m=await verifyShip(root,id),c=m.config,dir=join(root,'.ios-agent','ship',id);
  const lock=join(dir,'.lock');try{await mkdir(lock);}catch{throw Error('Ship operation locked; inspect the receipt before recovering an interrupted operation');}
  const receiptFile=join(dir,'receipt.json');let receipt:Receipt={};
  try{
    try{receipt=await readJSON(receiptFile);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    const run=async(args:string[],name:string)=>{const result=await runner.run('xcodebuild',args,{cwd:root,timeoutMs:30*60_000});await writeFile(join(dir,`${name}.log`),result.stdout+'\n'+result.stderr,{mode:0o600});await atomic(join(dir,`${name}-result.json`),{exitCode:result.exitCode,timedOut:result.timedOut,durationMs:result.durationMs});if(result.exitCode!==0||result.timedOut)throw Error(`${name} failed. Private diagnostics: ${join(dir,`${name}.log`)}. Do not publish this log; it may contain signing/account details.`);return result.stdout;};
    const credentials=auth(env),provisioning=c.allowProvisioningUpdates?['-allowProvisioningUpdates']:[];
    const archive=join(dir,'App.xcarchive');
    if(action==='archive'){
      if(receipt.archiveHash){if(await treeHash(archive)!==receipt.archiveHash)throw Error('Archive hash changed');return {status:'ARCHIVED',path:archive,reused:true};}
      const selector=[c.project?'-project':'-workspace',resolve(root,c.project??c.workspace!),'-scheme',c.scheme,'-configuration',c.configuration];
      const settings=JSON.parse(await run([...selector,'-showBuildSettings','-json','-destination','generic/platform=iOS'],'settings'));
      const target=Array.isArray(settings)?settings.find((s:{target:string})=>s.target===c.target):undefined;
      if(!target?.buildSettings||target.buildSettings.PRODUCT_BUNDLE_IDENTIFIER!==c.bundleId||target.buildSettings.MARKETING_VERSION!==c.version||target.buildSettings.CURRENT_PROJECT_VERSION!==c.build)throw Error('Resolved bundle/version/build differ from the approved plan');
      if(c.signing==='manual') for(const row of settings){
        const b=row.buildSettings;
        if(b?.PRODUCT_BUNDLE_IDENTIFIER && (row.target===c.target || /application|app-extension/.test(b.PRODUCT_TYPE??''))) {
          if(b.CODE_SIGN_STYLE!=='Manual'||b.DEVELOPMENT_TEAM!==c.teamId||!c.provisioningProfiles?.[b.PRODUCT_BUNDLE_IDENTIFIER]||b.PROVISIONING_PROFILE_SPECIFIER!==c.provisioningProfiles[b.PRODUCT_BUNDLE_IDENTIFIER]) throw Error('Configure matching manual team/profile settings for every app and extension target before archiving');
        }
      }
      await verifyShip(root,id);
      try{await lstat(archive);throw Error('Unreceipted archive exists; inspect it before creating a new plan');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
      await run([...selector,'-destination','generic/platform=iOS','-archivePath',archive,'CODE_SIGNING_ALLOWED=YES','CODE_SIGNING_REQUIRED=YES',`DEVELOPMENT_TEAM=${c.teamId}`,`CODE_SIGN_STYLE=${c.signing==='automatic'?'Automatic':'Manual'}`, ...provisioning,...credentials,'archive'],'archive');
      await verifyShip(root,id);
      const archiveInfo=await runner.run('/usr/bin/plutil',['-convert','json','-o','-',join(archive,'Info.plist')],{timeoutMs:30000});
      if(archiveInfo.exitCode!==0)throw Error('Cannot inspect archive identity');
      const info=JSON.parse(archiveInfo.stdout).ApplicationProperties;
      if(info?.CFBundleIdentifier!==c.bundleId||info?.CFBundleShortVersionString!==c.version||info?.CFBundleVersion!==c.build||info?.Team!==c.teamId)throw Error('Archived identity differs from approved release');
      const app=await confined(archive,`Products/${info.ApplicationPath}`);
      const signed=await runner.run('/usr/bin/codesign',['--verify','--deep','--strict',app],{timeoutMs:60000});if(signed.exitCode!==0)throw Error('Archive signature verification failed');
      receipt={archive:'App.xcarchive',archiveHash:await treeHash(archive)};await atomic(receiptFile,receipt);return {status:'ARCHIVED',path:archive,reused:false};
    }
    if(!receipt.archiveHash||await treeHash(archive)!==receipt.archiveHash)throw Error('Archive missing or changed; archive the approved release first');
    if(receipt.upload==='accepted')return {status:'UPLOAD_ACCEPTED_PROCESSING_UNKNOWN',reused:true};
    if(receipt.upload)throw Error('Previous upload outcome is uncertain. Check App Store Connect before any retry; automatic resubmission is disabled.');
    const ledger=join(root,'.ios-agent','ship',`upload-${digest(canonical({team:c.teamId,bundle:c.bundleId,version:c.version,build:c.build}))}.json`);
    try{await writeFile(ledger,JSON.stringify({plan:id,status:'in_progress'}),{flag:'wx',mode:0o600});}
    catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;throw Error('This release identity already has an upload attempt. Check App Store Connect; automatic duplicate upload is disabled.');}
    const options={method:'app-store-connect',destination:'upload',teamID:c.teamId,signingStyle:c.signing,manageAppVersionAndBuildNumber:false,...(c.provisioningProfiles?{provisioningProfiles:c.provisioningProfiles}:{})};
    const optionsPath=join(dir,'ExportOptions.plist');await writeFile(optionsPath,plist.build(options),{mode:0o600});
    receipt.upload='in_progress';receipt.at=new Date().toISOString();await atomic(receiptFile,receipt);
    try{await run(['-exportArchive','-archivePath',archive,'-exportPath',join(dir,'export'),'-exportOptionsPlist',optionsPath,...provisioning,...credentials],'upload');receipt.upload='accepted';await atomic(receiptFile,receipt);await atomic(ledger,{plan:id,status:'accepted'});}catch(e){receipt.upload='uncertain';await atomic(receiptFile,receipt);await atomic(ledger,{plan:id,status:'uncertain'});throw e;}
    return {status:'UPLOAD_ACCEPTED_PROCESSING_UNKNOWN',message:'Check App Store Connect for processing, export compliance and TestFlight availability. No testers were assigned and no App Review submission was made.'};
  }finally{await rm(lock,{recursive:true,force:true});}
}

export async function shipCLI(args:string[]):Promise<number>{
  if(args.includes('--help')||args.includes('-h')||!args.length){console.log('ios-agent-mcp ship --project DIR --config ship.json\nios-agent-mcp ship --project DIR --archive --approve ID\nios-agent-mcp ship --project DIR --upload --approve ID\nPrepare first; inspect SHIP_PLAN.md. Signing/provisioning and uploading require separate explicit approval. No App Review or public release.');return 0;}
  const flags=new Map<string,string|boolean>();for(let i=0;i<args.length;i++){const key=args[i]!;if(!['--project','--config','--archive','--upload','--approve'].includes(key)||flags.has(key))throw Error(`Invalid/duplicate ship option: ${key}`);if(['--archive','--upload'].includes(key))flags.set(key,true);else{const value=args[++i];if(!value||value.startsWith('--'))throw Error(`Missing value for ${key}`);flags.set(key,value);}}
  const root=String(flags.get('--project')??'');if(!root)throw Error('--project is required');
  if(flags.has('--archive')&&flags.has('--upload'))throw Error('Archive and upload need separate reviewed invocations');
  if(flags.has('--archive')||flags.has('--upload')){if(flags.has('--config'))throw Error('Prepare config separately');if(!flags.has('--approve'))throw Error('--approve ID is required');console.log(JSON.stringify(await executeShip(root,String(flags.get('--approve')),flags.has('--archive')?'archive':'upload'),null,2));}
  else{if(flags.has('--approve')||!flags.has('--config'))throw Error('Preparation needs --config, not --approve');console.log(JSON.stringify(await prepareShip(root,await readJSON(resolve(String(flags.get('--config'))))),null,2));}return 0;
}
