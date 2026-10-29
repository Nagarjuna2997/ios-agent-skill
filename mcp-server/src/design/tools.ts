// MCP tools for the design contract workflow. Six tools, small by design: the CLI exposes
// the full command set; these cover what a connected coding agent needs mid-task.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProcessRunner, type CommandRunner } from "../agent/runner.js";
import { renderContractMarkdown, validateContract } from "./contract.js";
import { REVIEWER_ROLES } from "./findings.js";
import { lintContract } from "./lint.js";
import { MODES } from "./routing.js";
import { AIRouteProvider, ClaudeCodeProvider, prepareExternalReview, runReview, submitReviewerOutput } from "./review.js";
import { detectDrift } from "./drift.js";
import { importBuildState, recordEvidence, recordStep, TIERS, verificationReport } from "./verification.js";
import { APPROVAL_SOURCES, DesignWorkflow } from "./workflow.js";
import { resolve } from "node:path";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };
const ok = (value: unknown): ToolResult => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
const fail = (error: unknown): ToolResult => ({ isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }] });

const projectDir = z.string().min(1).describe("Absolute path of the app's project folder.");
const designId = z.string().regex(/^[a-z0-9][a-z0-9-]{0,40}$/).describe("Design slug, for example offline-sync.");

export function registerDesignTools(server: McpServer, runner: CommandRunner = new ProcessRunner()): void {
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;
  const writes = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

  server.registerTool("design_contract", {
    title: "Create, update or validate a design contract",
    description: "Use this before substantial iOS work to save a typed design contract (objective, evidence-backed current-code facts, architecture, acceptance criteria with IDs, steps) as the single source of truth. Renders DESIGN.md deterministically, recommends lightweight or full review from inspectable signals, and on update invalidates review and approval flags for changed sections. action validate checks a draft without saving.",
    inputSchema: { projectDir, designId, action: z.enum(["create", "update", "validate"]), contract: z.record(z.unknown()).describe("Contract JSON; see docs/tooling/design-review.md."), reason: z.string().max(400).optional(), mode: z.enum(MODES).optional(), modeReason: z.string().max(400).optional() },
    annotations: writes,
  }, async (input) => {
    try {
      if (input.action === "validate") {
        const result = validateContract(input.contract);
        if (!result.ok || !result.contract) return ok({ ok: false, errors: result.errors });
        return ok({ ok: true, readinessGaps: result.readinessGaps, lint: lintContract(result.contract), markdownPreview: renderContractMarkdown(result.contract).slice(0, 4000) });
      }
      const design = new DesignWorkflow(input.projectDir, input.designId);
      if (input.action === "create") {
        const bundle = await design.create(input.contract, { ...(input.mode ? { mode: input.mode, modeReason: input.modeReason ?? "explicit choice" } : {}) });
        return ok({ revision: 1, contractHash: bundle.workflow.contractHash, mode: bundle.workflow.mode, recommendation: bundle.workflow.modeRecommendation, readinessGaps: bundle.readinessGaps, lint: lintContract(bundle.contract), markdownPath: design.store.paths.markdown, next: bundle.workflow.mode === "full" ? "Run design_review for an independent review before implementation." : "Resolve readiness gaps, then design_resolve action ready." });
      }
      const result = await design.update(input.contract, input.reason ?? "update");
      return ok({ revision: result.workflow.revision, contractHash: result.workflow.contractHash, changed: result.changed, staleFindings: result.staleFindings, state: result.workflow.state, readinessGaps: result.readinessGaps, note: result.changed.length ? "Review, readiness and approval flags were cleared for this revision; re-review findings marked re-review." : "No change." });
    } catch (error) { return fail(error); }
  });

  server.registerTool("design_status", {
    title: "Inspect a design's state, flags and findings",
    description: "Use this to check where a design stands before acting on it. Read-only. Shows workflow state, mode, bound flags (review completed, ready, approved with provenance, verified), open and blocking findings, stale runs and the next action. Never infers approval.",
    inputSchema: { projectDir, designId, includeFindings: z.boolean().default(true) },
    annotations: readOnly,
  }, async (input) => {
    try {
      const design = new DesignWorkflow(input.projectDir, input.designId);
      const bundle = await design.load();
      const w = bundle.workflow;
      const check = design.readinessCheck(bundle);
      return ok({ state: w.state, mode: w.mode, revision: w.revision, contractHash: w.contractHash, flags: w.flags, recommendation: w.modeRecommendation.explanation, rounds: w.rounds.map((r) => ({ runId: r.runId, round: r.round, finished: !!r.finishedAt, independent: r.independent, selfReview: r.selfReview, reviewers: r.reviewers.map((v) => ({ role: v.role, status: v.status, provider: v.provider, isolation: v.isolation, findings: v.findings })) })), readiness: check, staleRun: design.staleRun(w), decisionRecord: w.decisionRecord ?? null, ...(input.includeFindings ? { findings: w.findings } : { findingCounts: { total: w.findings.length, open: w.findings.filter((f) => f.disposition === "open").length } }) });
    } catch (error) { return fail(error); }
  });

  server.registerTool("design_review", {
    title: "Run or submit an independent design review",
    description: "Use this after design_contract when the mode is full, or whenever you want an independent opinion before implementing. Runs bounded reviewers that see only the contract revision, hashed evidence and role criteria. provider claude-code spawns fresh headless sessions; ai-route uses the configured stateless cloud provider; client-subagent and self-review prepare packages for the connected client to dispatch (self-review never counts as independent). action submit records an externally produced reviewer output. Records provider, execution id, hashes and isolation for every reviewer. Model calls happen only in this tool, never at startup.",
    inputSchema: { projectDir, designId, action: z.enum(["run", "prepare", "submit"]).default("run"), provider: z.enum(["claude-code", "ai-route", "client-subagent", "self-review"]).default("claude-code"), roles: z.array(z.enum(REVIEWER_ROLES)).max(5).optional(), extraEvidence: z.array(z.string().max(400)).max(20).default([]), runId: z.string().optional(), reviewerId: z.string().optional(), output: z.string().max(200_000).optional(), executionId: z.string().max(200).optional(), attestFreshContext: z.string().max(400).optional(), timeoutMs: z.number().int().min(10_000).max(3_600_000).optional() },
    annotations: writes,
  }, async (input, extra) => {
    try {
      const design = new DesignWorkflow(input.projectDir, input.designId);
      if (input.action === "submit") {
        if (!input.runId || !input.reviewerId || !input.output) throw new Error("submit needs runId, reviewerId and output.");
        const r = await submitReviewerOutput(design, { runId: input.runId, reviewerId: input.reviewerId, text: input.output, ...(input.executionId ? { executionId: input.executionId } : {}), ...(input.attestFreshContext ? { attestFreshContext: input.attestFreshContext } : {}) });
        return ok({ record: r.record, roundFinished: r.roundFinished, state: r.workflow.state });
      }
      const { workflow: before } = await design.load();
      if (before.state === "drafting" || before.state === "resolving") await design.requestReview();
      if (input.provider === "client-subagent" || input.provider === "self-review" || input.action === "prepare") {
        const mode = input.provider === "self-review" ? "self-review" : "client-subagent";
        const prepared = await prepareExternalReview(design, { mode, ...(input.roles ? { roles: input.roles } : {}), extraEvidence: input.extraEvidence });
        return ok({ ...prepared, independent: false, note: mode === "self-review" ? "Same-context self-review: labelled as such and never satisfies the independent-review requirement." : "Dispatch each prompt file to a fresh subagent that cannot see this conversation, then call design_review action submit with its output and attestFreshContext describing the isolation. The server records that attestation as client-reported." });
      }
      const provider = input.provider === "ai-route" ? new AIRouteProvider(resolve(input.projectDir, ".ios-agent-ai.json")) : new ClaudeCodeProvider(runner);
      const result = await runReview(design, { provider, ...(input.roles ? { roles: input.roles } : {}), extraEvidence: input.extraEvidence, ...(extra?.signal ? { signal: extra.signal } : {}), ...(input.timeoutMs ? { budget: { reviewerTimeoutMs: input.timeoutMs } } : {}) });
      const check = design.readinessCheck(await design.load());
      return ok({ runId: result.runId, round: result.round, independent: result.independent, isolation: provider.isolation, reviewers: result.reviewers, metrics: result.metrics, findings: result.findings.filter((f) => f.specHash === result.workflow.contractHash), skippedEvidence: result.skippedEvidence, state: result.workflow.state, readiness: check });
    } catch (error) { return fail(error); }
  });

  server.registerTool("design_resolve", {
    title: "Disposition findings, compute readiness, record approval",
    description: "Use this after a review round to resolve findings and move toward implementation. action disposition sets accepted, rejected (needs rationale), deferred (needs impact) or superseded on a finding. action ready computes readiness (no open blocking or re-review findings, mandatory fields, independent review in full mode) and never asserts it. action approve records who authorized implementation with verbatim provenance; approval is never inferred from a review or from silence. action implement moves to implementing when approval matches the current revision. action decision closes a non-converging review with a decision record.",
    inputSchema: { projectDir, designId, action: z.enum(["disposition", "ready", "approve", "implement", "decision", "cancel"]), findingId: z.string().optional(), disposition: z.enum(["accepted", "rejected", "deferred", "superseded"]).optional(), note: z.string().max(1000).optional(), approvalSource: z.enum(APPROVAL_SOURCES).optional(), provenance: z.string().max(1000).optional(), scope: z.string().max(400).optional(), resolution: z.string().max(1000).optional(), reason: z.string().max(400).optional() },
    annotations: writes,
  }, async (input) => {
    try {
      const design = new DesignWorkflow(input.projectDir, input.designId);
      switch (input.action) {
        case "disposition": { if (!input.findingId || !input.disposition) throw new Error("disposition needs findingId and disposition."); return ok(await design.disposition(input.findingId, input.disposition, input.note)); }
        case "ready": { const r = await design.markReady(); return ok({ ready: r.blockers.length === 0, blockers: r.blockers, state: r.workflow.state, note: r.blockers.length ? undefined : "Ready is not approval. Record approval with action approve, quoting the authorizing instruction." }); }
        case "approve": { if (!input.approvalSource || !input.provenance) throw new Error("approve needs approvalSource and provenance."); const w = await design.approve({ source: input.approvalSource, provenance: input.provenance, scope: input.scope ?? "" }); return ok({ userApproved: w.flags.userApproved }); }
        case "implement": { const w = await design.beginImplementation(); return ok({ state: w.state, revision: w.revision }); }
        case "decision": { if (!input.resolution || !input.reason) throw new Error("decision needs resolution and reason."); const w = await design.recordDecision(input.resolution, input.reason); return ok({ decisionRecord: w.decisionRecord, state: w.state }); }
        case "cancel": { const w = await design.cancel(input.reason ?? "cancelled"); return ok({ state: w.state }); }
      }
    } catch (error) { return fail(error); }
  });

  server.registerTool("design_verify", {
    title: "Record evidence and steps against acceptance criteria",
    description: "Use this during and after implementation to connect work to the design. Tracks implementation against the exact design revision. action step marks an implementation step; action evidence records an artifact at one tier (code-written, compiled, automated-checks, simulator-observed, visual-inspected, external-verified) for one criterion; action import-build maps existing /ios-build state (builds, tests, screenshots) to criteria deterministically and reports what could not be mapped; action report shows each criterion's status and marks the design verified only when every criterion has current evidence at its required tier. A successful command or screenshot alone never establishes acceptance.",
    inputSchema: { projectDir, designId, action: z.enum(["step", "evidence", "import-build", "report"]), stepId: z.string().optional(), stepStatus: z.enum(["pending", "in-progress", "done", "abandoned"]).optional(), criterion: z.string().optional(), tier: z.enum(TIERS).optional(), status: z.enum(["passed", "failed"]).optional(), source: z.string().max(400).optional(), note: z.string().max(600).optional() },
    annotations: writes,
  }, async (input) => {
    try {
      const design = new DesignWorkflow(input.projectDir, input.designId);
      switch (input.action) {
        case "step": { if (!input.stepId || !input.stepStatus) throw new Error("step needs stepId and stepStatus."); return ok({ steps: (await recordStep(design, input.stepId, input.stepStatus, input.note ?? "")).steps }); }
        case "evidence": { if (!input.criterion || !input.tier || !input.status || !input.source) throw new Error("evidence needs criterion, tier, status and source."); return ok(await recordEvidence(design, [{ criterion: input.criterion, tier: input.tier, status: input.status, source: input.source, note: input.note ?? "" }])); }
        case "import-build": return ok(await importBuildState(design));
        case "report": {
          const bundle = await design.load();
          if (bundle.workflow.state === "implementing") await design.beginVerification();
          const report = await verificationReport(design);
          let state = (await design.load()).workflow.state;
          if (report.allVerified && state === "verifying") state = (await design.markVerified(`all ${report.criteria.length} criteria verified`)).state;
          return ok({ ...report, state });
        }
      }
    } catch (error) { return fail(error); }
  });

  server.registerTool("design_drift", {
    title: "Compare a saved design with the current implementation",
    description: "Use this when the code may have moved away from the saved design, or before claiming a design is still implemented. Read-only. Deterministic checks: required files and symbols present, deployment target and Swift packages match project files, permission keys match Info.plist and entitlements, criteria lacking current evidence, evidence invalidated by source or contract changes, incomplete steps. Uncertain mappings are reported as unknown. Does not judge semantic equivalence and never rewrites the design.",
    inputSchema: { projectDir, designId },
    annotations: readOnly,
  }, async (input) => {
    try { return ok(await detectDrift(new DesignWorkflow(input.projectDir, input.designId))); }
    catch (error) { return fail(error); }
  });
}
