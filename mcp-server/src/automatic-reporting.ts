import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { VERSION } from './version.js';

const configPath = () => join(homedir(), '.config', 'ios-agent', 'reporting.json');
export function reportingEndpoint(value: string): string {
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash) throw Error('Use an HTTPS endpoint without credentials, query or fragment.');
  return u.href;
}
export async function reportingCommand(args: string[]) {
  const path=configPath();
  if(args.length===3 && args[0]==='enable' && args[1]==='--endpoint') {
    const endpoint=reportingEndpoint(args[2]!);
    await mkdir(dirname(path),{recursive:true,mode:0o700});
    await writeFile(path,JSON.stringify({enabled:true,endpoint,consentVersion:1}),{mode:0o600});
    console.log(`Automatic reporting enabled to ${endpoint}. Sends package version, feature/failure categories and platform; the service receives your network IP. Reports may become public GitHub issues. No app code, paths or logs. Disable: ios-agent-mcp reporting disable`);
  } else if(args.length===1 && args[0]==='disable') {
    await mkdir(dirname(path),{recursive:true,mode:0o700});
    await writeFile(path,JSON.stringify({enabled:false}),{mode:0o600});
    console.log('Automatic reporting disabled. Already submitted public issues are not deleted.');
  } else if(args.length===1 && args[0]==='status') {
    try { const c=JSON.parse(await readFile(path,'utf8'));console.log(c.enabled===true ? `Enabled: ${c.endpoint}` : 'Disabled'); }
    catch {console.log('Disabled');}
  } else throw Error('Optional reporting is OFF by default. Enabling consents to sending fixed failure categories and package/platform versions to the chosen service (which receives your IP), potentially as public GitHub issues. No code, paths or logs. Usage: reporting enable --endpoint https://YOUR-SERVICE/reports | reporting disable | reporting status');
}
export function failureCategory(tool: string): string | undefined {
  if(tool==='create_app')return 'app-starter';
  if(tool.startsWith('simulator_') || ['install_app','launch_app','terminate_app','open_deep_link','screenshot','build_project','run_tests'].includes(tool))return 'simulator';
  if(['get_apple_updates','plan_ios_app','plan_app_icon','search_local_references','read_local_reference','get_reference_outline','search_apple_technologies','get_apple_technology'].includes(tool))return 'local-references';
  if(tool.startsWith('review_') || ['analyze_swift_project','check_availability_guards','audit_app_store_readiness'].includes(tool))return 'swift-review';
  return undefined;
}
// No arguments, result bodies or exception text enter this function.
let queue = Promise.resolve();
export function reportToolFailure(tool: string): Promise<void> {
  queue=queue.then(()=>sendToolFailure(tool),()=>sendToolFailure(tool));
  return queue;
}
async function sendToolFailure(tool: string): Promise<void> {
  const feature=failureCategory(tool);if(!feature)return;
  try {
    const path=configPath(), config=JSON.parse(await readFile(path,'utf8'));
    if(config.enabled!==true || config.consentVersion!==1)return;
    const endpoint=reportingEndpoint(config.endpoint);
    const statePath=join(dirname(path),'reporting-last.json');
    let state:Record<string,number>={};try{state=JSON.parse(await readFile(statePath,'utf8'));}catch{}
    const key=`${VERSION}:${feature}`,now=Date.now();if(typeof state[key]==='number' && now-state[key]!<86400000)return;
    // Reserve before sending. Failures never create retry storms.
    state[key]=now;await writeFile(statePath,JSON.stringify(state),{mode:0o600});
    await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({version:VERSION,feature,symptom:'unexpected-error',platform:process.platform==='darwin'?'macos':process.platform==='win32'?'windows':process.platform==='linux'?'linux':'unknown'}),signal:AbortSignal.timeout(3000),redirect:'error'});
  } catch { /* Reporting must never fail the user's app workflow. */ }
}
