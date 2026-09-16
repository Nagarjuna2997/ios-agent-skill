import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { reportingEndpoint, failureCategory } from '../dist/automatic-reporting.js';
test('endpoint rejects insecure URLs and category omits reporting itself',()=>{
 for(const u of ['http://example.com/reports','https://user:secret@example.com','https://example.com/?secret=x'])assert.throws(()=>reportingEndpoint(u));
 assert.equal(failureCategory('prepare_issue_report'),undefined);
 for(const tool of ['simulator_boot','build_project','run_tests','install_app','launch_app','terminate_app','open_deep_link','screenshot'])assert.equal(failureCategory(tool),'simulator');
});
test('disabled by default; opt-in sends only fixed fields and throttles; disable stops sends',async()=>{
 const home=await mkdtemp(join(tmpdir(),'report-consent-'));
 try{
 const script=`
 import assert from 'node:assert/strict';
 import {reportingCommand,reportToolFailure} from './dist/automatic-reporting.js';
 let sent=[];globalThis.fetch=async(url,options)=>{sent.push(JSON.parse(options.body));return {ok:true};};
 await reportToolFailure('simulator_boot');assert.equal(sent.length,0);
 await reportingCommand(['enable','--endpoint','https://example.com/reports']);
 await Promise.all([reportToolFailure('simulator_boot'),reportToolFailure('simulator_boot')]);
 assert.equal(sent.length,1);assert.deepEqual(Object.keys(sent[0]).sort(),['feature','platform','symptom','version']);
 await reportingCommand(['disable']);await reportToolFailure('create_app');assert.equal(sent.length,1);
 `;
 execFileSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,HOME:home,USERPROFILE:home},timeout:10000});
 }finally{await rm(home,{recursive:true,force:true});}
});
