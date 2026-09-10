import { fileURLToPath } from 'node:url';
import { buildLibrary } from '../../scripts/lib/local-library.mjs';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');
const catalog = JSON.parse(read('docs/apple/technologies.json'));
const bundle = { library:buildLibrary(fileURLToPath(root)), catalog, updates: JSON.parse(read('docs/apple/updates.json')),
  iconGuide: read('docs/design/icon-composer.md'), appWorkflow: read('docs/tooling/app-description-workflow.md') };
mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/knowledge.json', import.meta.url), JSON.stringify(bundle));
console.log(`Bundled ${catalog.technologies.length} technologies and ${bundle.updates.entries.length} update sources`);

for (const name of ['local-library.mjs','local-library.d.mts']) copyFileSync(new URL('../../scripts/lib/'+name,import.meta.url), new URL('../data/'+name,import.meta.url));
console.log(`Bundled ${bundle.library.files.length} local files in ${Object.keys(bundle.library.blobs).length} deduplicated objects`);
