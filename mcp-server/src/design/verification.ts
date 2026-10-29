// Acceptance-to-evidence traceability. Evidence is recorded against the exact contract
// revision and the source fingerprint it was observed on, in separate tiers that are
// never collapsed into one "passed".
import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { z } from "zod";
import type { AcceptanceCriterion, DesignContract, VerificationMethod } from "./contract.js";
import type { DesignWorkflow } from "./workflow.js";

export const TIERS = ["code-written", "compiled", "automated-checks", "simulator-observed", "visual-inspected", "external-verified"] as const;
export type Tier = (typeof TIERS)[number];
const TIER_RANK: Record<Tier, number> = { "code-written": 0, "compiled": 1, "automated-checks": 2, "simulator-observed": 3, "visual-inspected": 4, "external-verified": 5 };

/** The weakest tier that can count for a criterion verified by the given method. */
export const REQUIRED_TIER: Record<VerificationMethod, Tier> = {
  "compile": "compiled",
  "unit-test": "automated-checks",
  "ui-test": "automated-checks",
  "simulator": "simulator-observed",
  "visual": "visual-inspected",
  "accessibility": "visual-inspected",
  "manual": "visual-inspected",
  "external-service": "external-verified",
  "signed-distribution": "external-verified",
};

export const EvidenceEntrySchema = z.object({
  id: z.string().min(1),
  criterion: z.string().regex(/^AC-[0-9]{1,4}$/),
  tier: z.enum(TIERS),
  status: z.enum(["passed", "failed"]),
  source: z.string().min(1).max(400).describe("Project-relative path of the artifact (log, xcresult, screenshot, report)."),
  sha256: z.string().optional(),
  sourceHash: z.string().describe("Fingerprint of the project sources the evidence was observed on."),
  contractHash: z.string(),
  revision: z.number().int().min(1),
  at: z.string(),
  recordedBy: z.enum(["manual", "ios-build-state"]),
  note: z.string().max(600).default(""),
}).strict();
export type EvidenceEntry = z.infer<typeof EvidenceEntrySchema>;

export const StepRecordSchema = z.object({
  status: z.enum(["pending", "in-progress", "done", "abandoned"]),
  at: z.string(),
  note: z.string().max(600).default(""),
  contractHash: z.string(),
}).strict();

export const VerificationFileSchema = z.object({
  version: z.literal(1),
  designId: z.string(),
  entries: z.array(EvidenceEntrySchema).max(2000).default([]),
  steps: z.record(z.string().regex(/^S-[0-9]{1,4}$/), StepRecordSchema).default({}),
}).strict();
export type VerificationFile = z.infer<typeof VerificationFileSchema>;

const FINGERPRINT_FILES = /\.(swift|xcconfig|entitlements|plist|yml|yaml|strings|xcstrings)$|^Package\.swift$|^project\.yml$/;
const SKIP_DIRS = new Set([".ios-agent", ".git", "node_modules", "DerivedData", "xcuserdata", ".build", "Pods", ".swiftpm"]);

/** Deterministic fingerprint of the project's buildable sources, independent of .ios-agent state. */
export async function sourceFingerprint(root: string): Promise<{ hash: string; files: number }> {
  const parts: string[] = [];
  const walk = async (dir: string, depth: number): Promise<void> => {
    if (depth > 12) return;
    let names: string[];
    try { names = (await readdir(dir)).sort(); } catch { return; }
    for (const name of names) {
      if (name.startsWith(".") || SKIP_DIRS.has(name)) continue;
      const full = join(dir, name);
      const st = await lstat(full);
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) await walk(full, depth + 1);
      else if (st.isFile() && FINGERPRINT_FILES.test(name) && st.size <= 2_000_000) {
        const rel = relative(root, full).split("\\").join("/");
        parts.push(`${rel}\0${createHash("sha256").update(await readFile(full)).digest("hex")}`);
        if (parts.length > 5000) return;
      }
    }
  };
  await walk(root, 0);
  return { hash: createHash("sha256").update(parts.sort().join("\n")).digest("hex"), files: parts.length };
}

export async function loadVerification(design: DesignWorkflow): Promise<VerificationFile> {
  const raw = await design.store.readJSON<unknown>(design.store.paths.verification);
  if (raw === undefined) return { version: 1, designId: design.id, entries: [], steps: {} };
  const parsed = VerificationFileSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`verification.json is invalid: ${parsed.error.issues[0]?.message ?? "unknown"}; preserve it and repair or remove it.`);
  return parsed.data;
}

async function saveVerification(design: DesignWorkflow, file: VerificationFile): Promise<void> {
  await design.store.writeJSON(design.store.paths.verification, VerificationFileSchema.parse(file));
}

export interface RecordEvidenceInput {
  criterion: string;
  tier: Tier;
  status: "passed" | "failed";
  source: string;
  note?: string;
  recordedBy?: "manual" | "ios-build-state";
  sourceHash?: string;
}

/** Record evidence against the current contract revision. The artifact is hashed when it exists. */
export async function recordEvidence(design: DesignWorkflow, inputs: RecordEvidenceInput[]): Promise<{ added: EvidenceEntry[]; file: VerificationFile }> {
  return design.store.locked(async () => {
    const bundle = await design.load();
    const file = await loadVerification(design);
    const fingerprint = (await sourceFingerprint(design.projectDir)).hash;
    const added: EvidenceEntry[] = [];
    for (const input of inputs) {
      if (!bundle.contract.acceptanceCriteria.some((c) => c.id === input.criterion)) throw new Error(`Unknown acceptance criterion ${input.criterion}`);
      if (input.source.startsWith("/") || input.source.includes("..")) throw new Error(`Evidence source must be a project-relative path: ${input.source}`);
      let sha256: string | undefined;
      try {
        const st = await lstat(join(design.projectDir, input.source));
        if (st.isFile() && !st.isSymbolicLink() && st.size <= 50_000_000) sha256 = createHash("sha256").update(await readFile(join(design.projectDir, input.source))).digest("hex");
      } catch { sha256 = undefined; }
      const entry: EvidenceEntry = {
        id: `E-${createHash("sha256").update(`${input.criterion}|${input.tier}|${input.source}|${bundle.workflow.contractHash}|${input.sourceHash ?? fingerprint}|${input.status}`).digest("hex").slice(0, 8)}`,
        criterion: input.criterion, tier: input.tier, status: input.status, source: input.source,
        ...(sha256 ? { sha256 } : {}),
        sourceHash: input.sourceHash ?? fingerprint, contractHash: bundle.workflow.contractHash, revision: bundle.workflow.revision,
        at: new Date().toISOString(), recordedBy: input.recordedBy ?? "manual", note: input.note ?? "",
      };
      if (!file.entries.some((e) => e.id === entry.id)) { file.entries.push(entry); added.push(entry); }
    }
    if (file.entries.length > 2000) file.entries = file.entries.slice(-2000);
    await saveVerification(design, file);
    return { added, file };
  });
}

export async function recordStep(design: DesignWorkflow, stepId: string, status: "pending" | "in-progress" | "done" | "abandoned", note = ""): Promise<VerificationFile> {
  return design.store.locked(async () => {
    const bundle = await design.load();
    if (!bundle.contract.steps.some((s) => s.id === stepId)) throw new Error(`Unknown step ${stepId}`);
    const file = await loadVerification(design);
    file.steps[stepId] = { status, at: new Date().toISOString(), note, contractHash: bundle.workflow.contractHash };
    await saveVerification(design, file);
    return file;
  });
}

/** Minimal view of the /ios-build run state this module reads; the real schema lives in agent/state.ts. */
interface BuildStateView {
  builds?: Array<{ success: boolean; cycle: number; attempt: number; at: string }>;
  tests?: Array<{ status: string; logPath?: string; resultBundle?: string; sourceHash?: string; at?: string }>;
  screenshots?: Array<{ screen: string; path: string; variant?: string }>;
  buildSourceHash?: string;
  captureSourceHash?: string;
  visualReviews?: Array<{ screen?: string; round?: number; passes?: boolean; assessment?: { passes?: boolean } }>;
}

/**
 * Import evidence from the existing /ios-build state. Mapping is deterministic:
 * builds -> compile criteria; tests -> unit/ui-test criteria whose target appears in the log;
 * screenshots -> simulator criteria whose target is the screen id. Anything else is reported as unmapped.
 */
export async function importBuildState(design: DesignWorkflow): Promise<{ added: EvidenceEntry[]; unmapped: Array<{ criterion: string; reason: string }> }> {
  const bundle = await design.load();
  const root = design.projectDir;
  const stateText = await readFile(join(root, ".ios-agent", "state.json"), "utf8").catch(() => undefined);
  if (!stateText) return { added: [], unmapped: bundle.contract.acceptanceCriteria.map((c) => ({ criterion: c.id, reason: "no .ios-agent/state.json; run /ios-build first" })) };
  const state = JSON.parse(stateText) as BuildStateView;
  const inputs: RecordEvidenceInput[] = [];
  const unmapped: Array<{ criterion: string; reason: string }> = [];
  const lastBuild = [...(state.builds ?? [])].reverse().find((b) => b.success);
  const lastTest = [...(state.tests ?? [])].reverse().find((t) => t.status === "passed");
  const testLog = lastTest?.logPath ? await readFile(join(root, lastTest.logPath), "utf8").catch(() => "") : "";
  for (const c of bundle.contract.acceptanceCriteria) {
    const req = REQUIRED_TIER[c.method];
    if (req === "compiled") {
      if (lastBuild && state.buildSourceHash) inputs.push({ criterion: c.id, tier: "compiled", status: "passed", source: `.ios-agent/logs/build-${lastBuild.attempt}.log`, recordedBy: "ios-build-state", sourceHash: state.buildSourceHash, note: `build cycle ${lastBuild.cycle} attempt ${lastBuild.attempt}` });
      else unmapped.push({ criterion: c.id, reason: "no successful build recorded" });
    } else if (req === "automated-checks") {
      if (!c.target) unmapped.push({ criterion: c.id, reason: "criterion has no test target to match against the test log" });
      else if (lastTest?.logPath && lastTest.sourceHash && testLog.includes(c.target)) inputs.push({ criterion: c.id, tier: "automated-checks", status: "passed", source: lastTest.logPath, recordedBy: "ios-build-state", sourceHash: lastTest.sourceHash, note: `test log mentions ${c.target}` });
      else unmapped.push({ criterion: c.id, reason: lastTest ? `test log does not mention ${c.target}` : "no passing test run recorded" });
    } else if (req === "simulator-observed") {
      const shot = (state.screenshots ?? []).find((s) => c.target && s.screen === c.target);
      if (!c.target) unmapped.push({ criterion: c.id, reason: "criterion has no screen target to match against screenshots" });
      else if (shot && state.captureSourceHash) inputs.push({ criterion: c.id, tier: "simulator-observed", status: "passed", source: shot.path.startsWith(".ios-agent") ? shot.path : `.ios-agent/screenshots/${shot.path.split("/").pop()}`, recordedBy: "ios-build-state", sourceHash: state.captureSourceHash, note: `screenshot of ${c.target}` });
      else unmapped.push({ criterion: c.id, reason: `no screenshot recorded for screen ${c.target}` });
    } else if (req === "visual-inspected") {
      const review = (state.visualReviews ?? []).find((r) => c.target && r.screen === c.target && (r.passes ?? r.assessment?.passes));
      if (review && state.captureSourceHash) inputs.push({ criterion: c.id, tier: "visual-inspected", status: "passed", source: `.ios-agent/design-reviews`, recordedBy: "ios-build-state", sourceHash: state.captureSourceHash, note: `model design review passed for ${c.target}; a model opinion is not accessibility certification` });
      else unmapped.push({ criterion: c.id, reason: c.target ? `no passing design review for ${c.target}` : "criterion has no screen target" });
    } else unmapped.push({ criterion: c.id, reason: `${c.method} needs external verification that /ios-build cannot provide` });
  }
  const { added } = inputs.length ? await recordEvidence(design, inputs) : { added: [] as EvidenceEntry[] };
  return { added, unmapped };
}

export interface CriterionStatus {
  criterion: AcceptanceCriterion;
  requiredTier: Tier;
  status: "verified" | "stale-evidence" | "failed" | "unverified";
  evidence: EvidenceEntry[];
  reason: string;
}

export interface VerificationReport {
  contractHash: string;
  revision: number;
  sourceFingerprint: string;
  criteria: CriterionStatus[];
  tiers: Record<Tier, { valid: number; stale: number }>;
  steps: { total: number; done: number; pending: string[] };
  allVerified: boolean;
}

export async function verificationReport(design: DesignWorkflow, contract?: DesignContract): Promise<VerificationReport> {
  const bundle = await design.load();
  const c = contract ?? bundle.contract;
  const file = await loadVerification(design);
  const fp = (await sourceFingerprint(design.projectDir)).hash;
  const tiers = Object.fromEntries(TIERS.map((t) => [t, { valid: 0, stale: 0 }])) as Record<Tier, { valid: number; stale: number }>;
  const criteria: CriterionStatus[] = c.acceptanceCriteria.map((criterion) => {
    const required = REQUIRED_TIER[criterion.method];
    const entries = file.entries.filter((e) => e.criterion === criterion.id);
    const current = entries.filter((e) => e.contractHash === bundle.workflow.contractHash && e.sourceHash === fp);
    const stale = entries.filter((e) => !current.includes(e));
    for (const e of current) tiers[e.tier].valid += 1;
    for (const e of stale) tiers[e.tier].stale += 1;
    const strongest = current.filter((e) => e.status === "passed").sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
    const failed = current.find((e) => e.status === "failed" && TIER_RANK[e.tier] >= TIER_RANK[required]);
    if (failed) return { criterion, requiredTier: required, status: "failed", evidence: current, reason: `failed at ${failed.tier}: ${failed.source}` };
    if (strongest && TIER_RANK[strongest.tier] >= TIER_RANK[required]) return { criterion, requiredTier: required, status: "verified", evidence: current, reason: `${strongest.tier} evidence ${strongest.source}` };
    if (stale.some((e) => e.status === "passed" && TIER_RANK[e.tier] >= TIER_RANK[required])) return { criterion, requiredTier: required, status: "stale-evidence", evidence: stale, reason: "evidence exists for an earlier contract revision or source fingerprint" };
    return { criterion, requiredTier: required, status: "unverified", evidence: current, reason: strongest ? `only ${strongest.tier} evidence; ${required} required` : `no evidence at ${required}` };
  });
  const pending = c.steps.filter((s) => file.steps[s.id]?.status !== "done").map((s) => s.id);
  return {
    contractHash: bundle.workflow.contractHash, revision: bundle.workflow.revision, sourceFingerprint: fp, criteria, tiers,
    steps: { total: c.steps.length, done: c.steps.length - pending.length, pending },
    allVerified: criteria.length > 0 && criteria.every((x) => x.status === "verified"),
  };
}

export function renderVerificationSummary(report: VerificationReport): string {
  const counts = { verified: 0, "stale-evidence": 0, failed: 0, unverified: 0 };
  for (const c of report.criteria) counts[c.status] += 1;
  const lines = [`Verification against revision ${report.revision} (${report.contractHash.slice(0, 8)}), sources ${report.sourceFingerprint.slice(0, 8)}:`];
  lines.push(`- criteria: ${counts.verified} verified, ${counts["stale-evidence"]} stale, ${counts.failed} failed, ${counts.unverified} unverified`);
  lines.push(`- tiers with valid evidence: ${TIERS.filter((t) => report.tiers[t].valid > 0).join(", ") || "none"}`);
  lines.push(`- steps: ${report.steps.done}/${report.steps.total} done${report.steps.pending.length ? ` (pending ${report.steps.pending.join(", ")})` : ""}`);
  for (const c of report.criteria.filter((x) => x.status !== "verified")) lines.push(`- ${c.criterion.id} ${c.status}: ${c.reason}`);
  return lines.join("\n");
}
