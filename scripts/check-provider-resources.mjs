// Explicit network check only; writes nothing and never imports remote instructions.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile(new URL('../resources/providers.json',import.meta.url),'utf8'));
const report=[];
for(const source of manifest.sources){try{const response=await fetch(source.url,{redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`HTTP ${response.status}`);const reader=response.body.getReader();const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5_000_000){await reader.cancel();throw Error('Response exceeds limit');}chunks.push(value);}const bytes=Buffer.concat(chunks);report.push({...source,status:'fetched',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:size,action:'Review content and validate API/model changes before changing the registry. A changed hash is not a semantic compatibility change.'});}catch{report.push({...source,status:'unavailable',action:'Check source manually; existing registry retained.'});}}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),changesApplied:false,sources:report},null,2));
