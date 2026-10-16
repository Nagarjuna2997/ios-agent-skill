// Local unsigned benchmark. No provider, network, scored arms or imported scripts.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {importHTML} from '../../mcp-server/dist/app-ir/html.js';
import {generateProject} from '../../mcp-server/dist/app-ir/swiftui.js';
import {sha256} from '../../mcp-server/dist/app-ir/schema.js';
import {comparePNGs} from '../../mcp-server/dist/app-ir/compare.js';
import {readSpec,writeSpec,regenerate} from '../../mcp-server/dist/agent/project.js';
import {ProcessRunner} from '../../mcp-server/dist/agent/runner.js';
import {buildProject} from '../../mcp-server/dist/agent/build.js';
import {testProject} from '../../mcp-server/dist/agent/testing.js';
import {runApp,screenshot} from '../../mcp-server/dist/agent/simulator.js';
const [output,udid,reference]=process.argv.slice(2);
if(!output||!udid) throw Error('Usage: node benchmarks/universal/run-html.mjs NEW_OUTPUT SIMULATOR_UDID [REFERENCE_PNG]');
const fixture=join(dirname(fileURLToPath(import.meta.url)),'html-disclosure');
const root=resolve(output), runner=new ProcessRunner(), started=Date.now();
const ir=await importHTML(join(fixture,'index.html'),'FieldNotes');
await generateProject(ir,root);
const evidence={schemaVersion:1,fixture:'html-disclosure',sourceHash:ir.sources[0].sha256,irHash:sha256(JSON.stringify(ir)),startedAt:new Date().toISOString(),status:'running',repairs:0,unsupported:ir.limitations};
const save=()=>writeFile(join(root,'VERIFICATION.json'),JSON.stringify(evidence,null,2)+'\n');
await save();
try {
 const xcode=await runner.run('xcodebuild',['-version']); evidence.toolchain=xcode.stdout.trim();
 const spec=await readSpec(root);spec.tests=true;await writeSpec(root,spec);
 for(const suffix of ['Tests','UITests'])await mkdir(join(root,'FieldNotes'+suffix),{recursive:true});
 await copyFile(join(fixture,'InteractionTests.swift'),join(root,'FieldNotesUITests/InteractionTests.swift'));
 await regenerate(root,spec,runner);
 // This fixture has one interaction test; do not imply generated unit test coverage.
 const scheme=join(root,'FieldNotes.xcodeproj/xcshareddata/xcschemes/FieldNotes.xcscheme');
 await writeFile(scheme,(await readFile(scheme,'utf8')).replace(/<TestableReference[^>]*><BuildableReference[^>]*BuildableName="FieldNotesTests.xctest"[^>]*\/><\/TestableReference>/g,''));
 evidence.build=await buildProject(root,runner,{udid});await save();
 if(!evidence.build.success)throw Error('Build failed; inspect saved diagnostics');
 evidence.tests=await testProject(root,runner,udid);await save();
 if(evidence.tests.status!=='passed')throw Error('Interaction test failed or unavailable');
 evidence.launch=await runApp(root,runner,{udid});await save();
 await new Promise(r=>setTimeout(r,2000));
 evidence.screenshot=await screenshot(root,runner,udid,'native');
 evidence.screenshot.sha256=sha256(await readFile(evidence.screenshot.path));await save();
 if(reference){const comparison=comparePNGs(await readFile(resolve(reference)),await readFile(evidence.screenshot.path));evidence.comparison=comparison.report;await writeFile(join(root,'difference.png'),comparison.diff);}
 evidence.status='built-tested-captured';
 evidence.limitations=['One static HTML screen and disclosure behavior only.','Visual comparison requires human review; no fidelity pass is inferred.','No unit tests, backend, cross-framework conversion or model-driven repair validated.'];
} catch(error){evidence.status='failed';evidence.error=error.message;process.exitCode=1;}
finally{evidence.elapsedMs=Date.now()-started;await save();console.log(JSON.stringify(evidence,null,2));}
