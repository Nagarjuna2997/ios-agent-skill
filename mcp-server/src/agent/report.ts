// RUN_REPORT.md: what was built, what was verified, what needs the user's
// accounts or money, and what is next. Every statement comes from run state.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative } from "node:path";
import type { Budget, CapabilityPlanRow, Plan } from "./plan.js";
import { projectPaths } from "./project.js";
import type { RunState } from "./state.js";

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function conciseDiagnostic(message: string): string {
  if (/api_error_status["']?\s*:\s*429/i.test(message)) {
    const detail = message.match(/"result"\s*:\s*"([^"\\]{1,300})/i)?.[1];
    return `Provider returned HTTP 429${detail ? `: ${detail}` : "; retry after its session limit resets."}`;
  }
  return message.length > 500 ? `${message.slice(0, 497)}...` : message;
}

function localImagePath(root: string, file: string): string | undefined {
  const path = isAbsolute(file) ? relative(root, file) : file;
  const normalized = path.replaceAll("\\", "/");
  return normalized === ".." || normalized.startsWith("../") ? undefined : normalized;
}

export async function toolCallCount(root: string): Promise<number> {
  const file = projectPaths(root).toolLog;
  if (!existsSync(file)) return 0;
  return (await readFile(file, "utf8")).split("\n").filter(Boolean).length;
}

function hexFromAsset(contents: string, appearance: "light" | "dark"): string | undefined {
  const set = JSON.parse(contents) as { colors?: Array<{ color?: { components?: { red?: string; green?: string; blue?: string } }; appearances?: Array<{ appearance?: string; value?: string }> }> };
  const entry = set.colors?.find((item) => appearance === "dark" ? item.appearances?.some((a) => a.appearance === "luminosity" && a.value === "dark") : !item.appearances?.length);
  const c = entry?.color?.components;
  if (!c?.red || !c.green || !c.blue) return undefined;
  return `#${[c.red, c.green, c.blue].map((value) => Math.round(Number(value) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function ratio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

/** Audit the actual generated color-set JSON, not merely the input palette. */
export function auditGeneratedPalette(files: Record<string, string>): NonNullable<RunState["designEvidence"]> {
  const semanticNames = ["BrandPrimary", "BrandSecondary", "BrandAccent"];
  const foregroundPath = Object.keys(files).find((path) => path.endsWith("/BrandOnPrimary.colorset/Contents.json"));
  const foreground = foregroundPath ? files[foregroundPath] : undefined;
  const rows = semanticNames.map((name) => {
    const path = Object.keys(files).find((file) => file.endsWith(`/${name}.colorset/Contents.json`));
    const light = path && foreground ? hexFromAsset(files[path], "light") : undefined;
    const dark = path && foreground ? hexFromAsset(files[path], "dark") : undefined;
    const onLight = foreground ? hexFromAsset(foreground, "light") : undefined;
    const onDark = foreground ? hexFromAsset(foreground, "dark") : undefined;
    const lightRatio = light && onLight ? ratio(light, onLight) : 0;
    const darkRatio = dark && onDark ? ratio(dark, onDark) : 0;
    return { color: name, light: lightRatio, dark: darkRatio, passesAA: lightRatio >= 4.5 && darkRatio >= 4.5 };
  });
  return { contrast: rows, passesAA: rows.every((row) => row.passesAA) };
}

export function renderRunReport(input: {
  state: RunState;
  plan?: Plan;
  rows?: CapabilityPlanRow[];
  budget?: Budget;
  toolCalls?: number;
  now?: Date;
  /** Current checkout root; persisted projectDir can refer to the machine that created the run. */
  projectDir?: string;
}): string {
  const { state, plan } = input;
  const root = input.projectDir ?? state.projectDir;
  const end = input.now ?? new Date(state.updatedAt);
  const elapsed = end.getTime() - Date.parse(state.cycleStartedAt ?? state.startedAt);
  const lastBuild = state.builds.at(-1);
  const built = state.builds.some((b) => b.success && b.cycle === state.cycle);
  const lines: string[] = [];
  lines.push(`# Run report: ${plan?.displayName ?? state.description}`, "");
  lines.push(`Request: ${state.description}`, "");
  lines.push("## Result", "");
  lines.push(`- Status: **${state.status}**${state.failure ? ` (${conciseDiagnostic(state.failure)})` : ""}`);
  lines.push(`- Elapsed: ${Math.round(elapsed / 60000)} min; build attempts: ${state.builds.length} (cap ${state.maxBuildAttempts} per cycle, ${state.cycle} cycle${state.cycle === 1 ? "" : "s"})`);
  lines.push(`- Last build: ${lastBuild ? `${lastBuild.success ? "succeeded" : `failed with ${lastBuild.errors} error(s)`} in ${seconds(lastBuild.durationMs)}` : "not run"}`);
  lines.push(`- Launched: ${state.run ? `yes, on ${state.run.simulator} (${state.run.udid})${state.run.pid ? `, pid ${state.run.pid}` : ""}` : "no"}`);
  lines.push(`- Screenshots: ${state.screenshots.length}`);
  if (state.toolchain) lines.push(`- Toolchain: ${state.toolchain.xcode ?? "unknown Xcode"}; simulator ${state.toolchain.simulator ?? "unknown"}${state.toolchain.sdk ? `; iOS Simulator SDK ${state.toolchain.sdk}` : ""}`);
  if (input.toolCalls !== undefined) lines.push(`- External tool calls logged: ${input.toolCalls} (\`.ios-agent/tool-log.jsonl\`)`);
  lines.push("");

  if (plan?.design) {
    lines.push("## Design evidence", "", `- Direction: ${plan.design.mood}; ${plan.design.palette.name} palette; ${plan.design.typography} typography; ${plan.design.shape} shapes; ${plan.design.density} density; ${plan.design.motion} motion.`);
    if (state.designEvidence) {
      lines.push(`- Palette on-color contrast: ${state.designEvidence.passesAA ? "PASS" : "FAIL"} (4.5:1 minimum for all generated light/dark semantic color pairs).`);
      if (state.designEvidence.paletteMatchesPlan !== undefined) lines.push(`- Generated semantic colors match the approved plan palette: ${state.designEvidence.paletteMatchesPlan ? "PASS" : "FAIL"}.`);
      lines.push("", "| Color | Light | Dark | WCAG AA |", "|---|---:|---:|---|");
      for (const row of state.designEvidence.contrast) lines.push(`| ${row.color} | ${row.light.toFixed(2)}:1 | ${row.dark.toFixed(2)}:1 | ${row.passesAA ? "Pass" : "Fail"} |`);
    } else lines.push("- Palette on-color contrast: not audited (generated color assets were unavailable)." );
    if (state.screenshots.length) {
      const groups = new Map<string, typeof state.screenshots>();
      for (const shot of state.screenshots) groups.set(shot.screen, [...(groups.get(shot.screen) ?? []), shot]);
      for (const [screen, shots] of groups) {
        if (shots.every((shot) => !shot.variant)) {
          const rel = localImagePath(root, shots[0].path);
          lines.push("", `### ${screen} — single capture; appearance and text size not recorded`, "", rel ? `<img src="${rel}" alt="${screen} screen in the iOS Simulator" width="260">` : "Screenshot file is outside this project checkout and was omitted.");
          continue;
        }
        const variants = new Set(shots.map((shot) => shot.variant));
        const complete = ["light", "dark", "xxl"].every((variant) => variants.has(variant as "light" | "dark" | "xxl"));
        lines.push("", `### ${screen} — ${complete ? "light, dark and XXL captured" : "partial design evidence"}`, "", "| Light | Dark | XXL Dynamic Type |", "|---|---|---|");
        const byVariant = new Map(shots.filter((shot) => shot.variant).map((shot) => [shot.variant, shot]));
        lines.push(`| ${imageCell(byVariant.get("light"), root, screen, "light appearance")} | ${imageCell(byVariant.get("dark"), root, screen, "dark appearance")} | ${imageCell(byVariant.get("xxl"), root, screen, "XXL Dynamic Type")} |`);
      }
    }
    lines.push("", "The palette check validates generated semantic color assets only. It does not measure every text/background pairing authored by the app, images, gradients or runtime state.", "");
  } else if (state.screenshots.length) {
      lines.push("## Screens", "");
      for (const shot of state.screenshots) {
        const rel = localImagePath(root, shot.path);
        lines.push(`### ${shot.screen}`, "", rel ? `<img src="${rel}" alt="${shot.screen} screen in the iOS Simulator" width="260">` : "Screenshot file is outside this project checkout and was omitted.", "");
      }
  }

  lines.push("## Visual model review", "", "Screenshot review is a model assessment, not HIG certification or an accessibility audit. VoiceOver, interaction, motion and offscreen states need separate tests.", "");
  if (!state.visualReviews?.length) lines.push("No completed visual model review. Screenshots alone do not establish a design pass.", "");
  for (const review of state.visualReviews ?? []) {
    lines.push(`### Cycle ${review.cycle}, round ${review.round}: ${review.status}`, "", `Evidence: .ios-agent/design-reviews/${review.key}/review.json`, "");
    for (const screen of review.screens) {
      lines.push(`- ${screen.screen}: ${screen.assessment?.verdict ?? "incomplete"}`);
      for (const finding of screen.assessment?.findings ?? []) lines.push(`  - ${finding.variant} / ${finding.category}: ${finding.observation} Repair: ${finding.repair}`);
      for (const limitation of screen.assessment?.limitations ?? []) lines.push(`  - Limitation: ${limitation}`);
    }
    lines.push("");
  }
  lines.push("## Capabilities", "");
  if (!state.capabilities.length && !state.unavailable.length) lines.push("No capabilities beyond SwiftUI and Foundation.", "");
  if (state.capabilities.length) {
    lines.push("| Capability | Applied | Module status | Awaiting credentials | Notes |", "|---|---|---|---|---|");
    for (const c of state.capabilities) {
      lines.push(`| ${c.name} (\`${c.id}\`) | yes, ${c.files} file(s) | ${c.status} | ${c.placeholders.length ? c.placeholders.map((k) => `\`${k}\``).join(", ") : "none"} | ${c.notes.join("; ").replace(/\|/g, "\\|") || ""} |`);
    }
    lines.push("", built ? "Applied capabilities compiled as part of this app's successful build." : "The app did not build successfully, so applied capabilities are not confirmed to compile.", "");
  }
  if (state.unavailable.length) {
    lines.push("Requested but not built:", "", ...state.unavailable.map((u) => `- \`${u.id}\`: ${u.reason}`), "");
  }

  const tabletShots = state.screenshots.filter(s => s.device === "ipad");
  lines.push("## iPad evidence", "");
  if (!tabletShots.length) lines.push("Not captured; tablet layout remains unverified.", "");
  for (const shot of tabletShots) lines.push(`- [${shot.screen} / ${shot.variant}](${shot.path})`);
  lines.push("", "## Tests", "");
  if (!state.tests?.length) lines.push("Not run. A successful build is not test evidence.", "");
  for (const t of state.tests ?? []) lines.push(`- ${t.status}: ${t.passed} passed, ${t.failed} failed, ${t.skipped} skipped; source ${t.sourceHash}. [Log](${t.logPath}); result bundle: ${t.resultBundle}${t.reason ? ` — ${t.reason}` : ""}`, "");
  lines.push("## Builds", "");
  if (!state.builds.length) lines.push("No build ran.", "");
  else {
    lines.push("| Cycle | Attempt | Result | Errors | Warnings | Time |", "|---|---|---|---|---|---|");
    for (const b of state.builds) lines.push(`| ${b.cycle} | ${b.attempt} | ${b.success ? "success" : "failed"} | ${b.errors} | ${b.warnings} | ${seconds(b.durationMs)} |`);
    const failing = [...state.builds].reverse().find((b) => !b.success);
    if (lastBuild && !lastBuild.success && failing) {
      lines.push("", "Last errors:", "", ...failing.firstErrors.map((e) => `- ${e.file ? `${e.file}:${e.line ?? "?"}:${e.column ?? "?"}: ` : ""}${e.message}`));
    }
    lines.push("");
  }

  const needs: string[] = [];
  for (const row of input.rows ?? []) {
    for (const c of row.credentials) needs.push(`- \`${c.key}\` for ${row.name}${c.kind === "server" ? " (set it on your backend, never in the app)" : " (add it to `.env`, then rebuild)"}: ${c.whereToGet}`);
  }
  for (const item of input.budget?.lines ?? []) needs.push(`- ${item.label} (${item.capability}): $${item.usd.toFixed(2)} ${item.period === "once" ? "once" : `per ${item.period}`}${item.verified ? "" : ", unverified"}`);
  for (const item of input.budget?.unpriced ?? []) needs.push(`- ${item.capability}: ${item.model}, ${item.note}`);
  lines.push("## Needs your accounts or money", "");
  if (!needs.length) lines.push("Nothing. The app runs in the simulator without accounts.", "");
  else lines.push(...needs, "");
  lines.push("Running on a physical iPhone, TestFlight or the App Store requires your own Apple Developer Program membership and signing team; the agent builds unsigned for the simulator only.", "");

  lines.push("## Next", "");
  const next: string[] = [];
  if (!built) next.push(`Fix the remaining build errors (see \`.ios-agent/logs\`), or run \`/ios-build --resume\` to continue with a new attempt budget.`);
  if (state.capabilities.some((c) => c.placeholders.length)) next.push("Fill in `.env` from `.env.example`, then rebuild so the placeholder keys are replaced.");
  if (state.unavailable.length) next.push("Capabilities listed as not built need a module in `capabilities/` before the agent can add them.");
  next.push('Ask for changes with `/ios-build --refine "<change>"`.');
  next.push(`Open \`${plan?.appName ?? "App"}.xcodeproj\` in Xcode to edit and run it yourself.`);
  lines.push(...next.map((n, i) => `${i + 1}. ${n}`), "");

  lines.push("## Progress log", "", "```text", ...state.progress.map((p) => `${p.at.slice(11, 19)} [${p.stage}] ${conciseDiagnostic(p.message)}`), "```", "");
  return lines.join("\n");
}

function imageCell(shot: RunState["screenshots"][number] | undefined, root: string, screen: string, label: string): string {
  if (!shot) return "Not captured";
  const rel = localImagePath(root, shot.path);
  if (!rel) return "Not available in this checkout";
  return `<img src="${rel}" alt="${screen} in ${label}" width="200">`;
}
