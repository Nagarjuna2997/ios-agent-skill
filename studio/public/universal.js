const $=id=>document.getElementById(id);let selected,captureURL,viewRequest=0;
async function api(url,body){const r=await fetch('/api/universal'+url,{method:body?'POST':'GET',headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const value=await r.json();if(!r.ok)throw Error(value.error);return value;}
async function list(){const rows=await api('');$('conversions').replaceChildren();for(const row of rows){const b=document.createElement('button');b.textContent=`${row.name} · ${row.adapter} · ${row.status}`;b.onclick=()=>act(()=>show(row.id));$('conversions').append(b);}}
async function show(id){const previousCapture=selected===id?$("capture-history").value:"";selected=id;const request=++viewRequest;for(const key of ["generate","build","cancel","export"])$(key).disabled=true;const [row,data]=await Promise.all([api('/'+id),api('/'+id+'/source')]);if(request!==viewRequest||selected!==id)return;$('detail').hidden=false;$('title').textContent=row.name;$('status').textContent=`${row.status} · tests: ${row.tests} · fidelity: ${row.visualFidelity}${row.error?' · '+row.error:''}`;$('limitations').textContent=JSON.stringify(row.limitations,null,2);$('original').textContent=data.files?data.files.map(f=>'// '+f.path+'\n'+f.source).join('\n\n'):data.input;$('swift').textContent=data.swift??'Not generated';$('ir').textContent=JSON.stringify(data.ir,null,2);$('generate').disabled=row.status!=='inspected'||row.limitations.length>0;$('build').disabled=!['generated-unverified','preview-ready','failed','interrupted','cancelled'].includes(row.status);$('cancel').disabled=!['building','launching','capturing'].includes(row.status);$('export').disabled=!data.swift||['building','launching','capturing','generating'].includes(row.status);$('runs').textContent=JSON.stringify(row.runs??[],null,2);const history=$('capture-history');history.replaceChildren(new Option('Current capture',''));for(const run of row.runs??[]){if(run.status==='preview-ready'&&typeof run.id==='string'&&/^[a-f0-9-]{36}$/.test(run.id)&&run.capture?.runId===run.id)history.add(new Option(`${run.started} · ${run.udid} · ${run.sourceHash.slice(0,12)}`,run.id));}if([...history.options].some(o=>o.value===previousCapture))history.value=previousCapture;await loadCapture(id,history.value,!!history.value||!!row.capture);}
let captureRequest=0;
async function loadCapture(id,runId,available=true){
 const request=++captureRequest;
 if(captureURL){URL.revokeObjectURL(captureURL);captureURL=null;}$('capture').hidden=true;
 $('capture-context').textContent=runId?'Archived capture from the selected run; may differ from current source. Not a test or fidelity pass.':'Current capture for unchanged source. Not a test or fidelity pass.';
 if(!available)return;
 const r=await fetch('/api/universal/'+id+(runId?'/captures/'+runId:'/image'),{headers:{'x-studio-token':document.querySelector('meta[name="studio-token"]').content}});
 if(request!==captureRequest||selected!==id)return;
 if(!r.ok)throw Error((await r.json()).error);
 const blob=await r.blob();if(request!==captureRequest||selected!==id)return;
 captureURL=URL.createObjectURL(blob);$('capture').src=captureURL;$('capture').hidden=false;
}
$('capture-history').onchange=()=>act(()=>loadCapture(selected,$('capture-history').value));

async function act(fn){$('error').textContent='';try{await fn();}catch(e){$('error').textContent=e.message;}}
$('import').onsubmit=e=>{e.preventDefault();act(async()=>{const row=await api('',{name:$('name').value,adapter:$('adapter').value,source:$('source').value});await list();await show(row.id);});};
$('generate').onclick=()=>act(async()=>{const id=selected;$('generate').disabled=true;$('status').textContent='Generating project…';await api('/'+id+'/generate',{});await list();await show(id);});
$('build').onclick=()=>act(async()=>{await api('/'+selected+'/build',$('simulator').value?{udid:$('simulator').value}:{});await show(selected);});
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
$('project-import').onclick=()=>act(async()=>{const row=await api('/project',{name:$('name').value,entry:$('entry').value,files:uploaded});await list();await show(row.id);});

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
