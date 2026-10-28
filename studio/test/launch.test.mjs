import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

test('server entry point starts through a symbolic checkout path', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-launch-'));
  await fs.symlink(process.cwd(), path.join(root, 'checkout'));
  const child = spawn(process.execPath, [path.join(root, 'checkout/studio/server.mjs')], {
    env: { ...process.env, STUDIO_HOME: path.join(root, 'data'), STUDIO_PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(async () => { child.kill('SIGTERM'); await new Promise(r => child.exitCode !== null ? r() : child.once('exit', r)); await fs.rm(root, { recursive: true, force: true }); });
  const output = await new Promise((resolve, reject) => {
    let text = '';
    const timer = setTimeout(() => reject(Error('Server did not start')), 10000);
    child.stdout.on('data', chunk => { text += chunk; if (text.includes('Projects stay in')) { clearTimeout(timer); resolve(text); } });
    child.once('exit', () => { clearTimeout(timer); reject(Error('Server exited before startup')); });
  });
  assert.match(output, /iOS Agent Studio/);
});
