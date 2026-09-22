import {policyCode as maskPolicyCode} from './policy-code.js';
import {readdir,readFile,lstat} from 'node:fs/promises';
import {join,relative,basename} from 'node:path';
import {resolveProjectRoot} from '../scan.js';
import {appIntentsCode} from '../analyzers/app-intents.js';
import {analyzeSecurity} from '../analyzers/security.js';
import {clientSafeKey,privilegedKey,placeholder} from './credentials.js';
export interface Evidence {file:string;line:number;kind:string;detail:string;confidence:'high'|'medium';}
export interface Risk {file:string;line:number;rule:string;severity:'blocker'|'serious'|'minor';message:string;why:string;fix:string;confidence:'high'|'medium';}
const services=[
 ['Supabase',/^Supabase$/, /^https:\/\/github\.com\/supabase\/supabase-swift(?:\.git)?$/i],
 ['Firebase',/^Firebase(?:Core|Auth|Firestore|Database|Storage|Functions|Messaging|Crashlytics|Analytics|RemoteConfig|AppCheck)?$/, /^https:\/\/github\.com\/firebase\/firebase-ios-sdk(?:\.git)?$/i],
 ['CloudKit',/^CloudKit$/, /never-match$/],
 ['AWS Amplify',/^(?:Amplify|AWSCognitoAuthPlugin|AWSAPIPlugin|AWSS3StoragePlugin|AWSPinpointPushNotificationsPlugin)$/, /^https:\/\/github\.com\/aws-amplify\/amplify-swift(?:\.git)?$/i],
 ['Appwrite',/^Appwrite$/, /^https:\/\/github\.com\/appwrite\/sdk-for-apple(?:\.git)?$/i],
 ['Apollo GraphQL',/^Apollo(?:API|WebSocket|SQLite)?$/, /^https:\/\/github\.com\/apollographql\/apollo-ios(?:\.git)?$/i],
] as const;
const skipped=new Set(['.git','.build','.swiftpm','node_modules','DerivedData','Pods','Carthage','vendor','Vendor','build','Tests','test','fixtures']);
export async function reviewBackendIntegration(path:string){
 const root=await resolveProjectRoot(path),inputs:{file:string;content:string}[]=[],limits=new Set<string>();let bytes=0,dirs=0;
 async function walk(dir:string):Promise<void>{
  if(++dirs>1000){limits.add('Directory limit reached');return;}
  for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
   if(inputs.length>=512||bytes>=8*1024*1024){limits.add('File/byte budget reached');return;}
   if(entry.isSymbolicLink())continue;const full=join(dir,entry.name);
   if(entry.isDirectory()&&!skipped.has(entry.name))await walk(full);
   else if(entry.isFile()&&(/\.(swift|json|plist|env|rules|sql|md)$/.test(entry.name)||entry.name==='.env'||entry.name.startsWith('.env.')||entry.name==='Package.resolved')){
    const size=(await lstat(full)).size;if(size>512*1024||bytes+size>8*1024*1024){limits.add('Oversize files skipped');continue;}
    try{inputs.push({file:relative(root,full),content:await readFile(full,'utf8')});bytes+=size;}catch{limits.add('Unreadable files skipped');}
   }
  }
 }
 await walk(root);
 const found=new Map<string,Evidence[]>(),risks:Risk[]=[],authProviders:Evidence[]=[],usage:Evidence[]=[],configurations:Evidence[]=[];
 const add=(service:string,e:Evidence)=>{if(!found.has(service))found.set(service,[]);const rows=found.get(service)!;if(rows.length<64)rows.push(e);else limits.add('Service evidence capped');};
 const risk=(r:Risk)=>{if(risks.length<128&&!risks.some(x=>x.file===r.file&&x.line===r.line&&x.rule===r.rule))risks.push(r);else if(risks.length>=128)limits.add('Risk output capped');};
 for(const {file,content} of inputs){
  const swift=file.endsWith('.swift'),code=swift?appIntentsCode(content):content;
  const line=(i:number)=>content.slice(0,i).split('\n').length;
  const ev=(i:number,kind:string,detail:string):Evidence=>({file,line:line(i),kind,detail,confidence:'high'});
  if(swift){
   for(const m of code.matchAll(/\bimport\s+([A-Za-z][\w]*)/g))for(const [service,pattern] of services)if(pattern.test(m[1]))add(service,ev(m.index,'import',m[1]));
   if(/\bimport\s+Foundation\b/.test(code)&&/\bURLSession\b/.test(code))add('REST / URLSession',ev(code.indexOf('URLSession'),'API','URLSession'));
   if(/\b(?:URLSessionWebSocketTask|webSocketTask\s*\()/.test(code))add('WebSockets',ev(code.search(/URLSessionWebSocketTask|webSocketTask/),'API','URLSession WebSocket'));
  }
  if(basename(file)==='Package.swift')for(const m of content.matchAll(/\.package\s*\(\s*url:\s*"(https:\/\/[^"\s]+)"/g)){
   if(!code.slice(m.index,m.index+8).trim())continue;
   for(const [service,,pattern]of services)if(pattern.test(m[1]))add(service,ev(m.index,'dependency',service+' Swift package'));
  }
  if(basename(file)==='Package.resolved')try{const data=JSON.parse(content);for(const p of data.pins??data.object?.pins??[]){const location=p.location??p.repositoryURL;if(typeof location==='string')for(const [service,,pattern]of services)if(pattern.test(location))add(service,ev(0,'dependency',service+' resolved package'));}}catch{limits.add('Malformed package lock skipped');}
  if(basename(file)==='GoogleService-Info.plist'&&/<key>GOOGLE_APP_ID<\/key>/.test(content)&&/<key>PROJECT_ID<\/key>/.test(content)){add('Firebase',ev(0,'configuration','Firebase client configuration (values omitted)'));configurations.push(ev(0,'configuration','GoogleService-Info.plist'));}
  if(/^amplify(?:configuration|_outputs)\.json$/.test(basename(file))){try{const d=JSON.parse(content);if(d.auth||d.Auth||d.data){add('AWS Amplify',ev(0,'configuration','Amplify configuration keys'));configurations.push(ev(0,'configuration','Amplify configuration (values omitted)'));}}catch{limits.add('Malformed Amplify configuration skipped');}}
  if(/\.md$/.test(file))continue;
  const emit=(i:number,rule:string,severity:Risk['severity'],message:string,why:string,fix:string,confidence:Risk['confidence']='high')=>risk({file,line:line(i),rule,severity,message,why,fix,confidence});
  // Inspect literal values, never include bytes or complete source lines in output.
  const assignments=swift?/\b(?:let|var)\s+(\w+)\s*(?::\s*String\s*)?=\s*"([^"\n]*)"/g:/["']?([\w-]+)["']?\s*[:=]\s*["']?([^"'\r\n,}]+)["']?/g;
  for(const m of content.matchAll(assignments)){
   if(swift&&!code.slice(m.index,m.index+3).trim())continue;
   const key=m[1],value=m[2].trim();if(placeholder(value)||clientSafeKey(value))continue;
   if(privilegedKey(value)||/^(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY|CLIENT_SECRET|private_key|appwrite_api_key)$/i.test(key)&&value.length>=12){emit(m.index,'backend-privileged-credential','blocker','Privileged credential material is present; value redacted.','A shipped client or committed configuration cannot keep server credentials secret. Repository evidence does not prove current credential validity.','Remove from client artifacts, rotate if real, and perform privileged operations on a trusted server.');}
  }
  if(!swift&&/\.plist$/.test(file))for(const m of content.matchAll(/<key>(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY|CLIENT_SECRET|private_key)<\/key>\s*<string>([^<]+)<\/string>/gi))if(!placeholder(m[2]))emit(m.index,'backend-privileged-credential','blocker','Privileged configuration value in plist; value redacted.','Bundle resources are readable.','Remove, rotate if real, and keep the operation server-side.');
  if(swift){
   // Reuse existing diagnostics; backend response strips excerpts and sensitive messages.
   for(const f of analyzeSecurity({path:file,content})){if(f.rule==='secret-in-userdefaults' && /UserDefaults\.\w+\.set\s*\(\s*(?:\w+\.)*(?:accessToken|refreshToken|password|token|secret|apiKey)\b/i.test(code.split('\n')[f.line-1]??''))risk({file,line:f.line,rule:f.rule,severity:f.severity,message:f.rule==='secret-in-userdefaults'?'Sensitive value written to UserDefaults.':'Potential sensitive value sent to logging.',why:'Credentials can escape the intended authentication boundary.',fix:'Use an appropriate Keychain policy and redact secret-bearing telemetry.',confidence:'medium'});}
   for(const m of code.matchAll(/\b(?:print|debugPrint|NSLog)\s*\(\s*(?:\w+\.)*(?:accessToken|refreshToken|password|otp|serviceRoleKey)\s*\)/gi))emit(m.index,'backend-token-logging','serious','Credential-shaped value passed directly to logging.','Logs may be collected or retained outside the session.','Log a fixed event and safe correlation identifier; omit the credential.');
   const imports=[...code.matchAll(/\bimport\s+(\w+)/g)].map(m=>m[1]);
   const backend=imports.some(m=>services.some(([,p])=>p.test(m)));
   if(backend){
    for(const m of code.matchAll(/\b(provider|signInWithOAuth)\s*[:(]\s*\.?(apple|google|github|facebook|azure|linkedin_oidc|discord|slack_oidc|spotify|twitch|twitter)\b/g))if(authProviders.length<128)authProviders.push(ev(m.index,'auth-provider',m[2]));
    for(const [name,re] of [['Apple',/\bASAuthorizationAppleIDProvider\b/],['Google',/\bGIDSignIn\b/],['email/password',/\bsignIn\s*\(\s*(?:withEmail|email):/],['OTP / magic link',/\bsignInWithOTP\s*\(/],['anonymous',/\bsignInAnonymously\s*\(/],['callback handler',/\bsession\s*\(\s*from:|\bhandle\s*\(\s*url:/],['auth-state observer',/\bauthStateChanges\b|\baddStateDidChangeListener\b/]] as const){const m=re.exec(code);if(m&&authProviders.length<128)authProviders.push(ev(m.index,'auth',name));}
    for(const [name,re] of [['database',/\b(?:Firestore|Database|CKDatabase|CKRecord|TablesDB)\b|\.from\s*\(/],['storage',/\b(?:Storage|CKAsset)\b|\.storage\b/],['realtime',/\bRealtime\b|\baddSnapshotListener\b|\.channel\s*\(/]] as const){const m=re.exec(code);if(m&&usage.length<128)usage.push(ev(m.index,'usage',name));}
   }
   // Discarding the response is concrete; no blanket search for a statusCode anywhere in a file.
   for(const m of code.matchAll(/let\s*\(\s*\w+\s*,\s*_\s*\)\s*=\s*try\s+await\s+URLSession\.shared\.data\s*\(/g))emit(m.index,'backend-discarded-http-response','serious','Raw URLSession response is discarded.','A decoded body alone cannot distinguish HTTP success from an error response.','Retain HTTPURLResponse and validate the endpoint’s status contract before decoding.');
   for(const m of code.matchAll(/while\s+true\s*\{\s*(?:try\??\s+await\s+)?(?:\w+\.)*(?:connect|reconnect)\s*\(\s*\)\s*\}/g))if(/webSocketTask|URLSessionWebSocketTask/.test(code))emit(m.index,'backend-unbounded-reconnect','serious','Immediate unbounded reconnect loop.','No visible delay or cancellation boundary exists in this loop; reconnection can consume battery and hammer the server.','Use bounded backoff with jitter, explicit cancellation, foreground recovery and one connection owner.');
  }
  const policyCode=maskPolicyCode(content);
  if(/\.sql$/.test(file))for(const m of policyCode.matchAll(/ALTER\s+TABLE\s+([\w.]+)\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY/gi)){
   const later=policyCode.slice(m.index+m[0].length);const table=m[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(!new RegExp('ALTER\\s+TABLE\\s+'+table+'\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY','i').test(later))emit(m.index,'backend-rls-disabled','serious','SQL explicitly disables row-level security.','This is repository migration evidence, not proof of deployed policy state.','Review exposed schemas and authorization tests before applying this migration.');
  }
  if(/\.rules$/.test(file))for(const m of policyCode.matchAll(/allow\s+(?:read|write|create|update|delete)(?:\s*,\s*\w+)*\s*:\s*if\s+true\s*;/g))emit(m.index,'backend-open-firebase-rule','serious','Unconditional Firebase allow rule in this file.','If deployed to a protected collection this grants broad access. This may instead be an isolated emulator fixture.','Scope access to the intended identity and data; test unauthenticated and cross-user denial before deployment.');
 }
 const awareness=(re:RegExp)=>inputs.filter(x=>/\.(md|sql|rules)$/.test(x.file)&&re.test(x.content)).slice(0,20).map(x=>({file:x.file,detail:'Reference present, not a policy audit'}));
 return {schemaVersion:1,services:[...found].map(([name,evidence])=>({name,evidence})),configurations,authProviders,usage,risks,reviewQuestions:[{topic:'Supabase RLS',evidence:awareness(/row.level.security|\bRLS\b/i),question:'Verify deployed policies using two users and an unauthenticated client. Missing local documentation is not proof of missing RLS.'},{topic:'Firebase Security Rules',evidence:awareness(/rules_version|Firestore.*rules|Security Rules/i),question:'Verify deployed rules/emulator denial tests; authentication alone is not authorization.'},{topic:'Account and app lifecycle',question:'If accounts exist, inspect deletion, session restoration and sign-out cache clearing. Check third-party login against current App Review 4.8 exceptions; absence cannot be proven by this scan.'}],limitations:[...limits,'No network calls, SDK execution, policy deployment audit or secret values in the response.','Lexical evidence is not a compiler diagnostic or proof of a secure backend. Arbitrary aliases, constructed credentials, binary plists and remote configuration can be missed. Quoted SQL identifiers and procedure bodies are not analyzed.','Pagination, cancellation, retry idempotency, endpoint environment choice and background behavior require contextual review; absence is not diagnosed from keywords.','Source and configuration filenames are local evidence. Do not upload this report without the developer’s authorization.']};
}
