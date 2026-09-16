#!/usr/bin/env node
// No credentials or model call: verify real Muse MCP discovery and Stop execution.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const [muse, server] = process.argv.slice(2);
if(!muse || !server) throw Error('Usage: node scripts/verify-muse.mjs /absolute/muse /absolute/ios-agent-mcp/dist/unified.js');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ios-muse-'));
const repo=fileURLToPath(new URL('../',import.meta.url));
const config=path.join(root,'config'), workspace=path.join(root,'project'), log=path.join(root,'protocol.jsonl');
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
try{
 fs.mkdirSync(path.join(config,'muse'),{recursive:true});
 fs.mkdirSync(path.join(workspace,'.claude','skills','ios-agent-skill'),{recursive:true});
 fs.copyFileSync(path.join(repo,'SKILL.md'),path.join(workspace,'.claude','skills','ios-agent-skill','SKILL.md'));
 fs.writeFileSync(path.join(root,'hook.mjs'),`import fs from 'node:fs';fs.writeFileSync(${JSON.stringify(path.join(root,'hook-fired'))},'ok');`);
 fs.writeFileSync(path.join(root,'proxy.mjs'),`
import fs from 'node:fs';import {spawn} from 'node:child_process';
const child=spawn(${JSON.stringify(process.execPath)},[${JSON.stringify(path.resolve(server))}],{stdio:['pipe','pipe','inherit']});
let buffer='';child.stdout.on('data',data=>{process.stdout.write(data);buffer+=data;let i;while((i=buffer.indexOf('\\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+1);try{const m=JSON.parse(line);if(m.result?.tools)fs.appendFileSync(${JSON.stringify(log)},JSON.stringify(m.result.tools.map(t=>t.name))+'\\n');}catch{}}});
process.stdin.pipe(child.stdin);child.on('error',()=>process.exit(1));child.on('exit',c=>process.exit(c??1));process.on('SIGTERM',()=>child.kill());
`);
 fs.writeFileSync(path.join(config,'muse','settings.json'),JSON.stringify({schema_version:1,mcpServers:{'ios-agent':{command:process.execPath,args:[path.join(root,'proxy.mjs')]}},hooks:{Stop:[{hooks:[{type:'command',command:`${quote(process.execPath)} ${quote(path.join(root,'hook.mjs'))}`}]}]}}));
 const env={...process.env,XDG_CONFIG_HOME:config};
 const run=async args=>await new Promise((resolve,reject)=>{
  const child=spawn(path.resolve(muse),args,{env,detached:true,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='',problem;
  const cleanup=()=>{try{process.kill(-child.pid,'SIGKILL');}catch{}};
  const timer=setTimeout(()=>{problem=Error('Muse probe timed out after 45 seconds');cleanup();},45000);
  const collect=(kind,data)=>{if(kind==='out')stdout+=data;else stderr+=data;if(stdout.length+stderr.length>4*1024*1024){problem=Error('Muse output exceeded limit');cleanup();}};
  child.stdout.on('data',data=>collect('out',data));child.stderr.on('data',data=>collect('err',data));
  child.on('error',error=>{clearTimeout(timer);cleanup();reject(error);});
  child.on('close',code=>{clearTimeout(timer);cleanup();if(problem || code!==0)reject(problem || Error(stderr));else resolve(stdout);});
 });
 const version=(await run(['--version'])).trim();
 const serverPackage=JSON.parse(fs.readFileSync(path.join(path.dirname(path.resolve(server)),'../package.json'),'utf8'));
 await run(['exec','--provider','echo','--no-foreign-personal-context','--workspace',workspace,'--trust-workspace','--no-session-log','--json','Local integration smoke test']);
 const tools=JSON.parse(fs.readFileSync(log,'utf8').trim().split('\n')[0]);
 for(const name of ['review_swift_concurrency','search_local_references','create_app','simulator_list'])if(!tools.includes(name))throw Error(`Missing MCP tool: ${name}`);
 if(fs.readFileSync(path.join(root,'hook-fired'),'utf8')!=='ok')throw Error('Stop hook did not execute');
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),museVersion:version,serverPackage:serverPackage.name,serverVersion:serverPackage.version,toolCount:tools.length,tools,stopHookExecuted:true,provider:'echo',modelSessionVerified:false,prePostHooksVerified:false,observerVerified:false},null,2));
}finally{fs.rmSync(root,{recursive:true,force:true});}
