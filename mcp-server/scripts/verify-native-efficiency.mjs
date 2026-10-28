#!/usr/bin/env node
// Real unsigned simulator compiler verification, no inference or savings score.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createProject,recordedBuild} from '../dist/agent/workspace.js';
import {ProcessRunner} from '../dist/agent/runner.js';
import {setMemory,observeBuild,fingerprint,inspectMemory,memoryContext} from '../dist/efficiency/memory.js';
import {progressCheck} from '../dist/efficiency/progress.js';
import {detectToolchain} from '../dist/agent/toolchain.js';
const args=process.argv.slice(2),root=resolve(args[1]??'');
if(!['--out','--confirm'].includes(args[0])||!args[1])throw Error('Usage: node scripts/verify-native-efficiency.mjs --out NEW_ABSOLUTE_DIRECTORY');
if(process.platform!=='darwin')throw Error('Native verification requires macOS/Xcode');
const runner=new ProcessRunner(), toolchain=await detectToolchain(runner);
if(!toolchain.xcode||!toolchain.iosSimulatorSdk)throw Error('Installed Xcode and Simulator SDK required');
const environment={xcode:toolchain.xcode,sdk:toolchain.iosSimulatorSdk};
const digest=data=>createHash('sha256').update(data).digest('hex');
if(args[0]==='--confirm'){
 const result=await recordedBuild(root,runner);assert.equal(result.success,true);
 await observeBuild(root,{scheme:result.scheme,destination:result.destination,fingerprint:await fingerprint(root,environment),receipt:randomUUID(),success:true});
 console.log(JSON.stringify({success:result.success,log:result.logPath,sha256:digest(await readFile(result.logPath))}));
}else{
 // Never overwrite prior projects/evidence; use a fresh output directory.
 await mkdir(root,{recursive:false});
 await createProject({projectDir:root,name:'EfficiencyProbe',deploymentTarget:'17.0',capabilities:['color-assets','app-icon']},runner);
 await setMemory(root,true);
 const file=join(root,'EfficiencyProbe','Views','RootView.swift'),results=[];
 for(let i=1;i<=3;i++){
  const source=`import SwiftUI\nstruct RootView: View { var body: some View { Text(verificationValue) } }\nlet verificationValue: String = 42 // attempt ${i}\n`;await writeFile(file,source);
  const result=await recordedBuild(root,runner);assert.equal(result.success,false);assert.ok(result.errors.some(e=>e.file?.endsWith('RootView.swift')&&e.message==="cannot convert value of type 'Int' to specified type 'String'")&&!result.toolError);
  const decision=await progressCheck(root,{cycle:'native-verification-1',receipt:String(i),errors:result.errors,source,threshold:2});
  results.push({buildPassed:result.success,action:decision.action,errors:result.errors.length,log:result.logPath,sha256:digest(await readFile(result.logPath))});
 }
 assert.deepEqual(results.map(r=>r.action),['continue','strategy','stop']);
 await writeFile(file,'import SwiftUI\nstruct RootView: View { var body: some View { Text(verificationValue) } }\nlet verificationValue: String = "Ready"\n');
 const confirmations=[];
 for(let i=0;i<2;i++){
  const stdout=execFileSync(process.execPath,[fileURLToPath(import.meta.url),'--confirm',root],{encoding:'utf8',timeout:900000,maxBuffer:1024*1024});confirmations.push(JSON.parse(stdout));
  assert.equal((await inspectMemory(root)).facts[0].state,i===0?'candidate':'promoted');
 }
 assert.ok((await memoryContext(root,await fingerprint(root,environment))).length>0);
 const evidence={kind:'native-compiler-integration-NOT-model-benchmark',environment,brokenBuilds:results,referenceBuilds:confirmations,memoryState:(await inspectMemory(root)).facts[0].state,modelTokens:null,cost:null,limitations:['No model inference','No simulator launch or UI verification','No savings or model-quality comparison']};
 await writeFile(join(root,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence,null,2));
}
