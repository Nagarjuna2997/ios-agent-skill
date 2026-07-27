/** Severity of a finding, ordered most-serious first when reported. */
export type Severity = "blocker" | "serious" | "minor";

/** A single rule violation, anchored to a location with a concrete fix. */
export interface Finding {
  /** Repo-relative path. */
  file: string;
  /** 1-indexed line. */
  line: number;
  severity: Severity;
  /** Short kebab-case rule id, e.g. "observable-without-mainactor". */
  rule: string;
  /** One sentence stating the defect. */
  message: string;
  /** What goes wrong at runtime, concretely. */
  consequence: string;
  /** The specific change to make. */
  fix: string;
  /** Path into this repo's docs that explains the rule in full. */
  doc: string;
  /** The offending source line, trimmed. */
  excerpt: string;
}

/** A Swift source file to analyze. */
export interface SourceFile {
  /** Repo-relative path. */
  path: string;
  content: string;
}

export type Analyzer = (file: SourceFile) => Finding[];

const SEVERITY_ORDER: Record<Severity, number> = {
  blocker: 0,
  serious: 1,
  minor: 2,
};

/** Most severe first, then by file and line, so output is stable. */
export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.file.localeCompare(b.file) ||
      a.line - b.line,
  );
}

/**
 * Files that legitimately do things app code must not — test doubles construct
 * live-looking types, previews hardcode values. Excluding them is what keeps
 * the signal-to-noise ratio high enough that the output is worth reading.
 */
export function isSupportFile(path: string): boolean {
  return /(Tests?|Mock\w*|Stub\w*|Fake\w*|Preview\w*|\w*Preview|Fixtures?)\.swift$/i.test(
    path,
  );
}

/** Strip `//` line comments so commented-out code is not reported. */
export function stripComment(line: string): string {
  const index = line.indexOf("//");
  return index === -1 ? line : line.slice(0, index);
}

/** Walk lines with 1-indexed numbers, skipping comment-only content. */
export function eachLine(
  file: SourceFile,
  visit: (line: string, number: number, raw: string) => void,
): void {
  const lines = file.content.split("\n");
  let inBlockComment = false;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];

    if (inBlockComment) {
      if (raw.includes("*/")) inBlockComment = false;
      continue;
    }
    if (raw.trimStart().startsWith("/*")) {
      if (!raw.includes("*/")) inBlockComment = true;
      continue;
    }

    const code = stripComment(raw);
    if (code.trim() === "") continue;
    visit(code, index + 1, raw);
  }
}
