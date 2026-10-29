// Versioned design contract: the machine-readable source of truth for substantial
// iOS work. DESIGN.md is rendered from it deterministically and never edited by hand.
import { createHash } from "node:crypto";
import { z } from "zod";

export const CONTRACT_SCHEMA_VERSION = 1 as const;

const id = (pattern: RegExp, hint: string) => z.string().regex(pattern, hint);
export const DESIGN_ID = /^[a-z0-9][a-z0-9-]{0,40}$/;
export const CRITERION_ID = /^AC-[0-9]{1,4}$/;
export const STEP_ID = /^S-[0-9]{1,4}$/;

/** Where a claim about existing behaviour comes from. Prose alone is not evidence. */
export const EvidenceRefSchema = z
  .object({
    path: z.string().min(1).max(400).describe("Project-relative path, forward slashes."),
    line: z.number().int().min(1).optional(),
    symbol: z.string().max(200).optional(),
    note: z.string().max(400).optional(),
  })
  .strict();
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const CLAIM_KINDS = ["fact", "decision", "assumption", "unknown"] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

/** A statement tagged by epistemic status. Facts must cite evidence; unknowns name what would settle them. */
export const ClaimSchema = z
  .object({
    kind: z.enum(CLAIM_KINDS),
    text: z.string().min(1).max(1000),
    evidence: z.array(EvidenceRefSchema).max(20).default([]),
    resolves: z.string().max(400).optional().describe("For unknowns: what check or decision would settle this."),
  })
  .strict()
  .superRefine((claim, ctx) => {
    if (claim.kind === "fact" && claim.evidence.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `fact needs evidence: ${claim.text.slice(0, 60)}` });
    }
  });
export type Claim = z.infer<typeof ClaimSchema>;

export const VERIFICATION_METHODS = [
  "compile",
  "unit-test",
  "ui-test",
  "simulator",
  "visual",
  "accessibility",
  "external-service",
  "signed-distribution",
  "manual",
] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const AcceptanceCriterionSchema = z
  .object({
    id: id(CRITERION_ID, "AC-<number>"),
    statement: z.string().min(1).max(600),
    method: z.enum(VERIFICATION_METHODS),
    /** Optional pointer to the thing that proves it: a test name, screen id or external system. */
    target: z.string().max(200).optional(),
  })
  .strict();
export type AcceptanceCriterion = z.infer<typeof AcceptanceCriterionSchema>;

export const ImplementationStepSchema = z
  .object({
    id: id(STEP_ID, "S-<number>"),
    description: z.string().min(1).max(600),
    criteria: z.array(id(CRITERION_ID, "AC-<number>")).min(1).max(30),
    dependsOn: z.array(id(STEP_ID, "S-<number>")).max(20).default([]),
    files: z.array(z.string().max(400)).max(50).default([]),
  })
  .strict();
export type ImplementationStep = z.infer<typeof ImplementationStepSchema>;

export const ScreenStateSchema = z
  .object({
    screen: z.string().min(1).max(80),
    states: z.array(z.enum(["loading", "empty", "success", "error", "offline", "partial"])).min(1),
    accessibility: z.array(z.string().max(300)).max(20).default([]),
  })
  .strict();

export const PermissionSchema = z
  .object({
    key: z.string().min(1).max(120).describe("Info.plist usage key or entitlement key."),
    purpose: z.string().max(300),
    kind: z.enum(["usage-description", "entitlement", "capability"]),
  })
  .strict();

export const DependencySchema = z
  .object({
    name: z.string().min(1).max(120),
    kind: z.enum(["swift-package", "apple-framework", "service", "tool"]),
    version: z.string().max(60).optional(),
    boundary: z.string().max(300).optional(),
  })
  .strict();

export const DesignContractSchema = z
  .object({
    schemaVersion: z.literal(CONTRACT_SCHEMA_VERSION),
    id: id(DESIGN_ID, "lowercase slug"),
    title: z.string().min(1).max(160),
    /** Revision increases on every saved change; the hash identifies exact content. */
    revision: z.number().int().min(1),
    objective: z.string().min(1).max(2000),
    scope: z.array(z.string().max(400)).min(1).max(40),
    nonGoals: z.array(z.string().max(400)).max(40).default([]),
    constraints: z.array(ClaimSchema).max(40).default([]),
    currentCode: z.array(ClaimSchema).max(60).default([]).describe("Observed facts about the existing code, each with evidence."),
    userJourneys: z.array(z.string().max(600)).max(30).default([]),
    screens: z.array(ScreenStateSchema).max(40).default([]),
    architecture: z.object({
      summary: z.string().max(2000).default(""),
      stateOwnership: z.array(ClaimSchema).max(40).default([]),
      dataFlow: z.array(ClaimSchema).max(40).default([]),
      persistence: z.array(ClaimSchema).max(40).default([]),
    }).strict().default({}),
    apiContracts: z.array(ClaimSchema).max(40).default([]),
    dependencies: z.array(DependencySchema).max(60).default([]),
    deployment: z.object({
      iosMinimum: z.string().regex(/^[0-9]{1,2}(\.[0-9]{1,2})?$/).optional(),
      targets: z.array(z.enum(["iphone", "ipad", "mac-catalyst", "visionos", "watchos", "tvos"])).max(6).default([]),
      toolchain: z.array(ClaimSchema).max(20).default([]),
    }).strict().default({}),
    concurrency: z.array(ClaimSchema).max(40).default([]),
    permissions: z.array(PermissionSchema).max(40).default([]),
    privacy: z.array(ClaimSchema).max(40).default([]),
    failureHandling: z.array(ClaimSchema).max(40).default([]),
    migration: z.array(ClaimSchema).max(40).default([]),
    acceptanceCriteria: z.array(AcceptanceCriterionSchema).min(1).max(200),
    steps: z.array(ImplementationStepSchema).max(200).default([]),
    unresolved: z.array(ClaimSchema).max(40).default([]),
    risks: z.array(ClaimSchema).max(40).default([]),
    requiredFiles: z.array(z.string().max(400)).max(100).default([]).describe("Project-relative files the implementation must contain; drift checks them."),
    requiredSymbols: z.array(z.string().min(1).max(120)).max(100).default([]).describe("Swift identifiers that must appear in project sources."),
  })
  .strict()
  .superRefine((contract, ctx) => {
    const criteria = new Set<string>();
    for (const c of contract.acceptanceCriteria) {
      if (criteria.has(c.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate acceptance criterion ${c.id}` });
      criteria.add(c.id);
    }
    const steps = new Set<string>();
    for (const s of contract.steps) {
      if (steps.has(s.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate step ${s.id}` });
      steps.add(s.id);
      for (const ref of s.criteria) if (!criteria.has(ref)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `step ${s.id} references unknown ${ref}` });
    }
    for (const s of contract.steps) for (const d of s.dependsOn) {
      if (!steps.has(d)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `step ${s.id} depends on unknown ${d}` });
      if (d === s.id) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `step ${s.id} depends on itself` });
    }
    const covered = new Set(contract.steps.flatMap((s) => s.criteria));
    if (contract.steps.length > 0) for (const c of contract.acceptanceCriteria) {
      if (!covered.has(c.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${c.id} is not referenced by any implementation step` });
    }
    for (const p of contract.requiredFiles) if (p.startsWith("/") || p.includes("..") || p.includes("\\")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `requiredFiles entry must be a plain relative path: ${p}` });
    }
  });
export type DesignContract = z.infer<typeof DesignContractSchema>;

/** Contract sections a finding or a revision can point at. Shared by reviewers and drift. */
export const SECTIONS = [
  "objective", "scope", "nonGoals", "constraints", "currentCode", "userJourneys", "screens", "architecture",
  "apiContracts", "dependencies", "deployment", "concurrency", "permissions", "privacy", "failureHandling",
  "migration", "acceptanceCriteria", "steps", "unresolved", "risks", "requiredFiles", "requiredSymbols",
] as const;
export type Section = (typeof SECTIONS)[number];

/** Fields that must be non-empty before a contract can be marked ready. */
export const MANDATORY_FOR_READY: ReadonlyArray<{ section: Section; reason: string }> = [
  { section: "objective", reason: "states what the work is for" },
  { section: "scope", reason: "bounds the work" },
  { section: "acceptanceCriteria", reason: "defines when the work is done" },
  { section: "steps", reason: "connects criteria to implementation" },
];

export interface ValidationResult {
  ok: boolean;
  contract?: DesignContract;
  errors: string[];
  /** Advisory gaps that do not block saving but block readiness. */
  readinessGaps: string[];
}

function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path.length ? issue.path.join(".") : "contract";
  return `${path}: ${issue.message}`;
}

export function readinessGaps(contract: DesignContract): string[] {
  const gaps: string[] = [];
  for (const m of MANDATORY_FOR_READY) {
    const value = contract[m.section];
    const empty = Array.isArray(value) ? value.length === 0 : typeof value === "string" ? value.trim() === "" : !value;
    if (empty) gaps.push(`${m.section} is empty (${m.reason})`);
  }
  const blockingUnknowns = contract.unresolved.filter((u) => u.kind === "unknown" && !u.resolves);
  for (const u of blockingUnknowns) gaps.push(`unresolved unknown without a settling check: ${u.text.slice(0, 80)}`);
  if (contract.currentCode.length === 0) gaps.push("currentCode has no observed facts; readiness needs evidence of what exists today");
  return gaps;
}

export function validateContract(input: unknown): ValidationResult {
  const migrated = migrateContract(input);
  if (!migrated.ok) return { ok: false, errors: migrated.errors, readinessGaps: [] };
  const parsed = DesignContractSchema.safeParse(migrated.value);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map(formatIssue), readinessGaps: [] };
  return { ok: true, contract: parsed.data, errors: [], readinessGaps: readinessGaps(parsed.data) };
}

/**
 * Migrate older schema versions forward. There is only version 1 today; the function
 * exists so a future bump has a single, tested place to land and so unknown versions
 * fail loudly instead of being half-parsed.
 */
export function migrateContract(input: unknown): { ok: true; value: unknown; migrated: string[] } | { ok: false; errors: string[] } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["contract must be a JSON object"] };
  const record = { ...(input as Record<string, unknown>) };
  const migrated: string[] = [];
  const version = record.schemaVersion;
  if (version === undefined) {
    record.schemaVersion = CONTRACT_SCHEMA_VERSION;
    migrated.push("schemaVersion defaulted to 1");
  } else if (version !== CONTRACT_SCHEMA_VERSION) {
    return { ok: false, errors: [`unsupported contract schemaVersion ${String(version)}; this build reads version ${CONTRACT_SCHEMA_VERSION}`] };
  }
  if (record.revision === undefined) {
    record.revision = 1;
    migrated.push("revision defaulted to 1");
  }
  return { ok: true, value: record, migrated };
}

/** Canonical JSON: sorted keys, no whitespace, so equal contracts hash equally regardless of author formatting. */
export function canonicalJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.keys(value as Record<string, unknown>).sort().map((k) => `${JSON.stringify(k)}:${canonicalJSON((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function contractHash(contract: DesignContract): string {
  return createHash("sha256").update(canonicalJSON(contract)).digest("hex");
}

/** Hash of a single section, used to decide which review findings a revision invalidates. */
export function sectionHashes(contract: DesignContract): Record<Section, string> {
  const out = {} as Record<Section, string>;
  for (const s of SECTIONS) out[s] = createHash("sha256").update(canonicalJSON(contract[s] ?? null)).digest("hex").slice(0, 16);
  return out;
}

export function changedSections(before: DesignContract, after: DesignContract): Section[] {
  const a = sectionHashes(before), b = sectionHashes(after);
  return SECTIONS.filter((s) => a[s] !== b[s]);
}

// ---------------------------------------------------------------------------
// Deterministic Markdown rendering.

const KIND_LABEL: Record<ClaimKind, string> = { fact: "Observed", decision: "Decision", assumption: "Assumption", unknown: "Unknown" };

function refText(e: EvidenceRef): string {
  const loc = e.line ? `${e.path}:${e.line}` : e.path;
  return e.symbol ? `${loc} (${e.symbol})` : loc;
}

function claimLines(claims: Claim[]): string[] {
  if (claims.length === 0) return ["_None recorded._"];
  return claims.map((c) => {
    const ev = c.evidence.length ? ` — evidence: ${c.evidence.map(refText).join("; ")}` : "";
    const res = c.kind === "unknown" && c.resolves ? ` — settled by: ${c.resolves}` : "";
    return `- **${KIND_LABEL[c.kind]}.** ${c.text}${ev}${res}`;
  });
}

function bullets(items: string[]): string[] {
  return items.length ? items.map((i) => `- ${i}`) : ["_None recorded._"];
}

export function renderContractMarkdown(contract: DesignContract): string {
  const hash = contractHash(contract);
  const lines: string[] = [];
  lines.push(`# ${contract.title}`, "");
  lines.push(`<!-- Rendered from DESIGN.json (schema ${contract.schemaVersion}, revision ${contract.revision}, sha256 ${hash}). Edit the JSON, not this file. -->`, "");
  lines.push(`Design \`${contract.id}\` · revision ${contract.revision} · hash \`${hash.slice(0, 12)}\``, "");
  lines.push("Legend: **Observed** cites evidence in the current code; **Decision** is proposed; **Assumption** is unverified; **Unknown** needs settling.", "");
  lines.push("## Objective", "", contract.objective, "");
  lines.push("## Scope", "", ...bullets(contract.scope), "");
  lines.push("## Non-goals", "", ...bullets(contract.nonGoals), "");
  lines.push("## Constraints", "", ...claimLines(contract.constraints), "");
  lines.push("## Current code", "", ...claimLines(contract.currentCode), "");
  lines.push("## User journeys", "", ...bullets(contract.userJourneys), "");
  lines.push("## Screens and states", "");
  if (contract.screens.length === 0) lines.push("_None recorded._");
  else {
    lines.push("| Screen | States | Accessibility |", "|---|---|---|");
    for (const s of contract.screens) lines.push(`| ${s.screen} | ${s.states.join(", ")} | ${s.accessibility.join("; ") || "—"} |`);
  }
  lines.push("");
  lines.push("## Architecture", "", contract.architecture.summary || "_No summary._", "");
  lines.push("### State ownership", "", ...claimLines(contract.architecture.stateOwnership), "");
  lines.push("### Data flow", "", ...claimLines(contract.architecture.dataFlow), "");
  lines.push("### Persistence", "", ...claimLines(contract.architecture.persistence), "");
  lines.push("## API contracts and service boundaries", "", ...claimLines(contract.apiContracts), "");
  lines.push("## Dependencies", "");
  if (contract.dependencies.length === 0) lines.push("_None recorded._");
  else {
    lines.push("| Name | Kind | Version | Boundary |", "|---|---|---|---|");
    for (const d of contract.dependencies) lines.push(`| ${d.name} | ${d.kind} | ${d.version ?? "—"} | ${d.boundary ?? "—"} |`);
  }
  lines.push("");
  lines.push("## Deployment", "");
  lines.push(`- Minimum iOS: ${contract.deployment.iosMinimum ?? "not stated"}`);
  lines.push(`- Targets: ${contract.deployment.targets.join(", ") || "not stated"}`);
  lines.push(...claimLines(contract.deployment.toolchain).filter((l) => !l.startsWith("_")), "");
  lines.push("## Concurrency and isolation", "", ...claimLines(contract.concurrency), "");
  lines.push("## Permissions and entitlements", "");
  if (contract.permissions.length === 0) lines.push("_None recorded._");
  else {
    lines.push("| Key | Kind | Purpose |", "|---|---|---|");
    for (const p of contract.permissions) lines.push(`| ${p.key} | ${p.kind} | ${p.purpose} |`);
  }
  lines.push("");
  lines.push("## Privacy and credential boundaries", "", ...claimLines(contract.privacy), "");
  lines.push("## Failure handling and recovery", "", ...claimLines(contract.failureHandling), "");
  lines.push("## Migration", "", ...claimLines(contract.migration), "");
  lines.push("## Acceptance criteria", "", "| ID | Statement | Verified by | Target |", "|---|---|---|---|");
  for (const c of contract.acceptanceCriteria) lines.push(`| ${c.id} | ${c.statement} | ${c.method} | ${c.target ?? "—"} |`);
  lines.push("");
  lines.push("## Implementation steps", "");
  if (contract.steps.length === 0) lines.push("_None recorded._");
  else {
    lines.push("| ID | Step | Criteria | Depends on |", "|---|---|---|---|");
    for (const s of contract.steps) lines.push(`| ${s.id} | ${s.description} | ${s.criteria.join(", ")} | ${s.dependsOn.join(", ") || "—"} |`);
  }
  lines.push("");
  lines.push("## Unresolved decisions", "", ...claimLines(contract.unresolved), "");
  lines.push("## Risks", "", ...claimLines(contract.risks), "");
  lines.push("## Drift anchors", "");
  lines.push(`- Required files: ${contract.requiredFiles.join(", ") || "none"}`);
  lines.push(`- Required symbols: ${contract.requiredSymbols.join(", ") || "none"}`);
  lines.push("");
  return lines.join("\n");
}
