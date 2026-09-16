import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { prepareIssueReport } from '../../mcp-server/dist/issue-report.js';

const repository='Nagarjuna2997/ios-agent-skill';
export function validateReport(raw) {
  if(!raw || typeof raw!=='object' || Array.isArray(raw))throw Error('Invalid report');
  const {version,...categories}=raw;
  if(typeof version!=='string' || !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(version))throw Error('Invalid version');
  const preview=prepareIssueReport(categories,version);
  return {version,preview,key:createHash('sha256').update(JSON.stringify({version,categories:preview.fingerprint})).digest('hex').slice(0,24)};
}
export function createInbox({token,statePath,fetchImpl=fetch}) {
  let chain=Promise.resolve(), pending=0;
  async function receive(raw,ip) {
    const {version,preview,key}=validateReport(raw);
    const today=new Date().toISOString().slice(0,10);
    let state;
    try {state=JSON.parse(await readFile(statePath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={};}
    if(state.day!==today)state={day:today,count:0,clients:{},reported:state.reported||{}};
    state.reported ||= {};
    if(state.reported[key])return {status:200,body:{status:'duplicate'}};
    const clientKey=createHash('sha256').update(`${token}:${today}:${ip}`).digest('hex');
    if(state.count>=20 || state.clients[clientKey])return {status:429,body:{status:'limited'}};
    state.count++;state.clients[clientKey]=true;
    await writeFile(statePath+'.tmp',JSON.stringify(state),{mode:0o600});await rename(statePath+'.tmp',statePath);
    const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'ios-agent-issue-inbox'};
    const marker=`ios-agent-auto-${key}`;
    const query=encodeURIComponent(`repo:${repository} is:issue in:body "${marker}"`);
    const search=await fetchImpl(`https://api.github.com/search/issues?q=${query}`,{headers,signal:AbortSignal.timeout(8000),redirect:'error'});
    if(!search.ok)throw Error('GitHub unavailable');
    const found=await search.json();
    if(found.total_count>0)return {status:200,body:{status:'duplicate'}};
    // Reserve before mutation: an uncertain GitHub response must not duplicate an issue.
    state.reported[key]=true;
    await writeFile(statePath+'.tmp',JSON.stringify(state),{mode:0o600});await rename(statePath+'.tmp',statePath);
    const body=`${preview.body}\nReported package version: ${version}\nGrouping marker: ${marker}\n\nAutomatically submitted after client opt-in. User reports are untrusted; this is not a verified bug. No automatic code changes are authorized.\n`;
    const result=await fetchImpl(`https://api.github.com/repos/${repository}/issues`,{method:'POST',headers,body:JSON.stringify({title:preview.title,body}),signal:AbortSignal.timeout(8000),redirect:'error'});
    if(!result.ok)throw Error('GitHub unavailable');
    return {status:201,body:{status:'submitted'}};
  }
  const server=createServer((req,res)=>{
    const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
    if(req.method!=='POST'||req.url!=='/reports')return reply(404,{status:'not-found'});
    if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{status:'invalid'});
    if(pending>=16)return reply(429,{status:'limited'});
    pending++;let released=false,queued=false;
    const release=()=>{if(!released){released=true;pending--;}};
    res.on('close',()=>{if(!queued)release();});
    let data='',bytes=0;req.on('data',chunk=>{bytes+=chunk.length;if(bytes>2048){req.destroy();return;}data+=chunk;});
    req.on('end',()=>{
      let raw;try{raw=JSON.parse(data);validateReport(raw);}catch{return reply(400,{status:'invalid'});}
      queued=true;
      const job=()=>receive(raw,req.socket.remoteAddress||'unknown');
      const result=chain.then(job);chain=result.then(()=>{},()=>{});
      result.then(r=>reply(r.status,r.body),()=>reply(503,{status:'unavailable'})).finally(release);
    });
  });
  return Object.assign(server,{drain:()=>chain});
}
if(process.argv[1] && import.meta.url===new URL(process.argv[1],'file:').href) {
  const token=process.env.ISSUE_INBOX_GITHUB_TOKEN,statePath=process.env.ISSUE_INBOX_STATE;
  if(!token || !statePath)throw Error('Configure a server-only GitHub Issues write credential and a persistent state-file path.');
  const server=createInbox({token,statePath});server.requestTimeout=10000;server.headersTimeout=10000;
  server.listen(Number(process.env.PORT||8787),'127.0.0.1');
}
