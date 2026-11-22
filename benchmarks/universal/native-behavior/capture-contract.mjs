import {createRequire} from 'node:module';

const require = createRequire(new URL('../../../mcp-server/package.json', import.meta.url));
const maxImageBytes = 10 * 1024 * 1024;
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export const wrappingFixture = 'wrapping-chip-row';

// Check the named XCTAttachments from the passing interaction test in this size cell.
export async function verifyWrappingCaptures(read) {
  const manifest = JSON.parse((await read('manifest.json', 1024 * 1024)).toString());
  if (!Array.isArray(manifest)) throw Error('Missing wrapping-row screenshot manifest');
  const tests = manifest.filter(test => test?.testIdentifier === 'WrappingRowTests/testRowsReflowAndPreserveReadingOrder()');
  if (tests.length !== 1 || !Array.isArray(tests[0].attachments)) throw Error('Missing or ambiguous wrapping-row test attachments');

  const files = new Set();
  for (const orientation of ['portrait', 'landscape']) {
    const label = orientation + '-tags';
    const matches = tests[0].attachments.filter(attachment => attachment?.isAssociatedWithFailure === false &&
      typeof attachment.suggestedHumanReadableName === 'string' &&
      (attachment.suggestedHumanReadableName === label || attachment.suggestedHumanReadableName.startsWith(label + '_')));
    if (matches.length !== 1) throw Error('Expected one successful ' + label + ' screenshot');

    const name = matches[0].exportedFileName;
    if (typeof name !== 'string' || !/^[a-zA-Z0-9_-]+\.png$/.test(name) || files.has(name)) throw Error('Unsafe or duplicate wrapping-row screenshot filename');
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
