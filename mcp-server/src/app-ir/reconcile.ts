// Conservative file-level reconciliation. Never modifies a developer's project.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {readBoundedFile} from './html.js';
import {sha256} from './schema.js';
export type Reconciliation = {
  version:1; outcome:'unchanged'|'keep-local'|'use-generated'|'converged'|'conflict';
  hashes:{base:string;local:string;generated:string};
  candidateHash:string|null; candidate:Buffer|null;
};
export function reconcileSource(base:Buffer,local:Buffer,generated:Buffer):Reconciliation {
  for(const bytes of [base,local,generated]) {
    if(bytes.length>262144)throw Error('Source exceeds 256 KiB');
    new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    if(bytes.includes(0))throw Error('Source must be text, not a binary file');
  }
  const hashes={base:sha256(base),local:sha256(local),generated:sha256(generated)};
  const outcome=local.equals(generated)?(local.equals(base)?'unchanged':'converged'):
    local.equals(base)?'use-generated':generated.equals(base)?'keep-local':'conflict';
  const candidate=outcome==='conflict'?null:Buffer.from(outcome==='use-generated'?generated:local);
  return {version:1,outcome,hashes,candidateHash:candidate?sha256(candidate):null,candidate};
}
export async function reconcileFiles(baseFile:string,localFile:string,generatedFile:string,output:string){
  // Read and validate every input before reserving a new output. Existing paths
  // (including symlinks) are refused by mkdir; no source is edited in place.
  const [base,local,generated]=await Promise.all([baseFile,localFile,generatedFile].map(p=>readBoundedFile(resolve(p))));
  const {candidate,...report}=reconcileSource(base,local,generated);
  const root=resolve(output);await mkdir(root,{recursive:false});
  await writeFile(join(root,'base.swift'),base,{flag:'wx'});
  await writeFile(join(root,'local.swift'),local,{flag:'wx'});
  await writeFile(join(root,'generated.swift'),generated,{flag:'wx'});
  if(candidate!==null)await writeFile(join(root,'candidate.swift'),candidate,{flag:'wx'});
  // Written last: no report means an interrupted/incomplete review bundle.
  await writeFile(join(root,'report.json'),JSON.stringify({...report,
    scope:'single-file, conservative; not semantic Swift or IR merging',
    status:'requires-review',build:'not-run',tests:'not-run',
    guidance:report.outcome==='conflict'?'Both versions changed. Resolve manually; no candidate was emitted.':'Review candidate.swift before applying it. No project files were modified.'
  },null,2)+'\n',{flag:'wx'});
  return {...report,output:root,status:'requires-review' as const};
}
