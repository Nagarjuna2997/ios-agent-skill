import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, lstat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { validateContract, renderContractMarkdown, contractHash, migrateContract, changedSections, canonicalJSON } from "../dist/design/contract.js";
import { recommendMode, detectSignals } from "../dist/design/routing.js";
import { mergeFindings, applyDisposition, markStale, dedupKey } from "../dist/design/findings.js";
import { DesignWorkflow, WorkflowError, canTransition } from "../dist/design/workflow.js";
import { DesignStore, containedReadPath } from "../dist/design/store.js";
import { buildEvidenceManifest, buildPackage, renderPrompt, parseReviewerOutput, runReview, prepareExternalReview, submitReviewerOutput, FakeProvider, ClaudeCodeProvider, selectRoles } from "../dist/design/review.js";
import { recordEvidence, recordStep, verificationReport, importBuildState, sourceFingerprint } from "../dist/design/verification.js";
import { detectDrift } from "../dist/design/drift.js";
import { lintContract } from "../dist/design/lint.js";
import { designCLI } from "../dist/design/cli.js";
import { select, GROUPS, PROFILES } from "../dist/efficiency/registry.js";

const UNIFIED = new URL("../dist/unified.js", import.meta.url).pathname;

function contract(overrides = {}) {
  return {
    id: "offline-sync",
    title: "Offline sync",
    objective: "Queue receipts offline and upload later without loss.",
    scope: ["queue locally", "upload when reachable"],
    currentCode: [{ kind: "fact", text: "SyncEngine holds items in memory.", evidence: [{ path: "App/Models/SyncEngine.swift", line: 2 }] }],
    architecture: { summary: "An actor owns the queue.", stateOwnership: [{ kind: "decision", text: "SyncQueue actor owns pending uploads.", evidence: [] }] },
    concurrency: [{ kind: "decision", text: "Uploads run inside the actor; UI state is @MainActor.", evidence: [] }],
    acceptanceCriteria: [
      { id: "AC-1", statement: "Pending receipts survive relaunch.", method: "unit-test", target: "testPendingSurvivesRelaunch" },
      { id: "AC-2", statement: "Receipts screen shows offline state.", method: "simulator", target: "receipts" },
      { id: "AC-3", statement: "Compiles with strict concurrency.", method: "compile" },
    ],
    steps: [
      { id: "S-1", description: "Add SyncQueue", criteria: ["AC-1", "AC-3"] },
      { id: "S-2", description: "Offline state", criteria: ["AC-2"], dependsOn: ["S-1"] },
    ],
    requiredFiles: ["App/Models/SyncEngine.swift"],
    requiredSymbols: ["SyncEngine"],
    ...overrides,
  };
}

async function project(t) {
  const root = await mkdtemp(join(tmpdir(), "design-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "App", "Models"), { recursive: true });
  await writeFile(join(root, "App", "Models", "SyncEngine.swift"), "import Foundation\n@MainActor @Observable final class SyncEngine { var items: [String] = [] }\n");
  return root;
}

function reviewerOutput(role, extra = {}) {
  return JSON.stringify({
    verdict: "pass-with-findings", summary: "ok",
    findings: [{ role, severity: "blocking", category: "concurrency", title: "Snapshot can race with queue mutation", affects: { criteria: ["AC-1"], sections: ["concurrency"] }, scenario: "stale read", evidence: ["architecture.stateOwnership"], correction: "publish via AsyncStream", verification: "ordered snapshot test", confidence: 0.7, uncertainty: "", ...extra }],
  });
}

// ---------------------------------------------------------------------------
// Design schema validation and deterministic rendering.

test("design contract: facts need evidence, ids are unique, steps reference known criteria", () => {
  assert.equal(validateContract(contract()).ok, true);
  const noEvidence = validateContract(contract({ currentCode: [{ kind: "fact", text: "x", evidence: [] }] }));
  assert.equal(noEvidence.ok, false);
  assert.match(noEvidence.errors.join("\n"), /fact needs evidence/);
  const dup = validateContract(contract({ acceptanceCriteria: [...contract().acceptanceCriteria, { id: "AC-1", statement: "dup", method: "compile" }] }));
  assert.match(dup.errors.join("\n"), /duplicate acceptance criterion AC-1/);
  const badStep = validateContract(contract({ steps: [{ id: "S-1", description: "x", criteria: ["AC-9"] }] }));
  assert.match(badStep.errors.join("\n"), /unknown AC-9/);
  const uncovered = validateContract(contract({ steps: [{ id: "S-1", description: "x", criteria: ["AC-1"] }] }));
  assert.match(uncovered.errors.join("\n"), /AC-2 is not referenced/);
  const traversal = validateContract(contract({ requiredFiles: ["../etc/passwd"] }));
  assert.match(traversal.errors.join("\n"), /plain relative path/);
});

test("design contract: schema migration defaults version and revision, rejects unknown versions", () => {
  const migrated = migrateContract({ id: "x" });
  assert.equal(migrated.ok, true);
  assert.deepEqual(migrated.migrated, ["schemaVersion defaulted to 1", "revision defaulted to 1"]);
  const future = validateContract({ ...contract(), schemaVersion: 2 });
  assert.equal(future.ok, false);
  assert.match(future.errors[0], /unsupported contract schemaVersion 2/);
});

test("design contract: rendering and hashing are deterministic and key-order independent", () => {
  const a = validateContract(contract()).contract;
  const reordered = JSON.parse(JSON.stringify(contract()));
  const { objective, ...rest } = reordered;
  const b = validateContract({ ...rest, objective }).contract;
  assert.equal(contractHash(a), contractHash(b));
  assert.equal(renderContractMarkdown(a), renderContractMarkdown(b));
  assert.equal(canonicalJSON({ b: 1, a: [2, { d: 1, c: 2 }] }), '{"a":[2,{"c":2,"d":1}],"b":1}');
  const md = renderContractMarkdown(a);
  assert.match(md, /\*\*Observed\.\*\* SyncEngine holds items in memory\. — evidence: App\/Models\/SyncEngine\.swift:2/);
  assert.match(md, /\| AC-1 \| Pending receipts survive relaunch\. \| unit-test \| testPendingSurvivesRelaunch \|/);
  assert.deepEqual(changedSections(a, validateContract(contract({ objective: "changed" })).contract), ["objective"]);
});

test("design routing: strong signals recommend full review; a bare contract stays lightweight", () => {
  const full = recommendMode(validateContract(contract()).contract);
  assert.equal(full.mode, "full");
  assert.ok(full.signals.some((s) => s.id === "concurrency"));
  assert.match(full.explanation, /Override with an explicit mode/);
  const light = recommendMode(validateContract(contract({ architecture: {}, concurrency: [], acceptanceCriteria: [{ id: "AC-1", statement: "x", method: "compile" }], steps: [{ id: "S-1", description: "y", criteria: ["AC-1"] }] })).contract);
  assert.equal(light.mode, "lightweight");
  assert.equal(detectSignals(validateContract(contract({ permissions: [{ key: "NSCameraUsageDescription", purpose: "scan", kind: "usage-description" }] })).contract).some((s) => s.id === "sensitive-permissions"), true);
});

test("design lint: seeded structural defects are detected and clean contracts are not flagged", () => {
  const clean = validateContract(contract()).contract;
  assert.deepEqual(lintContract(clean), []);
  const seeded = validateContract(contract({
    screens: [{ screen: "receipts", states: ["loading", "success"] }],
    architecture: { summary: "", persistence: [{ kind: "decision", text: "Store in SwiftData", evidence: [] }] },
    dependencies: [{ name: "ReceiptAPI", kind: "service" }],
    objective: "Sign in with passkeys and sync receipts.",
  })).contract;
  const rules = lintContract(seeded).map((f) => f.rule);
  for (const rule of ["screen-missing-error-state", "persistence-without-migration", "service-without-failure-handling", "auth-without-credential-boundary"]) assert.ok(rules.includes(rule), rule);
});

// ---------------------------------------------------------------------------
// State transitions, persistence and authorization provenance.

test("design workflow: create, revise, flags bind to the revision, approval is explicit", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  const created = await design.create(contract());
  assert.equal(created.workflow.state, "drafting");
  assert.equal(created.workflow.mode, "full");
  assert.ok((await readFile(design.store.paths.markdown, "utf8")).startsWith("# Offline sync"));
  await assert.rejects(design.create(contract()), /already exists/);
  await assert.rejects(design.beginImplementation(), WorkflowError);

  // Lightweight override makes readiness reachable without a review; approval still required.
  await design.setMode("lightweight", "small change");
  const ready = await design.markReady();
  assert.deepEqual(ready.blockers, []);
  assert.equal(ready.workflow.state, "ready");
  await assert.rejects(design.beginImplementation(), /recorded authorization/);
  await assert.rejects(design.approve({ source: "explicit-user-statement", provenance: "  ", scope: "" }), /provenance is required/);
  const approved = await design.approve({ source: "explicit-user-statement", provenance: "user: go ahead", scope: "as written" });
  assert.equal(approved.flags.userApproved.source, "explicit-user-statement");
  assert.equal(approved.flags.userApproved.contractHash, approved.contractHash);
  const impl = await design.beginImplementation();
  assert.equal(impl.state, "implementing");

  // A revision clears every bound flag and returns to drafting.
  const updated = await design.update(contract({ objective: "Queue receipts offline and upload later without loss or duplication." }), "clarify");
  assert.equal(updated.workflow.revision, 2);
  assert.equal(updated.workflow.state, "drafting");
  assert.deepEqual(updated.changed, ["objective"]);
  assert.equal(updated.workflow.flags.userApproved, null);
  assert.equal(updated.workflow.flags.readyForImplementation, null);
  assert.ok(await design.store.readRevision(1));
  assert.ok(await design.store.readRevision(2));
  // An unchanged contract is a no-op, not a new revision.
  const same = await design.update(contract({ objective: "Queue receipts offline and upload later without loss or duplication." }), "noop");
  assert.equal(same.workflow.revision, 2);
  assert.equal(canTransition("verified", "implementing"), false);
});

test("design workflow: external edits to DESIGN.json never inherit review validity", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.setMode("lightweight", "test");
  await design.markReady();
  const raw = JSON.parse(await readFile(design.store.paths.contract, "utf8"));
  raw.objective = "edited by hand";
  await writeFile(design.store.paths.contract, JSON.stringify(raw));
  const bundle = await design.load();
  assert.equal(bundle.workflow.state, "drafting");
  assert.equal(bundle.workflow.flags.readyForImplementation, null);
  assert.ok(bundle.workflow.history.some((h) => /changed outside the workflow/.test(h.reason)));
});

test("design store: ids and paths are validated, private state is gitignored and durable state is not", async (t) => {
  const root = await project(t);
  assert.throws(() => new DesignStore(root, "../x"), /Invalid design id/);
  assert.throws(() => new DesignStore("relative", "ok"), /absolute/);
  const design = new DesignWorkflow(root, "ok-id");
  await design.create(contract({ id: "ok-id" }));
  assert.equal((await readFile(join(root, ".ios-agent", "design-private", ".gitignore"), "utf8")).trim(), "*");
  await assert.rejects(lstat(join(root, ".ios-agent", "design", ".gitignore")));
  await assert.rejects(containedReadPath(root, "../outside"), /relative segments/);
  await assert.rejects(containedReadPath(root, "/etc/passwd"), /relative path/);
  await symlink("/etc", join(root, "linked"));
  await assert.rejects(containedReadPath(root, "linked/hosts"), /outside the project/);
  assert.throws(() => design.store.runDir("../../etc"), /Invalid run id/);
});

test("design store: concurrent writers serialise through the lock and corruption is reported, not hidden", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await Promise.all(Array.from({ length: 6 }, (_, i) => design.setMode(i % 2 ? "full" : "lightweight", `writer ${i}`)));
  const w = (await design.load()).workflow;
  assert.equal(w.history.filter((h) => /^mode set to/.test(h.reason)).length, 6);
  await writeFile(design.store.paths.workflow, "{not json");
  await assert.rejects(design.load(), /Corrupt JSON .*workflow\.json/);
});

test("design workflow: stale runs are detected by dead pid and recovered without losing findings", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.requestReview();
  const { round } = await design.beginRound({ runId: "run-stale-00000001", evidenceHashes: {}, pid: 2 ** 22 - 7 });
  await design.recordReviewer(round.runId, { reviewerId: "r1", role: "requirements", provider: "fake", isolation: "x", executionId: "e", status: "completed", findings: 0, elapsedMs: 1, usage: "unavailable" }, [{ finding: JSON.parse(reviewerOutput("requirements")).findings[0], provenance: { runId: round.runId, reviewerId: "r1", role: "requirements", provider: "fake", executionId: "e", specHash: "h" } }]);
  const before = await design.load();
  assert.equal(design.staleRun(before.workflow).stale, true);
  await assert.rejects(design.beginRound({ runId: "run-second-00000002", evidenceHashes: {}, pid: process.pid }), /already has an active run/);
  const recovered = await design.recoverStale();
  assert.equal(recovered.recovered, true);
  const after = await design.load();
  assert.equal(after.workflow.activeRun, undefined);
  assert.equal(after.workflow.state, "resolving");
  assert.equal(after.workflow.findings.length, 1);
  assert.equal((await design.recoverStale()).recovered, false);
});

// ---------------------------------------------------------------------------
// Reviewer context boundaries, evidence packaging and adapters.

test("design review: the package carries only the contract, hashed evidence and criteria; secrets are excluded or redacted", async (t) => {
  const root = await project(t);
  await writeFile(join(root, "App", "Models", "Config.swift"), "let endpoint = \"https://api.example\"\nlet apiKey = \"sk_live_ABCDEFGHIJKLMNOP\"\n");
  await writeFile(join(root, "Secrets.xcconfig"), "API_KEY=abc\n");
  await writeFile(join(root, "App", "big.swift"), "x".repeat(70_000));
  const c = validateContract(contract({ requiredFiles: ["App/Models/SyncEngine.swift", "App/Models/Config.swift", "Secrets.xcconfig", "App/big.swift", "missing.swift"] })).contract;
  const manifest = await buildEvidenceManifest(root, c, ["../outside.swift"], 120_000);
  const paths = manifest.evidence.map((e) => e.path);
  assert.deepEqual(paths, ["App/Models/Config.swift", "App/Models/SyncEngine.swift", "App/big.swift"]);
  assert.ok(manifest.skipped.some((s) => s.path === "Secrets.xcconfig" && /credential/.test(s.reason)));
  assert.ok(manifest.skipped.some((s) => s.path === "../outside.swift"));
  assert.ok(manifest.skipped.some((s) => s.path === "missing.swift"));
  const config = manifest.evidence.find((e) => e.path === "App/Models/Config.swift");
  assert.equal(config.redactedLines, 1);
  assert.doesNotMatch(config.text, /sk_live/);
  assert.equal(manifest.evidence.find((e) => e.path === "App/big.swift").truncated, true);
  for (const e of manifest.evidence) assert.match(e.sha256, /^[0-9a-f]{64}$/);

  const pkg = buildPackage(c, contractHash(c), "concurrency", manifest.evidence, "concurrency-abc");
  assert.deepEqual(Object.keys(pkg).sort(), ["boundary", "contract", "contractHash", "criteria", "designId", "evidence", "outputSchema", "packageVersion", "reviewerId", "revision", "role"]);
  const prompt = renderPrompt(pkg);
  assert.match(prompt, /have not seen the author's conversation/);
  assert.doesNotMatch(prompt, /sk_live/);
  assert.doesNotMatch(JSON.stringify(pkg), /"history"|"rounds"|"flags"|"provenance"/);
  assert.deepEqual(selectRoles(c), ["requirements", "architecture", "concurrency", "ui-verification"]);
  assert.deepEqual(selectRoles(validateContract(contract({ acceptanceCriteria: [{ id: "AC-1", statement: "x", method: "compile" }], steps: [{ id: "S-1", description: "y", criteria: ["AC-1"] }] })).contract), ["requirements", "architecture", "concurrency"]);
});

test("design review: fake provider rounds record provider, execution id, hashes and isolation; dedup keeps provenance", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.requestReview();
  const provider = new FakeProvider((pkg) => reviewerOutput(pkg.role), false);
  const result = await runReview(design, { provider, roles: ["requirements", "architecture", "concurrency"] });
  assert.equal(result.reviewers.length, 3);
  assert.equal(result.independent, false, "a fake that does not claim isolation never counts as independent");
  assert.equal(result.findings.length, 1, "three identical reports collapse into one finding");
  assert.equal(result.findings[0].provenance.length, 3);
  assert.deepEqual(result.findings[0].roles.sort(), ["architecture", "concurrency", "requirements"]);
  assert.equal(result.findings[0].confidence, 0.7, "agreement does not raise confidence");
  for (const r of result.reviewers) {
    assert.equal(r.provider, "fake");
    assert.match(r.executionId, /^fake-/);
    assert.match(r.isolation, /fake test double/);
  }
  assert.equal(result.workflow.rounds[0].contractHash, result.workflow.contractHash);
  assert.ok(result.workflow.rounds[0].evidenceHashes["App/Models/SyncEngine.swift"]);
  assert.equal(result.metrics.usage, "unavailable");
  assert.equal(result.metrics.cost, null);
  assert.equal(result.workflow.state, "resolving");
  assert.equal(result.workflow.flags.reviewCompleted, null);
  const check = design.readinessCheck(await design.load());
  assert.ok(check.blockers.some((b) => /requires a completed independent review/.test(b)));
  assert.ok(await design.store.readPrivate(result.runId, "manifest.json"));
  assert.ok(await design.store.readPrivate(result.runId, `output-${result.reviewers[0].reviewerId}.txt`));
});

test("design review: malformed output, timeout and cancellation are recorded without losing run state", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.requestReview();
  const malformed = new FakeProvider((pkg) => pkg.role === "requirements" ? "not json at all" : pkg.role === "architecture" ? JSON.stringify({ verdict: "pass", findings: [{ role: "security", severity: "major" }] }) : reviewerOutput(pkg.role), true);
  const r1 = await runReview(design, { provider: malformed, roles: ["requirements", "architecture", "concurrency"] });
  const byRole = Object.fromEntries(r1.reviewers.map((r) => [r.role, r]));
  assert.equal(byRole.requirements.status, "malformed");
  assert.match(byRole.requirements.error, /not JSON/);
  assert.equal(byRole.architecture.status, "malformed");
  assert.equal(byRole.concurrency.status, "completed");
  assert.equal(r1.independent, false, "a round with malformed reviewers is not a completed independent review");
  assert.equal(r1.findings.length, 1);
  assert.equal(r1.workflow.state, "resolving");
  assert.ok(r1.workflow.rounds[0].finishedAt);

  await design.requestReview();
  const slow = new FakeProvider((pkg) => reviewerOutput(pkg.role), true, 1_500);
  await assert.rejects(runReview(design, { provider: slow, roles: ["requirements"], budget: { reviewerTimeoutMs: 10 } }), /reviewerTimeoutMs/);
  const r2 = await runReview(design, { provider: slow, roles: ["requirements"], budget: { reviewerTimeoutMs: 1_000 } });
  assert.equal(r2.reviewers[0].status, "timeout");
  assert.equal(r2.workflow.state, "blocked");
  await design.reopen("retry after timeout");
  await design.requestReview();

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 50);
  const r3 = await runReview(design, { provider: slow, roles: ["requirements"], signal: controller.signal });
  assert.equal(r3.reviewers[0].status, "cancelled");
  assert.equal(r3.workflow.state, "blocked");
  const w = (await design.load()).workflow;
  assert.equal(w.activeRun, undefined);
  assert.equal(w.rounds.length, 3);
});

test("design review: budgets cap rounds and a decision record closes a non-converging review", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync", () => new Date());
  await design.create(contract(), { budget: { maxRounds: 1 } });
  await design.requestReview();
  const provider = new FakeProvider((pkg) => reviewerOutput(pkg.role), true);
  const r1 = await runReview(design, { provider, roles: ["requirements"] });
  assert.equal(r1.independent, true);
  assert.equal(r1.workflow.flags.reviewCompleted.contractHash, r1.workflow.contractHash);
  await design.requestReview();
  await assert.rejects(runReview(design, { provider, roles: ["requirements"] }), /Review budget exhausted/);
  const w = await design.recordDecision("ship with the race documented; fix in S-3", "reviewer and author disagree after the round cap");
  assert.equal(w.state, "blocked");
  assert.deepEqual(w.decisionRecord.openFindings, [w.findings[0].id]);
});

test("design findings: dispositions need rationale, stale findings return to re-review after relevant revisions", async (t) => {
  const specHash = "a".repeat(64);
  const prov = (id) => ({ runId: "run-x", reviewerId: id, role: "requirements", provider: "fake", executionId: "e", specHash });
  const f = JSON.parse(reviewerOutput("requirements")).findings[0];
  const merged = mergeFindings([], [{ finding: f, provenance: prov("r1") }, { finding: { ...f, title: "snapshot CAN race with queue mutation!" }, provenance: prov("r2") }, { finding: { ...f, category: "security", evidence: [] }, provenance: prov("r3") }], specHash);
  assert.equal(merged.findings.length, 2);
  assert.equal(merged.added, 2);
  assert.equal(merged.merged, 1);
  const concurrency = merged.findings.find((x) => x.category === "concurrency");
  assert.equal(concurrency.provenance.length, 2);
  assert.equal(merged.findings.find((x) => x.category === "security").supported, false, "a finding without evidence is unsupported");
  assert.equal(dedupKey(f), dedupKey({ ...f, title: "Snapshot can race with queue mutation (again)" }));
  assert.throws(() => applyDisposition(merged.findings, concurrency.id, "rejected", "", "now"), /needs a rationale/);
  applyDisposition(merged.findings, concurrency.id, "deferred", "ships behind a flag; impact: stale badge for up to 1s", "now");
  assert.equal(concurrency.disposition, "deferred");
  const stale = markStale(merged.findings, { sections: ["concurrency"], criteria: [] }, "b".repeat(64));
  assert.equal(stale.find((x) => x.id === concurrency.id).disposition, "re-review");
  const untouched = markStale(merged.findings, { sections: ["objective"], criteria: [] }, "b".repeat(64));
  assert.equal(untouched.find((x) => x.id === concurrency.id).disposition, "deferred");

  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.requestReview();
  const r = await runReview(design, { provider: new FakeProvider((pkg) => reviewerOutput(pkg.role), true), roles: ["requirements"] });
  const id = r.findings[0].id;
  const updated = await design.update(contract({ concurrency: [{ kind: "decision", text: "Uploads run detached.", evidence: [] }] }), "changed concurrency");
  assert.deepEqual(updated.staleFindings, [id]);
  assert.equal(updated.workflow.flags.reviewCompleted, null, "review validity never carries forward silently");
  await design.requestReview();
  await runReview(design, { provider: new FakeProvider(() => JSON.stringify({ verdict: "pass", findings: [] }), true), roles: ["requirements"] });
  const after = (await design.load()).workflow;
  assert.equal(after.findings.find((x) => x.id === id).disposition, "re-review");
  await design.disposition(id, "superseded", "replaced by detached design");
  const ready = await design.markReady();
  assert.deepEqual(ready.blockers, []);
});

test("design review: self-review is never independent; client subagents count only when the submitter attests isolation", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await design.requestReview();
  const prepared = await prepareExternalReview(design, { mode: "self-review", roles: ["requirements"] });
  assert.ok((await readFile(prepared.packages[0].promptPath, "utf8")).includes("Return only the JSON object"));
  assert.equal((await design.load()).workflow.activeRun, undefined, "external rounds do not hold the active-run marker");
  const submitted = await submitReviewerOutput(design, { runId: prepared.runId, reviewerId: prepared.packages[0].reviewerId, text: reviewerOutput("requirements"), attestFreshContext: "irrelevant for self-review" });
  assert.equal(submitted.roundFinished, true);
  assert.equal(submitted.workflow.rounds[0].selfReview, true);
  assert.equal(submitted.workflow.rounds[0].independent, false);
  assert.equal(submitted.workflow.flags.reviewCompleted, null);
  await assert.rejects(submitReviewerOutput(design, { runId: prepared.runId, reviewerId: prepared.packages[0].reviewerId, text: "{}" }), /already finished/);

  await design.requestReview();
  const sub = await prepareExternalReview(design, { mode: "client-subagent", roles: ["requirements", "architecture"] });
  const one = await submitReviewerOutput(design, { runId: sub.runId, reviewerId: sub.packages[0].reviewerId, text: reviewerOutput("requirements"), executionId: "agent-1", attestFreshContext: "Claude Code Agent tool, no conversation access" });
  assert.equal(one.roundFinished, false);
  assert.match(one.record.isolation, /client-attested .*not verified by the server/);
  const two = await submitReviewerOutput(design, { runId: sub.runId, reviewerId: sub.packages[1].reviewerId, text: reviewerOutput("architecture"), executionId: "agent-2" });
  assert.equal(two.roundFinished, true);
  assert.equal(two.workflow.rounds[1].independent, false, "one unattested reviewer makes the round non-independent");

  await design.requestReview();
  const sub2 = await prepareExternalReview(design, { mode: "client-subagent", roles: ["requirements"] });
  const attested = await submitReviewerOutput(design, { runId: sub2.runId, reviewerId: sub2.packages[0].reviewerId, text: reviewerOutput("requirements"), executionId: "agent-3", attestFreshContext: "fresh subagent" });
  assert.equal(attested.workflow.rounds[2].independent, true);
  assert.equal(attested.workflow.flags.reviewCompleted.contractHash, attested.workflow.contractHash);
  await design.update(contract({ objective: "changed" }), "edit");
  await design.requestReview();
  const sub3 = await prepareExternalReview(design, { mode: "client-subagent", roles: ["requirements"] });
  await design.update(contract({ objective: "changed twice" }), "edit again");
  await assert.rejects(submitReviewerOutput(design, { runId: sub3.runId, reviewerId: sub3.packages[0].reviewerId, text: reviewerOutput("requirements") }), /submission is stale/);
});

test("design review: the claude-code adapter runs a fresh headless process with tools disabled and reports availability honestly", async (t) => {
  const calls = [];
  const runner = { async run(command, args, options) {
    calls.push({ command, args, options });
    if (args[0] === "--version") return { command, args, exitCode: 0, stdout: "1.0.0", stderr: "", durationMs: 1, timedOut: false };
    return { command, args, exitCode: 0, stdout: JSON.stringify({ result: reviewerOutput("requirements"), session_id: "sess-1", usage: { input_tokens: 10, output_tokens: 5, cache: null } }), stderr: "", durationMs: 5, timedOut: false };
  } };
  const provider = new ClaudeCodeProvider(runner, { model: "test-model" });
  assert.deepEqual(await provider.available(), { ok: true });
  const pkg = buildPackage(validateContract(contract()).contract, "h", "requirements", [], "requirements-1");
  const out = await provider.run(pkg, renderPrompt(pkg), new AbortController().signal);
  assert.equal(out.executionId, "sess-1");
  assert.deepEqual(out.usage, { input_tokens: 10, output_tokens: 5 });
  const run = calls[1];
  assert.equal(run.command, "claude");
  for (const flag of ["-p", "--no-session-persistence", "--tools", "--strict-mcp-config", "--model"]) assert.ok(run.args.includes(flag), flag);
  assert.equal(run.args[run.args.indexOf("--tools") + 1], "");
  assert.equal(run.args[run.args.indexOf("--mcp-config") + 1], '{"mcpServers":{}}');
  assert.ok(run.options.input.includes("have not seen the author's conversation"));
  assert.notEqual(run.options.cwd, process.cwd());
  const missing = new ClaudeCodeProvider({ async run(c, a) { return { command: c, args: a, exitCode: null, stdout: "", stderr: "", durationMs: 0, timedOut: false, spawnError: "ENOENT" }; } });
  assert.match((await missing.available()).reason, /claude CLI not found/);
  assert.equal(parseReviewerOutput("```json\n" + reviewerOutput("requirements") + "\n```", "requirements").ok, true);
  assert.match(parseReviewerOutput(reviewerOutput("security"), "requirements").error, /different role/);
});

// ---------------------------------------------------------------------------
// Acceptance-to-evidence traceability and drift.

test("design verification: evidence tiers are separate, bound to the fingerprint and revision, and never collapse into acceptance", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  await mkdir(join(root, ".ios-agent", "logs"), { recursive: true });
  await writeFile(join(root, ".ios-agent", "logs", "build-1.log"), "ok\n");
  await assert.rejects(recordEvidence(design, [{ criterion: "AC-9", tier: "compiled", status: "passed", source: "x" }]), /Unknown acceptance criterion/);
  await assert.rejects(recordEvidence(design, [{ criterion: "AC-1", tier: "compiled", status: "passed", source: "/abs" }]), /project-relative/);
  const { added } = await recordEvidence(design, [{ criterion: "AC-3", tier: "compiled", status: "passed", source: ".ios-agent/logs/build-1.log" }, { criterion: "AC-1", tier: "compiled", status: "passed", source: ".ios-agent/logs/build-1.log" }]);
  assert.equal(added.length, 2);
  assert.match(added[0].sha256, /^[0-9a-f]{64}$/);
  let report = await verificationReport(design);
  const status = Object.fromEntries(report.criteria.map((c) => [c.criterion.id, c]));
  assert.equal(status["AC-3"].status, "verified");
  assert.equal(status["AC-1"].status, "unverified", "compiled evidence does not satisfy a unit-test criterion");
  assert.match(status["AC-1"].reason, /only compiled evidence; automated-checks required/);
  assert.equal(status["AC-2"].status, "unverified");
  assert.equal(report.allVerified, false);
  await recordStep(design, "S-1", "done");
  await assert.rejects(recordStep(design, "S-9", "done"), /Unknown step/);
  await writeFile(join(root, "App", "Models", "SyncEngine.swift"), "// changed\n");
  report = await verificationReport(design);
  assert.equal(report.criteria.find((c) => c.criterion.id === "AC-3").status, "stale-evidence");
  assert.equal(report.steps.done, 1);
  const fp1 = await sourceFingerprint(root);
  await writeFile(join(root, ".ios-agent", "logs", "build-1.log"), "changed log\n");
  assert.equal((await sourceFingerprint(root)).hash, fp1.hash, ".ios-agent artifacts never change the source fingerprint");
});

test("design verification: /ios-build state maps deterministically and reports what it cannot map", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract());
  let r = await importBuildState(design);
  assert.equal(r.added.length, 0);
  assert.match(r.unmapped[0].reason, /no .ios-agent\/state.json/);
  const fp = (await sourceFingerprint(root)).hash;
  await mkdir(join(root, ".ios-agent", "logs"), { recursive: true });
  await writeFile(join(root, ".ios-agent", "logs", "build-2.log"), "ok\n");
  await writeFile(join(root, ".ios-agent", "logs", "test-1.log"), "Test Suite passed: testPendingSurvivesRelaunch\n");
  await writeFile(join(root, ".ios-agent", "state.json"), JSON.stringify({ builds: [{ success: false, cycle: 1, attempt: 1, at: "t" }, { success: true, cycle: 1, attempt: 2, at: "t" }], buildSourceHash: fp, tests: [{ status: "passed", logPath: ".ios-agent/logs/test-1.log", sourceHash: fp }], screenshots: [{ screen: "receipts", path: ".ios-agent/screenshots/receipts-light.png", variant: "light" }], captureSourceHash: fp }));
  r = await importBuildState(design);
  assert.deepEqual(r.added.map((e) => [e.criterion, e.tier]).sort(), [["AC-1", "automated-checks"], ["AC-2", "simulator-observed"], ["AC-3", "compiled"]]);
  assert.deepEqual(r.unmapped, []);
  assert.ok(r.added.every((e) => e.recordedBy === "ios-build-state"));
  const report = await verificationReport(design);
  assert.equal(report.allVerified, true, "imported evidence is valid for the current fingerprint");
});

test("design drift: deterministic checks report missing files, symbols, target, permission and evidence; unknowns stay unknown", async (t) => {
  const root = await project(t);
  const design = new DesignWorkflow(root, "offline-sync");
  await design.create(contract({ requiredFiles: ["App/Models/SyncEngine.swift", "App/Models/SyncQueue.swift"], requiredSymbols: ["SyncEngine", "SyncQueue"], deployment: { iosMinimum: "17.0", targets: ["iphone"] }, permissions: [{ key: "NSCameraUsageDescription", purpose: "scan", kind: "usage-description" }], dependencies: [{ name: "Alamofire", kind: "swift-package" }] }));
  let report = await detectDrift(design);
  const checks = Object.fromEntries(report.findings.map((f) => [`${f.check}:${f.requirement ?? f.location ?? ""}`, f]));
  assert.ok(checks["required-file:App/Models/SyncQueue.swift"]);
  assert.ok(report.findings.some((f) => f.check === "required-symbol" && /SyncQueue/.test(f.message)));
  assert.ok(report.findings.some((f) => f.check === "deployment-target" && f.kind === "unknown"));
  assert.ok(report.findings.some((f) => f.check === "permission" && f.kind === "unknown"));
  assert.ok(report.findings.some((f) => f.check === "dependency" && f.kind === "unknown"));
  assert.equal(report.findings.filter((f) => f.check === "criterion-evidence").length, 3);
  assert.equal(report.findings.filter((f) => f.check === "step-incomplete").length, 2);
  assert.match(report.summary, /The design was not modified/);
  assert.equal(JSON.parse(await readFile(design.store.paths.contract, "utf8")).revision, 1);

  await writeFile(join(root, "project.yml"), "name: Demo\noptions:\n  deploymentTarget:\n    iOS: \"16.0\"\npackages:\n  Alamofire:\n    url: https://github.com/Alamofire/Alamofire\ntargets:\n  Demo:\n    info:\n      properties:\n        NSMicrophoneUsageDescription: talk\n");
  await writeFile(join(root, "App", "Models", "SyncQueue.swift"), "actor SyncQueue {}\n");
  report = await detectDrift(design);
  const target = report.findings.find((f) => f.check === "deployment-target");
  assert.equal(target.kind, "deterministic");
  assert.match(target.message, /design states iOS 17.0; project.yml states 16.0/);
  const perms = report.findings.filter((f) => f.check === "permission").map((f) => f.message);
  assert.ok(perms.some((m) => /NSCameraUsageDescription is in the design but not in project files/.test(m)));
  assert.ok(perms.some((m) => /NSMicrophoneUsageDescription is in project files but not in the design/.test(m)));
  assert.equal(report.findings.some((f) => f.check === "dependency"), false, "Alamofire is declared");
  assert.equal(report.findings.some((f) => f.check === "required-file"), false);
});

// ---------------------------------------------------------------------------
// CLI and MCP boundaries, and behaviour when the feature is not used.

test("design CLI: validate, lint and the workflow commands run through dist/unified.js", async (t) => {
  const root = await project(t);
  const file = join(root, "contract.json");
  await writeFile(file, JSON.stringify(contract()));
  const run = (args) => new Promise((resolve) => {
    const child = spawn(process.execPath, [UNIFIED, "design", ...args], { cwd: root });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d)); child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => resolve({ code, out, err }));
  });
  const v = await run(["validate", "--contract", file]);
  assert.equal(v.code, 0, v.err);
  assert.match(v.out, /Valid/);
  const bad = await run(["validate", "--contract", join(root, "App", "Models", "SyncEngine.swift")]);
  assert.equal(bad.code, 1);
  const help = await run(["--help"]);
  assert.match(help.out, /Usage: ios-agent-mcp design/);
  const created = await run(["create", "--project", root, "--id", "offline-sync", "--contract", file, "--mode", "lightweight", "--reason", "small"]);
  assert.equal(created.code, 0, created.err);
  assert.match(created.out, /Mode: lightweight/);
  const ready = await run(["ready", "--project", root, "--id", "offline-sync"]);
  assert.equal(ready.code, 0, ready.err);
  const implement = await run(["implement", "--project", root, "--id", "offline-sync"]);
  assert.equal(implement.code, 1);
  assert.match(implement.err, /recorded authorization/);
  const status = await run(["status", "--project", root, "--id", "offline-sync", "--json"]);
  assert.equal(JSON.parse(status.out).flags.userApproved, null);
  const unknown = await run(["frobnicate", "--project", root]);
  assert.equal(unknown.code, 2);
  const io = { out: () => {}, err: () => {} };
  assert.equal(await designCLI(["status", "--project", root, "--id", "nope"], io), 1);
  assert.equal(await designCLI(["status", "--project", root], io), 1);
});

test("design MCP tools: validate without side effects, status on a missing design is a clean error, and profiles can exclude the group", async (t) => {
  const root = await project(t);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [UNIFIED] }));
  t.after(() => client.close());
  const { tools } = await client.listTools();
  const names = tools.map((x) => x.name);
  for (const n of ["design_contract", "design_status", "design_review", "design_resolve", "design_verify", "design_drift"]) assert.ok(names.includes(n), n);
  assert.equal(tools.find((x) => x.name === "design_status").annotations.readOnlyHint, true);
  assert.equal(tools.find((x) => x.name === "design_drift").annotations.readOnlyHint, true);
  const validated = await client.callTool({ name: "design_contract", arguments: { projectDir: root, designId: "offline-sync", action: "validate", contract: contract() } });
  assert.equal(JSON.parse(validated.content[0].text).ok, true);
  await assert.rejects(lstat(join(root, ".ios-agent")), "validate must not create state");
  const missing = await client.callTool({ name: "design_status", arguments: { projectDir: root, designId: "offline-sync" } });
  assert.equal(missing.isError, true);
  assert.match(missing.content[0].text, /No design offline-sync/);
  await assert.rejects(lstat(join(root, ".ios-agent")), "status must not create state either");
  const created = await client.callTool({ name: "design_contract", arguments: { projectDir: root, designId: "offline-sync", action: "create", contract: contract() } });
  assert.equal(JSON.parse(created.content[0].text).revision, 1);
  const drift = await client.callTool({ name: "design_drift", arguments: { projectDir: root, designId: "offline-sync" } });
  assert.ok(JSON.parse(drift.content[0].text).findings.length > 0);
  const resolve = await client.callTool({ name: "design_resolve", arguments: { projectDir: root, designId: "offline-sync", action: "implement" } });
  assert.equal(resolve.isError, true);

  const group = GROUPS.find((g) => g.id === "design-review");
  assert.ok(group && group.test("design_status") && !group.test("ios_design_evidence"));
  assert.ok(PROFILES.build.includes("design-review"));
  assert.ok(!PROFILES.review.includes("design-review"));
  const entries = tools.map((tool) => ({ tool, groups: [GROUPS.find((g) => g.test(tool.name)).id], dependencies: [], runtime: "x", handler: async () => ({ content: [] }) }));
  assert.equal(select(entries, PROFILES.review).some((e) => e.tool.name.startsWith("design_")), false, "the review profile leaves design tools out");
});
