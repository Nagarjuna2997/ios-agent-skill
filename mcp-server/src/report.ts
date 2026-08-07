import { Finding, Severity, sortFindings } from "./analyzers/types.js";
import { SkillLintResult } from "./analyzers/skill.js";

const ICON: Record<Severity, string> = {
  blocker: "🔴",
  serious: "🟠",
  minor: "🟡",
};

/**
 * Render findings as readable markdown.
 *
 * Deliberately reports counts and the empty case explicitly: a report that says
 * nothing is indistinguishable from a check that never ran. See
 * docs/orchestration/verification.md.
 */
export function renderFindings(
  title: string,
  findings: Finding[],
  scanned: number,
  options: { limit?: number } = {},
): string {
  const limit = options.limit ?? 50;
  const sorted = sortFindings(findings);
  const lines: string[] = [`# ${title}`, ""];

  lines.push(
    `Scanned **${scanned}** Swift file${scanned === 1 ? "" : "s"}.`,
    "",
  );

  if (sorted.length === 0) {
    lines.push(
      "**No findings.** Every rule in this category passed.",
      "",
      "_This is a static check. It cannot verify behavior — run the build and the test suite for that._",
    );
    return lines.join("\n");
  }

  const counts = {
    blocker: sorted.filter((f) => f.severity === "blocker").length,
    serious: sorted.filter((f) => f.severity === "serious").length,
    minor: sorted.filter((f) => f.severity === "minor").length,
  };

  lines.push(
    `**${sorted.length} finding${sorted.length === 1 ? "" : "s"}** — ` +
      `🔴 ${counts.blocker} blocker · 🟠 ${counts.serious} serious · 🟡 ${counts.minor} minor`,
    "",
  );

  const shown = sorted.slice(0, limit);
  for (const finding of shown) {
    lines.push(
      `### ${ICON[finding.severity]} ${finding.file}:${finding.line} — ${finding.message}`,
      "",
      "```swift",
      finding.excerpt,
      "```",
      "",
      `**Why it matters:** ${finding.consequence}`,
      "",
      `**Fix:** ${finding.fix}`,
      "",
      `_Rule \`${finding.rule}\` · see \`${finding.doc}\`_`,
      "",
    );
  }

  if (sorted.length > shown.length) {
    lines.push(
      `_… and ${sorted.length - shown.length} more. Narrow the scan with \`path\` to see them._`,
      "",
    );
  }

  lines.push(
    "---",
    "",
    "_Static analysis only. It cannot prove the app builds or behaves correctly — " +
      "run `swift build` and `swift test` for that._",
  );

  return lines.join("\n");
}

const SEVERITY_RANK: Record<Severity, number> = { blocker: 0, serious: 1, minor: 2 };

/**
 * Render a skill-repository lint as markdown.
 *
 * Separate from `renderFindings` because the locations are markdown and YAML
 * files — rendering a `tools:` line inside a `swift` fence would be a lie about
 * what was inspected. The "Checked" section is not decoration: an empty report
 * with no statement of scope is indistinguishable from a check that never ran.
 */
export function renderSkillLint(result: SkillLintResult): string {
  const { findings, checked } = result;
  const sorted = [...findings].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.file.localeCompare(b.file) ||
      a.line - b.line,
  );

  const lines: string[] = ["# Skill Repository Lint", "", "## Checked", ""];

  lines.push(
    `- **SKILL.md:** ${checked.skillFile ? "found" : "**not found**"}`,
    `- **Subagent definitions:** ${checked.agentCount}`,
    checked.mirrorCheckSkipped
      ? "- **Mirrors:** skipped — no file matches SKILL.md's body, so this repository does not use the generated-mirror pattern"
      : `- **Mirrors compared:** ${checked.mirrorsCompared}`,
    `- **Referenced paths resolved:** ${checked.referencedPaths}`,
    "",
  );

  if (sorted.length === 0) {
    lines.push(
      "**No findings.** Frontmatter, agent tool permissions, mirror sync, and doc references all pass.",
      "",
      "_Metadata only. This does not check that the instructions are correct, only that they are well-formed and internally consistent._",
    );
    return lines.join("\n");
  }

  const counts = {
    blocker: sorted.filter((f) => f.severity === "blocker").length,
    serious: sorted.filter((f) => f.severity === "serious").length,
    minor: sorted.filter((f) => f.severity === "minor").length,
  };

  lines.push(
    `## ${sorted.length} finding${sorted.length === 1 ? "" : "s"}`,
    "",
    `🔴 ${counts.blocker} blocker · 🟠 ${counts.serious} serious · 🟡 ${counts.minor} minor`,
    "",
  );

  for (const finding of sorted) {
    const location = finding.line > 0 ? `${finding.file}:${finding.line}` : finding.file;
    lines.push(`### ${ICON[finding.severity]} ${location} — ${finding.message}`, "");

    if (finding.excerpt) {
      lines.push("```", finding.excerpt, "```", "");
    }

    lines.push(
      `**Why it matters:** ${finding.consequence}`,
      "",
      `**Fix:** ${finding.fix}`,
      "",
      `_Rule \`${finding.rule}\`_`,
      "",
    );
  }

  lines.push(
    "---",
    "",
    "_Metadata only. This does not check that the instructions are correct, only " +
      "that they are well-formed and internally consistent._",
  );

  return lines.join("\n");
}
