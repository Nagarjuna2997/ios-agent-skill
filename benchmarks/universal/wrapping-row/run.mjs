import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runNativeFixture} from '../native-behavior/run.mjs';

await runNativeFixture({
  here: dirname(fileURLToPath(import.meta.url)),
  name: 'TrailTags',
  fixture: 'wrapping-chip-row',
  expectedTests: 1,
});
