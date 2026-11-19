import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { project, ids, openstep } from './helpers/launch-project.js';
import { listReleaseConfirmations, saveReleaseConfirmation, resetReleaseConfirmation } from '../dist/release/confirmations.js';
import { prepareRelease, verifyPackage } from '../dist/release/package.js';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ios-release-confirmation-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const data = await project(root);
  data.objects[ids.config].name = data.objects[ids.projectConfig].name = 'Release';
  await fs.writeFile(path.join(root, 'App.xcodeproj/project.pbxproj'), openstep(data));
  return root;
}
const find = (view, id = 'review.login-required') => view.questions.find(q => q.id === id);

test('inspect is read-only and storage is private, gitignored and restricted to boolean assertions', async t => {
  const root = await fixture(t); const opt = { root };
  const before = await fs.readdir(root), view = await listReleaseConfirmations(opt);
  assert.deepEqual(await fs.readdir(root), before);
  const q = find(view); assert.equal(q.status, 'UNANSWERED');
  await saveReleaseConfirmation(opt, q.id, false, q.fingerprint);
  const saved = find(await listReleaseConfirmations(opt));
  assert.equal(saved.status, 'CONFIRMED'); assert.equal(saved.answer, false);
  const file = path.join(root, '.ios-agent/confirmations/state.json');
  if (process.platform !== 'win32') assert.equal((await fs.stat(file)).mode & 0o777, 0o600);
  const data = await fs.readFile(file, 'utf8'); assert.ok(!data.includes(root)); assert.ok(!data.includes('App.swift'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  assert.equal(spawnSync('git', ['check-ignore', file], { cwd: root }).status, 0);
  await assert.rejects(saveReleaseConfirmation(opt, q.id, 'credential-here', q.fingerprint), /evidence changed/);
  assert.ok(!(await fs.readFile(file, 'utf8')).includes('credential-here'));
});

test('changed source invalidates the saved assertion and stale optimistic writes are rejected', async t => {
  const root = await fixture(t), opt = { root }; const q = find(await listReleaseConfirmations(opt));
  await saveReleaseConfirmation(opt, q.id, true, q.fingerprint);
  await fs.writeFile(path.join(root, 'App.swift'), 'AVCaptureSession()');
  const changed = find(await listReleaseConfirmations(opt));
  assert.equal(changed.status, 'RECONFIRMATION_REQUIRED'); assert.equal(changed.answer, null); assert.notEqual(changed.fingerprint, q.fingerprint);
  await assert.rejects(saveReleaseConfirmation(opt, q.id, true, q.fingerprint), /evidence changed/);
  assert.equal(find(await listReleaseConfirmations(opt)).status, 'RECONFIRMATION_REQUIRED');
  const reconfirmed = find(await saveReleaseConfirmation(opt, q.id, false, changed.fingerprint));
  assert.equal(reconfirmed.status, 'CONFIRMED'); assert.equal(reconfirmed.answer, false);
  assert.equal(find(await resetReleaseConfirmation(opt, q.id)).status, 'UNANSWERED');
});

test('concurrent writes never silently lose a confirmation, malformed files and symlinks are rejected', async t => {
  const root = await fixture(t), opt = { root }; const view = await listReleaseConfirmations(opt), a = view.questions[0], b = view.questions[1];
  const r = await Promise.allSettled([saveReleaseConfirmation(opt, a.id, true, a.fingerprint), saveReleaseConfirmation(opt, b.id, true, b.fingerprint)]);
  assert.ok(r.some(x => x.status === 'fulfilled'));
  for (const x of r.filter(x => x.status === 'rejected')) assert.match(x.reason.message, /locked|EEXIST/);
  const after = await listReleaseConfirmations(opt);
  assert.equal(after.questions.filter(q => q.status === 'CONFIRMED').length, r.filter(x => x.status === 'fulfilled').length);
  const file = path.join(root, '.ios-agent/confirmations/state.json');
  await fs.writeFile(file, '{broken');
  await assert.rejects(listReleaseConfirmations(opt), /malformed or unsafe/);
  await fs.unlink(file); await fs.symlink('/etc/passwd', file);
  await assert.rejects(listReleaseConfirmations(opt), /malformed or unsafe/);
});

test('assertions never change old package schema or remove unresolved release questions', async t => {
  const root = await fixture(t), opt = { root }; const first = await prepareRelease(opt);
  const q = find(await listReleaseConfirmations(opt)); await saveReleaseConfirmation(opt, q.id, true, q.fingerprint);
  const second = await prepareRelease(opt);
  assert.equal((await verifyPackage(first.path)).manifest.packageSchemaVersion, 1);
  assert.equal(second.releaseId, first.releaseId); assert.deepEqual(second.questions, first.questions);
  assert.ok(second.questions.some(q => q.id === 'auth-access'));
});

test('CLI requires matching fingerprint, only yes/no, and provides no remote approval claim', async t => {
  const root = await fixture(t), cli = new URL('../dist/unified.js', import.meta.url).pathname;
  const list = spawnSync(process.execPath, [cli, 'apple', 'confirmations', '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(list.status, 0, list.stderr); const q = find(JSON.parse(list.stdout));
  const bad = spawnSync(process.execPath, [cli, 'apple', 'confirm', '--project', root, '--question', q.id, '--answer', 'password', '--fingerprint', q.fingerprint], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.ok(!bad.stderr.includes('password'));
  const good = spawnSync(process.execPath, [cli, 'apple', 'confirm', '--project', root, '--question', q.id, '--answer', 'yes', '--fingerprint', q.fingerprint, '--json'], { encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr); assert.equal(find(JSON.parse(good.stdout)).status, 'CONFIRMED');
  assert.equal(JSON.parse(good.stdout).status, 'DEVELOPER_ASSERTIONS_ONLY');
});

test('stale or blocked requests do not create any local confirmation files', async t => {
  const root = await fixture(t), opt = { root };
  const q = find(await listReleaseConfirmations(opt));
  await assert.rejects(saveReleaseConfirmation(opt, q.id, true, '0'.repeat(64)), /evidence changed/);
  await assert.rejects(saveReleaseConfirmation({root, configuration:'NotAConfig'}, q.id, true, q.fingerprint), /Resolve project/);
  await assert.rejects(fs.stat(path.join(root, '.ios-agent')), {code:'ENOENT'});
});

test('hard-linked or world-readable state is not accepted or overwritten', async t => {
  if (process.platform === 'win32') return t.skip('POSIX permissions and hard links');
  const root = await fixture(t), opt = { root }, q = find(await listReleaseConfirmations(opt));
  await saveReleaseConfirmation(opt, q.id, true, q.fingerprint);
  const file = path.join(root, '.ios-agent/confirmations/state.json'), link = path.join(root, 'linked.json');
  await fs.link(file, link);
  await assert.rejects(listReleaseConfirmations(opt), /malformed or unsafe/);
  await assert.rejects(saveReleaseConfirmation(opt, q.id, false, q.fingerprint), /malformed or unsafe/);
  await fs.unlink(link); await fs.chmod(file, 0o644);
  await assert.rejects(listReleaseConfirmations(opt), /malformed or unsafe/);
});
