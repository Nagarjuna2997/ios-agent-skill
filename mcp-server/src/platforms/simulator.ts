import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {type Runner} from './apple.js';
const system:Runner=async(c,a)=>(await promisify(execFile)(c,a,{timeout:180000,maxBuffer:4_000_000})).stdout;
export async function simulatorCommand(action:string,udid:string,values:string[]=[],run:Runner=system){
 const inventory=JSON.parse(await run('xcrun',['simctl','list','--json']));
 const devices=Object.values(inventory.devices??{}).flat() as {udid:string;isAvailable?:boolean;state:string}[];
 if(action==='create'){
  if(values.length!==2||!inventory.devicetypes?.some((d:any)=>d.identifier===values[0])||!inventory.runtimes?.some((r:any)=>r.identifier===values[1]&&r.isAvailable))throw Error('Choose an installed device type and available runtime from environment.');
  if(!udid||udid.length>80||udid.startsWith('-'))throw Error('Invalid new simulator name');
  return run('xcrun',['simctl','create',udid,...values]);
 }
 const device=devices.find(d=>d.udid===udid&&d.isAvailable!==false);if(!device)throw Error('Choose an available exact simulator UDID.');
 if(action==='open'){
  if(device.state!=='Booted')await run('xcrun',['simctl','boot',udid]);await run('xcrun',['simctl','bootstatus',udid,'-b']);
  const selected=(await run('xcode-select',['-p'])).trim();return run('open',['-a',join(selected,'Applications/Simulator.app'),'--args','-CurrentDeviceUDID',udid]);
 }
 if(['boot','shutdown'].includes(action)&&values.length===0)return run('xcrun',['simctl',action,udid]);
 if(action==='appearance'&&values.length===1&&['light','dark'].includes(values[0]!))return run('xcrun',['simctl','ui',udid,'appearance',values[0]!]);
 if(['launch','terminate','uninstall'].includes(action)&&values.length===1&&/^[a-zA-Z0-9][a-zA-Z0-9.-]+$/.test(values[0]!))return run('xcrun',['simctl',action,udid,values[0]!]);
 if(action==='install'&&values.length===1){const app=resolve(values[0]!);if(!(await lstat(app)).isDirectory()||!app.endsWith('.app'))throw Error('Choose a built .app directory');return run('xcrun',['simctl','install',udid,app]);}
 if(action==='screenshot'&&values.length===1){const out=resolve(values[0]!);if(!out.endsWith('.png'))throw Error('PNG path required');try{await lstat(out);throw Error('Output already exists');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}return run('xcrun',['simctl','io',udid,'screenshot',out]);}
 throw Error('Unsupported simulator action or arguments. Orientation/pose automation is not assumed from a device name.');
}
export async function captureMatrix(udids:string[],output:string,run:Runner=system){if(!udids.length||udids.length>8||new Set(udids).size!==udids.length)throw Error('Choose 1–8 unique simulator UDIDs');await mkdir(resolve(output),{recursive:false});const results=[];for(const udid of udids){try{await simulatorCommand('open',udid,[],run);const file=join(resolve(output),udid+'.png');await simulatorCommand('screenshot',udid,[file],run);results.push({udid,status:'captured',file});}catch{results.push({udid,status:'failed'});}}return {results,note:'Captures current simulator state. This is not build/test success or layout/accessibility verification.'};}
export async function simulatorCLI(args:string[]){if(args[0]==='capture-matrix'&&args.length===3){console.log(JSON.stringify(await captureMatrix(args[1]!.split(','),args[2]!),null,2));return;}if(args.length<2)throw Error('Usage: simulator open|boot|shutdown|create|install|launch|terminate|uninstall|appearance|screenshot UDID [ARGS]');console.log(await simulatorCommand(args[0]!,args[1]!,args.slice(2)));}
