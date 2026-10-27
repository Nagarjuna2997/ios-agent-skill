import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runNativeFixture} from '../native-behavior/run.mjs';
await runNativeFixture({here:dirname(fileURLToPath(import.meta.url)),name:'TripChecklist',fixture:'react-boolean-state',expectedTests:3});
