import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
test('Grok verifier distinguishes healthy discovery from failed or incomplete evidence',async t=>{
 const root=await mkdtemp(join(tmpdir(),'grok-probe-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'dist'));await writeFile(join(root,'package.json'),' {"version":"test"}');
 const server=join(root,'dist/unified.js');await writeFile(server,'');const binary=join(root,'grok');
 const good={servers:[{name:'ios-agent',healthy:true,checks:[{label:'handshake OK',passed:true,detail:'protocol test'},{label:'82 tools discovered',passed:true}]}],failing_count:0,healthy_count:1};
 for(const [result,pass] of [[good,true],[{...good,failing_count:1},false],[{...good,servers:[{name:'ios-agent',healthy:true,checks:[]}]},false]]){
  await writeFile(binary,`#!${process.execPath}\nif(process.argv.includes('--version'))console.log('fake-test-client');else {console.error('PRIVATE_SENTINEL');console.log(${JSON.stringify(JSON.stringify(result))});}`,{mode:0o700});
  const r=spawnSync(process.execPath,[fileURLToPath(new URL('../../scripts/verify-grok.mjs',import.meta.url)),binary,server],{encoding:'utf8',timeout:10000});
  assert.equal(r.status===0,pass,r.stderr);assert.doesNotMatch(r.stdout+r.stderr,/PRIVATE_SENTINEL/);
  if(pass){const evidence=JSON.parse(r.stdout);assert.equal(evidence.toolCount,82);assert.equal(evidence.modelSessionVerified,false);assert.equal(evidence.toolExecutionVerified,false);}
 }
});
test('Grok verifier cancellation terminates its owned process group and removes temp config',{skip:process.platform==='win32'},async t=>{
 const {spawn}=await import('node:child_process');const {readFile}=await import('node:fs/promises');
 const root=await mkdtemp(join(tmpdir(),'grok-cancel-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const marker=join(root,'started.json'),binary=join(root,'grok');
 await writeFile(binary,`#!${process.execPath}\nconst fs=require('fs');if(process.argv.includes('--version'))console.log('fake');else {fs.writeFileSync(${JSON.stringify(marker)},JSON.stringify({pid:process.pid,cwd:process.cwd()}));setInterval(()=>{},1000);}`,{mode:0o700});
 const child=spawn(process.execPath,[fileURLToPath(new URL('../../scripts/verify-grok.mjs',import.meta.url)),binary,join(root,'dist/unified.js')],{stdio:'ignore'});
 t.after(()=>child.kill('SIGKILL'));let record;
 for(let i=0;i<100;i++){try{record=JSON.parse(await readFile(marker,'utf8'));break;}catch{await new Promise(r=>setTimeout(r,20));}}
 assert.ok(record,'probe started');const closed=new Promise(r=>child.once('close',r));child.kill('SIGTERM');assert.equal(await closed,143);
 await assert.rejects(readFile(join(record.cwd,'.grok/config.toml')));
 let stopped=false;for(let i=0;i<100;i++){try{process.kill(record.pid,0);}catch{stopped=true;break;}await new Promise(r=>setTimeout(r,20));}
 assert.ok(stopped,'detached child stopped');
});
