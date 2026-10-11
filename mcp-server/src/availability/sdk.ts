import {readdir, readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';
import {AvailabilitySymbol} from '../analyzers/availability.js';
import {iosVersion,compare} from './scopes.js';
/** Lowest declaration version across overloads. Unknown/older overloads suppress the name. */
export function sdkSymbols(text:string,framework:string):AvailabilitySymbol[]{
 const found:AvailabilitySymbol[]=[],stack:Array<string|undefined>=[];let pending:string|undefined;
 for(const line of text.split('\n')){
  if(line.trimStart().startsWith('//'))continue;
  if(line.includes('@available'))pending=iosVersion(line)??pending;
  const d=/\b(?:public|open)\s+(?:(?:nonisolated|final|static|mutating|class)\s+)*(func|struct|class|enum|protocol|var|macro)\s+([A-Za-z_]\w*)/.exec(line);
  const effective=[...stack,pending].filter((v):v is string=>!!v).sort(compare).at(-1);
  if(d)found.push({name:d[2],kind:d[1],version:effective??'0',framework});
  for(const c of line){if(c==='{')stack.push(effective);else if(c==='}')stack.pop();}
  if(d||/\bextension\s+/.test(line)||line.includes('{')||line.includes('}'))pending=undefined;
 }
 return found;
}
export function combineSymbols(symbols:AvailabilitySymbol[]):AvailabilitySymbol[]{
 const map=new Map<string,AvailabilitySymbol>();
 for(const s of symbols){const old=map.get(s.name);if(!old||compare(s.version,old.version)<0)map.set(s.name,s);}
 return [...map.values()].filter(s=>s.version!=='0');
}
export async function loadSDK(sdk:string,frameworks:string[]){
 const symbols:AvailabilitySymbol[]=[],sources:string[]=[],limitations:string[]=[];let bytes=0;
 const wanted=new Set(frameworks);if(wanted.has('SwiftUI'))wanted.add('SwiftUICore');
 for(const fw of [...wanted].slice(0,40)){
  if(!/^[A-Za-z_]\w*$/.test(fw))continue;
  const dir=join(sdk,'System/Library/Frameworks',fw+'.framework','Modules',fw+'.swiftmodule');
  const paths=(await readdir(dir).catch(()=>[])).filter(p=>/^(?:arm64|x86_64)-apple-ios-simulator\.swiftinterface$/.test(p));
  const name=paths.find(p=>p.startsWith('arm64'))??paths[0];
  if(!name){limitations.push(`${fw}: no public Swift interface; Objective-C headers are not parsed.`);continue;}
  const p=join(dir,name),size=(await stat(p)).size;
  if(size>16_000_000||bytes+size>48_000_000){limitations.push('SDK scan byte limit reached.');continue;}
  bytes+=size;sources.push(p);symbols.push(...sdkSymbols(await readFile(p,'utf8'),fw));
 }
 return {symbols:combineSymbols(symbols),sources,limitations};
}
