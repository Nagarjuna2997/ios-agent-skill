// Resolve fixtures from this test file, not from the caller's working directory.
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
