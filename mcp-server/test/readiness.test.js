import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {project,ids,openstep,plist} from './helpers/launch-project.js';
import {reviewReadiness,metadataFindings} from '../dist/analyzers/readiness.js';
async function fixture(t,{source='',info={},settings={},resources=['LaunchScreen.storyboard','Assets.xcassets'],manifest}={}){
 const root=await fs.mkdtemp(join(tmpdir(),'readiness-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const data=await project(root,{info:{UILaunchScreen:{},ITSAppUsesNonExemptEncryption:false,...info},settings,resources});
 if(source)await fs.writeFile(join(root,'App.swift'),source);
 if(manifest)await fs.writeFile(join(root,'PrivacyInfo.xcprivacy'),plist.build(manifest));
 return {root,data};
}
const rules=r=>r.findings.map(f=>f.rule);
const noLaunch=['Assets.xcassets','PrivacyInfo.xcprivacy'];
const privacyCases=[['UserDefaults','UserDefaults.standard.string(forKey: "x")'],['SystemBootTime','ProcessInfo.processInfo.systemUptime'],['FileTimestamp','FileManager.default.attributesOfItem(atPath: "synthetic")'],['DiskSpace','URLResourceKey.volumeAvailableCapacityKey'],['ActiveKeyboards','UITextInputMode.activeInputModes']];
for(const [category,source] of privacyCases)test(`required reason: ${category} missing vs declared`,async t=>{
 const {root}=await fixture(t,{source,resources:noLaunch,manifest:{NSPrivacyAccessedAPITypes:[]}});
 assert.ok(rules(await reviewReadiness(root)).includes('missing-required-reason'));
 // TEST.1 is a synthetic structural reason, not a claim of Apple applicability.
 await fs.writeFile(join(root,'PrivacyInfo.xcprivacy'),plist.build({NSPrivacyAccessedAPITypes:[{NSPrivacyAccessedAPIType:'NSPrivacyAccessedAPICategory'+category,NSPrivacyAccessedAPITypeReasons:['TEST.1']}]}));
 assert.ok(!rules(await reviewReadiness(root)).includes('missing-required-reason'));
});
test('manifest elsewhere in the repository does not satisfy target membership',async t=>{
 const {root}=await fixture(t,{source:privacyCases[0][1],manifest:{NSPrivacyAccessedAPITypes:[{NSPrivacyAccessedAPIType:'NSPrivacyAccessedAPICategoryUserDefaults',NSPrivacyAccessedAPITypeReasons:['TEST.1']} ]}});
 assert.ok(rules(await reviewReadiness(root)).includes('missing-required-reason'));
});
test('no required-reason evidence does not demand a manifest',async t=>{
 const {root}=await fixture(t,{source:'import Foundation\n// UserDefaults.standard\nlet text = "ProcessInfo.processInfo.systemUptime"'});
 assert.ok(!rules(await reviewReadiness(root)).some(r=>r.includes('privacy')||r.includes('required-reason')));
});
test('malformed category array gets its own finding without fabricated missing reasons',async t=>{
 const {root}=await fixture(t,{source:privacyCases[0][1],resources:noLaunch,manifest:{NSPrivacyAccessedAPITypes:'wrong'}});
 const r=rules(await reviewReadiness(root));assert.ok(r.includes('privacy-reasons-shape'));assert.ok(!r.includes('missing-required-reason'));
});
test('camera purpose string must be nonempty; generated setting is respected',async t=>{
 const source='import AVFoundation\nAVCaptureDevice.requestAccess(for: .video) { _ in }';
 const {root,data}=await fixture(t,{source,info:{NSCameraUsageDescription:''}});
 assert.ok(rules(await reviewReadiness(root)).includes('missing-purpose-string'));
 Object.assign(data.objects[ids.config].buildSettings,{GENERATE_INFOPLIST_FILE:'YES',INFOPLIST_KEY_NSCameraUsageDescription:'Scan your documents'});
 await fs.writeFile(join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 assert.ok(!rules(await reviewReadiness(root)).includes('missing-purpose-string'));
});
test('unresolved xcconfig suppresses missing configuration assertions',async t=>{
 const {root,data}=await fixture(t,{source:'AVCaptureDevice.requestAccess(for: .video) { _ in }'});
 data.objects[ids.config].baseConfigurationReference='other';await fs.writeFile(join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 const r=await reviewReadiness(root);assert.ok(!rules(r).includes('missing-purpose-string'));assert.ok(r.targets[0].limitations.some(x=>x.includes('Info.plist unresolved')));
});
test('health capability false fails, true passes; unused entitlements are not removed',async t=>{
 const {root}=await fixture(t,{source:'import HealthKit\nlet store = HKHealthStore()',settings:{CODE_SIGN_ENTITLEMENTS:'App.entitlements'}});
 await fs.writeFile(join(root,'App.entitlements'),plist.build({'com.apple.developer.healthkit':false}));
 assert.ok(rules(await reviewReadiness(root)).includes('missing-integration-capability'));
 await fs.writeFile(join(root,'App.entitlements'),plist.build({'com.apple.developer.healthkit':true,'unrelated':'keep'}));
 assert.ok(!rules(await reviewReadiness(root)).includes('missing-integration-capability'));
});
test('export answer absence is advisory; invalid type fails; false is a valid declared answer',async t=>{
 const {root}=await fixture(t,{});
 assert.ok(!rules(await reviewReadiness(root)).some(r=>r.startsWith('export-')));
 await fs.writeFile(join(root,'Info.plist'),plist.build({UILaunchScreen:{}}));
 assert.equal((await reviewReadiness(root)).findings.find(f=>f.rule==='export-compliance-answer-needed').severity,'minor');
 await fs.writeFile(join(root,'Info.plist'),plist.build({UILaunchScreen:{},ITSAppUsesNonExemptEncryption:'maybe'}));
 assert.ok(rules(await reviewReadiness(root)).includes('export-compliance-type'));
});
test('metadata length is checked and pricing words are only review suggestions',()=>{
 assert.ok(metadataFindings({name:'X'.repeat(31)}).some(f=>f.rule==='metadata-length'));
 assert.equal(metadataFindings({subtitle:'Free diving journal'})[0].severity,'minor');
 assert.deepEqual(metadataFindings({name:'Dive log',subtitle:'Track your sessions'}),[]);
});
test('unknown selection, library projects and conditional source stay explicit',async t=>{
 const {root,data}=await fixture(t,{source:'#if DEBUG\nUserDefaults.standard\n#endif'});
 const a=await reviewReadiness(root);assert.ok(!rules(a).includes('missing-required-reason'));assert.ok(a.targets[0].limitations.some(x=>x.includes('conditional source')));
 assert.equal((await reviewReadiness(root,{target:'NotThere'})).targets.length,0);
 data.objects[ids.target].productType='com.apple.product-type.framework';await fs.writeFile(join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 assert.equal((await reviewReadiness(root)).targets[0].status,'unsupported-or-not-app');
});
test('selected configuration retains launch findings',async t=>{
 const {root}=await fixture(t);await fs.writeFile(join(root,'Info.plist'),plist.build({ITSAppUsesNonExemptEncryption:false}));
 assert.ok(rules(await reviewReadiness(root,{configuration:'Debug'})).includes('launch-configuration-missing'));
});
test('folder resources make privacy membership unknown',async t=>{
 const {root,data}=await fixture(t,{source:privacyCases[0][1]});
 const ref=Object.values(data.objects).find(o=>o.path==='Assets.xcassets');ref.lastKnownFileType='folder';await fs.writeFile(join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 const r=await reviewReadiness(root);assert.ok(!rules(r).includes('missing-required-reason'));assert.ok(r.targets[0].limitations.some(x=>x.includes('Privacy resource membership unresolved')));
});
test('plist strings are not Boolean export answers, generated YES/NO is normalized',async t=>{
 const {root,data}=await fixture(t,{info:{ITSAppUsesNonExemptEncryption:'NO'}});
 assert.ok(rules(await reviewReadiness(root)).includes('export-compliance-type'));
 Object.assign(data.objects[ids.config].buildSettings,{GENERATE_INFOPLIST_FILE:'YES',INFOPLIST_KEY_ITSAppUsesNonExemptEncryption:'NO'});await fs.writeFile(join(root,'App.xcodeproj/project.pbxproj'),openstep(data));
 assert.ok(!rules(await reviewReadiness(root)).includes('export-compliance-type'));
});
test('explicit project excludes a second app with the same target name',async t=>{
 const {root}=await fixture(t);await fs.mkdir(join(root,'Other'));await project(join(root,'Other'),{info:{}});
 const r=await reviewReadiness(root,{project:'App.xcodeproj',target:'LaunchFixture',configuration:'Debug'});
 assert.equal(r.targets.length,1);assert.equal(r.targets[0].project,'App.xcodeproj/project.pbxproj');assert.ok(!rules(r).includes('launch-configuration-missing'));
});
test('localized purpose strings remain unknown until built-app review',async t=>{
 const {root}=await fixture(t,{source:'AVCaptureDevice.requestAccess(for: .video) { _ in }'});
 await fs.mkdir(join(root,'en.lproj'));await fs.writeFile(join(root,'en.lproj/InfoPlist.strings'),'"NSCameraUsageDescription" = "Scan a page";');
 const r=await reviewReadiness(root);assert.ok(!rules(r).includes('missing-purpose-string'));assert.ok(r.targets[0].limitations.some(l=>l.includes('Localized InfoPlist.strings')));
});
