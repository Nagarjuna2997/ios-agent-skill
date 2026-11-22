import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { journeyStepName, type Journey } from './journeys.js';
import type { CommandRunner } from './runner.js';

export interface JourneyScreenshot { step: string; path: string; sha256: string }
const exported = z.array(z.object({
  testIdentifier: z.string(),
  attachments: z.array(z.object({ suggestedHumanReadableName: z.string(), exportedFileName: z.string() })),
}));

export async function collectJourneyScreenshots(root: string, resultBundle: string, runId: string, journeys: Journey[], runner: CommandRunner): Promise<JourneyScreenshot[]> {
  const folder = join(root, '.ios-agent/test-results', runId + '-attachments');
  await mkdir(folder, { recursive: true });
  const result = await runner.run('xcrun', ['xcresulttool', 'export', 'attachments', '--path', join(root, resultBundle), '--output-path', folder], { cwd: root, timeoutMs: 60_000 });
  if (result.exitCode !== 0) throw new Error('Could not export XCTest attachments');
  const manifest = exported.parse(JSON.parse(await readFile(join(folder, 'manifest.json'), 'utf8')));
  await mkdir(join(root, '.ios-agent/screenshots'), { recursive: true });
  const images: JourneyScreenshot[] = [];
  for (const journey of journeys) {
    const test = manifest.find(group => group.testIdentifier === `PlannedJourneyTests/test_${journey.id.replaceAll('-', '_')}()`);
    if (!test) continue;
    for (const [index] of journey.steps.entries()) {
      const step = journeyStepName(journey, index);
      const item = test.attachments.find(a => a.suggestedHumanReadableName.startsWith(step + '_') || a.suggestedHumanReadableName === step + '.png');
      if (!item || !/^[a-zA-Z0-9_.-]+\.png$/i.test(item.exportedFileName)) continue;
      const source = join(folder, item.exportedFileName);
      const stat = await lstat(source);
      if (!stat.isFile() || stat.size > 25 * 1024 * 1024) continue;
      const bytes = await readFile(source);
      if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) continue;
      const path = `.ios-agent/screenshots/${runId}-${step}.png`;
      await writeFile(join(root, path), bytes);
      images.push({ step, path, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
  return images;
}

/** Validate every expected checkpoint before a saved pass can be reused. */
export async function hasJourneyEvidence(root: string, journeys: Journey[], images: JourneyScreenshot[] = []): Promise<boolean> {
  const expected = new Set(journeys.flatMap(j => j.steps.map((_, i) => journeyStepName(j, i))));
  if (expected.size !== images.length) return false;
  for (const image of images) {
    if (!expected.delete(image.step) || !/^\.ios-agent\/screenshots\/[a-zA-Z0-9-]+\.png$/.test(image.path) ||
        !image.path.endsWith('-' + image.step + '.png')) return false;
    try {
      const path = join(root, image.path);
      const stat = await lstat(path);
      if (!stat.isFile() || stat.size > 25 * 1024 * 1024 || stat.size < 24) return false;
      const bytes = await readFile(path);
      if (!bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) ||
          createHash('sha256').update(bytes).digest('hex') !== image.sha256) return false;
    } catch { return false; }
  }
  return expected.size === 0;
}
