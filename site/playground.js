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
const art=document.querySelector('.hero-art');
const motion=document.querySelector('.motion-toggle');
let paused=reduced.matches;
function updateMotion(){
  document.body.classList.toggle('motion-paused',paused||reduced.matches);
  motion.hidden=reduced.matches;
  motion.setAttribute('aria-pressed',String(paused));
  motion.querySelector('span').textContent=paused?'Resume motion':'Pause motion';
  motion.querySelector('img').src=`assets/icons/${paused?'play':'pause'}.svg`;
}
updateMotion();
document.body.classList.add('motion-ready');
reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion();});
motion.addEventListener('click',()=>{paused=!paused;updateMotion();});
stage.addEventListener('pointermove',event=>{
  if(paused||reduced.matches||event.pointerType!=='mouse') return;
  const box=stage.getBoundingClientRect();
  art.style.setProperty('--rx',`${(0.5-(event.clientY-box.top)/box.height)*4}deg`);
  art.style.setProperty('--ry',`${((event.clientX-box.left)/box.width-0.5)*6}deg`);
});
stage.addEventListener('pointerleave',()=>{art.style.setProperty('--rx','0deg');art.style.setProperty('--ry','0deg');});
// Avoid a permanent animation loop in background tabs or when the artwork is offscreen.
const visibility=new IntersectionObserver(entries=>{
  art.querySelector('img').style.animationPlayState=entries[0].isIntersecting?'':'paused';
});
visibility.observe(stage);
fetch('npm-downloads-details.json').then(response=>{if(!response.ok)throw new Error('Unavailable');return response.json();}).then(data=>{
  if(data.package!=='ios-agent-mcp'||!Number.isSafeInteger(data.downloads)||data.downloads<0||!/^\d{4}-\d{2}-\d{2}$/.test(data.through))return;
  document.getElementById('download-count').textContent=data.downloads.toLocaleString();
  document.getElementById('download-period').textContent=`npm downloads through ${data.through} · refreshed daily`;
}).catch(()=>{});
