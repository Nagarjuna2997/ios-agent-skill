/** Offset-preserving top-level policy text. Quoted SQL identifiers/procedure bodies
 * are deliberately excluded: recognizing them needs a real SQL parser. */
export function policyCode(source: string): string {
  const chars = source.split('');
  const hide = (start: number, end: number) => {
    for (let k = start; k < end; k++) if (chars[k] !== '\n') chars[k] = ' ';
  };
  let i = 0;
  while (i < source.length) {
    const start = i;
    if (source.startsWith('--', i) || source.startsWith('//', i)) {
      while (i < source.length && source[i] !== '\n') i++;
    } else if (source.startsWith('/*', i)) {
      i += 2; let depth = 1;
      while (i < source.length && depth) {
        if (source.startsWith('/*', i)) { depth++; i += 2; }
        else if (source.startsWith('*/', i)) { depth--; i += 2; }
        else i++;
      }
    } else if (source[i] === "'" || source[i] === '"') {
      const quote = source[i++];
      while (i < source.length) {
        if (source[i] === '\\') { i = Math.min(i + 2, source.length); continue; }
        if (source[i++] === quote) {
          if (source[i] === quote) { i++; continue; }
          break;
        }
      }
    } else if (source[i] === '$') {
      const tag = /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.exec(source.slice(i))?.[0];
      if (!tag) { i++; continue; }
      const end = source.indexOf(tag, i + tag.length);
      i = end < 0 ? source.length : end + tag.length;
    } else { i++; continue; }
    hide(start, i);
  }
  return chars.join('');
}
