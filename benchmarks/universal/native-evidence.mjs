// Render recorded native behavior results; never infer browser fidelity or approve a baseline.
import {basename,join} from 'node:path';
export const nativeFixtures = new Map([['react-boolean-state',3],['react-memory-router',3],['react-controlled-text',3],['react-controlled-text-reset',4]]);
const leaf=value=>{
 if(typeof value!=='string'||!value||value.includes('\\'))throw Error('Invalid attachment path');
 const name=basename(value);if(!name||name==='.'||name==='..')throw Error('Invalid attachment path');return name;
};
function testResult(value){
 if(value===undefined)return undefined;
 if(!value||!['passed','failed','unavailable'].includes(value.status)||
    !['passed','failed','skipped'].every(k=>Number.isInteger(value[k])&&value[k]>=0))throw Error('Invalid native test counts');
 if(value.status==='passed'&&(value.passed===0||value.failed!==0||value.skipped!==0))throw Error('Contradictory native test result');
 return value;
}
export async function nativeEvidencePanels(report,{read,image,escape}){
 if(report.version!==1||!nativeFixtures.has(report.fixture)||report.runs!==undefined||
    (report.visualFidelity!==undefined&&report.visualFidelity!=='not-evaluated')||
    !['running','failed','native-behavior-passed'].includes(report.status))throw Error('Unsupported native report');
 const expected=nativeFixtures.get(report.fixture);
 if(report.expectedTests!==undefined&&report.expectedTests!==expected)throw Error('Fixture test-count contract does not match report');
 const results=Object.fromEntries(['large','xxxl'].map(key=>[key,testResult(report[key]?.tests)]));
 if(report.status==='native-behavior-passed'&&(report.build?.success!==true||report.error!=null||(report.build.errors!==undefined&&(!Array.isArray(report.build.errors)||report.build.errors.length!==0))||Object.values(results).some(r=>r?.status!=='passed'||r.passed!==expected)))throw Error('Contradictory native completion status');
 const panels=[];
 for(const [key,label] of [['large','Large'],['xxxl','XXXL']]){
  const row=report[key],tests=results[key],captures=[];
  if(row?.attachments){
   const folder=leaf(row.attachments);
   let manifest;
   try{manifest=JSON.parse((await read(join(folder,'manifest.json'),1024*1024)).toString());}
   catch(error){if(error.code!=='ENOENT')throw error;}
   if(manifest!==undefined){
    if(!Array.isArray(manifest)||manifest.length>32)throw Error('Invalid attachment manifest');
    const seen=new Set();let count=0;
    for(const test of manifest){
     if(typeof test.testIdentifier!=='string'||!Array.isArray(test.attachments))throw Error('Invalid test attachment record');
     for(const attachment of test.attachments){
      if(++count>64)throw Error('Too many native attachments');
      const name=leaf(attachment.exportedFileName);
      if(name!==attachment.exportedFileName||seen.has(name))throw Error('Unsafe or duplicate attachment filename');seen.add(name);
      if(typeof attachment.isAssociatedWithFailure!=='boolean')throw Error('Missing attachment failure identity');
      if(!name.endsWith('.png'))continue;
      if(captures.length>=8)throw Error('Too many native screenshots');
      const identity=`${attachment.isAssociatedWithFailure?'Failure attachment':'Recorded attachment'} · ${test.testIdentifier} · ${attachment.suggestedHumanReadableName??name}`;
      captures.push(await image(join(folder,name),identity));
     }
    }
   }
  }
  panels.push(`<section><h2>${label} native tests</h2><dl><dt>Recorded status</dt><dd>${escape(tests?.status)}</dd>${['passed','failed','skipped'].map(k=>`<dt>${k}</dt><dd>${escape(tests?.[k])}</dd>`).join('')}</dl><div class="images">${captures.length?captures.join(''):'<p>Screenshots unavailable</p>'}</div><details><summary>Recorded test evidence</summary><pre>${escape(JSON.stringify(tests??{status:'unavailable'},null,2))}</pre></details></section>`);
 }
 return `<section><h2>Native behavior evidence</h2><p>Visual fidelity was not evaluated. This viewer displays saved results; it does not rerun tests or verify checkpoint hashes. Missing artifacts remain unavailable.</p><dl><dt>Fixture</dt><dd>${escape(report.fixture)}</dd><dt>Expected tests per size</dt><dd>${expected}</dd><dt>Recorded build</dt><dd>${report.build?.success===true?'passed':report.build?.success===false?'failed':'unavailable'}</dd><dt>Phase</dt><dd>${escape(report.phase)}</dd><dt>Recorded error</dt><dd>${escape(report.error??'none recorded')}</dd></dl></section>${panels.join('')}`;
}
