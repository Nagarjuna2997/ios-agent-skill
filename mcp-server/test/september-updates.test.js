import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {summarizeProject, readSwiftFiles} from '../dist/scan.js';
import {reviewLaunchScreens} from '../dist/analyzers/launch-screen.js';
import {analyzeApp} from '../dist/release/model.js';
import {recognizeAdaptiveAPIs} from '../dist/analyzers/adaptive-apis.js';
import {isXcodeConfiguration, jsonProjectStatus} from '../dist/project-format.js';
async function fixture(t, text='{}') {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'xcproj-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 await fs.mkdir(path.join(root,'Demo.xcodeproj'));await fs.writeFile(path.join(root,'Demo.xcodeproj/project.xcproj'),text);return root;
}
test('JSON configuration inside xcodeproj is detected; standalone suffix is not',async t=>{
 const root=await fixture(t);const summary=await summarizeProject(root,[]);
 assert.equal(summary.hasXcodeProject,true);assert.equal(summary.deploymentTarget,null);
 assert.equal(summary.projectConfigurations[0].status,'json-object-unresolved');
 assert.equal(isXcodeConfiguration('Demo.xcproj'),false);
 assert.equal(isXcodeConfiguration('My App.xcodeproj/project.xcproj'),true);
});
for(const [text,status] of [['{','invalid-json'],['[]','unsupported-json-root'],['null','unsupported-json-root']]) test('JSON validation: '+status+text,async t=>{
 const root=await fixture(t,text);assert.equal(jsonProjectStatus(text),status);
 const report=await reviewLaunchScreens(root);assert.deepEqual(report.findings,[]);assert.ok(report.coverage.some(x=>x.includes(status)));
 const analysis=await analyzeApp({root});assert.equal(analysis.model.status,'BLOCKED');assert.ok(analysis.model.coverage.some(x=>x.includes(status)));
});
test('JSON release selection and workspace are explicitly unresolved, not missing project',async t=>{
 const root=await fixture(t);await fs.mkdir(path.join(root,'Demo.xcworkspace'));await fs.writeFile(path.join(root,'Demo.xcworkspace/contents.xcworkspacedata'),'<Workspace><FileRef location="group:Demo.xcodeproj"/></Workspace>');
 for(const options of [{project:'Demo.xcodeproj'},{project:'Demo.xcodeproj/project.xcproj'},{workspace:'Demo.xcworkspace'}]) {
  const r=await analyzeApp({root,...options});assert.equal(r.model.status,'BLOCKED');assert.ok(r.model.claims.some(c=>c.id==='project-format'));assert.equal(r.model.evidence.length,options.workspace?2:1);
 }
});
test('coexisting formats do not authorize legacy launch assumptions',async t=>{
 const root=await fixture(t);await fs.writeFile(path.join(root,'Demo.xcodeproj/project.pbxproj'),'{ IPHONEOS_DEPLOYMENT_TARGET = 12.0; }');
 assert.equal((await reviewLaunchScreens(root)).configurations,0);
 const explicit=await analyzeApp({root,project:'Demo.xcodeproj/project.pbxproj'});
 assert.ok(explicit.model.claims.some(c=>c.id==='project-format'));
 const summary=await summarizeProject(root,[]);
 assert.equal(summary.projectConfigurations.length,2);assert.equal(summary.deploymentTarget,null);
 await fs.writeFile(path.join(root,'Demo.xcodeproj/NotApp.swift'),'import SwiftUI');
 assert.deepEqual(await readSwiftFiles(root),[]);
});
test('SDK API recognition preserves 27.1 metadata, ignores comments/strings and shadow types',()=>{
 const found=recognizeAdaptiveAPIs([{path:'UI.swift',content:'import SwiftUI\nArrangementView {} secondary: {}\n.arrangementViewStyle(.split)\n.splitArrangementLayoutRatio(0.5)\nlet style: any ArrangementViewStyle\nSplitArrangementViewStyle()\nOverlayArrangementViewStyle()'},{path:'Controller.swift',content:'import UIKit\nUIArrangementViewController()\nUISplitArrangement()\nUIOverlayArrangement()'}]);
 assert.equal(found.length,9);assert.ok(found.every(a=>a.introducedIOS==='27.1'&&a.beta));
 assert.deepEqual(recognizeAdaptiveAPIs([{path:'Other.swift',content:'import SwiftUI\n// ArrangementView\nlet text="ArrangementView"\nstruct ArrangementView {}'}]),[]);
 assert.deepEqual(recognizeAdaptiveAPIs([{path:'Other.swift',content:'ArrangementView()'}]),[]);
});

test('updated guidance is retrievable through the bundled knowledge API',async()=>{
 const {searchLocalReferences,lookupUpdates}=await import('../dist/knowledge.js');
 for(const query of ['ArrangementView','RenderPreview','dialogsDisabled','4.4.1']) assert.ok(searchLocalReferences(query,30).length,query);
 assert.ok(JSON.stringify(lookupUpdates('App Store Connect API',30)).includes('4.4.1'));
});
