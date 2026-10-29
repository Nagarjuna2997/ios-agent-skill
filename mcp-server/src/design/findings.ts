// Structured review findings, deduplication with provenance, and dispositions.
import { createHash } from "node:crypto";
import { z } from "zod";
import { SECTIONS } from "./contract.js";

export const REVIEWER_ROLES = ["requirements", "architecture", "concurrency", "security", "ui-verification"] as const;
export type ReviewerRole = (typeof REVIEWER_ROLES)[number];

export const SEVERITIES = ["blocking", "major", "minor", "note"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CATEGORIES = [
  "requirements", "acceptance-tests", "architecture", "compatibility", "concurrency", "state-ownership", "lifecycle",
  "security", "privacy", "permissions", "service-integration", "ui-states", "accessibility", "verification-feasibility", "other",
] as const;

/** What one reviewer must return for one finding. Anything else is rejected as malformed. */
export const ReviewerFindingSchema = z
  .object({
    role: z.enum(REVIEWER_ROLES),
    severity: z.enum(SEVERITIES),
    category: z.enum(CATEGORIES),
    title: z.string().min(1).max(200),
    affects: z.object({
      criteria: z.array(z.string().regex(/^AC-[0-9]{1,4}$/)).max(20).default([]),
      sections: z.array(z.enum(SECTIONS)).max(10).default([]),
      sources: z.array(z.object({ path: z.string().min(1).max(400), line: z.number().int().min(1).optional() }).strict()).max(10).default([]),
    }).strict().default({}),
    scenario: z.string().min(1).max(1500).describe("A concrete way this goes wrong."),
    evidence: z.array(z.string().min(1).max(600)).max(10).default([]).describe("Quotes or references from the package; empty means unsupported."),
    correction: z.string().min(1).max(1500),
    verification: z.string().min(1).max(600).describe("What would show the correction worked."),
    confidence: z.number().min(0).max(1),
    uncertainty: z.string().max(600).default(""),
  })
  .strict();
export type ReviewerFinding = z.infer<typeof ReviewerFindingSchema>;

export const ReviewerOutputSchema = z
  .object({
    verdict: z.enum(["pass", "pass-with-findings", "fail"]),
    summary: z.string().max(2000).default(""),
    findings: z.array(ReviewerFindingSchema).max(60).default([]),
  })
  .strict();
export type ReviewerOutput = z.infer<typeof ReviewerOutputSchema>;

export const DISPOSITIONS = ["open", "accepted", "rejected", "deferred", "superseded", "re-review"] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

export interface Provenance {
  runId: string;
  reviewerId: string;
  role: ReviewerRole;
  provider: string;
  executionId: string;
  specHash: string;
}

/** A finding as stored in workflow.json: deduplicated, with every origin kept. */
export interface Finding extends Omit<ReviewerFinding, "role"> {
  id: string;
  /** All reviewers that reported this finding; the first is the primary. */
  provenance: Provenance[];
  roles: ReviewerRole[];
  /** Evidence-backed means at least one supporting reference was given. */
  supported: boolean;
  specHash: string;
  disposition: Disposition;
  dispositionNote?: string;
  dispositionAt?: string;
  /** For accepted findings: the contract revision that incorporated the change. */
  resolvedInRevision?: number;
  /** Sections or criteria changed since; the finding needs a fresh look. */
  staleReason?: string;
}

const STOPWORDS = new Set(["this", "that", "with", "from", "when", "while", "into", "than", "then", "there", "their", "which", "would", "could", "should", "again", "also"]);

const SEVERITY_RANK: Record<Severity, number> = { blocking: 0, major: 1, minor: 2, note: 3 };

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Key for overlapping findings: same category, same affected criteria/sections, and a similar title. */
export function dedupKey(f: Pick<ReviewerFinding, "category" | "affects" | "title">): string {
  const crit = [...f.affects.criteria].sort().join(",");
  const secs = [...f.affects.sections].sort().join(",");
  const words = normalise(f.title).split(" ").filter((w) => w.length > 3 && !STOPWORDS.has(w)).slice(0, 5).join(" ");
  return createHash("sha256").update(`${f.category}|${crit}|${secs}|${words}`).digest("hex").slice(0, 16);
}

export function findingId(key: string, specHash: string): string {
  return `F-${createHash("sha256").update(`${key}|${specHash}`).digest("hex").slice(0, 8)}`;
}

/**
 * Merge reviewer findings into the stored list. Overlaps collapse to one finding that keeps
 * every provenance record; agreement never raises confidence or severity on its own.
 */
export function mergeFindings(existing: Finding[], incoming: Array<{ finding: ReviewerFinding; provenance: Provenance }>, specHash: string): { findings: Finding[]; added: number; merged: number } {
  const byKey = new Map<string, Finding>();
  for (const f of existing) byKey.set(dedupKey(f) + "|" + f.specHash, f);
  let added = 0, merged = 0;
  for (const { finding, provenance } of incoming) {
    const key = dedupKey(finding) + "|" + specHash;
    const current = byKey.get(key);
    if (current) {
      if (!current.provenance.some((p) => p.reviewerId === provenance.reviewerId && p.runId === provenance.runId)) current.provenance.push(provenance);
      if (!current.roles.includes(finding.role)) current.roles.push(finding.role);
      if (SEVERITY_RANK[finding.severity] < SEVERITY_RANK[current.severity]) current.severity = finding.severity;
      if (finding.evidence.length && !current.supported) { current.supported = true; current.evidence = finding.evidence; }
      merged += 1;
      continue;
    }
    const { role, ...rest } = finding;
    byKey.set(key, {
      ...rest,
      id: findingId(dedupKey(finding), specHash),
      provenance: [provenance],
      roles: [role],
      supported: finding.evidence.length > 0,
      specHash,
      disposition: "open",
    });
    added += 1;
  }
  const findings = [...byKey.values()].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.id.localeCompare(b.id));
  return { findings, added, merged };
}

export function blocking(findings: Finding[]): Finding[] {
  return findings.filter((f) => f.severity === "blocking" && (f.disposition === "open" || f.disposition === "re-review"));
}

export function applyDisposition(findings: Finding[], id: string, disposition: Exclude<Disposition, "open" | "re-review">, note: string | undefined, now: string, revision?: number): Finding {
  const f = findings.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown finding ${id}`);
  if ((disposition === "rejected" || disposition === "deferred") && !note?.trim()) throw new Error(`${disposition} needs a rationale (rejected) or an impact statement (deferred).`);
  f.disposition = disposition;
  f.dispositionNote = note?.trim() || undefined;
  f.dispositionAt = now;
  if (disposition === "accepted" && revision !== undefined) f.resolvedInRevision = revision;
  delete f.staleReason;
  return f;
}

/** After a contract revision, findings touching changed sections or criteria need re-review. */
export function markStale(findings: Finding[], changed: { sections: readonly string[]; criteria: readonly string[] }, newSpecHash: string): Finding[] {
  const out: Finding[] = [];
  for (const f of findings) {
    const touchesSection = f.affects.sections.some((s) => changed.sections.includes(s));
    const touchesCriterion = f.affects.criteria.some((c) => changed.criteria.includes(c));
    if (f.disposition === "accepted" || f.disposition === "superseded") { out.push(f); continue; }
    if ((touchesSection || touchesCriterion) && f.specHash !== newSpecHash) {
      out.push({ ...f, disposition: "re-review", staleReason: `contract changed in ${[...f.affects.sections.filter((s) => changed.sections.includes(s)), ...f.affects.criteria.filter((c) => changed.criteria.includes(c))].join(", ")}` });
    } else out.push(f);
  }
  return out;
}
