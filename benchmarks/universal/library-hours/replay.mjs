// Replay the pixel, typography and decision evidence without Xcode.
import {strict as assert} from 'node:assert';
import {readFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {comparePNGs} from '../../../mcp-server/dist/app-ir/compare.js';
import {compareTextRegions} from '../../../mcp-server/dist/app-ir/typography.js';
import {evaluateVisualRepair} from '../../../mcp-server/dist/app-ir/visual-gate.js';
import {sha256} from '../../../mcp-server/dist/app-ir/schema.js';
import {combineSizeDecisions, compareSizeRepairs} from '../fidelity/measured-repair.mjs';

if (process.argv.length !== 3) throw Error('Usage: node replay.mjs ARCHIVED_CAPTURE');
const directory = resolve(process.argv[2]);
const read = name => readFile(join(directory, name));
const receipt = JSON.parse(await read('evidence.json'));
const values = {baseline: {}, candidate: {}};
const decisions = {};
for (const size of ['large', 'xxxl']) {
  const ref = await read(size + '-reference.png');
  for (const variant of ['baseline', 'candidate']) {
    const prefix = variant + '-' + size;
    const shot = await read(prefix + '.png');
    const probe = await read(prefix + '-probe.png');
    const evidence = receipt[variant][size];
    assert.equal(sha256(shot), evidence.screenshotHash);
    assert.equal(sha256(ref), evidence.referenceHash);
    const measurement = JSON.parse(await read(prefix + '-measurement.json'));
    const {referenceRegion: reference, nativeRegion: native} = measurement.comparison;
    const pixels = comparePNGs(ref, shot, {reference, native});
    assert.equal(pixels.report.meanAbsoluteChannelError, evidence.meanError);
    assert.equal(pixels.report.changedPixelFraction, evidence.changedFraction);
    assert.equal(sha256(pixels.diff), sha256(await read(prefix + '-diff.png')));
    const invariant = comparePNGs(shot, probe).report.meanAbsoluteChannelError === 0;
    assert.equal(invariant, true);
    const typography = compareTextRegions(measurement.referenceRegions, measurement.nativeRegions, invariant);
    assert.deepEqual(typography, measurement.typography);
    assert.equal(typography.mismatches, evidence.lineBreakMismatches);
    values[variant][size] = {...evidence, typography};
  }
  decisions[size] = evaluateVisualRepair(receipt.baseline[size], receipt.candidate[size], receipt.policy);
}
const pixels = compareSizeRepairs(values.baseline, values.candidate, receipt.policy);
console.log(JSON.stringify({sizes: decisions, pixels, decision: combineSizeDecisions(decisions.large, decisions.xxxl, pixels)}, null, 2));
