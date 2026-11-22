import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

// These executable inputs are imported from outside the fidelity, fixture and dist trees.
export async function sharedVerifierInputs(root) {
  const path = 'benchmarks/universal/native-behavior/ui-test-scheme.mjs';
  const source = await readFile(join(root, path));
  return [[path, createHash('sha256').update(source).digest('hex')]];
}

export async function readCaptureSize(command, device, expected) {
  const observed = (await command('xcrun', ['simctl', 'ui', device, 'content_size'])).trim();
  if (observed !== expected) throw Error(`Dynamic Type capture requires ${expected}; simulator reports ${observed}`);
  return observed;
}
