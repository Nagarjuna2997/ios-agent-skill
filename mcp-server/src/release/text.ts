/** Local output hygiene, not a guarantee that arbitrary prose contains no personal data. */
export function redactText(value: string): string {
  return value.replace(/-----BEGIN [^-]+-----[\s\S]*?(?:-----END [^-]+-----|$)/g, '[REDACTED]')
    .replace(/\b(?:sk-|ghp_|github_pat_|AKIA)[A-Za-z0-9_-]{8,}\b/g, '[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}(?:\.[A-Za-z0-9_-]+){1,2}/g, '[REDACTED]')
    .replace(/\b(?:password|passwd|secret|token|api[_ -]?key|authorization)\s*[:=]\s*(?:"[^"]*"|'[^']*'|\S+)/gi, '[REDACTED]')
    .replace(/https?:\/\/[^\s<>"']+/gi, '[URL WITHHELD]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL WITHHELD]')
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').trim();
}
