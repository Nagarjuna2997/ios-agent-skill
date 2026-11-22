// Opt-in simulator acceptance for a two-screen import and its source revision.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { UniversalStudio } from './universal.mjs';

const [destination, evidenceDir] = process.argv.slice(2);
if (!destination || !evidenceDir) throw Error('Usage: node studio/check-screen-setup.mjs SIMULATOR_UDID NEW_EVIDENCE_DIRECTORY');
await mkdir(evidenceDir);
const studio = new UniversalStudio(resolve(evidenceDir), resolve('.'));
await studio.init();
const input = {adapter:'react',name:'TrailSetup',source:await readFile('benchmarks/universal/react-navigation/App.tsx','utf8')};
async function capture(row) {
  await studio.generate(row.id);
  await studio.startBuild(row.id,{udid:destination,setupName:'Walk'});
  await studio.jobs.get(row.id);
  const result = await studio.get(row.id);
  assert.equal(result.status,'preview-ready',result.error);
  console.log('Verified screen capture:',join(studio.dir(row.id),'captures',result.capture.runId + '.png'));
}
const parent = await studio.create(input);
await studio.saveScreenSetup(parent.id,{name:'Walk',profile:'dark-large',orientation:'portrait',locale:'fr-CA',taps:['screen-1-node-6'],visible:'screen-2-node-3'});
await capture(parent);
const child = await studio.createRevision(parent.id,{...input,source:input.source.replace('quiet woodland','shaded woodland')});
await capture(child);
const comparison = await studio.compareCaptures(child.id);
console.log(comparison.conditions, comparison.report);
