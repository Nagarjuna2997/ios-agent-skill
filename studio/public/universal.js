const $=id=>document.getElementById(id);let selected,captureURL,viewRequest=0,revisionParent=null,revisionInput=null;
async function api(url,body){const r=await fetch('/api/universal'+url,{method:body?'POST':'GET',headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const value=await r.json();if(!r.ok)throw Error(value.error);return value;}
async function list(){const rows=await api('');$('conversions').replaceChildren();for(const row of rows){const b=document.createElement('button');b.textContent=`${row.name} · ${row.adapter} · ${row.status}`;b.onclick=()=>act(()=>show(row.id));$('conversions').append(b);}}
async function show(id){const previousCapture=selected===id?$("capture-history").value:"";selected=id;const request=++viewRequest;for(const key of ["generate","build","cancel","export","revision","compare-revision","compare-captures"])$(key).disabled=true;const [row,data]=await Promise.all([api('/'+id),api('/'+id+'/source')]);if(request!==viewRequest||selected!==id)return;$('capture-comparison').hidden=true;$('compare-captures').disabled=!row.revisionOf||!(row.runs??[]).some(r=>r.id&&r.capture?.runId===r.id&&r.status==='preview-ready');$('reconciliation').hidden=true;$('compare-revision').disabled=!row.revisionOf||!row.generatedRootSHA256||['building','launching','capturing','generating'].includes(row.status);revisionInput={adapter:row.adapter,name:row.name,source:data.input};$('revision').disabled=!!data.files||['building','launching','capturing','generating'].includes(row.status);$('revision').title=data.files?'For a multi-file revision, submit all files through the revision API.':'';$('lineage').textContent=row.revisionOf?'Source revision of '+row.revisionOf.id+' · prior IR '+row.revisionOf.irHash:'';$('detail').hidden=false;$('title').textContent=row.name;$('status').textContent=`${row.status} · tests: ${row.tests} · fidelity: ${row.visualFidelity}${row.error?' · '+row.error:''}`;$('limitations').textContent=JSON.stringify(row.limitations,null,2);$('original').textContent=data.files?data.files.map(f=>'// '+f.path+'\n'+f.source).join('\n\n'):data.input;$('swift').textContent=data.swift??'Not generated';$('ir').textContent=JSON.stringify(data.ir,null,2);$('generate').disabled=row.status!=='inspected'||row.limitations.length>0;$('build').disabled=!['generated-unverified','preview-ready','failed','interrupted','cancelled'].includes(row.status);$('cancel').disabled=!['building','launching','capturing'].includes(row.status);$('export').disabled=!data.swift||['building','launching','capturing','generating'].includes(row.status);$('runs').textContent=JSON.stringify(row.runs??[],null,2);const history=$('capture-history');history.replaceChildren(new Option('Current capture',''));for(const run of row.runs??[]){if(run.status==='preview-ready'&&typeof run.id==='string'&&/^[a-f0-9-]{36}$/.test(run.id)&&run.capture?.runId===run.id)history.add(new Option(`${run.started} · ${run.udid} · ${run.sourceHash.slice(0,12)}`,run.id));}if([...history.options].some(o=>o.value===previousCapture))history.value=previousCapture;await loadCapture(id,history.value,!!history.value||!!row.capture);}
let captureRequest=0;
async function loadCapture(id,runId,available=true){
 const request=++captureRequest;
 if(captureURL){URL.revokeObjectURL(captureURL);captureURL=null;}$('capture').hidden=true;$('archived-source').hidden=true;$('archived-swift').textContent='';
 $('capture-context').textContent=runId?'Archived capture from the selected run; may differ from current source. Not a test or fidelity pass.':'Current capture for unchanged source. Not a test or fidelity pass.';
 if(!available)return;
 const r=await fetch('/api/universal/'+id+(runId?'/captures/'+runId:'/image'),{headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content}});
 if(request!==captureRequest||selected!==id)return;
 if(!r.ok)throw Error((await r.json()).error);
 const blob=await r.blob();if(request!==captureRequest||selected!==id)return;
 captureURL=URL.createObjectURL(blob);$('capture').src=captureURL;$('capture').hidden=false;
 if(runId){
  const r=await fetch('/api/universal/'+id+'/captures/'+runId+'/source',{headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content}});
  const source=await r.json();if(request!==captureRequest||selected!==id)return;
  $('archived-source').hidden=false;$('archived-swift').textContent=r.ok?source.source:'Archived source unavailable: '+source.error;
 }
}
$('capture-history').onchange=()=>act(()=>loadCapture(selected,$('capture-history').value));

async function act(fn){$('error').textContent='';try{await fn();}catch(e){$('error').textContent=e.message;}}
$('import').onsubmit=e=>{e.preventDefault();act(async()=>{const row=await api(revisionParent?'/'+revisionParent+'/revision':'',{name:$('name').value,adapter:$('adapter').value,source:$('source').value});clearRevision();await list();await show(row.id);});};
function clearRevision(){revisionParent=null;$('revision-context').hidden=true;$('cancel-revision').hidden=true;}
$('cancel-revision').onclick=clearRevision;
$('revision').onclick=()=>{if(!revisionInput)return;revisionParent=selected;for(const key of ['name','adapter','source'])$(key).value=revisionInput[key];$('revision-context').textContent='Editing a new revision of '+revisionInput.name+'. Original source and evidence will be preserved.';$('revision-context').hidden=false;$('cancel-revision').hidden=false;$('source').focus();};
$('generate').onclick=()=>act(async()=>{const id=selected;$('generate').disabled=true;$('status').textContent='Generating project…';await api('/'+id+'/generate',{});await list();await show(id);});
$('build').onclick=()=>act(async()=>{await api('/'+selected+'/build',{...($('simulator').value?{udid:$('simulator').value}:{}),...($('capture-profile').value?{captureProfile:$('capture-profile').value}:{})});await show(selected);});
$('cancel').onclick=()=>act(()=>api('/'+selected+'/cancel',{}));
setInterval(()=>{if(selected&&['building','launching','capturing'].some(s=>$('status').textContent.startsWith(s)))act(()=>show(selected));},2000);
act(list);

$('export').onclick=()=>act(async()=>{const id=selected;const r=await fetch('/api/universal/'+id+'/export',{method:'POST',headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content,'content-type':'application/json'},body:'{}'});if(!r.ok)throw Error((await r.json()).error);const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download='NativeProject.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);});

let uploaded=[],uploadRequest=0;
$('folder').onchange=()=>act(async()=>{
 const request=++uploadRequest;uploaded=[];$('project-import').disabled=true;$('entry').replaceChildren();
 const files=[...$('folder').files].filter(f=>f.name.endsWith('.tsx'));
 if(!files.length||files.length>32||files.reduce((n,f)=>n+f.size,0)>262144)throw Error('Select 1–32 TSX files totalling at most 256 KiB');
 const loaded=await Promise.all(files.map(async f=>({path:f.webkitRelativePath.split('/').slice(1).join('/'),source:await f.text()})));
 if(request!==uploadRequest)return;
 uploaded=loaded;for(const file of loaded){const option=document.createElement('option');option.value=file.path;option.textContent=file.path;$('entry').append(option);}
 if(loaded.some(f=>f.path==='App.tsx'))$('entry').value='App.tsx';$('project-import').disabled=false;
});
$('project-import').onclick=()=>act(async()=>{const row=await api(revisionParent?'/'+revisionParent+'/revision':'/project',{name:$('name').value,entry:$('entry').value,files:uploaded});clearRevision();await list();await show(row.id);});

let simulatorRequest=0;
async function loadSimulators(){
 const request=++simulatorRequest;const rows=await api('/simulators');if(request!==simulatorRequest)return;
 const selectedDevice=$('simulator').value;$('simulator').replaceChildren(new Option('Automatic available device',''));
 for(const row of rows){$('simulator').append(new Option(`${row.name} · ${row.runtime.replace('com.apple.CoreSimulator.SimRuntime.','')} · ${row.state}`,row.udid));}
 if(selectedDevice&&!rows.some(r=>r.udid===selectedDevice)){const missing=new Option('Selected device unavailable — choose another',selectedDevice);missing.disabled=true;$('simulator').append(missing);}
 $('simulator').value=selectedDevice;
}
$('refresh-simulators').onclick=()=>act(loadSimulators);
act(loadSimulators);

$('compare-revision').onclick=()=>act(async()=>{
 const id=selected,request=viewRequest;const report=await api('/'+id+'/reconciliation');if(selected!==id||viewRequest!==request)return;
 $('reconciliation-result').textContent=report.outcome+' · '+report.scope;
 for(const field of ['base','local','generated','candidate'])$('reconciliation-'+field).textContent=report[field]??'Conflict: no candidate generated. Resolve the two edits manually.';
 $('reconciliation').hidden=false;
});

$('compare-captures').onclick=()=>act(async()=>{
 const id=selected,request=viewRequest;const result=await api('/'+id+'/capture-comparison');if(selected!==id||viewRequest!==request)return;
 $('comparison-conditions').textContent=result.comparison+' · '+result.conditions;
 $('comparison-report').textContent=JSON.stringify({baseline:result.baseline,candidate:result.candidate,...result.report},null,2);
 $('comparison-diff').src='data:image/png;base64,'+result.diff;$('capture-comparison').hidden=false;
});
