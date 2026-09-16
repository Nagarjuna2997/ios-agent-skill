import { Finding, SourceFile, isSupportFile } from './types.js';

export interface AppIntentsOptions {
  /** Opt in only when the product wants Apple Intelligence schema integration. */
  appleIntelligence?: boolean;
  /** Opt in only when Siri should refer to visible entities. */
  onscreenContent?: boolean;
}

// Preserve offsets/newlines while masking strings and nested comments. This is
// a lexical review, not a Swift parser: conditional branches are all inspected.
export function appIntentsCode(source: string): string {
  const out = source.split('');
  const blank = (start: number, end: number) => {
    for (let k = start; k < end; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  for (let i = 0; i < source.length;) {
    const start = i;
    if (source.startsWith('//', i)) {
      i = source.indexOf('\n', i); if (i < 0) i = source.length;
    } else if (source.startsWith('/*', i)) {
      i += 2; let depth = 1;
      while (i < source.length && depth) {
        if (source.startsWith('/*', i)) { depth++; i += 2; }
        else if (source.startsWith('*/', i)) { depth--; i += 2; }
        else i++;
      }
    } else {
      const opening = /^(#*)("""|")/.exec(source.slice(i));
      if (!opening) { i++; continue; }
      const hashes = opening[1], close = opening[2] + hashes;
      i += opening[0].length;
      while (i < source.length) {
        if (source.startsWith('\\' + hashes, i)) { i += 2 + hashes.length; continue; }
        if (source.startsWith(close, i)) { i += close.length; break; }
        i++;
      }
    }
    blank(start, Math.min(i, source.length));
  }
  return out.join('');
}

export function analyzeAppIntents(files: SourceFile[], options: AppIntentsOptions = {}): Finding[] {
  const sources = files.filter(f => !isSupportFile(f.path)).map(file => ({ file, code: appIntentsCode(file.content) }));
  const findings: Finding[] = [];
  const add = (file: SourceFile, index: number, rule: string, message: string, consequence: string, fix: string) => {
    const line = file.content.slice(0, index).split('\n').length;
    findings.push({ file: file.path, line, severity: 'minor', rule, message, consequence, fix,
      doc: 'docs/frameworks/app-intents-intelligence.md', excerpt: file.content.split('\n')[line - 1].trim() });
  };
  let firstEntity: { file: SourceFile; index: number } | undefined;
  for (const { file, code } of sources) {
    const legacy = /\bimport\s+(?:Intents|IntentsUI|SiriKit)\b|\bINIntent\b/.exec(code);
    if (legacy) add(file, legacy.index, 'sirikit-migration-review',
      'SiriKit usage: review whether new functionality should use App Intents.',
      'This is a migration advisory, not a deprecation or runtime failure. Apple still documents SiriKit integration.',
      'Keep supported existing behavior; evaluate App Intents for new schema, entity and Shortcuts capabilities. Check symbol-level SDK availability before migrating.');
    const entities = /\b(?:struct|class|enum)\s+(\w+)([^{};]*)\{/g;
    for (const match of code.matchAll(entities)) {
      // Remove generic parameter lists before inspecting the inheritance clause.
      // A constraint such as T: AppEntity does not make the container an entity.
      let depth = 0, header = '';
      for (const character of match[2]) {
        if (character === '<') { depth++; continue; }
        if (character === '>') { depth = Math.max(0, depth - 1); continue; }
        if (!depth) header += character;
      }
      const inheritance = header.split(/\bwhere\b/)[0].split(':').slice(1).join(':');
      if (!/(?:^|,)\s*(?:AppIntents\.)?AppEntity\s*(?:,|$)/.test(inheritance)) continue;
      const index = match.index!;
      firstEntity ??= { file, index };
      // Attribute context ends at the previous declaration body or statement.
      const prefix = code.slice(Math.max(code.lastIndexOf('}', index), code.lastIndexOf(';', index)) + 1, index);
      if (options.appleIntelligence && !/@(?:AppEntity|AssistantEntity)\s*\(\s*schema\s*:/.test(prefix)) {
        add(file, index, 'app-entity-schema-review', `Review schema adoption for ${match[1]}.`,
          'Apple Intelligence integration was requested, but this entity has no detected schema annotation. Not every entity has a matching domain; ordinary AppEntity usage remains valid.',
          'Adopt @AppEntity(schema:) only if an Apple schema matches the entity semantics. Otherwise document why no schema applies; do not invent one.');
      }
    }
  }
  if (options.onscreenContent && firstEntity && !sources.some(({ code }) => /\bappEntityIdentifier\b/.test(code))) {
    add(firstEntity.file, firstEntity.index, 'onscreen-entity-association-review',
      'No appEntityIdentifier association detected for requested onscreen Siri support.',
      'Declaring an intent/entity does not by itself associate the currently visible content. Another valid association API or code outside this scan may already handle it.',
      'Review the visible view’s NSUserActivity and associate its appEntityIdentifier with the Transferable AppEntity, or verify the released SDK’s equivalent view annotation. Do not add annotations to background-only intents.');
  }
  return findings;
}
