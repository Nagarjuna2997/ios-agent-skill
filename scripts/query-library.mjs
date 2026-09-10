#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { buildLibrary, searchLibrary, readLibrary } from './lib/local-library.mjs';
const library = buildLibrary(fileURLToPath(new URL('../', import.meta.url)));
const [command, value, offset, maxChars] = process.argv.slice(2);
let result;
if (command === 'search' && value) result = { results:searchLibrary(library,value,8,offset ?? 'all') };
else if (command === 'read' && value) result = readLibrary(library,value,Number(offset ?? 0),Number(maxChars ?? 6000));
else if (command === 'outline' && value) {
  const file = library.files.find(f => f.path === value);
  result = file ? {path:file.path,characters:file.characters,headings:file.headings} : {error:'Unknown indexed file'};
} else result = {error:'Usage: node scripts/query-library.mjs search "query" [all|source|guide] | outline path | read path [offset] [maxChars]'};
console.log(JSON.stringify(result,null,2));
if (result.error) process.exitCode=1;
