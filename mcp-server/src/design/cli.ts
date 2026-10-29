// `ios-agent-mcp design <command>`: the design contract and independent-review workflow.
import { readFile, lstat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { ProcessRunner } from "../agent/runner.js";
import { renderContractMarkdown, validateContract, VERIFICATION_METHODS } from "./contract.js";
import { DISPOSITIONS, REVIEWER_ROLES, type ReviewerRole } from "./findings.js";
import { lintContract } from "./lint.js";
import { MODES } from "./routing.js";
import { AIRouteProvider, ClaudeCodeProvider, FakeProvider, prepareExternalReview, runReview, submitReviewerOutput, type ReviewProvider } from "./review.js";
import { listDesigns } from "./store.js";
import { detectDrift } from "./drift.js";
import { importBuildState, recordEvidence, recordStep, renderVerificationSummary, TIERS, verificationReport, type Tier } from "./verification.js";
import { APPROVAL_SOURCES, DesignWorkflow, WorkflowError, type Workflow } from "./workflow.js";

export const DESIGN_USAGE = `Usage: ios-agent-mcp design <command> [options]

Contract
  validate   --contract <file.json>                       Validate and list readiness gaps.
  render     --contract <file.json>                       Print deterministic DESIGN.md.
  lint       --contract <file.json> | --project --id      Deterministic structural checks (not a review).
  create     --project <dir> --id <slug> --contract <file> [--mode lightweight|full --reason <text>]
  update     --project --id --contract <file> --reason <text>
  list       --project <dir>

Routing and state
  route      --project --id                                Recommended mode and the signals behind it.
  mode       --project --id --mode <mode> --reason <text>  Explicit override, recorded.
  status     --project --id [--json]
  inspect    --project --id [--run <runId>]                Rounds, reviewers, findings, private run files.
  resume     --project --id                                Recover a stale run and print the next action.
  cancel     --project --id --reason <text>
  cleanup    --project --id [--keep <n>]                   Remove old private runs (durable files untouched).

Review
  review     --project --id --provider claude-code|ai-route|self-review|client-subagent [--roles a,b] [--evidence p1,p2] [--timeout-ms n]
  submit     --project --id --run <runId> --reviewer <id> --file <output> [--execution-id <id>] [--attest-fresh-context <text>]
  findings   --project --id [--json]
  disposition --project --id --finding <F-id> --as accepted|rejected|deferred|superseded [--note <text>]
  decision   --project --id --resolution <text> --reason <text>   Close a non-converging review.

Implementation and verification
  ready      --project --id                                Compute readiness; never asserts it.
  approve    --project --id --source explicit-user-statement|existing-implementation-authorization --provenance <text> [--scope <text>]
  implement  --project --id                                Move to implementing (needs recorded approval).
  step       --project --id --step <S-id> --status pending|in-progress|done|abandoned [--note <text>]
  evidence   --project --id --criterion <AC-id> --tier <tier> --status passed|failed --source <path> [--note <text>]
  import-build --project --id                              Map /ios-build state.json into evidence.
  verify     --project --id [--json]                       Report tiers per criterion; marks verified only when complete.
  drift      --project --id [--json]

Tiers: ${TIERS.join(", ")}. Roles: ${REVIEWER_ROLES.join(", ")}.
State lives in <project>/.ios-agent/design/<id>/ (durable) and .ios-agent/design-private/<id>/ (private, gitignored).
`;

function parse(args: string[]): { command: string; flags: Map<string, string>; help: boolean } {
  const flags = new Map<string, string>();
  const command = args[0] && !args[0].startsWith("--") ? args[0] : "";
  let help = false;
  for (let i = command ? 1 : 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--help" || a === "-h") { help = true; continue; }
    if (!a.startsWith("--")) throw new Error(`Unexpected argument ${a}`);
    const key = a.slice(2);
    if (key === "json") { flags.set("json", "true"); continue; }
    const value = args[i + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    if (flags.has(key)) throw new Error(`Duplicate option --${key}`);
    flags.set(key, value);
    i++;
  }
  return { command, flags, help };
}

function need(flags: Map<string, string>, key: string): string {
  const v = flags.get(key);
  if (!v) throw new Error(`--${key} is required`);
  return v;
}

function oneOf<T extends string>(value: string, options: readonly T[], label: string): T {
  if (!(options as readonly string[]).includes(value)) throw new Error(`${label} must be one of ${options.join(", ")}`);
  return value as T;
}

async function readJSONFile(path: string): Promise<unknown> {
  const full = isAbsolute(path) ? path : resolve(process.cwd(), path);
  const st = await lstat(full);
  if (st.isSymbolicLink() || !st.isFile() || st.size > 2_000_000) throw new Error(`Refusing to read ${path}: not a regular file under 2 MB`);
  return JSON.parse(await readFile(full, "utf8"));
}

function nextAction(w: Workflow, blockers: string[]): string {
  switch (w.state) {
    case "drafting": return w.mode === "full" ? "design review --provider <provider>" : "design ready";
    case "review-requested": return "design review --provider <provider> (a round is requested but not started)";
    case "reviewing": return "wait for the active run, or design resume if it is stale";
    case "review-complete":
    case "resolving": return blockers.length ? `disposition the open findings, then design ready (${blockers.length} blocker(s))` : "design ready";
    case "ready": return w.flags.userApproved ? "design implement" : "design approve --source ... --provenance ... (record who authorized implementation)";
    case "implementing": return "mark steps done, record evidence, then design verify";
    case "verifying": return "record remaining evidence; design verify reports what is still unverified";
    case "verified": return "design drift to keep watching for divergence";
    case "blocked": return w.decisionRecord ? "revise the contract (design update) or cancel" : "design decision --resolution ... or design update";
    default: return "none";
  }
}

async function makeProvider(name: string, flags: Map<string, string>): Promise<ReviewProvider | "self-review" | "client-subagent"> {
  switch (name) {
    case "claude-code": return new ClaudeCodeProvider(new ProcessRunner(), { ...(flags.get("model") ? { model: flags.get("model")! } : {}) });
    case "ai-route": return new AIRouteProvider(resolve(process.cwd(), ".ios-agent-ai.json"));
    case "self-review": return "self-review";
    case "client-subagent": return "client-subagent";
    case "fake": {
      // Exposed for harness tests only; it is labelled fake in every record it produces.
      const file = flags.get("fake-output");
      if (!file) throw new Error("--fake-output <file> is required with the fake provider");
      const text = await readFile(file, "utf8");
      return new FakeProvider((pkg) => text.split("\"ROLE\"").join(JSON.stringify(pkg.role)), flags.get("fake-isolated") === "true");
    }
    default: throw new Error(`Unknown provider ${name}; choose claude-code, ai-route, self-review or client-subagent`);
  }
}

export async function designCLI(args: string[], io: { out: (s: string) => void; err: (s: string) => void } = { out: (s) => console.log(s), err: (s) => console.error(s) }): Promise<number> {
  let parsed: ReturnType<typeof parse>;
  try { parsed = parse(args); } catch (error) { io.err((error as Error).message); io.err(DESIGN_USAGE); return 2; }
  const { command, flags, help } = parsed;
  if (help || !command) { io.out(DESIGN_USAGE); return command ? 0 : 2; }
  const KNOWN = new Set(["validate", "render", "lint", "create", "update", "list", "route", "mode", "status", "inspect", "resume", "cancel", "cleanup", "review", "submit", "findings", "disposition", "decision", "ready", "approve", "implement", "step", "evidence", "import-build", "verify", "drift"]);
  if (!KNOWN.has(command)) { io.err(`Unknown design command ${command}`); io.err(DESIGN_USAGE); return 2; }
  const json = flags.get("json") === "true";
  const emit = (value: unknown, text?: string) => io.out(json || text === undefined ? JSON.stringify(value, null, 2) : text);
  try {
    if (command === "validate" || command === "render" || (command === "lint" && flags.has("contract"))) {
      const result = validateContract(await readJSONFile(need(flags, "contract")));
      if (!result.ok || !result.contract) { io.err(`Invalid contract:\n- ${result.errors.join("\n- ")}`); return 1; }
      if (command === "render") { io.out(renderContractMarkdown(result.contract)); return 0; }
      if (command === "lint") { const findings = lintContract(result.contract); emit({ findings }, findings.length ? findings.map((f) => `${f.severity} ${f.rule}: ${f.message}`).join("\n") : "No lint findings. Lint is structural; it is not an independent review."); return findings.some((f) => f.severity === "blocking") ? 1 : 0; }
      emit({ ok: true, readinessGaps: result.readinessGaps }, result.readinessGaps.length ? `Valid. Readiness gaps:\n- ${result.readinessGaps.join("\n- ")}` : "Valid and complete for readiness.");
      return 0;
    }
    const project = need(flags, "project");
    if (command === "list") { const ids = await listDesigns(project); emit({ designs: ids }, ids.length ? ids.join("\n") : "No designs in this project."); return 0; }
    const design = new DesignWorkflow(project, need(flags, "id"));

    switch (command) {
      case "create": {
        const mode = flags.get("mode") ? oneOf(flags.get("mode")!, MODES, "--mode") : undefined;
        const bundle = await design.create(await readJSONFile(need(flags, "contract")), { ...(mode ? { mode, modeReason: flags.get("reason") ?? "explicit choice" } : {}) });
        emit({ id: design.id, revision: bundle.workflow.revision, contractHash: bundle.workflow.contractHash, mode: bundle.workflow.mode, recommendation: bundle.workflow.modeRecommendation, readinessGaps: bundle.readinessGaps, paths: { contract: design.store.paths.contract, markdown: design.store.paths.markdown } },
          `Created design ${design.id} (revision 1, ${bundle.workflow.contractHash.slice(0, 12)}).\nMode: ${bundle.workflow.mode}. ${bundle.workflow.modeRecommendation.explanation}\n${bundle.readinessGaps.length ? `Readiness gaps:\n- ${bundle.readinessGaps.join("\n- ")}` : "No readiness gaps."}\nRendered: ${design.store.paths.markdown}`);
        return 0;
      }
      case "update": {
        const result = await design.update(await readJSONFile(need(flags, "contract")), need(flags, "reason"));
        emit({ revision: result.workflow.revision, contractHash: result.workflow.contractHash, changed: result.changed, staleFindings: result.staleFindings, state: result.workflow.state },
          result.changed.length ? `Revision ${result.workflow.revision}: changed ${result.changed.join(", ")}. ${result.staleFindings.length ? `${result.staleFindings.length} finding(s) need re-review.` : ""} Review and approval flags were cleared.` : "No change to the contract.");
        return 0;
      }
      case "lint": { const { contract } = await design.load(); const findings = lintContract(contract); emit({ findings }, findings.length ? findings.map((f) => `${f.severity} ${f.rule}: ${f.message}`).join("\n") : "No lint findings."); return findings.some((f) => f.severity === "blocking") ? 1 : 0; }
      case "route": { const { workflow: w } = await design.load(); emit({ mode: w.mode, recommendation: w.modeRecommendation, override: w.modeOverride ?? null }, `${w.modeRecommendation.explanation}\nActive mode: ${w.mode}${w.modeOverride ? ` (override: ${w.modeOverride.reason})` : ""}\nSignals:\n${w.modeRecommendation.signals.map((s) => `- ${s.id} [${s.where}]: ${s.detail}`).join("\n") || "- none"}`); return 0; }
      case "mode": { const w = await design.setMode(oneOf(need(flags, "mode"), MODES, "--mode"), need(flags, "reason")); emit({ mode: w.mode, override: w.modeOverride ?? null }, `Mode is now ${w.mode}.`); return 0; }
      case "status": {
        const bundle = await design.load();
        const w = bundle.workflow;
        const check = design.readinessCheck(bundle);
        const stale = design.staleRun(w);
        const value = { id: design.id, state: w.state, mode: w.mode, revision: w.revision, contractHash: w.contractHash, flags: w.flags, rounds: w.rounds.length, findings: { total: w.findings.length, open: w.findings.filter((f) => f.disposition === "open").length, reReview: w.findings.filter((f) => f.disposition === "re-review").length, blocking: w.findings.filter((f) => f.severity === "blocking" && ["open", "re-review"].includes(f.disposition)).length }, readiness: check, activeRun: w.activeRun ?? null, staleRun: stale, next: nextAction(w, check.blockers) };
        emit(value, [
          `Design ${design.id}: ${w.state} (${w.mode} mode, revision ${w.revision}, ${w.contractHash.slice(0, 12)})`,
          `Flags: review ${w.flags.reviewCompleted ? "completed" : "not completed"}; ready ${w.flags.readyForImplementation ? "yes" : "no"}; approved ${w.flags.userApproved ? `yes (${w.flags.userApproved.source})` : "no"}; verified ${w.flags.verified ? "yes" : "no"}`,
          `Findings: ${value.findings.total} total, ${value.findings.open} open, ${value.findings.reReview} need re-review, ${value.findings.blocking} blocking`,
          w.activeRun ? `Active run ${w.activeRun.runId}${stale.stale ? ` (stale: ${stale.reason})` : ""}` : "No active run",
          check.ready ? "Readiness: all checks pass" : `Readiness blockers:\n- ${check.blockers.join("\n- ")}`,
          `Next: ${value.next}`,
        ].join("\n"));
        return 0;
      }
      case "inspect": {
        const { workflow: w } = await design.load();
        const runId = flags.get("run");
        const rounds = runId ? w.rounds.filter((r) => r.runId === runId) : w.rounds;
        if (runId && rounds.length === 0) throw new Error(`Unknown run ${runId}`);
        const privateRuns = await design.store.listRuns();
        emit({ rounds, findings: w.findings, privateRuns, history: w.history.slice(-30) },
          [...rounds.map((r) => `Round ${r.round} ${r.runId} (${r.finishedAt ? "finished" : "open"}; independent: ${r.independent}; self-review: ${r.selfReview}; contract ${r.contractHash.slice(0, 8)})\n${r.reviewers.map((v) => `  - ${v.role} ${v.status} via ${v.provider} [${v.isolation}] exec=${v.executionId || "-"} findings=${v.findings}${v.error ? ` error=${v.error}` : ""}`).join("\n")}`), `Private run files: ${design.store.paths.runs} (${privateRuns.length} run(s))`].join("\n"));
        return 0;
      }
      case "resume": {
        const recovered = await design.recoverStale();
        const bundle = await design.load();
        const check = design.readinessCheck(bundle);
        emit({ recovered, state: bundle.workflow.state, next: nextAction(bundle.workflow, check.blockers) }, `${recovered.recovered ? `Recovered stale run: ${recovered.reason}.` : recovered.reason ? `Nothing to recover (${recovered.reason}).` : "Nothing to recover."}\nState: ${bundle.workflow.state}. Next: ${nextAction(bundle.workflow, check.blockers)}`);
        return 0;
      }
      case "cancel": { const w = await design.cancel(need(flags, "reason")); emit({ state: w.state }, `Design is now ${w.state}.`); return 0; }
      case "cleanup": { const keep = Number(flags.get("keep") ?? 10); if (!Number.isInteger(keep) || keep < 0 || keep > 200) throw new Error("--keep must be 0-200"); const { workflow: w } = await design.load(); const removed = await design.store.cleanup(keep, new Set(w.activeRun ? [w.activeRun.runId] : [])); emit({ removed }, removed.length ? `Removed ${removed.length} private run(s).` : "Nothing to remove."); return 0; }
      case "review": {
        const providerName = need(flags, "provider");
        const roles = flags.get("roles")?.split(",").map((r) => oneOf(r.trim(), REVIEWER_ROLES, "--roles")) as ReviewerRole[] | undefined;
        const extraEvidence = flags.get("evidence")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        const provider = await makeProvider(providerName, flags);
        const { workflow: before } = await design.load();
        if (before.state === "drafting" || before.state === "resolving") await design.requestReview();
        if (provider === "self-review" || provider === "client-subagent") {
          const prepared = await prepareExternalReview(design, { mode: provider, ...(roles ? { roles } : {}), extraEvidence });
          emit(prepared, [
            `${provider === "self-review" ? "Self-review" : "Client subagent review"} prepared: run ${prepared.runId}.`,
            provider === "self-review" ? "This runs in the same context as the author; it is labelled self-review and never counts as independent review." : "Dispatch each prompt to a fresh subagent with no access to this conversation, then submit its output. Independence is recorded as client-attested and is not verified by the server.",
            ...prepared.packages.map((p) => `- ${p.role} (${p.reviewerId}): prompt ${p.promptPath}`),
            `Submit with: design submit --project ... --id ${design.id} --run ${prepared.runId} --reviewer <id> --file <output.json>${provider === "client-subagent" ? " --attest-fresh-context \"<how it was isolated>\"" : ""}`,
            prepared.skippedEvidence.length ? `Skipped evidence:\n${prepared.skippedEvidence.map((s) => `- ${s.path}: ${s.reason}`).join("\n")}` : "",
          ].filter(Boolean).join("\n"));
          return 0;
        }
        const timeoutMs = flags.get("timeout-ms") ? Number(flags.get("timeout-ms")) : undefined;
        const controller = new AbortController();
        const stop = () => controller.abort();
        process.once("SIGINT", stop); process.once("SIGTERM", stop);
        try {
          const result = await runReview(design, { provider, ...(roles ? { roles } : {}), extraEvidence, signal: controller.signal, ...(timeoutMs ? { budget: { reviewerTimeoutMs: timeoutMs } } : {}), sink: (line) => io.err(line) });
          const check = design.readinessCheck(await design.load());
          emit({ runId: result.runId, round: result.round, independent: result.independent, reviewers: result.reviewers, metrics: result.metrics, findings: result.findings.filter((f) => f.specHash === result.workflow.contractHash), skippedEvidence: result.skippedEvidence, state: result.workflow.state, next: nextAction(result.workflow, check.blockers) },
            [
              `Round ${result.round} (${result.runId}) via ${provider.id}: ${result.metrics.completed}/${result.metrics.reviewers} reviewers completed, ${result.metrics.malformed} malformed, ${result.metrics.failed} failed, ${Math.round(result.metrics.elapsedMs / 1000)}s.`,
              `Independent review: ${result.independent ? "yes" : "no"} (${provider.isolation}).`,
              `Usage: ${result.metrics.usage === "unavailable" ? "unavailable" : JSON.stringify(result.metrics.usage)}; cost: not computed (no pricing configured).`,
              ...result.findings.filter((f) => f.specHash === result.workflow.contractHash).map((f) => `- ${f.id} [${f.severity}/${f.category}] ${f.title}${f.supported ? "" : " (unsupported: no evidence cited)"} — ${f.roles.join(", ")}`),
              `State: ${result.workflow.state}. Next: ${nextAction(result.workflow, check.blockers)}`,
            ].join("\n"));
          return result.metrics.completed === 0 ? 1 : 0;
        } finally { process.off("SIGINT", stop); process.off("SIGTERM", stop); }
      }
      case "submit": {
        const text = await readFile(need(flags, "file"), "utf8");
        const result = await submitReviewerOutput(design, { runId: need(flags, "run"), reviewerId: need(flags, "reviewer"), text, ...(flags.get("execution-id") ? { executionId: flags.get("execution-id")! } : {}), ...(flags.get("attest-fresh-context") ? { attestFreshContext: flags.get("attest-fresh-context")! } : {}) });
        emit({ record: result.record, roundFinished: result.roundFinished, state: result.workflow.state }, `Reviewer ${result.record.reviewerId}: ${result.record.status}${result.record.error ? ` (${result.record.error})` : ""}. ${result.roundFinished ? `Round finished; state ${result.workflow.state}.` : "Waiting for the other reviewers."}`);
        return result.record.status === "malformed" ? 1 : 0;
      }
      case "findings": {
        const { workflow: w } = await design.load();
        emit({ findings: w.findings }, w.findings.length ? w.findings.map((f) => `${f.id} [${f.severity}/${f.category}] ${f.disposition}${f.staleReason ? ` (${f.staleReason})` : ""} — ${f.title}\n  affects: ${[...f.affects.criteria, ...f.affects.sections].join(", ") || "-"}; roles: ${f.roles.join(", ")}; supported: ${f.supported}; confidence ${f.confidence}\n  scenario: ${f.scenario}\n  correction: ${f.correction}\n  verify: ${f.verification}`).join("\n") : "No findings.");
        return 0;
      }
      case "disposition": { const f = await design.disposition(need(flags, "finding"), oneOf(need(flags, "as"), DISPOSITIONS.filter((d) => d !== "open" && d !== "re-review") as Array<"accepted" | "rejected" | "deferred" | "superseded">, "--as"), flags.get("note")); emit(f, `${f.id} is now ${f.disposition}.`); return 0; }
      case "decision": { const w = await design.recordDecision(need(flags, "resolution"), need(flags, "reason")); emit({ decisionRecord: w.decisionRecord, state: w.state }, `Decision recorded; ${w.decisionRecord!.openFindings.length} finding(s) left open. State: ${w.state}.`); return 0; }
      case "ready": { const r = await design.markReady(); emit({ ready: r.blockers.length === 0, blockers: r.blockers, state: r.workflow.state }, r.blockers.length ? `Not ready:\n- ${r.blockers.join("\n- ")}` : `Ready for implementation (revision ${r.workflow.revision}). Approval is still required and is never inferred.`); return r.blockers.length ? 1 : 0; }
      case "approve": { const w = await design.approve({ source: oneOf(need(flags, "source"), APPROVAL_SOURCES, "--source"), provenance: need(flags, "provenance"), scope: flags.get("scope") ?? "" }); emit({ userApproved: w.flags.userApproved }, `Approval recorded for revision ${w.revision} (${w.flags.userApproved!.source}).`); return 0; }
      case "implement": { const w = await design.beginImplementation(); emit({ state: w.state }, `Implementing revision ${w.revision}. Each step references its criteria; record evidence as you go.`); return 0; }
      case "step": { const file = await recordStep(design, need(flags, "step"), oneOf(need(flags, "status"), ["pending", "in-progress", "done", "abandoned"] as const, "--status"), flags.get("note") ?? ""); emit({ steps: file.steps }, `Step ${flags.get("step")} is ${flags.get("status")}.`); return 0; }
      case "evidence": {
        const tier = oneOf(need(flags, "tier"), TIERS, "--tier") as Tier;
        const { added } = await recordEvidence(design, [{ criterion: need(flags, "criterion"), tier, status: oneOf(need(flags, "status"), ["passed", "failed"] as const, "--status"), source: need(flags, "source"), note: flags.get("note") ?? "" }]);
        emit({ added }, added.length ? `Recorded ${added[0]!.id} (${tier}) for ${added[0]!.criterion}.` : "Identical evidence already recorded.");
        return 0;
      }
      case "import-build": { const r = await importBuildState(design); emit(r, `Imported ${r.added.length} evidence entr${r.added.length === 1 ? "y" : "ies"} from /ios-build state.${r.unmapped.length ? `\nUnmapped:\n${r.unmapped.map((u) => `- ${u.criterion}: ${u.reason}`).join("\n")}` : ""}`); return 0; }
      case "verify": {
        const bundle = await design.load();
        if (bundle.workflow.state === "implementing") await design.beginVerification();
        const report = await verificationReport(design);
        let state = (await design.load()).workflow.state;
        if (report.allVerified && state === "verifying") state = (await design.markVerified(`all ${report.criteria.length} criteria have current evidence at the required tier`)).state;
        emit({ ...report, state }, `${renderVerificationSummary(report)}\nState: ${state}${report.allVerified ? "" : " (not verified; the unverified criteria above remain explicitly unverified)"}`);
        return 0;
      }
      case "drift": { const report = await detectDrift(design); emit(report, `${report.summary}\n${report.findings.map((f) => `- ${f.id} [${f.kind}/${f.check}]${f.requirement ? ` ${f.requirement}` : ""}${f.location ? ` @ ${f.location}` : ""}: ${f.message}`).join("\n")}${report.findings.length ? "\n" : ""}Checks: ${report.checks.map((c) => `${c.check} (${c.kind})`).join(", ")}`); return report.findings.some((f) => f.kind === "deterministic") ? 1 : 0; }
      default:
        io.err(`Unknown design command ${command}`); io.err(DESIGN_USAGE); return 2;
    }
  } catch (error) {
    io.err(error instanceof WorkflowError ? error.message : `design ${command} failed: ${(error as Error).message}`);
    return 1;
  }
}

export const DESIGN_METHODS = VERIFICATION_METHODS;
