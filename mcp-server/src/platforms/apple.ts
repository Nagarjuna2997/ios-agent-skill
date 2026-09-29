import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
export const platforms={iOS:{sdk:'iphoneos',simulator:'iphonesimulator'},iPadOS:{sdk:'iphoneos',simulator:'iphonesimulator'},macOS:{sdk:'macosx',simulator:null},watchOS:{sdk:'watchos',simulator:'watchsimulator'},tvOS:{sdk:'appletvos',simulator:'appletvsimulator'},visionOS:{sdk:'xros',simulator:'xrsimulator'}} as const;
export function version(value:string):number[]{if(!/^\d+(\.\d+){0,2}$/.test(value))throw Error('Expected numeric platform version, not an SDK label.');return value.split('.').map(Number).concat([0,0]).slice(0,3);}
export function compare(a:string,b:string){const x=version(a),y=version(b);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]!>y[i]!?1:-1;return 0;}
export function availability(buildSDK:string,deploymentTarget:string,introduced:string){return {sdkCanCompile:compare(buildSDK,introduced)>=0,requiresRuntimeGuard:compare(deploymentTarget,introduced)<0,validTarget:compare(buildSDK,deploymentTarget)>=0,note:'A sufficient SDK version does not prove an API exists or an entitlement is available; verify the API declaration.'};}
export type Runner=(command:string,args:string[])=>Promise<string>;
const system:Runner=async(command,args)=>(await promisify(execFile)(command,args,{timeout:30000,maxBuffer:4_000_000})).stdout;
export async function discoverApple(run:Runner=system){
 const commands:[string,string,string[]][]=[['xcode','xcodebuild',['-version']],['developerDirectory','xcode-select',['-p']],['swift','xcrun',['swift','--version']],['sdks','xcodebuild',['-showsdks']],['simulators','xcrun',['simctl','list','--json']],['simctlCapabilities','xcrun',['simctl','help']]];
 const result:Record<string,unknown>={};for(const [key,command,args] of commands){try{const text=await run(command,args);result[key]=key==='simulators'?JSON.parse(text):text.trim();}catch{result[key]={status:'unavailable'};}}
 const inventory=result.simulators as {devicetypes?:{identifier:string;name:string;productFamily?:string}[]};
 result.duoCandidates=(inventory?.devicetypes??[]).filter(d=>/iPhone-Duo/.test(d.identifier));
 result.constraints=['Discovery never installs runtimes or changes selected Xcode.','Duo pose/orientation automation is unsupported unless exposed by the installed documented CLI.','Build SDK and minimum deployment target are independent.','No fixed screen size or fold capability is inferred from a device display name.'];return result;
}
