// Proportionate routing: recommend lightweight or full review from signals a person can
// inspect in the contract itself. The recommendation explains itself and can be overridden.
import type { DesignContract } from "./contract.js";

export const MODES = ["lightweight", "full"] as const;
export type Mode = (typeof MODES)[number];

export interface Signal {
  id: string;
  /** Which contract field tripped it, so the person can check. */
  where: string;
  detail: string;
}

const PAYMENT = /\b(storekit|in-app purchase|subscription|payment|checkout|billing|price|purchase)\b/i;
const AUTH = /\b(auth|sign[- ]?in|login|passkey|oauth|token|session|credential|keychain)\b/i;
const SENSITIVE_PERMISSION = /^(NS(Camera|Microphone|Location|Contacts|Calendars|Reminders|Photo|Health|Motion|Bluetooth|FaceID|Speech|Siri|LocalNetwork|UserTracking)|com\.apple\.developer\.(healthkit|homekit|networking|in-app-payments|applesignin|push))/i;
const MIGRATION = /\b(migrat|schema version|versioned schema|lightweight migration|data model change)\b/i;
const CONCURRENCY = /\b(actor|@MainActor|Sendable|isolation|data race|TaskGroup|detached|nonisolated)\b/;

function claimsText(contract: DesignContract, keys: Array<keyof DesignContract>): string {
  const parts: string[] = [];
  for (const k of keys) {
    const v = contract[k];
    if (Array.isArray(v)) for (const item of v) parts.push(typeof item === "string" ? item : JSON.stringify(item));
    else if (typeof v === "string") parts.push(v);
    else if (v && typeof v === "object") parts.push(JSON.stringify(v));
  }
  return parts.join("\n");
}

export function detectSignals(contract: DesignContract): Signal[] {
  const signals: Signal[] = [];
  const archText = `${contract.architecture.summary}\n${claimsText(contract, ["constraints", "scope"])}`;
  const archDecisions = [...contract.architecture.stateOwnership, ...contract.architecture.dataFlow].filter((c) => c.kind === "decision");
  if (archDecisions.length > 0) signals.push({ id: "architecture-change", where: "architecture", detail: `${archDecisions.length} proposed architecture decision(s)` });
  if (contract.architecture.persistence.some((c) => c.kind === "decision") || MIGRATION.test(claimsText(contract, ["migration"]) + archText) || contract.migration.length > 0) {
    signals.push({ id: "persistence-migration", where: "architecture.persistence / migration", detail: "persistence decisions or migration notes present" });
  }
  const allText = claimsText(contract, ["objective", "scope", "userJourneys", "apiContracts", "privacy", "constraints"]) + archText;
  if (AUTH.test(allText)) signals.push({ id: "authentication", where: "objective / apiContracts / privacy", detail: "authentication or credential handling mentioned" });
  if (PAYMENT.test(allText) || contract.dependencies.some((d) => /storekit/i.test(d.name))) signals.push({ id: "payments", where: "objective / dependencies", detail: "payments or StoreKit involved" });
  const sensitive = contract.permissions.filter((p) => SENSITIVE_PERMISSION.test(p.key));
  if (sensitive.length > 0) signals.push({ id: "sensitive-permissions", where: "permissions", detail: sensitive.map((p) => p.key).join(", ") });
  if (contract.concurrency.some((c) => c.kind === "decision") || CONCURRENCY.test(claimsText(contract, ["concurrency"]) + archText)) {
    signals.push({ id: "concurrency", where: "concurrency", detail: "actor isolation or concurrency decisions present" });
  }
  if (contract.deployment.targets.length > 1) signals.push({ id: "multi-target", where: "deployment.targets", detail: contract.deployment.targets.join(", ") });
  if (contract.dependencies.some((d) => d.kind === "service")) signals.push({ id: "external-service", where: "dependencies", detail: contract.dependencies.filter((d) => d.kind === "service").map((d) => d.name).join(", ") });
  if (contract.acceptanceCriteria.length >= 12 || contract.steps.length >= 10) signals.push({ id: "large-scope", where: "acceptanceCriteria / steps", detail: `${contract.acceptanceCriteria.length} criteria, ${contract.steps.length} steps` });
  if (contract.unresolved.filter((u) => u.kind === "unknown").length >= 3) signals.push({ id: "many-unknowns", where: "unresolved", detail: `${contract.unresolved.length} unresolved items` });
  return signals;
}

/** Signals that alone justify a full review; the rest need two or more together. */
const STRONG = new Set(["persistence-migration", "authentication", "payments", "sensitive-permissions", "concurrency"]);

export interface Recommendation {
  mode: Mode;
  signals: Signal[];
  explanation: string;
}

export function recommendMode(contract: DesignContract): Recommendation {
  const signals = detectSignals(contract);
  const strong = signals.filter((s) => STRONG.has(s.id));
  const full = strong.length > 0 || signals.length >= 2;
  const explanation = full
    ? `Full review recommended: ${strong.length ? `${strong.map((s) => s.id).join(", ")} ${strong.length === 1 ? "is" : "are"} high-impact` : `${signals.length} signals together (${signals.map((s) => s.id).join(", ")})`}. Override with an explicit mode if the work is smaller than it looks.`
    : signals.length === 1
      ? `Lightweight review recommended: only ${signals[0]!.id} was detected, which is not high-impact on its own. Choose full review if the change touches more than the contract says.`
      : "Lightweight review recommended: no high-impact signals detected. Choose full review if the contract understates the change.";
  return { mode: full ? "full" : "lightweight", signals, explanation };
}
