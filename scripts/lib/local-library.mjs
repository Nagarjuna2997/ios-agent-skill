import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';

const roots = ['docs', 'patterns', 'checklists', 'templates', 'samples'];
const excluded = new Set(['.git', '.build', '.ios-agent', 'node_modules', 'dist', '__pycache__', 'xcuserdata', 'DerivedData']);
const extensions = new Set(['.md', '.swift', '.metal', '.h', '.m', '.c', '.cpp', '.plist', '.yml', '.yaml', '.json', '.svg', '.py', '.pbxproj', '.xcscheme']);
const generated = new Set(['docs/apple/technologies.json', 'docs/apple/updates.json', 'docs/apple/local-library.json', 'docs/apple/local-library.md']);

export function buildLibrary(root) {
  const files = [], blobs = {};
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink() || excluded.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) { visit(absolute); continue; }
      const path = relative(root, absolute).split('\\').join('/');
      if (!entry.isFile() || !extensions.has(extname(path)) || generated.has(path)) continue;
      const content = readFileSync(absolute, 'utf8');
      const hash = createHash('sha256').update(content).digest('hex');
      blobs[hash] = content;
      const headings = [];
      let offset = 0;
      for (const line of content.split('\n')) {
        if (/^#{1,6} /.test(line)) headings.push({ title: line.replace(/^#+ /,''), offset });
        offset += line.length + 1;
      }
      const kind = extname(path) === '.md' ? 'guide' : 'source';
      files.push({ path, title: headings[0]?.title ?? basename(path), kind, hash, characters: content.length, headings });
    }
  }
  for (const name of roots) visit(join(root, name));
  files.sort((a,b) => a.path.localeCompare(b.path));
  return { schemaVersion: 1, files, blobs };
}

export function searchLibrary(library, query, limit = 8, kind = 'all') {
  const terms = query.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
  if (!terms.length) return [];
  return library.files.filter(f => kind === 'all' || f.kind === kind).map(file => {
    const title = (file.title + ' ' + file.path).toLowerCase();
    const body = library.blobs[file.hash].toLowerCase();
    const score = terms.reduce((total, word) => total + (title.includes(word) ? 20 : body.includes(word) ? 1 : 0), 0);
    const matches = terms.every(word => title.includes(word) || body.includes(word));
    return { file, score, matches };
  }).filter(row => row.matches).sort((a,b) => b.score-a.score || a.file.path.localeCompare(b.file.path)).slice(0,limit)
    .map(({file,score}) => ({ path:file.path, title:file.title, kind:file.kind, characters:file.characters, score }));
}

export function readLibrary(library, path, offset = 0, maxChars = 6000) {
  const file = library.files.find(file => file.path === path);
  if (!file) return { error: 'Unknown local reference. Search first; only indexed repository files can be read.' };
  if (!Number.isInteger(offset) || offset < 0 || offset > file.characters || !Number.isInteger(maxChars) || maxChars < 1 || maxChars > 16000) {
    return { error: 'Use an offset within the file and maxChars between 1 and 16000.' };
  }
  const content = library.blobs[file.hash].slice(offset, offset + maxChars);
  const nextOffset = offset + content.length < file.characters ? offset + content.length : null;
  return { path:file.path, kind:file.kind, hash:file.hash, offset, totalCharacters:file.characters, content, nextOffset,
    evidence: file.kind === 'source' ? 'Repository source; consult the owning sample README for build/test evidence.' : 'Repository guidance; code blocks may include incomplete examples and explicitly labelled anti-patterns.' };
}
