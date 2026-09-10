import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');
const catalog = JSON.parse(read('docs/apple/technologies.json'));
const guides = Object.fromEntries([...new Set(catalog.technologies.map(t => t.guide))].map(path => [path, read(path)]));
const bundle = { catalog, updates: JSON.parse(read('docs/apple/updates.json')), guides,
  iconGuide: read('docs/design/icon-composer.md'), appWorkflow: read('docs/tooling/app-description-workflow.md') };
mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/knowledge.json', import.meta.url), JSON.stringify(bundle));
console.log(`Bundled ${catalog.technologies.length} technologies and ${bundle.updates.entries.length} update sources`);
