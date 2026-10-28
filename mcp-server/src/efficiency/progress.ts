import {hash,update} from './store.js';
interface State {version:1;cycle:string;signatures:string[];source:string;repeats:number;interventions:number;lastReceipt:string;lastAction?:'continue'|'strategy'|'stop';lastReason?:string;events:Array<{at:string;reason:string;action:'strategy'|'stop';source:string}>}
const initial=():State=>({version:1,cycle:'',signatures:[],source:'',repeats:0,interventions:0,lastReceipt:'',events:[]});
export function diagnosticKeys(errors:Array<{message:string;file?:string;line?:number}>){return [...errors.map(e=>hash([e.file??'',e.message.replace(/\b0x[0-9a-f]+\b/gi,'<address>').replace(/:\d+:\d+/g,':<location>').replace(/\s+/g,' ').trim()]))].sort();}
export async function progressCheck(root:string,input:{cycle:string;receipt:string;errors:Array<{message:string;file?:string}>;source:unknown;threshold:number;phase?:'build'|'tests'}){
 if(!Number.isInteger(input.threshold)||input.threshold<2||input.threshold>10)throw Error('Repeat threshold must be 2–10');
 let action:'continue'|'strategy'|'stop'='continue';let reason='';
 await update(root,input.phase==='tests'?'test-progress.json':'progress.json',initial(),v=>{
  if(v.version!==1||!Array.isArray(v.events)||!Array.isArray(v.signatures))throw Error('Invalid progress state');
  if(v.cycle!==input.cycle)v={...initial(),cycle:input.cycle};
  if(v.lastReceipt===input.receipt){action=v.lastAction??'continue';reason=v.lastReason??'';return v;}
  const keys=diagnosticKeys(input.errors),source=hash(input.source);
  const same=keys.length>0&&hash(keys)===hash(v.signatures);
  v.repeats=same?v.repeats+1:1;
  if(!same)v.interventions=0; // New diagnostics or partial reduction are progress, never stuck.
  if(same&&v.repeats>=input.threshold){action=v.interventions?'stop':'strategy';reason=`Same ${input.phase==='tests'?'acceptance outcome':'compiler diagnostic set'} in ${v.repeats} completed ${input.phase==='tests'?'test runs':'builds'}; ${source===v.source?'source unchanged':'edits did not change diagnostics'}. ${action==='strategy'?'Use a materially different repair strategy; preserve acceptance tests and compiler checks.':'Stopping after the bounded strategy intervention failed.'}`;v.interventions++;v.events.push({at:new Date().toISOString(),reason,action,source});v.events=v.events.slice(-32);}
  return {...v,lastReceipt:input.receipt,signatures:keys,source,lastAction:action,lastReason:reason};
 });return {action,reason};
}
