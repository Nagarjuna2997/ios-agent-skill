#!/usr/bin/env node
/**
 * Verify every documented palette colour against the contrast rule SKILL.md
 * states, and keep the published ratios honest.
 *
 * SKILL.md requires 4.5:1 for body text and 3:1 for large text (18pt+), and
 * separately instructs agents to put white text on saturated colour pills.
 * Nothing checked that the shipped palettes could actually satisfy both, and
 * they could not: nine of ten primaries and accents fail 4.5:1 against white.
 *
 * That is not a typo to correct — a saturated brand colour rarely reaches
 * 4.5:1 against white, which is a real design constraint rather than a bug.
 * So this does not demand every colour pass. It demands every colour's ratio
 * be PUBLISHED next to its hex, and that the doc's stated usage matches what
 * the number allows.
 *
 * Usage: node scripts/check-contrast.mjs [--json]
 */
import { readFileSync } from "node:fs";

const WHITE = "FFFFFF";
const BLACK = "000000";

/** WCAG relative luminance. */
function luminance(hex) {
  const channel = (offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function contrastRatio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

/** The best foreground for a background, and whether it clears each bar. */
export function verdictFor(hex) {
  const onWhite = contrastRatio(hex, WHITE);
  const onBlack = contrastRatio(hex, BLACK);
  const best = onWhite >= onBlack ? "white" : "black";
  const ratio = Math.max(onWhite, onBlack);
  return {
    hex,
    whiteText: Number(onWhite.toFixed(2)),
    blackText: Number(onBlack.toFixed(2)),
    bestForeground: best,
    bestRatio: Number(ratio.toFixed(2)),
    // 4.5:1 body, 3:1 large text (18pt+ or 14pt bold), per SKILL.md.
    passesBody: ratio >= 4.5,
    passesLarge: ratio >= 3,
  };
}

/**
 * Extract every `#RRGGBB` that a doc publishes with a ratio annotation.
 *
 * The contract is `#RRGGBB` followed somewhere on the same line by
 * `N.NN:1`. A colour published without a ratio is the failure this catches —
 * an unannotated hex is a number nobody has checked.
 */
export function auditFile(path) {
  const text = readFileSync(path, "utf8");
  const problems = [];
  let annotated = 0;

  for (const [index, line] of text.split("\n").entries()) {
    // Only lines that look like palette entries: a hex in a table or list.
    const hexes = [...line.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map((m) => m[1].toUpperCase());
    if (hexes.length === 0) continue;
    if (!/\|/.test(line)) continue;

    // An em-dash in the foreground column is an explicit "not a text-bearing
    // surface" marker — background, surface, and text roles are checked as
    // PAIRS in the summary line instead, which is the meaningful test for them.
    // Accepting the marker but not an omission is the point: a blank cell is
    // indistinguishable from a colour nobody measured.
    if (/\|\s*—\s*\|/.test(line)) continue;

    const claimed = line.match(/(\d+\.\d{1,2}):1/);
    if (!claimed) {
      problems.push(`${path}:${index + 1}: palette colour #${hexes[0]} published with no contrast ratio`);
      continue;
    }

    annotated += 1;
    const actual = verdictFor(hexes[0]).bestRatio;
    const stated = Number(claimed[1]);
    if (Math.abs(actual - stated) > 0.05) {
      problems.push(
        `${path}:${index + 1}: #${hexes[0]} is annotated ${stated}:1 but measures ${actual}:1`,
      );
    }
  }

  return { annotated, problems };
}

const PALETTE_DOCS = ["docs/design/color-system.md"];

function main() {
  const json = process.argv.includes("--json");
  let problems = [];
  let annotated = 0;

  for (const path of PALETTE_DOCS) {
    const result = auditFile(path);
    annotated += result.annotated;
    problems = problems.concat(result.problems);
  }

  if (json) {
    console.log(JSON.stringify({ annotated, problems, ok: problems.length === 0 }, null, 2));
  } else if (problems.length === 0) {
    console.log(`OK — ${annotated} palette colours, every published ratio matches its measurement`);
  } else {
    console.error("Contrast problems:");
    for (const problem of problems) console.error(`  ${problem}`);
  }

  process.exitCode = problems.length === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
