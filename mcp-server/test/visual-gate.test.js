import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {evaluateVisualRepair,repairWithGate} from '../dist/app-ir/visual-gate.js';
const hash='a'.repeat(64);
const base=()=>({version:1,sourceHash:hash,referenceHash:hash,screenshotHash:hash,artifactsHash:hash,
 pins:{device:'iPhone',os:'27.0',xcode:'27A266a',appearance:'light',contentSize:'large',locale:'en_US',orientation:'portrait',state:'collapsed',width:1206,height:2622,scale:3,fontConfiguration:'system',referenceRenderer:'pinned-browser',normalizationHash:hash},
 build:'passed',functionality:'passed',accessibility:'passed',layout:'passed',typography:'passed',testsPassed:3,accessibilityIssues:0,clippedElements:0,lineBreakMismatches:0,meanError:0.1,changedFraction:0.2});
const good=()=>({...base(),sourceHash:'b'.repeat(64),meanError:0.01,changedFraction:0.05});
const policy={version:1,maxMeanError:0.02,maxChangedFraction:0.1,maxLineBreakMismatches:0,minimumImprovement:0.001};
test('acceptance requires independent passing checks plus visual thresholds',()=>assert.equal(evaluateVisualRepair(base(),good(),policy).outcome,'accepted'));
for(const key of ['build','functionality','accessibility','layout','typography'])test(`improved pixels cannot outweigh ${key} failure`,()=>assert.equal(evaluateVisualRepair(base(),{...good(),[key]:'failed'},policy).outcome,'rejected'));
for(const key of ['build','functionality','accessibility','layout','typography'])test(`missing ${key} evidence requires review`,()=>assert.equal(evaluateVisualRepair(base(),{...good(),[key]:'unavailable'},policy).outcome,'requires-review'));
for(const [key,value] of [['testsPassed',0],['testsPassed',2],['clippedElements',1],['accessibilityIssues',1],['lineBreakMismatches',1],['changedFraction',0.3]])test(`regression in ${key} rejects`,()=>assert.equal(evaluateVisualRepair(base(),{...good(),[key]:value},policy).outcome,'rejected'));
test('changed reference, pins and unchanged source cannot yield acceptance',()=>{
 for(const candidate of [{...good(),referenceHash:'c'.repeat(64)},{...good(),pins:{...good().pins,appearance:'dark'}},{...good(),sourceHash:hash}])assert.equal(evaluateVisualRepair(base(),candidate,policy).outcome,'requires-review');
});
test('NaN metrics and unknown statuses are rejected by schema',()=>{
 assert.throws(()=>evaluateVisualRepair(base(),{...good(),meanError:NaN},policy));
 assert.throws(()=>evaluateVisualRepair(base(),{...good(),accessibility:'probably'},policy));
});
test('three rejected attempts are durable, capped and not rerun',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));let calls=0;
 try{const options={directory,baseline:base(),policy,verifyCandidate:async()=>{calls++;return {...good(),functionality:'failed'};}};
 const result=await repairWithGate(options);assert.equal(result.outcome,'rejected');assert.equal(calls,3);
 assert.equal((await repairWithGate(options)).attempts.length,3);assert.equal(calls,3);
 const file=join(directory,'attempt-1/result.json');const record=JSON.parse(await readFile(file,'utf8'));record.attempt.evidence.meanError=0;await writeFile(file,JSON.stringify(record));await assert.rejects(repairWithGate(options),/changed/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('interruption does not become pass; failed verifier stops without leaking raw exception',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));try{
 await mkdir(join(directory,'attempt-1'));
 assert.equal((await repairWithGate({directory,baseline:base(),policy,verifyCandidate:async()=>{throw Error('Must not run');}})).outcome,'requires-review');
 await rm(join(directory,'attempt-1'),{recursive:true});
 const result=await repairWithGate({directory,baseline:base(),policy,verifyCandidate:async()=>{throw Error('SECRET');}});
 assert.equal(result.outcome,'requires-review');assert.equal(result.attempts.length,1);assert.ok(!JSON.stringify(result).includes('SECRET'));
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('accepted candidate resumes without another verification and policy changes invalidate ledger',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));let calls=0;try{
 const options={directory,baseline:base(),policy,verifyCandidate:async()=>{calls++;return good();}};
 assert.equal((await repairWithGate(options)).acceptedAttempt,1);assert.equal((await repairWithGate(options)).acceptedAttempt,1);assert.equal(calls,1);
 await assert.rejects(repairWithGate({...options,policy:{...policy,maxMeanError:0.03}}),/changed/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('unknown geometry and accessibility counts cannot masquerade as zero issues',()=>{
 for(const key of ['accessibilityIssues','clippedElements','lineBreakMismatches'])assert.equal(evaluateVisualRepair(base(),{...good(),[key]:null},policy).outcome,'requires-review');
});
test('hash-consistent ledger cannot accept a result without verifier evidence',async()=>{
 const {sha256}=await import('../dist/app-ir/schema.js');const directory=await mkdtemp(join(tmpdir(),'gate-'));
 try {await repairWithGate({directory,baseline:base(),policy,verifyCandidate:async()=>good()});
 const file=join(directory,'attempt-1/result.json');const record=JSON.parse(await readFile(file,'utf8'));delete record.attempt.evidence;record.hash=sha256(JSON.stringify(record.attempt));
 await writeFile(file,JSON.stringify(record));
 await assert.rejects(repairWithGate({directory,baseline:base(),policy,verifyCandidate:async()=>good()}),/Missing verifier evidence/);
 } finally {await rm(directory,{recursive:true,force:true});}
});

test('an adapter can limit its strategy budget to one without a fake failed second attempt',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));let calls=0;
 try {const result=await repairWithGate({directory,baseline:base(),policy,maxAttempts:1,verifyCandidate:async()=>{calls++;return {...good(),functionality:'failed'};}});assert.equal(result.outcome,'rejected');assert.equal(calls,1);assert.equal(result.attempts.length,1);}
 finally {await rm(directory,{recursive:true,force:true});}
});
test('explicit checkpoint-backed recovery reuses the reserved attempt number',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));try{
 await mkdir(join(directory,'attempt-1'));let number;
 const result=await repairWithGate({directory,baseline:base(),policy,maxAttempts:1,resumeInterrupted:true,verifyCandidate:async n=>{number=n;return good();}});
 assert.equal(number,1);assert.equal(result.acceptedAttempt,1);
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('saved decisions validate external checkpoint artifacts when a verifier is supplied',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gate-'));try{
 const options={directory,baseline:base(),policy,maxAttempts:1,verifyCandidate:async()=>good()};await repairWithGate(options);
 await assert.rejects(repairWithGate({...options,verifySavedEvidence:async()=>{throw Error('artifact missing');}}),/artifact missing/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
