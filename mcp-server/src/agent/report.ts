// RUN_REPORT.md: what was built, what was verified, what needs the user's
// accounts or money, and what is next. Every statement comes from run state.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { Budget, CapabilityPlanRow, Plan } from "./plan.js";
import { projectPaths } from "./project.js";
import type { RunState } from "./state.js";

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

export async function toolCallCount(root: string): Promise<number> {
  const file = projectPaths(root).toolLog;
  if (!existsSync(file)) return 0;
  return (await readFile(file, "utf8")).split("\n").filter(Boolean).length;
}

export function renderRunReport(input: {
  state: RunState;
  plan?: Plan;
  rows?: CapabilityPlanRow[];
  budget?: Budget;
  toolCalls?: number;
  now?: Date;
}): string {
  const { state, plan } = input;
  const root = state.projectDir;
  const end = input.now ?? new Date(state.updatedAt);
  const elapsed = end.getTime() - Date.parse(state.startedAt);
  const lastBuild = state.builds.at(-1);
  const built = state.builds.some((b) => b.success && b.cycle === state.cycle);
  const lines: string[] = [];
  lines.push(`# Run report: ${plan?.displayName ?? state.description}`, "");
  lines.push(`Request: ${state.description}`, "");
  lines.push("## Result", "");
  lines.push(`- Status: **${state.status}**${state.failure ? ` (${state.failure})` : ""}`);
  lines.push(`- Elapsed: ${Math.round(elapsed / 60000)} min; build attempts: ${state.builds.length} (cap ${state.maxBuildAttempts} per cycle, ${state.cycle} cycle${state.cycle === 1 ? "" : "s"})`);
  lines.push(`- Last build: ${lastBuild ? `${lastBuild.success ? "succeeded" : `failed with ${lastBuild.errors} error(s)`} in ${seconds(lastBuild.durationMs)}` : "not run"}`);
  lines.push(`- Launched: ${state.run ? `yes, on ${state.run.simulator} (${state.run.udid})${state.run.pid ? `, pid ${state.run.pid}` : ""}` : "no"}`);
  lines.push(`- Screenshots: ${state.screenshots.length}`);
  if (state.toolchain) lines.push(`- Toolchain: ${state.toolchain.xcode ?? "unknown Xcode"}; simulator ${state.toolchain.simulator ?? "unknown"}`);
  if (input.toolCalls !== undefined) lines.push(`- External tool calls logged: ${input.toolCalls} (\`.ios-agent/tool-log.jsonl\`)`);
  lines.push("");

  if (state.screenshots.length) {
    lines.push("## Screens", "");
    for (const shot of state.screenshots) {
      const rel = relative(root, shot.path).split("\\").join("/");
      lines.push(`### ${shot.screen}`, "", `<img src="${rel}" alt="${shot.screen} screen in the iOS Simulator" width="260">`, "");
    }
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

  lines.push("## Progress log", "", "```text", ...state.progress.map((p) => `${p.at.slice(11, 19)} [${p.stage}] ${p.message}`), "```", "");
  return lines.join("\n");
}
