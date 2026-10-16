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
