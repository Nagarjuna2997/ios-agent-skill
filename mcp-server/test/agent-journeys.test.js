import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createProject, writePlan } from '../dist/agent/workspace.js';
import { readSpec } from '../dist/agent/project.js';
import { testProject } from '../dist/agent/testing.js';
import { PlanSchema } from '../dist/agent/plan.js';
import { journeyTests, journeyStepName } from '../dist/agent/journeys.js';
import { collectJourneyScreenshots, hasJourneyEvidence } from '../dist/agent/journey-evidence.js';

const plan = JSON.parse(await readFile(fileURLToPath(new URL('../../examples/agent/habit-tracker/.ios-agent/plan.json', import.meta.url)), 'utf8'));
const known = plan.journeys[0];

test('plans validate reachable start screen, unique journeys, bounded identifiers, and final observable outcome', () => {
  assert.equal(PlanSchema.safeParse(plan).success, true);
  assert.equal(PlanSchema.safeParse({...plan, journeys:undefined}).success, true);
  for (const journeys of [[known, known], [{...known,startScreen:'missing'}], [{...known,steps:known.steps.slice(0,2)}], [{...known,steps:[{action:'tap',target:'"; foo()'},...known.steps]}]]) {
    assert.equal(PlanSchema.safeParse({...plan, journeys}).success,false);
  }
  const swift = journeyTests([known]);
  assert.equal((swift.match(/UUID\(\).uuidString/g) ?? []).length,1);
  assert.match(swift,/wasOffscreen0 && waitVisible/);
});

test('checkpoint collection only uses the matching XCTest and a valid PNG from its export', async t => {
  const root = await mkdtemp(join(tmpdir(),'ios-journey-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  const step = journeyStepName(known, 0);
  const item = {suggestedHumanReadableName:step + '_0_123.png', exportedFileName:'expected.png'};
  const bytes = Buffer.alloc(24); Buffer.from('89504e470d0a1a0a','hex').copy(bytes);
  const runner = {async run(_cmd,args) {
    const out = args.at(-1);
    await mkdir(out,{recursive:true});
    await writeFile(join(out,'manifest.json'),JSON.stringify([
      {testIdentifier:'WrongSuite/test_persist_check_in()',attachments:[{...item,suggestedHumanReadableName:journeyStepName(known,1) + '.png'}]},
      {testIdentifier:'PlannedJourneyTests/test_persist_check_in()',attachments:[item,{...item,suggestedHumanReadableName:journeyStepName(known,1) + '.png',exportedFileName:'../expected.png'}]},
    ]));
    await writeFile(join(out,item.exportedFileName),bytes);
    return {exitCode:0};
  }};
  const images = await collectJourneyScreenshots(root,'test.xcresult','run',[known],runner);
  assert.equal(images.length,1);
  assert.equal(images[0].step,step);
  assert.equal(images[0].path,'.ios-agent/screenshots/run-' + step + '.png');
  const one = {...known, steps:known.steps.slice(0,1)};
  assert.ok(await hasJourneyEvidence(root,[one],images));
  assert.equal(await hasJourneyEvidence(root,[known],images), false);
  assert.deepEqual(await readFile(join(root,images[0].path)),bytes);
  await writeFile(join(root,images[0].path),Buffer.alloc(bytes.length));
  assert.equal(await hasJourneyEvidence(root,[one],images),false);
  await rm(join(root,images[0].path));
  assert.equal(await hasJourneyEvidence(root,[one],images),false);
});

test('creating a project enables the reviewed journeys and changing their generated assertions blocks execution', async t => {
  const root = await mkdtemp(join(tmpdir(), 'ios-journey-project-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  const runner = {async run(command,args) { return {command,args,exitCode:1,stdout:'',stderr:'not installed',durationMs:1}; }};
  const review = await writePlan(root, plan);
  assert.match(review.markdown, /Simulator journeys/);
  const created = await createProject({ projectDir:root, name:plan.appName }, runner);
  const suite = plan.appName + 'UITests/PlannedJourneyTests.swift';
  assert.ok(created.files.includes(suite));
  assert.equal((await readSpec(root)).tests, true);
  assert.equal(await readFile(join(root,suite),'utf8'), journeyTests(plan.journeys));
  await writeFile(join(root,suite),'// removed check');
  await assert.rejects(testProject(root,runner), /differs from its reviewed plan/);
});
