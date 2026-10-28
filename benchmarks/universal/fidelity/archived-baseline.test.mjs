import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {seedKnownGood} from '../../../mcp-server/dist/app-ir/known-good.js';
import {evaluateVisualRepair} from '../../../mcp-server/dist/app-ir/visual-gate.js';
const root=new URL('../evidence/local-known-good-20261028/',import.meta.url);
const archive=new URL('../evidence/uikit-ax-harness-fixed-local-20261021/',import.meta.url);
const json=async(base,name)=>JSON.parse(await readFile(new URL(name,base),'utf8'));
async function verifyManifest(base){const manifest=await json(base,'hashes.json');for(const [name,hash]of Object.entries(manifest)){assert.ok(!name.startsWith('/')&&!name.split('/').includes('..'));assert.equal(sha256(await readFile(new URL(name,base))),hash,name);}return Object.keys(manifest).length;}
test('authorized local seed retains archived evidence, exact environment and explicit scope',async()=>{
 await verifyManifest(root);assert.equal(await verifyManifest(archive),44);
 const [baseline,auth,provenance,approval,report]=await Promise.all([json(root,'baseline.json'),json(root,'authorization.json'),json(root,'provenance.json'),json(root,'reference-approval.json'),json(archive,'report.json')]);
 assert.equal(auth.kind,'initial-local-baseline');assert.equal(auth.decision,'authorized');assert.equal(auth.scope.evidenceHash,sha256(JSON.stringify(baseline)));assert.equal(auth.scope.sourceHash,baseline.sourceHash);assert.equal(auth.scope.referenceHash,baseline.referenceHash);assert.equal(auth.scope.pinsHash,sha256(JSON.stringify(baseline.pins)));
 assert.deepEqual(baseline,report.repair.attempts.find(a=>a.number===auth.scope.attempt).evidence);
 assert.equal(provenance.originalReportHash,sha256(await readFile(new URL('report.json',archive))));assert.equal(provenance.archiveManifestHash,sha256(await readFile(new URL('hashes.json',archive))));assert.equal(provenance.referenceApprovalHash,sha256(await readFile(new URL('reference-approval-20261022.json',archive))));
 assert.deepEqual(seedKnownGood(baseline,provenance.policy,approval),baseline);
 assert.equal(provenance.newNativeExecution,false);assert.equal(provenance.productionIntegration,false);assert.equal(provenance.hostedBaselineApproved,false);
 assert.equal(evaluateVisualRepair(report.baseline,baseline,provenance.policy,approval).outcome,'requires-review');
 assert.throws(()=>seedKnownGood(report.baseline,provenance.policy,approval),/verified good/);
 assert.throws(()=>seedKnownGood({...baseline,pins:{...baseline.pins,appearance:'dark'}},provenance.policy,approval),/approval/);
});
