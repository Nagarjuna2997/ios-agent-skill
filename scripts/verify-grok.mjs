#!/usr/bin/env node
// Runs only version/doctor, never a model prompt. Trust is limited to our temp config.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const [binary,server]=process.argv.slice(2);
if(!binary||!server||process.argv.length!==4)throw Error('Usage: node scripts/verify-grok.mjs /absolute/grok /absolute/dist/unified.js');
if(!path.isAbsolute(binary)||!path.isAbsolute(server))throw Error('Use absolute executable and server paths');
if(process.platform==='win32')throw Error('This verification helper requires POSIX process-group cleanup; use grok mcp doctor directly on Windows');
let activeStop=()=>{};
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ios-grok-'));
const cancel=signal=>{activeStop();fs.rmSync(root,{recursive:true,force:true});process.exit(signal==='SIGINT'?130:143);};
const interrupt=()=>cancel('SIGINT'),terminate=()=>cancel('SIGTERM');
process.on('SIGINT',interrupt);process.on('SIGTERM',terminate);
const run=args=>new Promise((resolve,reject)=>{
 const child=spawn(binary,args,{cwd:root,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});let out='',size=0,problem;
 const stop=()=>{try{if(process.platform==='win32')child.kill();else process.kill(-child.pid,'SIGKILL');}catch{}};
 activeStop=stop;
 const timer=setTimeout(()=>{problem=Error('Grok probe timed out');stop();},60000);
 child.stdout.on('data',d=>{size+=d.length;if(size>4*1024*1024){problem=Error('Grok output exceeded limit');stop();}else out+=d;});
 child.stderr.on('data',d=>{size+=d.length;if(size>4*1024*1024){problem=Error('Grok output exceeded limit');stop();}});
 child.on('error',()=>{clearTimeout(timer);stop();reject(Error('Could not start Grok executable'));});
 child.on('close',code=>{clearTimeout(timer);stop();if(problem||code!==0)reject(problem??Error(`Grok probe exited ${code}; inspect connectivity locally`));else resolve(out);});
});
try{
 fs.mkdirSync(path.join(root,'.grok'));
 fs.writeFileSync(path.join(root,'.grok/config.toml'),`[mcp_servers.ios-agent]\ncommand = ${JSON.stringify(process.execPath)}\nargs = ${JSON.stringify([server,'--project',root])}\nstartup_timeout_sec = 45\n`);
 const version=(await run(['--version'])).trim();
 const result=JSON.parse(await run(['--trust','--cwd',root,'mcp','doctor','ios-agent','--json']));
 const row=result.servers?.find(s=>s.name==='ios-agent');
 const checks=row?.checks??[];const count=checks.find(c=>/^\d+ tools discovered$/.test(c.label));
 if(result.failing_count!==0||result.healthy_count!==1||!row?.healthy||checks.some(c=>!c.passed)||!count||!checks.some(c=>c.label==='handshake OK'))throw Error('Grok MCP discovery not verified');
 const toolCount=Number(count.label.split(' ')[0]);if(!Number.isSafeInteger(toolCount)||toolCount<1)throw Error('No tools discovered');
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),grokVersion:version,serverVersion:JSON.parse(fs.readFileSync(path.resolve(path.dirname(server),'../package.json'),'utf8')).version,transport:'stdio',protocol:checks.find(c=>c.label==='handshake OK').detail,toolCount,healthy:true,modelSessionVerified:false,toolExecutionVerified:false,notes:'Temporary local server configuration; doctor only. No model prompt or provider request.'},null,2));
}finally{activeStop();process.off('SIGINT',interrupt);process.off('SIGTERM',terminate);fs.rmSync(root,{recursive:true,force:true});}
