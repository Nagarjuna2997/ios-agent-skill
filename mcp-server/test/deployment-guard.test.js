import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeAvailability} from '../dist/analyzers/availability.js';
const check=(content, options={deploymentTarget:'17.0'})=>analyzeAvailability({path:'View.swift',content},options);
test('deployment: an API included in the deployment target needs no guard',()=>assert.deepEqual(check('Text("x").glassEffect()', {deploymentTarget:'26.0'}),[]));
test('deployment: unrelated guard does not protect a later use',()=>assert.ok(check('if #available(iOS 18, *) { print("yes") }\nText("x").glassEffect()').some(f=>f.rule==='missing-availability-guard')));
test('deployment: an insufficient enclosing guard still fails',()=>assert.ok(check('if #available(iOS 18, *) { Text("x").glassEffect() }').some(f=>f.rule==='missing-availability-guard')));
test('deployment: annotated types and extensions protect only their members',()=>{
 for(const kind of ['struct V','extension V']){
  const code=`@available(iOS 26, *)\n${kind} { var body: some View { Text("x").glassEffect() } }\nfunc other() { Text("x").glassEffect() }`;
  const f=check(code).filter(f=>f.rule==='missing-availability-guard');assert.equal(f.length,1);assert.equal(f[0].line,3);
 }
});
test('deployment: symbols supplied by an SDK table are checked',()=>assert.ok(check('newSDKModifier()', {deploymentTarget:'17',symbols:[{name:'newSDKModifier',version:'18.2',kind:'func'}]}).some(f=>f.rule==='missing-availability-guard')));

import {sdkSymbols,combineSymbols} from '../dist/availability/sdk.js';
import {resolveTargets} from '../dist/availability/projects.js';
import {compilerFindings,reviewAvailability} from '../dist/availability/review.js';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('scope: else is not protected; comments and strings do not act as guards',()=>{
 assert.equal(check('if #available(iOS 26, *) { Text("x").glassEffect() } else { Text("x").glassEffect() }').length,1);
 assert.equal(check('// if #available(iOS 26, *)\nlet text = "#available(iOS 26, *)"\nText("x").glassEffect()').length,1);
 assert.equal(check('// Text("x").glassEffect()\nlet s = "glassEffect()"').length,0);
});
test('scope: guard applies after else until the enclosing function ends',()=>{
 const f=check('func a() { guard #available(iOS 26, *) else { return }; Text("x").glassEffect() }\nfunc b() { Text("x").glassEffect() }');assert.equal(f.length,1);assert.equal(f[0].line,2);
});
test('scope: annotation on a sibling declaration cannot protect a use',()=>assert.equal(check('@available(iOS 26, *)\nstruct A {}\nstruct B { var body: some View { Text("x").glassEffect() } }').length,1));
test('unknown target suppresses deployment guesses',()=>assert.deepEqual(check('Text("x").glassEffect()', {deploymentTarget:null}),[]));
test('SDK extraction inherits extension availability and conservatively combines overloads',()=>{
 const s=combineSymbols(sdkSymbols('@available(iOS 18.2, *)\nextension View {\n public func newSDKModifier()\n}\n@available(iOS 18, *)\npublic func overloaded()\npublic func overloaded()','SwiftUI'));
 assert.deepEqual(s.map(x=>[x.name,x.version]),[['newSDKModifier','18.2']]);
 assert.equal(check('newSDKModifier()', {deploymentTarget:'18.1',symbols:s}).length,1);
 assert.equal(check('newSDKModifier()', {deploymentTarget:'18.10',symbols:s}).length,0);
});
test('project.yml and Package.swift literal targets; unknown is explicit',()=>{
 const y=resolveTargets(new Map([['project.yml','name: App\ntargets:\n  App:\n    platform: iOS\n    deploymentTarget: "26.0"\n    sources: [Sources]'],['Sources/App.swift','import SwiftUI']]));
 assert.equal(y[0].deploymentTarget,'26.0');assert.equal(y[0].files.length,1);
 assert.equal(resolveTargets(new Map([['Package.swift','let p = Package(platforms: [.iOS(.v18_2)])']]))[0].deploymentTarget,'18.2');
 assert.equal(resolveTargets(new Map())[0].deploymentTarget,null);
 assert.equal(resolveTargets(new Map(),'26.1')[0].deploymentTarget,'26.1');
});
function pbx(target='17.0',extra='') {return `{objects = { P = { isa = PBXProject; targets = (T); buildConfigurationList = PC; }; PC = {buildConfigurations = (PR);}; PR = {name = Release; buildSettings = {SDKROOT = iphoneos;};}; T = {isa = PBXNativeTarget; name = App; buildConfigurationList = TC; buildPhases = (S);}; TC = {buildConfigurations = (TR);}; TR = {name = Release; buildSettings = {IPHONEOS_DEPLOYMENT_TARGET = ${target}; ${extra}};}; S = {isa = PBXSourcesBuildPhase; files = (B);}; B = {fileRef = F;}; F = {path = View.swift; sourceTree = SOURCE_ROOT;}; }; rootObject = P; }`;}
test('pbx target membership and configuration are preserved',()=>{
 const t=resolveTargets(new Map([['App.xcodeproj/project.pbxproj',pbx('26')],['View.swift','import SwiftUI'],['Other.swift','let unrelated = 1']]))[0];
 assert.equal(t.deploymentTarget,'26');assert.deepEqual(t.files.map(f=>f.path),['View.swift']);assert.equal(t.compilerEligible,true);
});
test('compiler diagnostic parser accepts only project files and iOS errors',()=>{
 const f=compilerFindings("/tmp/app/View.swift:3:5: error: 'glassEffect(_:in:)' is only available in iOS 26.0 or newer\n/sdk/Other.swift:2:3: error: 'API' is only available in iOS 27.0 or newer",'/tmp/app',new Set(['View.swift']));assert.equal(f.length,1);assert.match(f[0].message,/compiler/);assert.equal(f[0].severity,'blocker');
});
test('live local Swift compiler proves the deployment-target case', {skip:process.platform!=='darwin'||process.env.IOS_AGENT_TEST_LOCAL_SDK!=='1'},async t=>{
 const root=await mkdtemp(join(tmpdir(),'deployment-real-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'App.xcodeproj'));await writeFile(join(root,'View.swift'),'import SwiftUI\nstruct V: View { var body: some View { Text("Hello").glassEffect() } }');
 await writeFile(join(root,'App.xcodeproj/project.pbxproj'),pbx('17.0'));
 const a=(await reviewAvailability(root)).targets[0];
 assert.equal(a.compiler,'failed');assert.ok(a.findings.some(f=>f.message.startsWith('[compiler]')));
 await writeFile(join(root,'App.xcodeproj/project.pbxproj'),pbx('26.0'));
 const b=(await reviewAvailability(root)).targets[0];assert.equal(b.compiler,'passed');assert.equal(b.findings.length,0);
});
import {availabilityExit} from '../dist/availability/review.js';
test('bodyless annotated binding does not protect the next function',()=>assert.equal(check('@available(iOS 26, *)\nlet flag = true\nfunc unguarded() { Text("x").glassEffect() }').length,1));
test('commented package platforms are ignored and string versions work',()=>{
 for(const literal of ['.v26','"26.0"'])assert.match(resolveTargets(new Map([['Package.swift',`// platforms: [.iOS(.v17)]\nlet p = Package(platforms: [.iOS(${literal})])`]]))[0].deploymentTarget,/^26/);
});
test('compiler failure, unknown targets, timeout and empty selection are incomplete',()=>{
 for(const status of ['failed','timeout'])assert.equal(availabilityExit({targets:[{compiler:status,deploymentTarget:'17',filesChecked:1,findings:[],limitations:[]}]}),2);
 assert.equal(availabilityExit({targets:[]}),2);
 assert.equal(availabilityExit({targets:[{compiler:'not-run',deploymentTarget:'not detected',filesChecked:1,findings:[],limitations:[]}]}),2);
});
test('sibling declaration modifiers and attributes never inherit a binding annotation',()=>{
 for(const prefix of ['@MainActor','fileprivate','public nonisolated','@MainActor\npublic','private final'])assert.equal(check(`@available(iOS 26, *)\nlet flag = true\n${prefix} func unguarded() { Text("x").glassEffect() }`).length,1,prefix);
});
