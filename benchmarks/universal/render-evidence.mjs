// Optional offline review surface. Reads saved evidence; never runs or approves an app.
import {readFile,writeFile,realpath,lstat} from 'node:fs/promises';
import {resolve,join,basename,relative,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
const escape=value=>String(value??'unavailable').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function renderEvidence(directory,output){
 const root=await realpath(directory);
 async function read(name,max){
  const p=join(root,name),stat=await lstat(p);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>max)throw Error('Invalid evidence file: '+name);
  const resolved=await realpath(p),rel=relative(root,resolved);if(rel.startsWith('..')||isAbsolute(rel))throw Error('Evidence escapes root');
  const data=await readFile(resolved);if(data.length>max)throw Error('Evidence grew beyond limit');return data;
 }
 const report=JSON.parse((await read('report.json',16*1024*1024)).toString());
 if(!Array.isArray(report.runs)||report.runs.length>10)throw Error('Unsupported report');
 async function image(name,label){
  try {const data=await read(name,10*1024*1024);if(!data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Not PNG');return `<figure><img alt="${escape(label)}" src="data:image/png;base64,${data.toString('base64')}"><figcaption>${escape(label)}</figcaption></figure>`;}
  catch(e){if(e.code==='ENOENT')return `<p>${escape(label)} unavailable</p>`;throw e;}
 }
 const panels=[];
 for(const run of report.runs){
  if(typeof run.folder!=='string')throw Error('Missing run folder');const folder=basename(run.folder);if(!folder||folder==='.'||folder==='..'||folder.includes('\\'))throw Error('Invalid run folder');
  const evidence=run.evidence??{};
  const captures=await Promise.all(['normalized.png','difference.png'].map((n,i)=>image(join(folder,n),i?'Difference from reference':'Native app')));
  panels.push(`<section><h2>${escape(run.name)}</h2><dl>${['build','functionality','accessibility','layout','typography','lineBreakMismatches','meanError','changedFraction'].map(k=>`<dt>${escape(k)}</dt><dd>${escape(evidence[k])}</dd>`).join('')}</dl><div class="images">${captures.join('')}</div><details><summary>Recorded measurements and test results</summary><pre>${escape(JSON.stringify({build:run.build??null,large:run.large,xxxl:run.xxxl,evidence},null,2))}</pre></details></section>`);
 }
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><title>Native conversion evidence</title><style>:root{color-scheme:light dark;font:17px system-ui}body{max-width:1100px;margin:auto;padding:24px;line-height:1.5}section{border-top:1px solid gray;padding-block:24px}.images{display:flex;flex-wrap:wrap;gap:24px}figure{margin:0;flex:1;min-width:240px;max-width:420px}img{width:100%;height:auto}dl{display:grid;grid-template-columns:minmax(140px,1fr) 2fr;gap:8px}dd{margin:0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}summary{cursor:pointer;padding:12px}small{display:block}</style><main><h1>Native conversion evidence</h1><p>Status: <strong>${escape(report.status)}</strong> · Adapter: ${escape(report.adapter??'html')}</p><p>This is saved evidence, not a live simulator or an approval. Missing data remains unavailable. No baseline promotion is performed.</p><details><summary>Capture environment</summary><pre>${escape(JSON.stringify(report.profile,null,2))}</pre></details><section><h2>Source reference</h2>${await image('reference.png','Source reference')}</section>${panels.join('')}<section><h2>Repair decision</h2><pre>${escape(JSON.stringify({repair:report.repair??null,failureCategory:report.failureCategory??null,error:report.error??null,candidateFailure:report.candidateFailure??null},null,2))}</pre></section></main></html>`;
 await writeFile(resolve(output),html,{flag:'wx'});return {path:resolve(output),status:report.status,runs:report.runs.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const [dir,out]=process.argv.slice(2);if(!dir||!out)throw Error('Usage: render-evidence.mjs EVIDENCE_DIRECTORY NEW_HTML_FILE');console.log(await renderEvidence(dir,out));}
