import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { project, ids, openstep } from './helpers/launch-project.js';
import { inspectRelease, prepareRelease, verifyPackage } from '../dist/release/package.js';
import { validateProposal } from '../dist/release/intelligence.js';
import { canonical } from '../dist/release/model.js';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ios-release-proposal-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const data = await project(root);
  data.objects[ids.config].name = 'Release';
  data.objects[ids.projectConfig].name = 'Release';
  await fs.writeFile(path.join(root, 'App.xcodeproj/project.pbxproj'), openstep(data));
  return root;
}

test('proposal preserves unknowns, asks for review and does not execute network or write project state', async t => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'App.swift'), 'import SwiftUI\nstruct Home: View { var body: some View { Text("Home") } }');
  const before = await fs.readdir(root);
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw Error('Unexpected network'); };
  let result;
  try { result = await inspectRelease({ root }); } finally { globalThis.fetch = original; }
  assert.deepEqual(await fs.readdir(root), before);
  assert.equal(result.proposal.generation.dataSent, 'NONE');
  assert.equal(result.proposal.metadata.description.value, null);
  assert.equal(result.proposal.review.credentials.value, null);
  assert.equal(result.proposal.validation.checks.build.status, 'NOT_CHECKED');
  assert.ok(result.proposal.questions.some(q => q.id === 'privacy-practices'));
});

test('proposal retains linked evidence and refuses to infer actual collection, age rating, or export answers', async t => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'App.swift'), 'AVCaptureSession()\nWKWebView()\nMFMessageComposeViewController()\nimport CryptoKit');
  const r = await inspectRelease({ root });
  const p = r.proposal;
  assert.equal(p.privacy.items.find(item => item.id === 'camera').collection.status, 'UNKNOWN');
  assert.equal(p.review.ageRating.unrestrictedWebAccess.status, 'INFERRED_NEEDS_CONFIRMATION');
  assert.equal(p.review.ageRating.messaging.status, 'INFERRED_NEEDS_CONFIRMATION');
  assert.equal(p.review.ageRating.violence.value, null);
  assert.equal(p.review.exportCompliance.usesNonExemptEncryption.value, null);
  assert.ok(p.questions.some(q => q.id === 'export-compliance'));
  validateProposal(p, r);
  const altered = structuredClone(p);
  altered.review.exportCompliance.summary.evidence.push('nonexistent-evidence');
  assert.throws(() => validateProposal(altered, r), /missing evidence/);
});

test('private free-form intent is not echoed; old local package schema remains valid', async t => {
  const root = await fixture(t);
  const secret = 'private-user-sentinel';
  const r = await inspectRelease({ root, prompt: `Please make a useful app; ${secret}` });
  assert.ok(!canonical(r).includes(secret));
  const p = await prepareRelease({ root });
  assert.equal((await verifyPackage(p.path)).manifest.packageSchemaVersion, 1);
});

test('a web or messaging indicator keeps privacy practices unknown and asks for review', async t => {
  for (const [code, id] of [['WKWebView()', 'webContent'], ['MFMessageComposeViewController()', 'messaging']]) {
    const root = await fixture(t);
    await fs.writeFile(path.join(root, 'App.swift'), code);
    const r = await inspectRelease({ root, prompt: 'No account required.' });
    assert.equal(r.proposal.privacy.items.find(item => item.id === id).collection.status, 'UNKNOWN');
    assert.ok(r.proposal.questions.some(q => q.id === 'data-handling'));
    assert.equal(r.proposal.review.credentials.status, 'USER_REQUIRED');
  }
});

test('CLI can return the local proposal and reports blocked selection', async t => {
  const root = await fixture(t);
  const cli = new URL('../dist/unified.js', import.meta.url).pathname;
  const good = spawnSync(process.execPath, [cli, 'apple', 'suggest', '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).proposal.validation.checks.tests.status, 'NOT_CHECKED');
  const blocked = spawnSync(process.execPath, [cli, 'apple', 'suggest', '--project', root, '--configuration', 'NotAConfig', '--json'], { encoding: 'utf8' });
  assert.equal(blocked.status, 2, blocked.stderr);
  assert.equal(JSON.parse(blocked.stdout).proposal.validation.status, 'BLOCKED');
});
