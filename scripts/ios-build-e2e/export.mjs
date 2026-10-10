// Never upload the runner HOME, credentials, node_modules or DerivedData.
import { lstat, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export async function exportEvidence(root, secret = '') {
  const out = join(root,'export'); let bytes = 0;
  await rm(out,{recursive:true,force:true});
  async function copy(path) {
    let st; try {st = await lstat(join(root,path));} catch(e) {if(e.code === 'ENOENT') return; throw e;}
    let ancestor = root;
    for (const part of path.split('/')) {ancestor=join(ancestor,part);if((await lstat(ancestor)).isSymbolicLink()) throw new Error('Symlink in evidence; refusing export');}
    if (st.isSymbolicLink()) throw new Error('Symlink in evidence; refusing export');
    if (st.isDirectory()) {for (const name of await readdir(join(root,path))) await copy(`${path}/${name}`); return;}
    if (!st.isFile()) throw new Error('Non-file evidence');
    bytes += st.size; if(bytes > 250*1024*1024) throw new Error('Evidence exceeds 250 MiB');
    const data = await readFile(join(root,path));
    if(secret && data.includes(Buffer.from(secret))) throw new Error('Provider credential found in evidence; refusing export');
    await mkdir(dirname(join(out,path)),{recursive:true});await writeFile(join(out,path),data);
  }
  for (const p of ['identity.json','result.json','checkpoint.json','plan.log','build.log','app/PLAN.md','app/RUN_REPORT.md',
    'app/.ios-agent/state.json','app/.ios-agent/plan.json','app/.ios-agent/spec.json','app/.ios-agent/logs',
    'app/.ios-agent/screenshots','app/.ios-agent/design-reviews','app/.ios-agent/test-results']) await copy(p);
  try {
    const spec=JSON.parse(await readFile(join(root,'app/.ios-agent/spec.json'),'utf8'));
    const names=[spec.name,...(spec.extensions??[]).map(e=>e.name)];
    if(names.some(n=>typeof n !== 'string'||!/^[A-Z][A-Za-z0-9]*$/.test(n))) throw new Error('Unsafe app name');
    for(const n of names) for(const suffix of ['', 'Tests','UITests','.xcodeproj']) await copy(`app/${n}${suffix}`);
    await copy('app/Config');await copy('app/project.yml');
  } catch(e) {if(e.code !== 'ENOENT') throw e;}
  return bytes;
}
if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if(!process.argv[2]) throw new Error('Usage: export.mjs OUTPUT');
  console.log(`Exported ${await exportEvidence(resolve(process.argv[2]),process.env.ANTHROPIC_API_KEY)} bytes of synthetic evidence`);
}
