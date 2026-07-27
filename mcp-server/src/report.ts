import { Finding, sortFindings } from "./analyzers/types.js";

const ICON: Record<Finding["severity"], string> = {
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
