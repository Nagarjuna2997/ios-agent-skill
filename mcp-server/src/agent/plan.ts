// The plan is what a non-developer reviews before any code exists: screens,
// data model, capabilities with their defaults and alternatives, what each
// needs from the user, and a budget built only from stated cost data.
import { z } from "zod";
import type { CatalogEntry, LoadedCapability, Resolution } from "./capabilities.js";
import { SWIFT_IDENTIFIER } from "./spec.js";

const SCREEN_ID = /^[a-z][a-z0-9-]{0,39}$/;

export const PlanSchema = z
  .object({
    appName: z.string().regex(SWIFT_IDENTIFIER, "UpperCamelCase Swift identifier"),
    displayName: z.string().min(1).max(30),
    summary: z.string().min(1).max(600),
    bundleId: z.string().optional(),
    navigation: z.enum(["tabs", "stack", "split"]),
    screens: z
      .array(
        z
          .object({
            id: z.string().regex(SCREEN_ID),
            title: z.string().min(1).max(40),
            purpose: z.string().min(1).max(200),
            topLevel: z.boolean(),
            capabilities: z.array(z.string()).default([]),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    models: z
      .array(
        z
          .object({
            name: z.string().regex(SWIFT_IDENTIFIER),
            persisted: z.boolean(),
            fields: z
              .array(z.object({ name: z.string().regex(/^[a-z][A-Za-z0-9]{0,39}$/), type: z.string().min(1).max(60), optional: z.boolean().default(false) }).strict())
              .min(1)
              .max(40),
          })
          .strict(),
      )
      .max(30)
      .default([]),
    capabilities: z.array(z.object({ id: z.string().min(1), reason: z.string().min(1).max(200) }).strict()).max(60).default([]),
    features: z.array(z.string().min(1).max(200)).max(40).default([]),
    assumptions: z.array(z.string().min(1).max(300)).max(20).default([]),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const ids = new Set<string>();
    for (const screen of plan.screens) {
      if (ids.has(screen.id)) ctx.addIssue({ code: "custom", message: `Duplicate screen id ${screen.id}` });
      ids.add(screen.id);
    }
    if (!plan.screens.some((s) => s.topLevel)) ctx.addIssue({ code: "custom", message: "At least one screen must be topLevel (reachable from launch)." });
    if (plan.navigation === "tabs" && plan.screens.filter((s) => s.topLevel).length > 5) {
      ctx.addIssue({ code: "custom", message: "A tab bar shows at most five top-level screens." });
    }
  });
export type Plan = z.infer<typeof PlanSchema>;

export type BuildDepth = "full" | "placeholder-credentials" | "not-available";

export interface CapabilityPlanRow {
  id: string;
  name: string;
  reason: string;
  appleNative: boolean;
  alternatives: string[];
  cost: string;
  credentials: Array<{ key: string; kind: "client" | "server"; whereToGet: string }>;
  depth: BuildDepth;
  status: string;
}

export interface Budget {
  oneTimeUsd: number;
  monthlyUsd: number;
  yearlyUsd: number;
  lines: Array<{ capability: string; label: string; usd: number; period: "once" | "month" | "year"; verified: boolean; checkedOn?: string; source?: string }>;
  unpriced: Array<{ capability: string; model: string; note: string }>;
}

export function capabilityRows(plan: Plan, resolution: Resolution, env: Record<string, string> = {}): CapabilityPlanRow[] {
  const reasons = new Map(plan.capabilities.map((c) => [c.id, c.reason]));
  const added = new Map(resolution.added.map((a) => [a.id, a.because]));
  const rows: CapabilityPlanRow[] = resolution.ordered.map(({ manifest }: LoadedCapability) => {
    const credentials = manifest.credentialsNeeded.map((c) => ({ key: c.key, kind: c.kind, whereToGet: c.whereToGet }));
    const missing = manifest.credentialsNeeded.some((c) => !env[c.key] || env[c.key] === "REPLACE_ME");
    return {
      id: manifest.id,
      name: manifest.name,
      reason: reasons.get(manifest.id) ?? added.get(manifest.id) ?? "requested",
      appleNative: manifest.appleNative,
      alternatives: manifest.alternatives,
      cost: `${manifest.cost.model}: ${manifest.cost.note}`,
      credentials,
      depth: missing && credentials.length ? "placeholder-credentials" : "full",
      status: manifest.status,
    };
  });
  for (const missing of resolution.unavailable) {
    rows.push({
      id: missing.id,
      name: missing.catalog?.name ?? missing.id,
      reason: reasons.get(missing.id) ?? "requested",
      appleNative: missing.catalog?.appleNative ?? false,
      alternatives: [],
      cost: missing.catalog ? `${missing.catalog.cost.model}: ${missing.catalog.cost.note}` : "unknown",
      credentials: (missing.catalog?.credentials ?? []).map((key) => ({ key, kind: "client" as const, whereToGet: "see catalog" })),
      depth: "not-available",
      status: missing.catalog?.status ?? "unknown",
    });
  }
  return rows;
}

export function budget(resolution: Resolution, catalog: CatalogEntry[] = []): Budget {
  const result: Budget = { oneTimeUsd: 0, monthlyUsd: 0, yearlyUsd: 0, lines: [], unpriced: [] };
  for (const { manifest } of resolution.ordered) {
    if (manifest.cost.model === "free" && !manifest.cost.amounts.length) continue;
    if (!manifest.cost.amounts.length) {
      result.unpriced.push({ capability: manifest.id, model: manifest.cost.model, note: manifest.cost.note });
      continue;
    }
    for (const amount of manifest.cost.amounts) {
      result.lines.push({
        capability: manifest.id,
        label: amount.label,
        usd: amount.usd,
        period: amount.period,
        verified: amount.verified,
        ...(amount.checkedOn ? { checkedOn: amount.checkedOn } : {}),
        ...(amount.source ? { source: amount.source } : {}),
      });
      if (amount.period === "once") result.oneTimeUsd += amount.usd;
      else if (amount.period === "month") result.monthlyUsd += amount.usd;
      else result.yearlyUsd += amount.usd;
    }
  }
  for (const missing of resolution.unavailable) {
    const entry = missing.catalog ?? catalog.find((e) => e.id === missing.id);
    if (entry && entry.cost.model !== "free") result.unpriced.push({ capability: entry.id, model: entry.cost.model, note: entry.cost.note });
  }
  return result;
}

const escapeCell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const money = (usd: number) => `$${usd.toFixed(2)}`;
const DEPTH: Record<BuildDepth, string> = {
  full: "Built with the app",
  "placeholder-credentials": "Built with placeholder keys; works after you add credentials",
  "not-available": "Not built: no module yet",
};

export function renderPlanMarkdown(plan: Plan, rows: CapabilityPlanRow[], money_: Budget, toolchain?: { xcode?: string; simulator?: string }): string {
  const lines: string[] = [];
  lines.push(`# ${plan.displayName}: build plan`, "", plan.summary, "");
  if (toolchain) lines.push(`Target toolchain: ${toolchain.xcode ?? "Xcode not detected"}; simulator: ${toolchain.simulator ?? "none detected"}.`, "");
  lines.push("## Screens", "", "| Screen | Reached from | Purpose |", "|---|---|---|");
  for (const screen of plan.screens) {
    lines.push(`| ${escapeCell(screen.title)} (\`${screen.id}\`) | ${screen.topLevel ? (plan.navigation === "tabs" ? "tab bar" : "launch") : "navigation"} | ${escapeCell(screen.purpose)} |`);
  }
  lines.push("", `Navigation: ${plan.navigation}.`, "");
  lines.push("## Data model", "");
  if (!plan.models.length) lines.push("No stored data model.", "");
  for (const model of plan.models) {
    lines.push(`- **${model.name}**${model.persisted ? " (stored on device with SwiftData)" : ""}: ${model.fields.map((f) => `${f.name}: ${f.type}${f.optional ? "?" : ""}`).join(", ")}`);
  }
  if (plan.models.length) lines.push("");
  lines.push("## Capabilities", "");
  if (!rows.length) lines.push("Only SwiftUI and Foundation; no additional capabilities.", "");
  else {
    lines.push("| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |", "|---|---|---|---|---|---|---|---|");
    for (const row of rows) {
      const provide = row.credentials.length ? row.credentials.map((c) => `\`${c.key}\`${c.kind === "server" ? " (server only)" : ""}`).join(", ") : "nothing";
      lines.push(
        `| ${escapeCell(row.name)} | ${escapeCell(row.reason)} | ${row.appleNative ? "Apple-native" : "third-party"} | ${row.alternatives.length ? row.alternatives.join(", ") : "none"} | ${escapeCell(row.cost)} | ${provide} | ${DEPTH[row.depth]} | ${row.status} |`,
      );
    }
    lines.push("", "Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.", "");
  }
  lines.push("## Budget", "");
  lines.push("Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.", "");
  if (money_.lines.length) {
    lines.push("| Capability | Item | Amount | Verified |", "|---|---|---|---|");
    for (const line of money_.lines) {
      lines.push(`| ${line.capability} | ${escapeCell(line.label)} | ${money(line.usd)} ${line.period === "once" ? "once" : `per ${line.period}`} | ${line.verified ? `yes${line.checkedOn ? ` (${line.checkedOn})` : ""}` : "no"} |`);
    }
    lines.push("", `Totals from priced items: ${money(money_.oneTimeUsd)} one-time, ${money(money_.monthlyUsd)} per month, ${money(money_.yearlyUsd)} per year.`, "");
  } else lines.push("No priced items.", "");
  if (money_.unpriced.length) {
    lines.push("Not included in the totals (usage-based or no confirmed price):", "");
    for (const item of money_.unpriced) lines.push(`- ${item.capability}: ${item.model}, ${item.note}`);
    lines.push("");
  }
  if (plan.assumptions.length) {
    lines.push("## Assumptions", "", ...plan.assumptions.map((a) => `- ${a}`), "");
  }
  return lines.join("\n");
}
