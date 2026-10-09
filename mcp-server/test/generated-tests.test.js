import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { newAppSpec, renderProjectYml, infoPlistProperties } from '../dist/agent/spec.js';
import { renderXcodeProject } from '../dist/agent/xcodeproj.js';
import { classifyTestSummary } from '../dist/agent/testing.js';
test('both project writers include separate test targets and runnable schemes', async () => {
 const root = await mkdtemp(join(tmpdir(), 'test-targets-'));
 try {
 const spec = {...newAppSpec({name: 'Probe'}), tests: true};
 const {files} = await renderXcodeProject(root, spec);
 const pbx = files['Probe.xcodeproj/project.pbxproj'];
 assert.match(pbx, /com.apple.product-type.bundle.unit-test/);
 assert.match(pbx, /com.apple.product-type.bundle.ui-testing/);
 assert.match(pbx, /TEST_TARGET_NAME = Probe/);
 assert.match(pbx, /TARGETED_DEVICE_FAMILY = "1,2"/);
 const scheme = files['Probe.xcodeproj/xcshareddata/xcschemes/Probe.xcscheme'];
 assert.equal((scheme.match(/<TestableReference /g)||[]).length, 2);
 const yaml = renderProjectYml(spec);
 assert.match(yaml, /bundle.unit-test/); assert.match(yaml, /bundle.ui-testing/);
 assert.equal(infoPlistProperties(spec)['UISupportedInterfaceOrientations~ipad'].length, 4);
 } finally { await rm(root, {recursive:true,force:true}); }
});
test('test evidence cannot turn absent, skipped or zero tests into passing', () => {
 assert.equal(classifyTestSummary(0, undefined).status, 'unavailable');
 for (const s of [{passedTests:0,failedTests:0,skippedTests:0},{passedTests:2,failedTests:1,skippedTests:0},{passedTests:2,failedTests:0,skippedTests:1}]) assert.equal(classifyTestSummary(0,s).status,'failed');
 assert.equal(classifyTestSummary(65,{passedTests:2,failedTests:0,skippedTests:0}).status,'failed');
 assert.equal(classifyTestSummary(0,{passedTests:2,failedTests:0,skippedTests:0}).status,'passed');
});
test('compiler failures without an xcresult summary are repairable failures', () => {
 assert.equal(classifyTestSummary(65, undefined).status, 'failed');
});
test('refine transports actual screenshot blocks with their screen labels', async () => {
 const {ClaudeCodeBrain} = await import('../dist/agent/brain.js');
 let sent;
 const brain = new ClaudeCodeBrain({runner:{async run(command,args,options){sent={args,input:options.input};return {exitCode:0,stdout:JSON.stringify({type:'result',result:JSON.stringify({files:[]})}),stderr:''};}}});
 await brain.refine({plan:{design:{}},spec:{name:'Probe',capabilities:[],deploymentTarget:'17.0'},change:'Less crowded',capabilities:[],files:[],screenshots:[{screen:{id:'home'},images:[{variant:'light',sha256:'test',data:'actual-pixels'}]}]});
 const content = JSON.parse(sent.input).message.content;
 assert.equal(content[1].source.data,'actual-pixels');
 assert.match(content[0].text,/home: light/);
 assert.ok(sent.args.includes('stream-json'));
});
