// Deterministic contract lint. These are structural checks a script can decide; they are
// not independent review and never satisfy the review requirement. The evaluation harness
// uses them to measure seeded-defect detection without a model.
import type { DesignContract, Section } from "./contract.js";
import { detectSignals } from "./routing.js";

export interface LintFinding {
  rule: string;
  severity: "blocking" | "major" | "minor";
  section: Section;
  criterion?: string;
  message: string;
}

const ISOLATION = /@MainActor|\bactor\b|Sendable|nonisolated/;
const CREDENTIAL = /keychain|credential|token|secret|never (?:logged|stored in source)/i;

export function lintContract(contract: DesignContract): LintFinding[] {
  const out: LintFinding[] = [];
  const signals = new Set(detectSignals(contract).map((s) => s.id));

  for (const c of contract.acceptanceCriteria) {
    if (["unit-test", "ui-test", "simulator"].includes(c.method) && !c.target) {
      out.push({ rule: "criterion-without-target", severity: "major", section: "acceptanceCriteria", criterion: c.id, message: `${c.id} is verified by ${c.method} but names no test or screen; evidence cannot be traced to it` });
    }
    if (c.method === "manual" && !c.target) out.push({ rule: "manual-criterion-unanchored", severity: "minor", section: "acceptanceCriteria", criterion: c.id, message: `${c.id} is manual with no target; say what a person inspects` });
  }
  if (contract.steps.length === 0) out.push({ rule: "no-implementation-steps", severity: "major", section: "steps", message: "no implementation steps; criteria are not connected to work" });

  for (const s of contract.screens) {
    if (!s.states.includes("error")) out.push({ rule: "screen-missing-error-state", severity: "major", section: "screens", message: `screen ${s.screen} has no error state` });
    if (!s.states.includes("empty")) out.push({ rule: "screen-missing-empty-state", severity: "minor", section: "screens", message: `screen ${s.screen} has no empty state` });
  }

  const persistenceDecision = contract.architecture.persistence.some((c) => c.kind === "decision");
  if (persistenceDecision && contract.migration.length === 0) {
    out.push({ rule: "persistence-without-migration", severity: "major", section: "migration", message: "persistence changes are proposed but migration of existing data is not addressed" });
  }
  if (signals.has("authentication") && !contract.privacy.some((c) => CREDENTIAL.test(c.text))) {
    out.push({ rule: "auth-without-credential-boundary", severity: "blocking", section: "privacy", message: "authentication is in scope but no privacy claim states where credentials live and that they never reach source or logs" });
  }
  for (const p of contract.permissions) if (!p.purpose.trim()) out.push({ rule: "permission-without-purpose", severity: "major", section: "permissions", message: `${p.key} has no stated purpose` });
  if (signals.has("concurrency") && !contract.concurrency.some((c) => ISOLATION.test(c.text))) {
    out.push({ rule: "concurrency-without-isolation", severity: "major", section: "concurrency", message: "concurrency is in scope but no claim names actor isolation for shared or UI-observed state" });
  }
  if (contract.dependencies.some((d) => d.kind === "service") && contract.failureHandling.length === 0) {
    out.push({ rule: "service-without-failure-handling", severity: "major", section: "failureHandling", message: "an external service is a dependency but failure handling is empty" });
  }
  for (const u of contract.unresolved) if (u.kind === "unknown" && !u.resolves) out.push({ rule: "unknown-without-resolver", severity: "minor", section: "unresolved", message: `unknown has no settling check: ${u.text.slice(0, 80)}` });
  if (contract.currentCode.length === 0) out.push({ rule: "no-current-code-evidence", severity: "major", section: "currentCode", message: "no observed facts about the existing code; compatibility cannot be reviewed" });
  const assumptionsOnly = contract.currentCode.length > 0 && contract.currentCode.every((c) => c.kind !== "fact");
  if (assumptionsOnly) out.push({ rule: "current-code-not-observed", severity: "major", section: "currentCode", message: "currentCode holds only assumptions or decisions; add observed facts with evidence" });
  return out;
}
