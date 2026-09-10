import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { get } from 'node:http';
import { startViewer } from '../dist/viewer.js';
const udid = '12345678-abcd-1234-abcd-123456789012';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
class FakeRunner {
  calls = [];
  fail = false;
  gate;
  async run(command, args) {
    this.calls.push({ command, args });
    await this.gate;
    if (!this.fail) await writeFile(args.at(-1), png);
    return { command, args, stdout: '', stderr: 'private failure detail', exitCode: this.fail ? 1 : 0 };
  }
}
test('viewer restricts token, Host, origins and methods, and provides safe preview', async t => {
  const runner = new FakeRunner();
  const viewer = await startViewer(runner, udid);
  t.after(viewer.close);
  const url = new URL(viewer.url);
  assert.equal(url.hostname, '127.0.0.1');
  assert.match(url.pathname, /^\/[a-f0-9]{64}\/$/);
  assert.equal((await fetch(url.origin)).status, 404);
  for (const headers of [{ Host: 'attacker.example' }, { Origin: 'https://attacker.example' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
    const status = await new Promise((resolve, reject) => { get(viewer.url, { headers }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject); });
    assert.equal(status, 403);
  }
  const post = await fetch(viewer.url, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET');
  const page = await fetch(viewer.url);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('cache-control'), 'no-store');
  assert.equal(page.headers.get('access-control-allow-origin'), null);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await page.text(), /Read-only preview/);
  assert.equal(runner.calls.length, 0);
});
test('concurrent screenshot requests share capture, cache, and clean temporary files', async () => {
  const runner = new FakeRunner();
  const viewer = await startViewer(runner, udid);
  try {
    const responses = await Promise.all(Array.from({ length: 8 }, () => fetch(viewer.url + 'frame.png')));
    for (const response of responses) {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/png');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
    }
    assert.equal(runner.calls.length, 1);
    assert.equal(runner.calls[0].command, 'xcrun');
    assert.deepEqual(runner.calls[0].args.slice(0, -1), ['simctl', 'io', udid, 'screenshot', '--type=png']);
  } finally { await viewer.close(); }
  await assert.rejects(access(dirname(runner.calls[0].args.at(-1))));
  await viewer.close();
});
test('capture failure is bounded and redacts command output', async t => {
  const runner = new FakeRunner(); runner.fail = true;
  const viewer = await startViewer(runner, udid); t.after(viewer.close);
  for (let i = 0; i < 3; i++) {
    const response = await fetch(viewer.url + 'frame.png');
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /private failure/);
  }
  assert.equal(runner.calls.length, 1);
});
test('close waits for in-flight screenshot before cleaning directory', async () => {
  const runner = new FakeRunner();
  let release;
  runner.gate = new Promise(resolve => { release = resolve; });
  const viewer = await startViewer(runner, udid);
  const request = fetch(viewer.url + 'frame.png');
  while (!runner.calls.length) await new Promise(resolve => setTimeout(resolve, 5));
  const closing = viewer.close();
  release();
  const response = await request; await response.arrayBuffer();
  await closing;
  await assert.rejects(access(dirname(runner.calls[0].args.at(-1))));
});
test('invalid device identifiers are rejected before launching a server', async () => {
  for (const value of ['booted', '<script>', '../../x', '--help']) await assert.rejects(startViewer(new FakeRunner(), value), /UDID/);
});
