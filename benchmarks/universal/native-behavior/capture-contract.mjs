import {createRequire} from 'node:module';

const require = createRequire(new URL('../../../mcp-server/package.json', import.meta.url));
const maxImageBytes = 10 * 1024 * 1024;
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export const wrappingFixture = 'wrapping-chip-row';
export const readingFixture = 'reading-list-records';
const contracts = new Map([
  [wrappingFixture, {test:'WrappingRowTests/testRowsReflowAndPreserveReadingOrder()', images:[['portrait-tags','portrait'],['landscape-tags','landscape']]}],
  [readingFixture, {test:'ReadingShelfTests/testEditingOneOfTwoIdenticalTitlesPreservesTheirIdentities()', images:[['edited-one-record','portrait']]}],
]);
export const requiresCaptures = fixture => contracts.has(fixture);

// Check the named XCTAttachments from the passing interaction test in this size cell.
export async function verifyFixtureCaptures(fixture,read) {
  const contract=contracts.get(fixture);
  if(!contract)throw Error('No screenshot contract for fixture');
  const manifest = JSON.parse((await read('manifest.json', 1024 * 1024)).toString());
  if (!Array.isArray(manifest)) throw Error('Missing fixture screenshot manifest');
  const tests = manifest.filter(test => test?.testIdentifier === contract.test);
  if (tests.length !== 1 || !Array.isArray(tests[0].attachments)) throw Error('Missing or ambiguous fixture test attachments');

  const files = new Set();
  for (const [label,orientation] of contract.images) {
    const matches = tests[0].attachments.filter(attachment => attachment?.isAssociatedWithFailure === false &&
      typeof attachment.suggestedHumanReadableName === 'string' &&
      (attachment.suggestedHumanReadableName === label || attachment.suggestedHumanReadableName.startsWith(label + '_')));
    if (matches.length !== 1) throw Error('Expected one successful ' + label + ' screenshot');

    const name = matches[0].exportedFileName;
    if (typeof name !== 'string' || !/^[a-zA-Z0-9_-]+\.png$/.test(name) || files.has(name)) throw Error('Unsafe or duplicate fixture screenshot filename');
    files.add(name);
    const data = await read(name, maxImageBytes);
    if (data.length < 33 || !data.subarray(0, 8).equals(signature) || data.toString('ascii', 12, 16) !== 'IHDR') throw Error('Invalid PNG for ' + label);
    const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
    if (!width || !height || width * height > 8_000_000 || (orientation === 'portrait' ? width >= height : width <= height)) {
      throw Error('Invalid screenshot dimensions for ' + label);
    }
    // Decode the entire bounded image, including CRC checks, before recording a pass.
    require('pngjs').PNG.sync.read(data);
  }
}
