// Deterministic workflow over a design contract. Every transition is guarded, logged
// and persisted, so interrupted work resumes from durable state.
import { z } from "zod";
import { changedSections, contractHash, readinessGaps, renderContractMarkdown, validateContract, type DesignContract, type Section } from "./contract.js";
import { applyDisposition, blocking, markStale, mergeFindings, type Disposition, type Finding, type Provenance, type ReviewerFinding, type ReviewerRole } from "./findings.js";
import { recommendMode, type Mode, type Signal } from "./routing.js";
import { DesignStore } from "./store.js";

export const STATES = [
  "drafting", "review-requested", "reviewing", "review-complete", "resolving",
  "ready", "implementing", "verifying", "verified", "blocked", "cancelled", "superseded",
] as const;
export type State = (typeof STATES)[number];

export interface Budget {
  maxReviewers: number;
  maxConcurrency: number;
  maxRounds: number;
  reviewerTimeoutMs: number;
  maxContextChars: number;
}
export const DEFAULT_BUDGET: Budget = { maxReviewers: 5, maxConcurrency: 2, maxRounds: 3, reviewerTimeoutMs: 10 * 60_000, maxContextChars: 120_000 };

export const BudgetSchema = z.object({
  maxReviewers: z.number().int().min(1).max(8).default(DEFAULT_BUDGET.maxReviewers),
  maxConcurrency: z.number().int().min(1).max(4).default(DEFAULT_BUDGET.maxConcurrency),
  maxRounds: z.number().int().min(1).max(5).default(DEFAULT_BUDGET.maxRounds),
  reviewerTimeoutMs: z.number().int().min(1_000).max(60 * 60_000).default(DEFAULT_BUDGET.reviewerTimeoutMs),
  maxContextChars: z.number().int().min(10_000).max(400_000).default(DEFAULT_BUDGET.maxContextChars),
}).strict();

/** A flag that is bound to the exact contract it was set for; a revision clears it. */
export interface BoundFlag { at: string; contractHash: string; revision: number; note?: string }

export const APPROVAL_SOURCES = ["explicit-user-statement", "existing-implementation-authorization"] as const;
export interface Approval extends BoundFlag {
  source: (typeof APPROVAL_SOURCES)[number];
  /** Where the authorization came from, verbatim or by reference; never inferred. */
  provenance: string;
  scope: string;
}

export interface ReviewerRecord {
  reviewerId: string;
  role: ReviewerRole;
  provider: string;
  isolation: string;
  executionId: string;
  status: "completed" | "malformed" | "failed" | "timeout" | "cancelled" | "pending";
  verdict?: "pass" | "pass-with-findings" | "fail";
  findings: number;
  elapsedMs: number;
  usage: Record<string, number> | "unavailable";
  error?: string;
}

export interface ReviewRound {
  runId: string;
  round: number;
  startedAt: string;
  finishedAt?: string;
  contractHash: string;
  revision: number;
  evidenceHashes: Record<string, string>;
  reviewers: ReviewerRecord[];
  /** Independent means every reviewer ran in a fresh context on a provider that can show it. */
  independent: boolean;
  selfReview: boolean;
}

export interface DecisionRecord {
  at: string;
  reason: string;
  openFindings: string[];
  resolution: string;
}

export interface Workflow {
  version: 1;
  designId: string;
  state: State;
  mode: Mode;
  modeRecommendation: { mode: Mode; signals: Signal[]; explanation: string; at: string; contractHash: string };
  modeOverride?: { mode: Mode; reason: string; at: string };
  budget: Budget;
  contractHash: string;
  revision: number;
  history: Array<{ at: string; from: State; to: State; reason: string }>;
  rounds: ReviewRound[];
  findings: Finding[];
  flags: {
    reviewCompleted: BoundFlag | null;
    readyForImplementation: BoundFlag | null;
    userApproved: Approval | null;
    verified: BoundFlag | null;
  };
  decisionRecord?: DecisionRecord;
  cancelled?: { at: string; reason: string };
  activeRun?: { runId: string; pid: number; startedAt: string; heartbeatAt: string };
  updatedAt: string;
}

const TRANSITIONS: Record<State, readonly State[]> = {
  "drafting": ["review-requested", "ready", "cancelled", "superseded"],
  "review-requested": ["reviewing", "drafting", "blocked", "cancelled"],
  "reviewing": ["review-complete", "blocked", "drafting", "cancelled"],
  "review-complete": ["resolving", "drafting", "cancelled"],
  "resolving": ["ready", "review-requested", "blocked", "drafting", "cancelled"],
  "ready": ["implementing", "drafting", "cancelled"],
  "implementing": ["verifying", "drafting", "blocked", "cancelled"],
  "verifying": ["verified", "implementing", "drafting", "blocked", "cancelled"],
  "verified": ["drafting", "superseded"],
  "blocked": ["drafting", "resolving", "cancelled"],
  "cancelled": [],
  "superseded": [],
};

export function canTransition(from: State, to: State): boolean {
  return TRANSITIONS[from].includes(to);
}

export class WorkflowError extends Error {}

function transition(w: Workflow, to: State, reason: string, now: string): void {
  if (!canTransition(w.state, to)) throw new WorkflowError(`Cannot move design ${w.designId} from ${w.state} to ${to}.`);
  w.history.push({ at: now, from: w.state, to, reason });
  if (w.history.length > 500) w.history = w.history.slice(-500);
  w.state = to;
  w.updatedAt = now;
}

function clearBoundFlags(w: Workflow, reason: string, now: string): void {
  const cleared: string[] = [];
  for (const key of ["reviewCompleted", "readyForImplementation", "userApproved", "verified"] as const) {
    if (w.flags[key]) { cleared.push(key); w.flags[key] = null; }
  }
  if (cleared.length) w.history.push({ at: now, from: w.state, to: w.state, reason: `${reason}; cleared ${cleared.join(", ")}` });
}

export interface DesignBundle {
  contract: DesignContract;
  workflow: Workflow;
  readinessGaps: string[];
}

/** All durable operations on one design. Each public method takes the lock, loads, mutates, saves. */
export class DesignWorkflow {
  readonly store: DesignStore;
  constructor(readonly projectDir: string, readonly id: string, private readonly clock: () => Date = () => new Date()) {
    this.store = new DesignStore(projectDir, id);
  }

  private now(): string { return this.clock().toISOString(); }

  async load(): Promise<DesignBundle> {
    const raw = await this.store.readJSON<unknown>(this.store.paths.contract);
    if (raw === undefined) throw new WorkflowError(`No design ${this.id} in this project. Create one first.`);
    const validation = validateContract(raw);
    if (!validation.ok || !validation.contract) throw new WorkflowError(`Stored contract for ${this.id} is invalid: ${validation.errors.join("; ")}`);
    const workflow = await this.store.readJSON<Workflow>(this.store.paths.workflow);
    if (!workflow) throw new WorkflowError(`Design ${this.id} has no workflow.json; restore it from version control or re-create the design.`);
    if (workflow.version !== 1) throw new WorkflowError(`Unsupported workflow version ${String(workflow.version)}`);
    const hash = contractHash(validation.contract);
    if (workflow.contractHash !== hash) {
      // DESIGN.json was edited outside the tool. Treat that as a revision: it must not inherit review validity.
      workflow.history.push({ at: this.now(), from: workflow.state, to: workflow.state, reason: `DESIGN.json changed outside the workflow (hash ${workflow.contractHash.slice(0, 8)} -> ${hash.slice(0, 8)}); flags cleared` });
      clearBoundFlags(workflow, "external edit", this.now());
      workflow.findings = workflow.findings.map((f) => f.disposition === "accepted" || f.disposition === "superseded" ? f : { ...f, disposition: "re-review", staleReason: "contract edited outside the workflow" });
      workflow.contractHash = hash;
      workflow.revision = validation.contract.revision;
      if (workflow.state !== "drafting" && canTransition(workflow.state, "drafting")) transition(workflow, "drafting", "external edit", this.now());
      await this.store.writeJSON(this.store.paths.workflow, workflow);
    }
    return { contract: validation.contract, workflow, readinessGaps: validation.readinessGaps };
  }

  private async save(contract: DesignContract, workflow: Workflow): Promise<void> {
    workflow.updatedAt = this.now();
    await this.store.writeJSON(this.store.paths.workflow, workflow);
    await this.store.writeJSON(this.store.paths.contract, contract);
    await this.store.writeText(this.store.paths.markdown, renderContractMarkdown(contract));
  }

  /** Create a design from a contract. Fails if one already exists. */
  async create(input: unknown, options: { mode?: Mode; modeReason?: string; budget?: Partial<Budget> } = {}): Promise<DesignBundle> {
    return this.store.locked(async () => {
      if (await this.store.exists()) throw new WorkflowError(`Design ${this.id} already exists; use update to revise it.`);
      const validation = validateContract(input);
      if (!validation.ok || !validation.contract) throw new WorkflowError(`Contract invalid: ${validation.errors.join("; ")}`);
      const contract = { ...validation.contract, id: this.id, revision: 1 };
      const now = this.now();
      const hash = contractHash(contract);
      const rec = recommendMode(contract);
      const workflow: Workflow = {
        version: 1, designId: this.id, state: "drafting",
        mode: options.mode ?? rec.mode,
        modeRecommendation: { ...rec, at: now, contractHash: hash },
        budget: BudgetSchema.parse(options.budget ?? {}),
        contractHash: hash, revision: 1,
        history: [{ at: now, from: "drafting", to: "drafting", reason: "created" }],
        rounds: [], findings: [],
        flags: { reviewCompleted: null, readyForImplementation: null, userApproved: null, verified: null },
        updatedAt: now,
      };
      if (options.mode && options.mode !== rec.mode) workflow.modeOverride = { mode: options.mode, reason: options.modeReason ?? "explicit choice", at: now };
      await this.store.snapshotRevision(1, JSON.stringify(contract, null, 2) + "\n");
      await this.save(contract, workflow);
      return { contract, workflow, readinessGaps: validation.readinessGaps };
    });
  }

  /** Save a revised contract: bumps revision, snapshots, invalidates bound flags and stale findings. */
  async update(input: unknown, reason: string): Promise<DesignBundle & { changed: Section[]; staleFindings: string[] }> {
    return this.store.locked(async () => {
      const current = await this.load();
      const validation = validateContract(input);
      if (!validation.ok || !validation.contract) throw new WorkflowError(`Contract invalid: ${validation.errors.join("; ")}`);
      if (validation.contract.id !== this.id) throw new WorkflowError(`Contract id ${validation.contract.id} does not match design ${this.id}.`);
      const probe = { ...validation.contract, revision: current.contract.revision };
      if (contractHash(probe) === current.workflow.contractHash) return { ...current, changed: [], staleFindings: [] };
      const contract = { ...validation.contract, revision: current.contract.revision + 1 };
      const changed = changedSections(current.contract, contract);
      const changedCriteria = contract.acceptanceCriteria.filter((c) => {
        const before = current.contract.acceptanceCriteria.find((b) => b.id === c.id);
        return !before || before.statement !== c.statement || before.method !== c.method;
      }).map((c) => c.id);
      const removedCriteria = current.contract.acceptanceCriteria.filter((b) => !contract.acceptanceCriteria.some((c) => c.id === b.id)).map((b) => b.id);
      const w = current.workflow;
      const now = this.now();
      const hash = contractHash(contract);
      w.history.push({ at: now, from: w.state, to: w.state, reason: `revision ${contract.revision}: ${reason}` });
      clearBoundFlags(w, `revision ${contract.revision}`, now);
      const before = w.findings.map((f) => f.disposition);
      w.findings = markStale(w.findings, { sections: changed, criteria: [...changedCriteria, ...removedCriteria] }, hash);
      const staleFindings = w.findings.filter((f, i) => f.disposition === "re-review" && before[i] !== "re-review").map((f) => f.id);
      w.contractHash = hash;
      w.revision = contract.revision;
      const rec = recommendMode(contract);
      w.modeRecommendation = { ...rec, at: now, contractHash: hash };
      if (!w.modeOverride) w.mode = rec.mode;
      if (w.state !== "drafting" && canTransition(w.state, "drafting")) transition(w, "drafting", `revision ${contract.revision}`, now);
      await this.store.snapshotRevision(contract.revision, JSON.stringify(contract, null, 2) + "\n");
      await this.save(contract, w);
      return { contract, workflow: w, readinessGaps: validation.readinessGaps, changed, staleFindings };
    });
  }

  async setMode(mode: Mode, reason: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const now = this.now();
      if (mode === w.modeRecommendation.mode) { delete w.modeOverride; w.mode = mode; }
      else { w.modeOverride = { mode, reason, at: now }; w.mode = mode; }
      w.history.push({ at: now, from: w.state, to: w.state, reason: `mode set to ${mode}: ${reason}` });
      await this.save(contract, w);
      return w;
    });
  }

  async requestReview(): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      if (w.state === "resolving") transition(w, "review-requested", "re-review requested", this.now());
      else transition(w, "review-requested", `${w.mode} review requested`, this.now());
      await this.save(contract, w);
      return w;
    });
  }

  /** Called by the review runner around a round. The round record is written privately as it progresses. */
  async beginRound(run: { runId: string; evidenceHashes: Record<string, string>; pid: number }): Promise<{ contract: DesignContract; workflow: Workflow; round: ReviewRound }> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      if (w.state !== "review-requested" && w.state !== "reviewing") throw new WorkflowError(`Design ${this.id} is ${w.state}; request a review first.`);
      // The round budget is per contract revision: a revision starts a fresh budget, like a new build cycle.
      const completedRounds = w.rounds.filter((r) => r.finishedAt && r.contractHash === w.contractHash).length;
      if (completedRounds >= w.budget.maxRounds) throw new WorkflowError(`Review budget exhausted (${w.budget.maxRounds} rounds for this revision). Record a decision or revise the contract.`);
      if (w.activeRun) throw new WorkflowError(`Design ${this.id} already has an active run ${w.activeRun.runId}; resume or cancel it first.`);
      const now = this.now();
      const round: ReviewRound = { runId: run.runId, round: w.rounds.length + 1, startedAt: now, contractHash: w.contractHash, revision: w.revision, evidenceHashes: run.evidenceHashes, reviewers: [], independent: false, selfReview: false };
      w.rounds.push(round);
      w.activeRun = { runId: run.runId, pid: run.pid, startedAt: now, heartbeatAt: now };
      if (w.state === "review-requested") transition(w, "reviewing", `round ${round.round} started`, now);
      await this.save(contract, w);
      return { contract, workflow: w, round };
    });
  }

  async heartbeat(runId: string): Promise<void> {
    await this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      if (w.activeRun?.runId === runId) { w.activeRun.heartbeatAt = this.now(); await this.save(contract, w); }
    });
  }

  /** Record one reviewer's outcome and merge its findings under the lock, so concurrent reviewers never overwrite each other. */
  async recordReviewer(runId: string, record: ReviewerRecord, incoming: Array<{ finding: ReviewerFinding; provenance: Provenance }> | null): Promise<{ workflow: Workflow; added: number; merged: number }> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const round = w.rounds.find((r) => r.runId === runId);
      if (!round) throw new WorkflowError(`Unknown run ${runId}`);
      const i = round.reviewers.findIndex((r) => r.reviewerId === record.reviewerId);
      if (i >= 0) round.reviewers[i] = record; else round.reviewers.push(record);
      let added = 0, merged = 0;
      if (incoming) {
        const result = mergeFindings(w.findings, incoming, round.contractHash);
        w.findings = result.findings; added = result.added; merged = result.merged;
      }
      if (w.activeRun?.runId === runId) w.activeRun.heartbeatAt = this.now();
      await this.save(contract, w);
      return { workflow: w, added, merged };
    });
  }

  async finishRound(runId: string, outcome: { independent: boolean; selfReview: boolean }): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const round = w.rounds.find((r) => r.runId === runId);
      if (!round) throw new WorkflowError(`Unknown run ${runId}`);
      const now = this.now();
      round.finishedAt = now;
      round.independent = outcome.independent;
      round.selfReview = outcome.selfReview;
      if (w.activeRun?.runId === runId) delete w.activeRun;
      const completed = round.reviewers.filter((r) => r.status === "completed");
      if (w.state === "reviewing") {
        if (completed.length === 0) transition(w, "blocked", `round ${round.round} produced no usable reviewer output`, now);
        else {
          transition(w, "review-complete", `round ${round.round} finished: ${completed.length}/${round.reviewers.length} reviewers completed`, now);
          if (outcome.independent) w.flags.reviewCompleted = { at: now, contractHash: w.contractHash, revision: w.revision, note: `independent round ${round.round}` };
          transition(w, "resolving", "findings await disposition", now);
        }
      }
      await this.save(contract, w);
      return w;
    });
  }

  async disposition(findingId: string, disposition: Exclude<Disposition, "open" | "re-review">, note?: string): Promise<Finding> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      if (!["resolving", "review-complete", "blocked", "drafting"].includes(w.state)) throw new WorkflowError(`Findings can be dispositioned while resolving, not while ${w.state}.`);
      const f = applyDisposition(w.findings, findingId, disposition, note, this.now(), disposition === "accepted" ? w.revision : undefined);
      w.history.push({ at: this.now(), from: w.state, to: w.state, reason: `${findingId} ${disposition}${note ? `: ${note.slice(0, 120)}` : ""}` });
      await this.save(contract, w);
      return f;
    });
  }

  /** Readiness is computed, never asserted: no open blocking findings, no re-review, no mandatory gaps. */
  readinessCheck(bundle: DesignBundle): { ready: boolean; blockers: string[] } {
    const { contract, workflow: w } = bundle;
    const blockers: string[] = [];
    for (const g of readinessGaps(contract)) blockers.push(`gap: ${g}`);
    for (const f of blocking(w.findings)) blockers.push(`blocking finding ${f.id} is ${f.disposition}: ${f.title}`);
    for (const f of w.findings.filter((x) => x.disposition === "re-review")) blockers.push(`finding ${f.id} needs re-review: ${f.staleReason ?? "contract changed"}`);
    if (w.mode === "full") {
      if (!w.flags.reviewCompleted) blockers.push("full mode requires a completed independent review of this revision");
      else if (w.flags.reviewCompleted.contractHash !== w.contractHash) blockers.push("independent review covered an earlier revision");
    }
    if (w.activeRun) blockers.push(`run ${w.activeRun.runId} is still active`);
    return { ready: blockers.length === 0, blockers };
  }

  async markReady(): Promise<{ workflow: Workflow; blockers: string[] }> {
    return this.store.locked(async () => {
      const bundle = await this.load();
      const w = bundle.workflow;
      const check = this.readinessCheck(bundle);
      if (!check.ready) return { workflow: w, blockers: check.blockers };
      const now = this.now();
      if (w.state === "drafting" && w.mode === "lightweight") transition(w, "ready", "lightweight mode: mandatory fields complete", now);
      else if (w.state === "resolving") transition(w, "ready", "all findings dispositioned", now);
      else if (w.state !== "ready") throw new WorkflowError(`Design ${this.id} is ${w.state}; readiness applies from drafting (lightweight) or resolving.`);
      w.flags.readyForImplementation = { at: now, contractHash: w.contractHash, revision: w.revision };
      await this.save(bundle.contract, w);
      return { workflow: w, blockers: [] };
    });
  }

  /** Record authorization with provenance. Never called implicitly. */
  async approve(approval: { source: Approval["source"]; provenance: string; scope: string }): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      if (!w.flags.readyForImplementation || w.flags.readyForImplementation.contractHash !== w.contractHash) throw new WorkflowError("Mark the design ready before recording approval; approval binds to a ready revision.");
      if (!approval.provenance.trim()) throw new WorkflowError("Approval provenance is required: quote or reference the authorizing instruction.");
      const now = this.now();
      w.flags.userApproved = { at: now, contractHash: w.contractHash, revision: w.revision, source: approval.source, provenance: approval.provenance.trim(), scope: approval.scope.trim() || "design as written" };
      w.history.push({ at: now, from: w.state, to: w.state, reason: `approval recorded (${approval.source})` });
      await this.save(contract, w);
      return w;
    });
  }

  async beginImplementation(): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const a = w.flags.userApproved;
      if (!a || a.contractHash !== w.contractHash) throw new WorkflowError("Implementation needs recorded authorization for this exact revision (design approve).");
      transition(w, "implementing", `authorized by ${a.source}`, this.now());
      await this.save(contract, w);
      return w;
    });
  }

  async beginVerification(): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      transition(w, "verifying", "implementation reported complete", this.now());
      await this.save(contract, w);
      return w;
    });
  }

  async markVerified(summary: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      transition(w, "verified", summary, this.now());
      w.flags.verified = { at: this.now(), contractHash: w.contractHash, revision: w.revision, note: summary };
      await this.save(contract, w);
      return w;
    });
  }

  async returnToImplementation(reason: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      transition(w, "implementing", reason, this.now());
      await this.save(contract, w);
      return w;
    });
  }

  async recordDecision(resolution: string, reason: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const now = this.now();
      w.decisionRecord = { at: now, reason, resolution, openFindings: w.findings.filter((f) => f.disposition === "open" || f.disposition === "re-review").map((f) => f.id) };
      if (w.state !== "blocked" && canTransition(w.state, "blocked")) transition(w, "blocked", `decision recorded: ${reason}`, now);
      else w.history.push({ at: now, from: w.state, to: w.state, reason: `decision recorded: ${reason}` });
      await this.save(contract, w);
      return w;
    });
  }

  async reopen(reason: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      transition(w, "resolving", reason, this.now());
      await this.save(contract, w);
      return w;
    });
  }

  async cancel(reason: string): Promise<Workflow> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const now = this.now();
      if (w.activeRun) {
        const round = w.rounds.find((r) => r.runId === w.activeRun!.runId);
        if (round && !round.finishedAt) { round.finishedAt = now; for (const r of round.reviewers) if (r.status === "pending") r.status = "cancelled"; }
        delete w.activeRun;
        w.history.push({ at: now, from: w.state, to: w.state, reason: `active run cancelled: ${reason}` });
        if (w.state === "reviewing") { transition(w, "drafting", "run cancelled", now); await this.save(contract, w); return w; }
      }
      transition(w, "cancelled", reason, now);
      w.cancelled = { at: now, reason };
      await this.save(contract, w);
      return w;
    });
  }

  /** Detect a run whose process is gone or whose heartbeat is older than the reviewer timeout. */
  staleRun(w: Workflow): { stale: boolean; reason?: string } {
    if (!w.activeRun) return { stale: false };
    const age = this.clock().getTime() - Date.parse(w.activeRun.heartbeatAt);
    let alive = true;
    try { process.kill(w.activeRun.pid, 0); } catch (error) { alive = (error as NodeJS.ErrnoException).code === "EPERM"; }
    if (!alive) return { stale: true, reason: `process ${w.activeRun.pid} is not running` };
    if (age > w.budget.reviewerTimeoutMs * 2) return { stale: true, reason: `no heartbeat for ${Math.round(age / 1000)}s` };
    return { stale: false };
  }

  /** Clear a stale run so the design can continue; a live run is left alone. */
  async recoverStale(): Promise<{ recovered: boolean; reason?: string }> {
    return this.store.locked(async () => {
      const { contract, workflow: w } = await this.load();
      const s = this.staleRun(w);
      if (!s.stale || !w.activeRun) return { recovered: false, ...(w.activeRun ? { reason: "run is live" } : {}) };
      const now = this.now();
      const round = w.rounds.find((r) => r.runId === w.activeRun!.runId);
      if (round && !round.finishedAt) { round.finishedAt = now; for (const r of round.reviewers) if (r.status === "pending") r.status = "failed"; }
      w.history.push({ at: now, from: w.state, to: w.state, reason: `stale run ${w.activeRun.runId} recovered: ${s.reason}` });
      delete w.activeRun;
      if (w.state === "reviewing") transition(w, round?.reviewers.some((r) => r.status === "completed") ? "review-complete" : "drafting", "stale run recovered", now);
      if (w.state === "review-complete") transition(w, "resolving", "findings from the partial round await disposition", now);
      await this.save(contract, w);
      return { recovered: true, reason: s.reason };
    });
  }
}
