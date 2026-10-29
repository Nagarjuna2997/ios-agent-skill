// Independent review: a reviewer sees exactly one package (contract revision, hashed
// evidence, role criteria, output schema) and nothing from the author's conversation.
// Providers record how they isolate; the server never assumes isolation from a prompt.
import { createHash, randomUUID } from "node:crypto";
import { readFile, lstat } from "node:fs/promises";
import { relative } from "node:path";
import { extractJson } from "../agent/brain.js";
import type { CommandRunner } from "../agent/runner.js";
import { canonicalJSON, SECTIONS, type DesignContract, type Section } from "./contract.js";
import { ReviewerOutputSchema, REVIEWER_ROLES, type Finding, type Provenance, type ReviewerFinding, type ReviewerOutput, type ReviewerRole } from "./findings.js";
import { detectSignals, type Signal } from "./routing.js";
import { containedReadPath } from "./store.js";
import { BudgetSchema, type Budget, type ReviewerRecord, type Workflow } from "./workflow.js";
import { DesignWorkflow } from "./workflow.js";

export const PACKAGE_VERSION = 1 as const;
const MAX_EVIDENCE_FILE_CHARS = 64_000;
const SECRET_PATH = /(^|\/)(\.env[^/]*|.*\.(p12|p8|pem|key|mobileprovision|keychain)|Secrets\.xcconfig|.*secret.*)$/i;
const SECRET_LINE = /(api[_-]?key|secret|token|password|authorization)\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}/i;

export interface EvidenceEntry {
  path: string;
  sha256: string;
  bytes: number;
  text: string;
  truncated: boolean;
  redactedLines: number;
}

export interface ReviewPackage {
  packageVersion: typeof PACKAGE_VERSION;
  designId: string;
  revision: number;
  contractHash: string;
  reviewerId: string;
  role: ReviewerRole;
  criteria: string[];
  contract: DesignContract;
  evidence: EvidenceEntry[];
  outputSchema: string;
  boundary: string;
}

export const ROLE_CRITERIA: Record<ReviewerRole, { name: string; criteria: string[] }> = {
  requirements: {
    name: "Requirements and acceptance-test completeness",
    criteria: [
      "Every acceptance criterion is testable by its stated method and names what it checks.",
      "User journeys and screen states are covered by criteria; missing error, empty and offline states are findings.",
      "Scope and non-goals are consistent with the objective; contradictions are findings.",
      "Assumptions that affect acceptance are called out; an unknown that blocks a criterion is blocking.",
    ],
  },
  architecture: {
    name: "Architecture and compatibility with existing code",
    criteria: [
      "Proposed decisions are compatible with the observed current code; cite the evidence paths you relied on.",
      "State ownership, data flow and persistence are coherent and have one owner per piece of state.",
      "Dependencies and deployment targets are consistent with the APIs the design uses.",
      "Migration of existing data or settings is planned when persistence changes.",
    ],
  },
  concurrency: {
    name: "Swift concurrency, state ownership and lifecycle",
    criteria: [
      "UI-observed state is isolated to the main actor; shared mutable state has an actor or is Sendable.",
      "Cancellation and task lifetime are defined for every long-running operation.",
      "Ordering and re-entrancy hazards are addressed where multiple tasks mutate the same state.",
      "Lifecycle transitions (background, termination, scene changes) do not lose or corrupt work.",
    ],
  },
  security: {
    name: "Security, privacy, permissions and service integration",
    criteria: [
      "Credentials never enter source, logs or the design document; storage is Keychain or an equivalent boundary.",
      "Each permission or entitlement has a purpose and the usage-description key is listed.",
      "External services have a declared boundary, failure mode and data minimisation.",
      "Privacy requirements match the data actually collected; undisclosed collection is blocking.",
    ],
  },
  "ui-verification": {
    name: "UI states, accessibility and verification feasibility",
    criteria: [
      "Loading, empty, success and error states exist for each screen and are reachable with synthetic data.",
      "Dynamic Type, VoiceOver, Reduce Motion and iPad layout are addressed where the screens need them.",
      "Each criterion with method simulator, visual or accessibility can actually be observed in the simulator.",
      "Criteria that can only be verified against external services or signed builds are marked as such.",
    ],
  },
};

export const OUTPUT_SCHEMA_TEXT = `{
  "verdict": "pass" | "pass-with-findings" | "fail",
  "summary": string,
  "findings": [{
    "role": "<your role>",
    "severity": "blocking" | "major" | "minor" | "note",
    "category": "requirements" | "acceptance-tests" | "architecture" | "compatibility" | "concurrency" | "state-ownership" | "lifecycle" | "security" | "privacy" | "permissions" | "service-integration" | "ui-states" | "accessibility" | "verification-feasibility" | "other",
    "title": string,
    "affects": { "criteria": ["AC-1"], "sections": ["architecture"], "sources": [{ "path": "App/Foo.swift", "line": 12 }] },  // sections must be contract top-level keys: objective, scope, nonGoals, constraints, currentCode, userJourneys, screens, architecture, apiContracts, dependencies, deployment, concurrency, permissions, privacy, failureHandling, migration, acceptanceCriteria, steps, unresolved, risks, requiredFiles, requiredSymbols
    "scenario": "a concrete way this goes wrong",
    "evidence": ["quote or reference from the package; leave empty if you have none"],
    "correction": "the specific change",
    "verification": "what would show the correction worked",
    "confidence": 0.0-1.0,
    "uncertainty": "what you could not determine"
  }]
}`;

export const BOUNDARY_TEXT = "This package is your complete input. You have not seen the author's conversation, reasoning or other reviewers' findings. Judge only what is in the contract and the evidence below; where you need something that is not here, say so as uncertainty rather than assuming it. Return only the JSON object.";

export function selectRoles(contract: DesignContract, signals: Signal[] = detectSignals(contract), max = 5): ReviewerRole[] {
  const ids = new Set(signals.map((s) => s.id));
  const roles: ReviewerRole[] = ["requirements"];
  if (ids.has("architecture-change") || ids.has("persistence-migration") || ids.has("large-scope") || contract.architecture.summary.trim()) roles.push("architecture");
  if (ids.has("concurrency") || contract.concurrency.length > 0) roles.push("concurrency");
  if (ids.has("authentication") || ids.has("payments") || ids.has("sensitive-permissions") || ids.has("external-service") || contract.permissions.length > 0 || contract.privacy.length > 0) roles.push("security");
  if (contract.screens.length > 0 || contract.acceptanceCriteria.some((c) => ["simulator", "visual", "accessibility", "ui-test"].includes(c.method))) roles.push("ui-verification");
  return roles.filter((r, i, a) => a.indexOf(r) === i && REVIEWER_ROLES.includes(r)).slice(0, max);
}

function redact(text: string): { text: string; redacted: number } {
  let redacted = 0;
  const out = text.split("\n").map((line) => {
    if (SECRET_LINE.test(line)) { redacted += 1; return "[redacted line]"; }
    return line;
  }).join("\n");
  return { text: out, redacted };
}

/** Collect the evidence the contract points at, inside the project only, hashed and bounded. */
export async function buildEvidenceManifest(root: string, contract: DesignContract, extra: string[], maxChars: number): Promise<{ evidence: EvidenceEntry[]; skipped: Array<{ path: string; reason: string }> }> {
  const wanted = new Set<string>();
  const claims = [...contract.constraints, ...contract.currentCode, ...contract.architecture.stateOwnership, ...contract.architecture.dataFlow, ...contract.architecture.persistence,
    ...contract.apiContracts, ...contract.deployment.toolchain, ...contract.concurrency, ...contract.privacy, ...contract.failureHandling, ...contract.migration, ...contract.unresolved, ...contract.risks];
  for (const c of claims) for (const e of c.evidence) wanted.add(e.path);
  for (const p of contract.requiredFiles) wanted.add(p);
  for (const p of extra) wanted.add(p);
  const evidence: EvidenceEntry[] = [];
  const skipped: Array<{ path: string; reason: string }> = [];
  let used = 0;
  for (const path of [...wanted].sort()) {
    if (path.startsWith(".ios-agent/design-private") || SECRET_PATH.test(path)) { skipped.push({ path, reason: "excluded as private or credential material" }); continue; }
    let full: string;
    try { full = await containedReadPath(root, path); } catch (error) { skipped.push({ path, reason: (error as Error).message }); continue; }
    const st = await lstat(full);
    if (!st.isFile()) { skipped.push({ path, reason: "not a regular file" }); continue; }
    const raw = await readFile(full);
    const sha256 = createHash("sha256").update(raw).digest("hex");
    const { text, redacted } = redact(raw.toString("utf8"));
    const limit = Math.min(MAX_EVIDENCE_FILE_CHARS, Math.max(0, maxChars - used));
    if (limit === 0) { skipped.push({ path, reason: "context budget exhausted" }); continue; }
    const truncated = text.length > limit;
    const body = truncated ? text.slice(0, limit) : text;
    used += body.length;
    evidence.push({ path: relative(root, full).split("\\").join("/"), sha256, bytes: raw.length, text: body, truncated, redactedLines: redacted });
  }
  return { evidence, skipped };
}

export function buildPackage(contract: DesignContract, contractHash: string, role: ReviewerRole, evidence: EvidenceEntry[], reviewerId = `${role}-${randomUUID().slice(0, 8)}`): ReviewPackage {
  return {
    packageVersion: PACKAGE_VERSION,
    designId: contract.id, revision: contract.revision, contractHash,
    reviewerId, role, criteria: ROLE_CRITERIA[role].criteria,
    contract, evidence, outputSchema: OUTPUT_SCHEMA_TEXT, boundary: BOUNDARY_TEXT,
  };
}

export function packageHash(pkg: ReviewPackage): string {
  return createHash("sha256").update(canonicalJSON({ ...pkg, reviewerId: undefined })).digest("hex");
}

export function renderPrompt(pkg: ReviewPackage): string {
  const lines: string[] = [];
  lines.push(`You are the ${ROLE_CRITERIA[pkg.role].name} reviewer for an iOS design contract.`);
  lines.push(pkg.boundary, "");
  lines.push("Review criteria:", ...pkg.criteria.map((c, i) => `${i + 1}. ${c}`), "");
  lines.push("Rules: cite evidence from the contract or the files below for every finding; a finding without evidence is marked unsupported. Prefer fewer, concrete findings. Use severity blocking only when implementation should not start.", "");
  lines.push(`Contract (design ${pkg.designId}, revision ${pkg.revision}, sha256 ${pkg.contractHash}):`, "```json", JSON.stringify(pkg.contract, null, 2), "```", "");
  if (pkg.evidence.length) {
    lines.push("Evidence files (project-relative; sha256 recorded):");
    for (const e of pkg.evidence) {
      lines.push(`--- ${e.path} (sha256 ${e.sha256.slice(0, 12)}, ${e.bytes} bytes${e.truncated ? ", truncated" : ""}${e.redactedLines ? `, ${e.redactedLines} redacted lines` : ""}) ---`, e.text);
    }
    lines.push("");
  } else lines.push("No evidence files were authorized for this review; treat claims about existing code as unverified.", "");
  lines.push("Output schema:", pkg.outputSchema, "", `Set every finding's "role" to "${pkg.role}". Return only the JSON object.`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Providers.

export interface ProviderResult {
  text: string;
  executionId: string;
  usage: Record<string, number> | "unavailable";
}

export interface ReviewProvider {
  readonly id: string;
  /** How the provider keeps the reviewer from seeing the author's context; recorded verbatim. */
  readonly isolation: string;
  /** True when the provider can show a fresh context (new process or stateless request). */
  readonly providesIsolation: boolean;
  /** True for same-context self-review; never satisfies the independent requirement. */
  readonly selfReview: boolean;
  available(): Promise<{ ok: boolean; reason?: string }>;
  run(pkg: ReviewPackage, prompt: string, signal: AbortSignal): Promise<ProviderResult>;
}

/** Headless `claude -p`: a new process per reviewer, no session persistence, no tools. */
export class ClaudeCodeProvider implements ReviewProvider {
  readonly id = "claude-code";
  readonly isolation = "fresh headless `claude -p` process per reviewer, --no-session-persistence, tools disabled, empty MCP config, temporary cwd";
  readonly providesIsolation = true;
  readonly selfReview = false;
  constructor(private readonly runner: CommandRunner, private readonly options: { command?: string; model?: string } = {}) {}

  async available(): Promise<{ ok: boolean; reason?: string }> {
    const result = await this.runner.run(this.options.command ?? "claude", ["--version"], { timeoutMs: 20_000 });
    if (result.spawnError) return { ok: false, reason: `claude CLI not found (${result.spawnError}); install Claude Code or choose another provider` };
    if (result.exitCode !== 0) return { ok: false, reason: `claude --version exited ${result.exitCode}` };
    return { ok: true };
  }

  async run(_pkg: ReviewPackage, prompt: string, signal: AbortSignal): Promise<ProviderResult> {
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "ios-agent-design-review-"));
    try {
      const result = await this.runner.run(this.options.command ?? "claude", ["-p", "--output-format", "json", "--max-turns", "1", "--no-session-persistence", "--tools", "", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', ...(this.options.model ? ["--model", this.options.model] : [])], { cwd: dir, input: prompt, signal, timeoutMs: 60 * 60_000 });
      if (result.timedOut || signal.aborted) throw new Error("reviewer timed out or was cancelled");
      if (result.spawnError) throw new Error(`claude could not start: ${result.spawnError}`);
      if (result.exitCode !== 0) throw new Error(`claude exited with ${result.exitCode}: ${(result.stderr || result.stdout).slice(-400)}`);
      const envelope = JSON.parse(result.stdout) as { result?: string; is_error?: boolean; session_id?: string; usage?: Record<string, unknown> };
      if (envelope.is_error || typeof envelope.result !== "string") throw new Error("claude returned no result");
      const usage: Record<string, number> = {};
      for (const [k, v] of Object.entries(envelope.usage ?? {})) if (typeof v === "number") usage[k] = v;
      return { text: envelope.result, executionId: envelope.session_id ?? randomUUID(), usage: Object.keys(usage).length ? usage : "unavailable" };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}

/** Stateless HTTP request through the existing `ai` router and its privacy configuration. */
export class AIRouteProvider implements ReviewProvider {
  readonly id = "ai-route";
  readonly isolation = "stateless HTTP completion through the ai router; no conversation state is sent";
  readonly providesIsolation = true;
  readonly selfReview = false;
  constructor(private readonly configPath: string, private readonly env: NodeJS.ProcessEnv = process.env) {}

  private async deps() {
    const [{ loadConfig }, { cloudAdapter, keyNames }, { route }] = await Promise.all([import("../ai/config.js"), import("../ai/providers.js"), import("../ai/router.js")]);
    const config = await loadConfig(this.configPath);
    const adapters = (["openai", "anthropic", "gemini"] as const).map((p) => cloudAdapter(p, this.env[keyNames[p]]));
    return { config, adapters, route };
  }

  async available(): Promise<{ ok: boolean; reason?: string }> {
    const { config } = await this.deps();
    if (config.privacy !== "cloud-permitted") return { ok: false, reason: "ai privacy is local-only; set `ai config privacy cloud-permitted` and allow a provider to use cloud reviewers" };
    if (config.allowedCloudProviders.length === 0) return { ok: false, reason: "no cloud provider is allowed in .ios-agent-ai.json" };
    return { ok: true };
  }

  async run(_pkg: ReviewPackage, prompt: string, signal: AbortSignal): Promise<ProviderResult> {
    const { config, adapters, route } = await this.deps();
    const response = await route(config, adapters, prompt, ["text"], signal);
    const usage: Record<string, number> = {};
    if (response.usage && typeof response.usage === "object") for (const [k, v] of Object.entries(response.usage as Record<string, unknown>)) if (typeof v === "number") usage[k] = v;
    return { text: response.text, executionId: `${response.provider}:${response.model}:${randomUUID().slice(0, 8)}`, usage: Object.keys(usage).length ? usage : "unavailable" };
  }
}

/** Test double. Its isolation claim is configurable so tests can exercise both branches, and it is always labelled fake. */
export class FakeProvider implements ReviewProvider {
  readonly id = "fake";
  readonly isolation: string;
  readonly selfReview = false;
  calls: ReviewPackage[] = [];
  constructor(private readonly respond: (pkg: ReviewPackage, signal: AbortSignal) => Promise<string> | string, readonly providesIsolation = false, private readonly delayMs = 0) {
    this.isolation = `fake test double (claims isolation: ${providesIsolation})`;
  }
  async available() { return { ok: true }; }
  async run(pkg: ReviewPackage, _prompt: string, signal: AbortSignal): Promise<ProviderResult> {
    this.calls.push(pkg);
    if (this.delayMs) await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, this.delayMs);
      signal.addEventListener("abort", () => { clearTimeout(t); reject(new Error("cancelled")); }, { once: true });
    });
    if (signal.aborted) throw new Error("cancelled");
    return { text: await this.respond(pkg, signal), executionId: `fake-${randomUUID().slice(0, 8)}`, usage: "unavailable" };
  }
}

// ---------------------------------------------------------------------------
// Parsing and the runner.

const SECTION_ALIASES: Record<string, Section> = {
  stateownership: "architecture", dataflow: "architecture", persistence: "architecture", summary: "architecture",
  toolchain: "deployment", iosminimum: "deployment", targets: "deployment", acceptance: "acceptanceCriteria", criteria: "acceptanceCriteria",
  nongoals: "nonGoals", userjourneys: "userJourneys", currentcode: "currentCode", apicontracts: "apiContracts", failurehandling: "failureHandling",
  acceptancecriteria: "acceptanceCriteria", requiredfiles: "requiredFiles", requiredsymbols: "requiredSymbols", entitlements: "permissions", security: "privacy",
};

/** Map reviewer-written section names onto contract sections; unknown names are dropped and reported, not fatal. */
export function normaliseSections(json: unknown): string[] {
  const dropped: string[] = [];
  if (!json || typeof json !== "object") return dropped;
  const findings = (json as { findings?: unknown }).findings;
  if (!Array.isArray(findings)) return dropped;
  for (const f of findings) {
    const affects = f && typeof f === "object" ? (f as { affects?: { sections?: unknown } }).affects : undefined;
    if (!affects || !Array.isArray(affects.sections)) continue;
    const kept: Section[] = [];
    for (const raw of affects.sections) {
      if (typeof raw !== "string") continue;
      const direct = (SECTIONS as readonly string[]).includes(raw) ? (raw as Section) : undefined;
      const alias = SECTION_ALIASES[raw.toLowerCase().replace(/[^a-z]/g, "")];
      const lower = SECTIONS.find((s) => s.toLowerCase() === raw.toLowerCase());
      const mapped = direct ?? lower ?? alias;
      if (mapped) { if (!kept.includes(mapped)) kept.push(mapped); } else dropped.push(raw);
    }
    affects.sections = kept;
  }
  return dropped;
}

export function parseReviewerOutput(text: string, role: ReviewerRole): { ok: true; output: ReviewerOutput; droppedSections: string[] } | { ok: false; error: string } {
  let json: unknown;
  try { json = extractJson(text); } catch (error) { return { ok: false, error: `not JSON: ${(error as Error).message}` }; }
  const droppedSections = normaliseSections(json);
  const parsed = ReviewerOutputSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".") || "output"}: ${i.message}`).join("; ") };
  const wrongRole = parsed.data.findings.filter((f) => f.role !== role);
  if (wrongRole.length) return { ok: false, error: `${wrongRole.length} finding(s) claim a different role than ${role}` };
  return { ok: true, output: parsed.data, droppedSections };
}

export interface ReviewRunOptions {
  provider: ReviewProvider;
  roles?: ReviewerRole[];
  extraEvidence?: string[];
  signal?: AbortSignal;
  budget?: Partial<Budget>;
  /** Called with progress lines; nothing secret is passed. */
  sink?: (line: string) => void;
}

export interface ReviewRunResult {
  runId: string;
  round: number;
  reviewers: ReviewerRecord[];
  independent: boolean;
  selfReview: boolean;
  findings: Finding[];
  skippedEvidence: Array<{ path: string; reason: string }>;
  workflow: Workflow;
  metrics: RunMetrics;
}

export interface RunMetrics {
  runId: string;
  round: number;
  provider: string;
  reviewers: number;
  completed: number;
  malformed: number;
  failed: number;
  elapsedMs: number;
  findingsAdded: number;
  findingsMerged: number;
  usage: Record<string, number> | "unavailable";
  cost: null;
}

/** Run one bounded review round. Every outcome, including malformed output, is persisted without losing run state. */
export async function runReview(design: DesignWorkflow, options: ReviewRunOptions): Promise<ReviewRunResult> {
  const avail = await options.provider.available();
  if (!avail.ok) throw new Error(`Provider ${options.provider.id} is unavailable: ${avail.reason}`);
  const bundle = await design.load();
  const budget: Budget = BudgetSchema.parse({ ...bundle.workflow.budget, ...options.budget });
  const roles = (options.roles?.length ? options.roles : selectRoles(bundle.contract)).slice(0, budget.maxReviewers);
  const manifest = await buildEvidenceManifest(design.projectDir, bundle.contract, options.extraEvidence ?? [], budget.maxContextChars);
  const evidenceHashes = Object.fromEntries(manifest.evidence.map((e) => [e.path, e.sha256]));
  const runId = `run-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const { contract, workflow, round } = await design.beginRound({ runId, evidenceHashes, pid: process.pid });
  const specHash = workflow.contractHash;
  const store = design.store;
  const packages = roles.map((role) => buildPackage(contract, specHash, role, manifest.evidence));
  const started = Date.now();
  const records: ReviewerRecord[] = [];
  let added = 0, merged = 0;
  const usageTotal: Record<string, number> = {};
  let usageUnavailable = false;
  const heartbeat = setInterval(() => { void design.heartbeat(runId).catch(() => undefined); }, 15_000);
  await store.writePrivate(runId, "manifest.json", JSON.stringify({ runId, round: round.round, contractHash: specHash, evidenceHashes, skipped: manifest.skipped, roles }, null, 2));
  for (const pkg of packages) {
    await store.writePrivate(runId, `package-${pkg.reviewerId}.json`, JSON.stringify(pkg, null, 2));
    await design.recordReviewer(runId, { reviewerId: pkg.reviewerId, role: pkg.role, provider: options.provider.id, isolation: options.provider.isolation, executionId: "", status: "pending", findings: 0, elapsedMs: 0, usage: "unavailable" }, null);
  }
  const runOne = async (pkg: ReviewPackage): Promise<void> => {
    const t0 = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), budget.reviewerTimeoutMs);
    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort, { once: true });
    const base: ReviewerRecord = { reviewerId: pkg.reviewerId, role: pkg.role, provider: options.provider.id, isolation: options.provider.isolation, executionId: "", status: "pending", findings: 0, elapsedMs: 0, usage: "unavailable" };
    let record: ReviewerRecord;
    let incoming: Array<{ finding: ReviewerFinding; provenance: Provenance }> | null = null;
    try {
      if (options.signal?.aborted) throw new Error("cancelled");
      const result = await options.provider.run(pkg, renderPrompt(pkg), controller.signal);
      await store.writePrivate(runId, `output-${pkg.reviewerId}.txt`, result.text);
      if (result.usage === "unavailable") usageUnavailable = true; else for (const [k, v] of Object.entries(result.usage)) usageTotal[k] = (usageTotal[k] ?? 0) + v;
      const parsed = parseReviewerOutput(result.text, pkg.role);
      if (!parsed.ok) {
        record = { ...base, executionId: result.executionId, status: "malformed", elapsedMs: Date.now() - t0, usage: result.usage, error: parsed.error };
      } else {
        const provenance: Provenance = { runId, reviewerId: pkg.reviewerId, role: pkg.role, provider: options.provider.id, executionId: result.executionId, specHash };
        incoming = parsed.output.findings.map((finding) => ({ finding, provenance }));
        record = { ...base, executionId: result.executionId, status: "completed", verdict: parsed.output.verdict, findings: parsed.output.findings.length, elapsedMs: Date.now() - t0, usage: result.usage, ...(parsed.droppedSections.length ? { error: `dropped unknown section names: ${[...new Set(parsed.droppedSections)].join(", ")}` } : {}) };
      }
    } catch (error) {
      const message = (error as Error).message;
      const cancelled = options.signal?.aborted || /cancel/i.test(message);
      const timedOut = controller.signal.aborted && !options.signal?.aborted;
      record = { ...base, status: cancelled && !timedOut ? "cancelled" : timedOut ? "timeout" : "failed", elapsedMs: Date.now() - t0, error: message.slice(0, 400) };
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    }
    records.push(record);
    options.sink?.(`[review] ${record.role} ${record.status}${record.findings ? ` (${record.findings} findings)` : ""}`);
    const outcome = await design.recordReviewer(runId, record, incoming);
    added += outcome.added; merged += outcome.merged;
  };
  try {
    const queue = [...packages];
    const workers = Array.from({ length: Math.min(budget.maxConcurrency, queue.length) }, async () => { while (queue.length) { const next = queue.shift(); if (next) await runOne(next); } });
    await Promise.all(workers);
  } finally {
    clearInterval(heartbeat);
  }
  const completed = records.filter((r) => r.status === "completed");
  const independent = completed.length > 0 && completed.length === records.length && options.provider.providesIsolation && !options.provider.selfReview;
  const finalWorkflow = await design.finishRound(runId, { independent, selfReview: options.provider.selfReview });
  const metrics: RunMetrics = {
    runId, round: round.round, provider: options.provider.id, reviewers: records.length, completed: completed.length,
    malformed: records.filter((r) => r.status === "malformed").length, failed: records.filter((r) => r.status === "failed" || r.status === "timeout" || r.status === "cancelled").length,
    elapsedMs: Date.now() - started, findingsAdded: added, findingsMerged: merged,
    usage: usageUnavailable || Object.keys(usageTotal).length === 0 ? "unavailable" : usageTotal, cost: null,
  };
  await store.writePrivate(runId, "metrics.json", JSON.stringify(metrics, null, 2));
  return { runId, round: round.round, reviewers: records, independent, selfReview: options.provider.selfReview, findings: finalWorkflow.findings, skippedEvidence: manifest.skipped, workflow: finalWorkflow, metrics };
}

/**
 * Same-context self-review or client-dispatched subagents: write packages and stop. The
 * caller submits outputs with `submitReviewerOutput`. Nothing here is independent unless the
 * submitter attests a fresh context, and that attestation is recorded as client-reported.
 */
export async function prepareExternalReview(design: DesignWorkflow, options: { mode: "self-review" | "client-subagent"; roles?: ReviewerRole[]; extraEvidence?: string[]; budget?: Partial<Budget> }): Promise<{ runId: string; packages: Array<{ reviewerId: string; role: ReviewerRole; packagePath: string; promptPath: string }>; skippedEvidence: Array<{ path: string; reason: string }> }> {
  const bundle = await design.load();
  const budget: Budget = { ...bundle.workflow.budget, ...options.budget };
  const roles = (options.roles?.length ? options.roles : selectRoles(bundle.contract)).slice(0, budget.maxReviewers);
  const manifest = await buildEvidenceManifest(design.projectDir, bundle.contract, options.extraEvidence ?? [], budget.maxContextChars);
  const evidenceHashes = Object.fromEntries(manifest.evidence.map((e) => [e.path, e.sha256]));
  const runId = `run-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const { contract, workflow } = await design.beginRound({ runId, evidenceHashes, pid: process.pid });
  const out: Array<{ reviewerId: string; role: ReviewerRole; packagePath: string; promptPath: string }> = [];
  const isolation = options.mode === "self-review" ? "same context as the author (self-review; not independent)" : "client-dispatched subagent; isolation is client-reported and not verified by the server";
  await design.store.writePrivate(runId, "manifest.json", JSON.stringify({ runId, mode: options.mode, contractHash: workflow.contractHash, evidenceHashes, skipped: manifest.skipped, roles }, null, 2));
  for (const role of roles) {
    const pkg = buildPackage(contract, workflow.contractHash, role, manifest.evidence);
    const packagePath = await design.store.writePrivate(runId, `package-${pkg.reviewerId}.json`, JSON.stringify(pkg, null, 2));
    const promptPath = await design.store.writePrivate(runId, `prompt-${pkg.reviewerId}.txt`, renderPrompt(pkg));
    await design.recordReviewer(runId, { reviewerId: pkg.reviewerId, role, provider: options.mode, isolation, executionId: "", status: "pending", findings: 0, elapsedMs: 0, usage: "unavailable" }, null);
    out.push({ reviewerId: pkg.reviewerId, role, packagePath, promptPath });
  }
  // Release the active-run marker: external submissions arrive later, possibly from another process.
  await design.store.locked(async () => {
    const { contract: c, workflow: w } = await design.load();
    if (w.activeRun?.runId === runId) delete w.activeRun;
    await design.store.writeJSON(design.store.paths.workflow, w);
    await design.store.writeJSON(design.store.paths.contract, c);
  });
  return { runId, packages: out, skippedEvidence: manifest.skipped };
}

export async function submitReviewerOutput(design: DesignWorkflow, input: { runId: string; reviewerId: string; text: string; executionId?: string; attestFreshContext?: string }): Promise<{ record: ReviewerRecord; workflow: Workflow; roundFinished: boolean }> {
  const bundle = await design.load();
  const round = bundle.workflow.rounds.find((r) => r.runId === input.runId);
  if (!round) throw new Error(`Unknown run ${input.runId}`);
  if (round.finishedAt) throw new Error(`Run ${input.runId} is already finished.`);
  const pending = round.reviewers.find((r) => r.reviewerId === input.reviewerId);
  if (!pending) throw new Error(`Unknown reviewer ${input.reviewerId} in run ${input.runId}`);
  if (pending.status !== "pending") throw new Error(`Reviewer ${input.reviewerId} already has status ${pending.status}.`);
  if (round.contractHash !== bundle.workflow.contractHash) throw new Error("The contract changed since this round started; the submission is stale. Request a new review.");
  await design.store.writePrivate(input.runId, `output-${input.reviewerId}.txt`, input.text);
  const parsed = parseReviewerOutput(input.text, pending.role);
  const selfReview = pending.provider === "self-review";
  const attested = !selfReview && !!input.attestFreshContext?.trim();
  const isolation = selfReview ? pending.isolation : attested ? `client-attested fresh context: ${input.attestFreshContext!.trim().slice(0, 200)} (not verified by the server)` : pending.isolation;
  let record: ReviewerRecord;
  let incoming: Array<{ finding: ReviewerFinding; provenance: Provenance }> | null = null;
  if (!parsed.ok) record = { ...pending, isolation, executionId: input.executionId ?? "", status: "malformed", error: parsed.error };
  else {
    const provenance: Provenance = { runId: input.runId, reviewerId: input.reviewerId, role: pending.role, provider: pending.provider, executionId: input.executionId ?? "", specHash: round.contractHash };
    incoming = parsed.output.findings.map((finding) => ({ finding, provenance }));
    record = { ...pending, isolation, executionId: input.executionId ?? "", status: "completed", verdict: parsed.output.verdict, findings: parsed.output.findings.length, ...(parsed.droppedSections.length ? { error: `dropped unknown section names: ${[...new Set(parsed.droppedSections)].join(", ")}` } : {}) };
  }
  let workflow = (await design.recordReviewer(input.runId, record, incoming)).workflow;
  const updated = workflow.rounds.find((r) => r.runId === input.runId)!;
  const roundFinished = updated.reviewers.every((r) => r.status !== "pending");
  if (roundFinished) {
    const completed = updated.reviewers.filter((r) => r.status === "completed");
    const independent = !selfReview && completed.length === updated.reviewers.length && completed.length > 0 && updated.reviewers.every((r) => /client-attested/.test(r.isolation));
    workflow = await design.finishRound(input.runId, { independent, selfReview });
  }
  return { record, workflow, roundFinished };
}
