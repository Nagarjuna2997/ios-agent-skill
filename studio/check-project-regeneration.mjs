// On a disposable simulator, regenerate the ReadingShelf fixture and replay user-owned native UI.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {serve} from './server.mjs';
import {captureScreenSetup} from './screen-setup.mjs';

const [udid,output]=process.argv.slice(2);
if(!udid||!output)throw Error('Usage: node studio/check-project-regeneration.mjs SIMULATOR_UDID NEW_EVIDENCE_DIR');
const root=resolve(output);await mkdir(root);
const studio=await serve({port:0,root,repo:resolve('.')});
try {
 const token=(await (await fetch(studio.origin+'/universal')).text()).match(/name="studio-token" content="([a-f0-9]+)"/)[1];
 async function post(path,body) {
   const reply=await fetch(studio.origin+'/api/universal'+path,{method:'POST',headers:{'content-type':'application/json','x-studio-token':token},body:JSON.stringify(body)});
   const data=await reply.json();assert.ok(reply.ok,data.error??JSON.stringify(data));return data;
 }
 const source=await readFile('benchmarks/universal/reading-list/App.tsx','utf8');
 const input={name:'ReadingShelf',adapter:'react',source};
 const parent=await post('',input);assert.equal((await post('/'+parent.id+'/generate',{})).status,'generated-unverified');
 const original=join(studio.universal.dir(parent.id),'project');
 const swiftPath='ReadingShelf/Views/RootView.swift', swiftFile=join(original,swiftPath);
 const current=await readFile(swiftFile,'utf8');
 assert.match(current,/\.navigationBarTitleDisplayMode\(\.inline\)/);
 await writeFile(swiftFile,current.replaceAll('.navigationBarTitleDisplayMode(.inline)', '.navigationBarTitleDisplayMode(.inline)\n                .modifier(ReaderToolbar())'));
 const userSwift='ReadingShelf/Views/ReaderToolbar.swift';
 await writeFile(join(original,userSwift),`import SwiftUI
struct ReaderToolbar: ViewModifier {
    @State private var showing = false
    func body(content: Content) -> some View {
        content.toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Notes") { showing = true }.accessibilityIdentifier("reader-notes")
            }
        }.sheet(isPresented: $showing) {
            Text("My reading notes")
                .foregroundStyle(Color("ReaderInk"))
                .accessibilityIdentifier("reader-notes-title")
        }
    }
}
`);
 const colorset='ReadingShelf/Resources/Assets.xcassets/ReaderInk.colorset/Contents.json';
 await mkdir(join(original,'ReadingShelf/Resources/Assets.xcassets/ReaderInk.colorset'));
 await writeFile(join(original,colorset),JSON.stringify({colors:[{idiom:'universal',color:{'color-space':'srgb',components:{red:'0.000',green:'0.200',blue:'0.250',alpha:'1.000'}}}],info:{author:'xcode',version:1}}));
 execFileSync('xcodegen',['generate','--spec','project.yml'],{cwd:original,stdio:'pipe'});
 const setup={name:'Second book',profile:'light-large',orientation:'portrait',locale:'en-US',taps:['screen-1-node-4-cedar-b'],visible:'screen-2-node-5'};
 await post('/'+parent.id+'/screen-setup',setup);
 const child=await post('/'+parent.id+'/revision',{...input,source:source.replace('Jon Lake','Jon Lake, revised')});
 assert.equal((await post('/'+child.id+'/generate',{})).status,'generated-unverified');
 const review=await post('/'+child.id+'/project-review',{});
 assert.deepEqual(review.blockers,[]);assert.equal(review.files.find(f=>f.path===swiftPath).change,'merged');
 for(const path of [userSwift,colorset])assert.equal(review.files.find(f=>f.path===path).change,'keep-local');
 const row=await post('/'+child.id+'/apply-project',{reviewId:review.reviewId});
 const merged=join(studio.universal.dir(row.id),'project');
 assert.match(await readFile(join(merged,swiftPath),'utf8'),/Jon Lake, revised/);
 assert.match(await readFile(join(merged,'ReadingShelf.xcodeproj/project.pbxproj'),'utf8'),/ReaderToolbar.swift/);
 assert.equal(await readFile(join(original,swiftPath),'utf8'),current.replaceAll('.navigationBarTitleDisplayMode(.inline)', '.navigationBarTitleDisplayMode(.inline)\n                .modifier(ReaderToolbar())'));
 await post('/'+row.id+'/build',{udid,setupName:setup.name});await studio.universal.jobs.get(row.id);
 const complete=await studio.universal.get(row.id);assert.equal(complete.status,'preview-ready',complete.error);
 const capture=await studio.universal.image(row.id,complete.capture.runId);await writeFile(join(root,'second-book.png'),capture);
 const {ProcessRunner}=await studio.universal.module('agent/runner'), runner=new ProcessRunner();
 const toolbarFrame=join(root,'user-toolbar.png');
 await captureScreenSetup({runner,udid,bundle:complete.runs.at(-1).launch.bundleId,output:toolbarFrame,
   setup:{...setup,taps:[...setup.taps,'reader-notes'],visible:'reader-notes-title'}});
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const report={status:'passed',device:complete.runs.at(-1).launch.simulator,xcode:complete.runs.at(-1).environment.xcode,
   sdk:complete.runs.at(-1).environment.iosSimulatorSdk,reviewId:review.reviewId,changes:review.files.filter(f=>f.change!=='unchanged'),
   replay:setup,toolbar:{taps:[...setup.taps,'reader-notes'],visible:'reader-notes-title'},
   captures:{'second-book.png':hash(capture),'user-toolbar.png':hash(await readFile(toolbarFrame))}};
 await writeFile(join(root,'result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
} finally {await new Promise(resolve=>studio.server.close(resolve));}
