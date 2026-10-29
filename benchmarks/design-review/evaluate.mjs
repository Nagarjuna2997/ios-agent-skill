#!/usr/bin/env node
// Design-review evaluation.
//
//   node evaluate.mjs                     deterministic: lint vs seeded defects, no model
//   node evaluate.mjs --live --provider claude-code|ai-route [--out DIR]
//                                         live: independent review of every fixture, scored by category
//   node evaluate.mjs --self-test         harness sanity checks
//
// The deterministic run measures what a script can decide. The live run measures model
// reviewers and is recorded separately; neither claims improved quality or reduced rework.
import { readdir, readFile, mkdir, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "..", "mcp-server", "dist", "design");
const { validateContract } = await import(join(dist, "contract.js"));
const { lintContract } = await import(join(dist, "lint.js"));

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

async function fixtures() {
  const root = join(here, "fixtures");
  const ids = (await readdir(root)).sort();
  const out = [];
  for (const id of ids) {
    const contract = JSON.parse(await readFile(join(root, id, "contract.json"), "utf8"));
    const expected = JSON.parse(await readFile(join(root, id, "expected.json"), "utf8"));
    out.push({ id, contract, expected });
  }
  return out;
}

function scoreRules(expectedRules, actualRules) {
  const expected = [...expectedRules];
  const actual = [...actualRules];
  let detected = 0;
  for (const rule of expected) { const i = actual.indexOf(rule); if (i >= 0) { detected++; actual.splice(i, 1); } }
  return { expected: expected.length, detected, missed: expected.length - detected, falsePositives: actual.length, unexpectedRules: actual };
}

function coverage(contract) {
  const covered = new Set(contract.steps.flatMap((s) => s.criteria));
  const traceable = contract.acceptanceCriteria.filter((c) => c.method === "compile" || c.target).length;
  return { criteria: contract.acceptanceCriteria.length, coveredByStep: contract.acceptanceCriteria.filter((c) => covered.has(c.id)).length, traceable };
}

export async function deterministic() {
  const rows = [];
  for (const f of await fixtures()) {
    const v = validateContract(f.contract);
    if (!v.ok) { rows.push({ id: f.id, invalid: v.errors }); continue; }
    const rules = lintContract(v.contract).map((x) => x.rule);
    rows.push({ id: f.id, ...scoreRules(f.expected.seededDefects, rules), coverage: coverage(v.contract) });
  }
  const totals = rows.reduce((t, r) => ({ expected: t.expected + (r.expected ?? 0), detected: t.detected + (r.detected ?? 0), falsePositives: t.falsePositives + (r.falsePositives ?? 0) }), { expected: 0, detected: 0, falsePositives: 0 });
  return { mode: "deterministic-lint", model: "none", provider: "none", rows, totals, note: "Lint is structural; this measures seeded-defect detection by a script, not reviewer judgment." };
}

async function live(providerName, outDir) {
  const { DesignWorkflow } = await import(join(dist, "workflow.js"));
  const { runReview, ClaudeCodeProvider, AIRouteProvider } = await import(join(dist, "review.js"));
  const { ProcessRunner } = await import(join(here, "..", "..", "mcp-server", "dist", "agent", "runner.js"));
  const provider = providerName === "ai-route" ? new AIRouteProvider(join(process.cwd(), ".ios-agent-ai.json")) : new ClaudeCodeProvider(new ProcessRunner());
  const avail = await provider.available();
  if (!avail.ok) return { mode: "live", provider: providerName, status: "not-run", reason: avail.reason, rows: [] };
  const rows = [];
  for (const f of await fixtures()) {
    const root = await mkdtemp(join(tmpdir(), "design-eval-"));
    try {
      await mkdir(join(root, "App", "Models"), { recursive: true });
      await writeFile(join(root, "App", "Models", "SyncEngine.swift"), "import Foundation\n@MainActor @Observable final class SyncEngine { var items: [String] = [] }\n");
      const design = new DesignWorkflow(root, f.contract.id);
      await design.create(f.contract, { mode: "full" });
      await design.requestReview();
      const started = Date.now();
      const result = await runReview(design, { provider });
      // Score by lint rule family -> finding category the rule maps to; a live reviewer is judged on category + affected section.
      const expectedCategories = f.expected.seededDefects.map(ruleCategory);
      const actual = result.findings.filter((x) => x.severity !== "note").map((x) => x.category);
      const score = scoreRules(expectedCategories, actual);
      // Live reviewers also report real gaps the thin fixtures have; those are "beyond seeded", not false positives.
      rows.push({ id: f.id, runId: result.runId, independent: result.independent, reviewers: result.metrics.reviewers, completed: result.metrics.completed, malformed: result.metrics.malformed, reviewerErrors: result.reviewers.filter((v) => v.error).map((v) => v.role + ": " + v.error), elapsedMs: Date.now() - started, usage: result.metrics.usage, expected: score.expected, detected: score.detected, missed: score.missed, beyondSeeded: score.falsePositives, unsupported: result.findings.filter((x) => !x.supported).length, findings: result.findings.map((x) => ({ id: x.id, severity: x.severity, category: x.category, title: x.title, supported: x.supported, roles: x.roles })) });
    } finally { await rm(root, { recursive: true, force: true }); }
  }
  const totals = rows.reduce((t, r) => ({ reviewers: t.reviewers + r.reviewers, completed: t.completed + r.completed, malformed: t.malformed + r.malformed, independentRounds: t.independentRounds + (r.independent ? 1 : 0), expected: t.expected + r.expected, detected: t.detected + r.detected, beyondSeeded: t.beyondSeeded + r.beyondSeeded, unsupported: t.unsupported + r.unsupported, elapsedMs: t.elapsedMs + r.elapsedMs }), { reviewers: 0, completed: 0, malformed: 0, independentRounds: 0, expected: 0, detected: 0, beyondSeeded: 0, unsupported: 0, elapsedMs: 0 });
  const report = { mode: "live", provider: providerName, isolation: provider.isolation, status: "ran", rows, totals, at: new Date().toISOString(), note: "Category-level match against seeded defects; findings beyond the seeded defect are real gaps in deliberately thin fixtures, not counted as false positives; usage is model-reported or unavailable; cost is not computed." };
  if (outDir) { await mkdir(outDir, { recursive: true }); await writeFile(join(outDir, `live-${providerName}-${Date.now()}.json`), JSON.stringify(report, null, 2)); }
  return report;
}

function ruleCategory(rule) {
  return ({
    "persistence-without-migration": "architecture", "screen-missing-error-state": "ui-states", "screen-missing-empty-state": "ui-states",
    "auth-without-credential-boundary": "security", "concurrency-without-isolation": "concurrency", "service-without-failure-handling": "service-integration",
    "criterion-without-target": "verification-feasibility", "current-code-not-observed": "compatibility", "permission-without-purpose": "permissions",
    "unknown-without-resolver": "requirements", "no-implementation-steps": "requirements",
  })[rule] ?? "other";
}

async function selfTest() {
  const report = await deterministic();
  const control = report.rows.find((r) => r.id === "clean-control");
  if (!control || control.falsePositives !== 0) throw new Error("clean-control must produce no lint findings");
  if (report.totals.detected !== report.totals.expected) throw new Error(`deterministic lint must detect every seeded defect (${report.totals.detected}/${report.totals.expected})`);
  if (report.totals.falsePositives !== 0) throw new Error(`unexpected lint findings: ${JSON.stringify(report.rows.filter((r) => r.falsePositives))}`);
  const s = scoreRules(["a", "a"], ["a"]);
  if (s.detected !== 1 || s.missed !== 1) throw new Error("scoreRules must count duplicates separately");
  console.log(`self-test ok: ${report.rows.length} fixtures, ${report.totals.detected}/${report.totals.expected} seeded defects detected, 0 false positives`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (args.includes("--self-test")) await selfTest();
    else if (args.includes("--live")) console.log(JSON.stringify(await live(flag("--provider") ?? "claude-code", flag("--out")), null, 2));
    else console.log(JSON.stringify(await deterministic(), null, 2));
  } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
