import { z } from "zod";

import { Finding, Severity, sortFindings } from "./analyzers/types.js";

/**
 * Structured tool output.
 *
 * Every review tool returns BOTH a markdown `content` block and this object as
 * `structuredContent`. The markdown is for a human reading the transcript; the
 * object is for a workflow that needs to branch on the result without parsing
 * prose. Returning only JSON would make the transcript unreadable; returning
 * only prose forces every consumer to regex it.
 *
 * Field names are snake_case because this is a wire contract, not internal API.
 */

/** Weights behind `score`. Stated here because a score nobody can reproduce is a vibe. */
const SEVERITY_WEIGHT: Record<Severity, number> = {
  blocker: 10,
  serious: 3,
  minor: 1,
};

/** One blocker per file scanned is the notional floor. */
const CAPACITY_PER_FILE = 10;

/**
 * A 0–100 defect-density score.
 *
 *   penalty  = 10·blockers + 3·serious + 1·minor
 *   capacity = filesChecked × 10
 *   score    = clamp(0, 100, round(100 × (1 − penalty / capacity)))
 *
 * 100 means no findings. The denominator is file count, so the score is a
 * *density*: adding clean files raises it, which is the intended behaviour for
 * tracking one project over time.
 *
 * It is deliberately NOT comparable between projects — a UI-heavy target and a
 * networking library have different rule surfaces. Use it as a direction of
 * travel, and use the counts for anything that matters.
 */
export function scoreFor(findings: Finding[], filesChecked: number): number {
  if (filesChecked <= 0) return 100;

  const penalty = findings.reduce(
    (total, finding) => total + SEVERITY_WEIGHT[finding.severity],
    0,
  );
  const capacity = filesChecked * CAPACITY_PER_FILE;
  const score = Math.round(100 * (1 - penalty / capacity));

  return Math.max(0, Math.min(100, score));
}

export const issueSchema = z.object({
  file: z.string(),
  line: z.number().int(),
  severity: z.enum(["blocker", "serious", "minor"]),
  rule: z.string(),
  message: z.string(),
  consequence: z.string(),
  fix: z.string(),
  doc: z.string(),
  excerpt: z.string(),
});

/** The shape every review tool declares as its `outputSchema`. */
export const reviewOutputShape = {
  summary: z.string().describe("One-line plain-language result."),
  score: z
    .number()
    .int()
    .describe(
      "0-100 defect density. 100 = no findings. penalty = 10*blockers + 3*serious + 1*minor; capacity = files*10. Comparable across runs on ONE project, not between projects.",
    ),
  counts: z.object({
    blocker: z.number().int(),
    serious: z.number().int(),
    minor: z.number().int(),
    total: z.number().int(),
  }),
  files_checked: z.number().int().describe("Swift files actually scanned."),
  issues: z.array(issueSchema).describe("Every finding, most severe first."),
  suggestions: z
    .array(z.string())
    .describe(
      "Prioritized next actions, deduplicated by rule — not a restatement of every issue's fix.",
    ),
};

export const reviewOutputSchema = z.object(reviewOutputShape);
export type ReviewOutput = z.infer<typeof reviewOutputSchema>;

/**
 * Collapse findings into a handful of actions.
 *
 * A `suggestions` array that simply repeats every issue's `fix` is noise — the
 * issues already carry those. This groups by rule so a file with forty
 * literal-spacing findings produces one instruction, ordered by total weight.
 */
function suggestionsFor(findings: Finding[]): string[] {
  if (findings.length === 0) return [];

  const byRule = new Map<string, { count: number; weight: number; fix: string }>();

  for (const finding of findings) {
    const entry = byRule.get(finding.rule) ?? {
      count: 0,
      weight: 0,
      fix: finding.fix,
    };
    entry.count += 1;
    entry.weight += SEVERITY_WEIGHT[finding.severity];
    byRule.set(finding.rule, entry);
  }

  return [...byRule.entries()]
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 5)
    .map(([rule, entry]) =>
      entry.count === 1
        ? `${rule}: ${entry.fix}`
        : `${rule} (${entry.count} occurrences): ${entry.fix}`,
    );
}

function summarize(title: string, counts: ReviewOutput["counts"], files: number): string {
  if (counts.total === 0) {
    return `${title}: no findings across ${files} file${files === 1 ? "" : "s"}.`;
  }
  const parts: string[] = [];
  if (counts.blocker > 0) parts.push(`${counts.blocker} blocker`);
  if (counts.serious > 0) parts.push(`${counts.serious} serious`);
  if (counts.minor > 0) parts.push(`${counts.minor} minor`);
  return `${title}: ${parts.join(", ")} across ${files} file${files === 1 ? "" : "s"}.`;
}

/** Build the structured half of a tool result. */
export function buildReviewOutput(
  title: string,
  findings: Finding[],
  filesChecked: number,
): ReviewOutput {
  const sorted = sortFindings(findings);
  const counts = {
    blocker: sorted.filter((f) => f.severity === "blocker").length,
    serious: sorted.filter((f) => f.severity === "serious").length,
    minor: sorted.filter((f) => f.severity === "minor").length,
    total: sorted.length,
  };

  return {
    summary: summarize(title, counts, filesChecked),
    score: scoreFor(sorted, filesChecked),
    counts,
    files_checked: filesChecked,
    issues: sorted,
    suggestions: suggestionsFor(sorted),
  };
}
