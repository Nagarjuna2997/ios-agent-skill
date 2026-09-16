'use strict';
const clients = {
  claude: {command:'claude mcp add ios-agent -- npx -y ios-agent-mcp@latest', hint:'Run from your app folder, then reconnect Claude Code.', label:'Claude'},
  codex: {command:'codex mcp add ios-agent -- npx -y ios-agent-mcp@latest', hint:'Connect in your local Codex coding environment, then confirm the tools are available.', label:'Codex'},
  gemini: {command:'gemini mcp add ios-agent -- npx -y ios-agent-mcp@latest', hint:'Run from your project folder, then restart Gemini CLI.', label:'Gemini CLI'},
  muse: {command:'npm install -g ios-agent-mcp@latest', hint:'First install outside the sandbox. Then follow the guide to add the server to Muse settings.', label:'Muse Code'}
};
const tabs = [...document.querySelectorAll('[data-client]')];
function selectClient(tab) {
  const client = clients[tab.dataset.client];
  tabs.forEach(item => {item.setAttribute('aria-selected',String(item===tab)); item.tabIndex=item===tab?0:-1;});
  document.getElementById('client-panel').setAttribute('aria-labelledby',tab.id);
  document.getElementById('install-command').textContent=client.command;
  document.getElementById('setup-hint').textContent=client.hint;
  const guide=document.getElementById('client-guide');
  guide.href=`install.html#${tab.dataset.client}`;
  guide.firstChild.textContent=`${client.label} setup and usage guide `;
  document.getElementById('copy-status').textContent='';
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',()=>selectClient(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
    else if(event.key==='Home') next=0;
    else if(event.key==='End') next=tabs.length-1;
    else return;
    event.preventDefault(); selectClient(tabs[next]); tabs[next].focus();
  });
});
const copy=document.getElementById('copy-install');
copy.hidden=false;
copy.addEventListener('click',async()=>{
  const status=document.getElementById('copy-status');
  try {await navigator.clipboard.writeText(document.getElementById('install-command').textContent);status.textContent='Copied. Paste into your terminal.';}
  catch {status.textContent='Select the command above and copy it manually.';}
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stage=document.querySelector('.hero-stage');
const motion=document.querySelector('.motion-toggle');
const reset=document.querySelector('.reset-objects');
const objects=[...stage.querySelectorAll('.play-object')];
let frozen=false;
const states=new Map(objects.map(object=>[object,{x:0,y:0,drag:null,timer:null}]));
function paint(object,state) {
  object.style.setProperty('--drag-x',`${state.x}px`);
  object.style.setProperty('--drag-y',`${state.y}px`);
}
function settle(object) {
  const state=states.get(object);
  if(state.drag && object.hasPointerCapture(state.drag.id))object.releasePointerCapture(state.drag.id);
  state.drag=null;state.x=0;state.y=0;
  clearTimeout(state.timer);
  object.classList.remove('dragging','hovering','nudged');
  object.style.setProperty('--tilt-x','0deg');object.style.setProperty('--tilt-y','0deg');
  paint(object,state);
}
function updateMode(){
  stage.classList.toggle('objects-frozen',frozen);
  motion.setAttribute('aria-pressed',String(frozen));
  motion.querySelector('span').textContent=frozen?'Unfreeze objects':'Freeze objects';
  motion.querySelector('img').src=`assets/icons/${frozen?'play':'pause'}.svg`;
  objects.forEach(object=>object.setAttribute('aria-disabled',String(frozen)));
}
objects.forEach(object=>{
  object.disabled=false;
  const state=states.get(object);
  object.addEventListener('pointerdown',event=>{
    if(frozen||event.button!==0||state.drag)return;
    clearTimeout(state.timer);object.classList.remove('nudged');
    state.drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:state.x,y:state.y};
    object.classList.add('dragging');object.setPointerCapture(event.pointerId);
  });
  object.addEventListener('pointermove',event=>{
    if(frozen)return;
    if(state.drag && event.pointerId===state.drag.id){
      // Keep objects near their original places; vertical touch movement remains page scrolling.
      const limit=Math.min(100,stage.clientWidth*.12);
      state.x=Math.max(-limit,Math.min(limit,state.drag.x+event.clientX-state.drag.startX));
      state.y=Math.max(-70,Math.min(70,state.drag.y+event.clientY-state.drag.startY));
      paint(object,state);return;
    }
    if(event.pointerType!=='mouse'||reduced.matches)return;
    const box=object.getBoundingClientRect();
    object.classList.add('hovering');
    object.style.setProperty('--tilt-x',`${(.5-(event.clientY-box.top)/box.height)*12}deg`);
    object.style.setProperty('--tilt-y',`${((event.clientX-box.left)/box.width-.5)*14}deg`);
  });
  object.addEventListener('pointerleave',()=>{
    if(!state.drag){object.classList.remove('hovering');object.style.setProperty('--tilt-x','0deg');object.style.setProperty('--tilt-y','0deg');}
  });
  for(const eventName of ['pointerup','pointercancel','lostpointercapture'])object.addEventListener(eventName,event=>{
    if(state.drag?.id===event.pointerId)settle(object);
  });
  object.addEventListener('keydown',event=>{
    if(frozen)return;
    const deltas={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
    if(event.key==='Escape'||event.key==='Home'){event.preventDefault();settle(object);return;}
    const delta=deltas[event.key];if(!delta)return;
    event.preventDefault();const limit=Math.min(100,stage.clientWidth*.12);
    state.x=Math.max(-limit,Math.min(limit,state.x+delta[0]));state.y=Math.max(-70,Math.min(70,state.y+delta[1]));paint(object,state);
  });
  object.addEventListener('click',event=>{
    // Enter/Space also provides a small, local response for keyboard activation.
    if(event.detail!==0||frozen||reduced.matches)return;
    object.classList.add('nudged');clearTimeout(state.timer);state.timer=setTimeout(()=>object.classList.remove('nudged'),350);
  });
});
motion.hidden=false;reset.hidden=false;
motion.addEventListener('click',()=>{frozen=!frozen;objects.forEach(settle);updateMode();});
reset.addEventListener('click',()=>objects.forEach(settle));
reduced.addEventListener('change',()=>objects.forEach(settle));
window.addEventListener('blur',()=>objects.forEach(settle));
updateMode();
fetch('npm-downloads-details.json').then(response=>{if(!response.ok)throw new Error('Unavailable');return response.json();}).then(data=>{
  if(data.package!=='ios-agent-mcp'||!Number.isSafeInteger(data.downloads)||data.downloads<0||!/^\d{4}-\d{2}-\d{2}$/.test(data.through))return;
  document.getElementById('download-count').textContent=data.downloads.toLocaleString();
  document.getElementById('download-period').textContent=`npm downloads through ${data.through} · refreshed daily`;
}).catch(()=>{});
