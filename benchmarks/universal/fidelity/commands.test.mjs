import {test} from 'node:test';import assert from 'node:assert/strict';
import {runSetupCommand} from './commands.mjs';
const base={exitCode:0,timedOut:false,durationMs:10,stdout:' ready\n',stderr:''};
test('setup success is recorded before returning output',async()=>{
 const records=[];assert.equal(await runSetupCommand({run:async()=>base},'xcrun',['simctl','bootstatus','synthetic','-b'],r=>records.push(r)),'ready');assert.equal(records[0].args[1],'bootstatus');
});
test('timeout, exit and spawn failures preserve evidence even with empty stderr',async()=>{
 for(const patch of [{timedOut:true,exitCode:null},{exitCode:1},{spawnError:'ENOENT',exitCode:null},{timedOut:true}]){
  const records=[];await assert.rejects(runSetupCommand({run:async()=>({...base,...patch})},'xcrun',['simctl','boot'],r=>records.push(r)),/Setup command failed/);assert.equal(records.length,1);assert.equal(records[0].command,'xcrun');assert.equal(records[0].timedOut,patch.timedOut??false);
 }
});
test('setup log output is bounded',async()=>{let record;await runSetupCommand({run:async()=>({...base,stdout:'a'.repeat(9000)})},'xcodebuild',['-version'],r=>record=r);assert.equal(record.stdout.length,8000);});
test('setup failures are infrastructure failures, never visual regression verdicts',async()=>{
 const {classifyRunFailure}=await import('./commands.mjs');
 for(const phase of ['environment-setup','simulator-setup'])assert.equal(classifyRunFailure(phase),'infrastructure_failure');
 assert.equal(classifyRunFailure('app-verification'),'verification_failure');
});

test('only the requested checkpoint interruption is classified as intentional',async()=>{
 const {classifyRunFailure}=await import('./commands.mjs');
 assert.equal(classifyRunFailure('app-verification','Injected interruption after baseline-large','baseline-large'),'interrupted');
 assert.equal(classifyRunFailure('app-verification','Injected interruption after baseline-large'),'verification_failure');
 assert.equal(classifyRunFailure('simulator-setup','xcrun failed','baseline-large'),'infrastructure_failure');
});

test('discovery preserves options/results and records only the exact simulator query',async()=>{
 const {withSimulatorDiscoveryEvidence}=await import('./commands.mjs');const records=[];const options={timeoutMs:60000};
 const runner=withSimulatorDiscoveryEvidence({run:async(c,a,o)=>{assert.equal(o,options);return base;}},r=>records.push(r));
 assert.equal(await runner.run('xcrun',['simctl','list','devices','available','--json'],options),base);
 await runner.run('unrelated',['private'],options);assert.equal(records.length,1);
});
test('discovery failures retain diagnostics and classify as infrastructure without hiding build errors',async()=>{
 const {withSimulatorDiscoveryEvidence,classifyRunFailure}=await import('./commands.mjs');
 for(const patch of [{exitCode:1},{timedOut:true},{spawnError:'ENOENT'}]){
  const records=[];const runner=withSimulatorDiscoveryEvidence({run:async()=>({...base,...patch,stderr:'x'.repeat(9000)})},r=>records.push(r));
  await assert.rejects(runner.run('xcrun',['simctl','list','devices','available','--json']),e=>classifyRunFailure('app-verification',e.message,null,e.code)==='infrastructure_failure');
  assert.equal(records[0].stderr.length,8000);
 }
 assert.equal(classifyRunFailure('app-verification','Build failed'), 'verification_failure');
});

test('only simulator boot receives the explicit five-minute migration budget',async()=>{
 for(const [command,args,expected] of [['xcrun',['simctl','bootstatus','synthetic','-b'],300000],['xcrun',['simctl','boot','synthetic'],120000],['xcodebuild',['-version'],120000]]){
  let record;await runSetupCommand({run:async(c,a,o)=>{assert.equal(o.timeoutMs,expected);return base;}},command,args,r=>record=r);assert.equal(record.timeoutMs,expected);
 }
});

test('candidate evidence retains infrastructure category before the repair gate catches errors',async()=>{
 const {candidateFailureEvidence}=await import('./commands.mjs');
 assert.equal(candidateFailureEvidence(Object.assign(new Error('discovery failed'),{code:'FIDELITY_SIMULATOR_DISCOVERY'})).category,'infrastructure_failure');
 assert.equal(candidateFailureEvidence(new Error('Build failed')).category,'verification_failure');
 assert.equal(candidateFailureEvidence(new Error('x'.repeat(3000))).message.length,2000);
});
