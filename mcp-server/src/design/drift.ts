// Evidence-based drift detection between a saved design and the current project.
// Every finding says whether it came from a deterministic check or is unknown; nothing
// here claims semantic equivalence between prose and code, and nothing rewrites the design.
import { lstat, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { DesignContract } from "./contract.js";
import { verificationReport, type VerificationReport } from "./verification.js";
import type { DesignWorkflow } from "./workflow.js";

export interface DriftFinding {
  id: string;
  kind: "deterministic" | "unknown";
  check: "required-file" | "required-symbol" | "deployment-target" | "dependency" | "permission" | "criterion-evidence" | "evidence-invalidated" | "step-incomplete" | "contract-revision";
  requirement?: string;
  location?: string;
  message: string;
}

export interface DriftReport {
  designId: string;
  revision: number;
  contractHash: string;
  sourceFingerprint: string;
  findings: DriftFinding[];
  checks: Array<{ check: DriftFinding["check"]; kind: "deterministic" | "unknown"; detail: string }>;
  summary: string;
}

const SOURCE_DIRS_SKIP = new Set([".ios-agent", ".git", "node_modules", "DerivedData", "xcuserdata", ".build", "Pods"]);

async function listFiles(root: string, test: (name: string) => boolean, limit = 4000): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string, depth: number): Promise<void> => {
    if (depth > 12 || out.length >= limit) return;
    let names: string[];
    try { names = (await readdir(dir)).sort(); } catch { return; }
    for (const name of names) {
      if (name.startsWith(".") || SOURCE_DIRS_SKIP.has(name)) continue;
      const full = join(dir, name);
      const st = await lstat(full);
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) await walk(full, depth + 1);
      else if (test(name)) out.push(full);
    }
  };
  await walk(root, 0);
  return out;
}

async function readIfFile(path: string): Promise<string | undefined> {
  try { const st = await lstat(path); if (!st.isFile() || st.isSymbolicLink() || st.size > 2_000_000) return undefined; return await readFile(path, "utf8"); }
  catch { return undefined; }
}

/** Minimum iOS from project.yml, spec.json or an xcconfig; undefined when no source states it. */
export async function observedDeploymentTarget(root: string): Promise<{ value?: string; source?: string }> {
  const spec = await readIfFile(join(root, ".ios-agent", "spec.json"));
  if (spec) {
    try { const v = (JSON.parse(spec) as { deploymentTarget?: string }).deploymentTarget; if (v) return { value: v, source: ".ios-agent/spec.json" }; } catch { /* ignore */ }
  }
  const yml = await readIfFile(join(root, "project.yml"));
  if (yml) {
    const m = yml.match(/deploymentTarget:\s*\n?\s*iOS:\s*["']?([0-9.]+)/) ?? yml.match(/iOS:\s*["']?([0-9.]+)/);
    if (m) return { value: m[1], source: "project.yml" };
  }
  for (const file of await listFiles(root, (n) => n.endsWith(".xcconfig"), 50)) {
    const text = await readIfFile(file);
    const m = text?.match(/IPHONEOS_DEPLOYMENT_TARGET\s*=\s*([0-9.]+)/);
    if (m) return { value: m[1], source: relative(root, file) };
  }
  return {};
}

export async function observedPackages(root: string): Promise<{ names: string[]; source?: string }> {
  const spec = await readIfFile(join(root, ".ios-agent", "spec.json"));
  if (spec) {
    try {
      const packages = (JSON.parse(spec) as { packages?: Array<{ name?: string; url?: string; product?: string }> }).packages ?? [];
      const names = packages.flatMap((p) => [p.name, p.product, p.url?.split("/").pop()?.replace(/\.git$/, "")].filter((x): x is string => !!x));
      if (names.length) return { names, source: ".ios-agent/spec.json" };
    } catch { /* ignore */ }
  }
  const yml = await readIfFile(join(root, "project.yml"));
  if (yml) {
    const section = yml.split(/\npackages:\s*\n/)[1];
    if (section) {
      const names = [...section.matchAll(/^\s{2}([A-Za-z0-9_.-]+):/gm)].map((m) => m[1]!);
      if (names.length) return { names, source: "project.yml" };
    }
  }
  const pkg = await readIfFile(join(root, "Package.swift"));
  if (pkg) {
    const names = [...pkg.matchAll(/\.package\([^)]*?(?:name:\s*"([^"]+)"|url:\s*"[^"]*\/([^"/]+?)(?:\.git)?")/g)].map((m) => m[1] ?? m[2]!);
    return { names, source: "Package.swift" };
  }
  return { names: [] };
}

export async function observedPermissionKeys(root: string): Promise<{ keys: string[]; sources: string[] }> {
  const keys = new Set<string>();
  const sources: string[] = [];
  const files = [...await listFiles(root, (n) => n === "Info.plist" || n.endsWith(".entitlements") || n === "project.yml" || n.endsWith(".xcconfig"), 200)];
  for (const file of files) {
    const text = await readIfFile(file);
    if (!text) continue;
    let found = false;
    for (const m of text.matchAll(/(NS[A-Za-z]+UsageDescription|com\.apple\.developer\.[a-z0-9.-]+|com\.apple\.security\.[a-z0-9.-]+|aps-environment|INFOPLIST_KEY_(NS[A-Za-z]+UsageDescription))/g)) {
      keys.add(m[2] ?? m[1]!); found = true;
    }
    if (found) sources.push(relative(root, file));
  }
  return { keys: [...keys].sort(), sources };
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const d = (pa[i] ?? 0) - (pb[i] ?? 0); if (d) return d; }
  return 0;
}

export async function detectDrift(design: DesignWorkflow, options: { report?: VerificationReport } = {}): Promise<DriftReport> {
  const bundle = await design.load();
  const contract: DesignContract = bundle.contract;
  const root = design.projectDir;
  const findings: DriftFinding[] = [];
  const checks: DriftReport["checks"] = [];
  let n = 0;
  const add = (f: Omit<DriftFinding, "id">) => findings.push({ id: `D-${String(++n).padStart(3, "0")}`, ...f });

  // Required files.
  for (const file of contract.requiredFiles) {
    const st = await lstat(join(root, file)).catch(() => undefined);
    if (!st || !st.isFile()) add({ kind: "deterministic", check: "required-file", location: file, message: `required file is missing` });
  }
  checks.push({ check: "required-file", kind: "deterministic", detail: `${contract.requiredFiles.length} required file(s) checked for existence` });

  // Required symbols: presence in Swift sources. Presence is deterministic; meaning is not checked.
  if (contract.requiredSymbols.length) {
    const swift = await listFiles(root, (name) => name.endsWith(".swift"));
    const corpus = new Map<string, string>();
    for (const f of swift) { const t = await readIfFile(f); if (t) corpus.set(relative(root, f), t); }
    for (const symbol of contract.requiredSymbols) {
      const re = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      const hit = [...corpus.entries()].find(([, text]) => re.test(text));
      if (!hit) add({ kind: "deterministic", check: "required-symbol", location: swift.length ? undefined : "no Swift sources found", message: `symbol ${symbol} does not appear in any Swift source` });
    }
    checks.push({ check: "required-symbol", kind: "deterministic", detail: `${contract.requiredSymbols.length} symbol(s) searched in ${swift.length} Swift file(s); presence only, not behaviour` });
  }

  // Deployment target.
  if (contract.deployment.iosMinimum) {
    const observed = await observedDeploymentTarget(root);
    if (!observed.value) { add({ kind: "unknown", check: "deployment-target", message: `design states iOS ${contract.deployment.iosMinimum}; no project file states a deployment target` }); checks.push({ check: "deployment-target", kind: "unknown", detail: "no deployment target found in spec.json, project.yml or xcconfig" }); }
    else {
      if (compareVersions(observed.value, contract.deployment.iosMinimum) !== 0) add({ kind: "deterministic", check: "deployment-target", location: observed.source, message: `design states iOS ${contract.deployment.iosMinimum}; ${observed.source} states ${observed.value}` });
      checks.push({ check: "deployment-target", kind: "deterministic", detail: `compared with ${observed.source}` });
    }
  }

  // Dependencies.
  const wantedPackages = contract.dependencies.filter((d) => d.kind === "swift-package");
  if (wantedPackages.length) {
    const observed = await observedPackages(root);
    if (!observed.source) { add({ kind: "unknown", check: "dependency", message: `design lists ${wantedPackages.length} Swift package(s); no manifest found to compare against` }); checks.push({ check: "dependency", kind: "unknown", detail: "no spec.json, project.yml or Package.swift packages found" }); }
    else {
      const lower = observed.names.map((x) => x.toLowerCase());
      for (const d of wantedPackages) if (!lower.some((x) => x.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(x))) add({ kind: "deterministic", check: "dependency", location: observed.source, message: `Swift package ${d.name} is not declared in ${observed.source}` });
      checks.push({ check: "dependency", kind: "deterministic", detail: `compared against ${observed.source} (${observed.names.length} declared)` });
    }
  }

  // Permissions and entitlements.
  if (contract.permissions.length) {
    const observed = await observedPermissionKeys(root);
    if (observed.sources.length === 0) { add({ kind: "unknown", check: "permission", message: `design lists ${contract.permissions.length} permission key(s); no Info.plist, entitlements or project.yml keys found` }); checks.push({ check: "permission", kind: "unknown", detail: "no permission keys observed" }); }
    else {
      for (const p of contract.permissions) if (!observed.keys.includes(p.key)) add({ kind: "deterministic", check: "permission", location: observed.sources.join(", "), message: `${p.kind} ${p.key} is in the design but not in project files` });
      for (const k of observed.keys) if (!contract.permissions.some((p) => p.key === k)) add({ kind: "deterministic", check: "permission", location: observed.sources.join(", "), message: `${k} is in project files but not in the design` });
      checks.push({ check: "permission", kind: "deterministic", detail: `compared ${observed.keys.length} observed key(s) from ${observed.sources.join(", ")}` });
    }
  }

  // Criteria without current evidence, and evidence invalidated by source or contract changes.
  const report = options.report ?? await verificationReport(design, contract);
  for (const c of report.criteria) {
    if (c.status === "unverified") add({ kind: "deterministic", check: "criterion-evidence", requirement: c.criterion.id, message: `${c.criterion.id} has no evidence at ${c.requiredTier} (${c.criterion.method})` });
    else if (c.status === "stale-evidence") add({ kind: "deterministic", check: "evidence-invalidated", requirement: c.criterion.id, location: c.evidence[0]?.source, message: `${c.criterion.id} evidence predates the current sources or revision` });
    else if (c.status === "failed") add({ kind: "deterministic", check: "criterion-evidence", requirement: c.criterion.id, message: `${c.criterion.id} has failed evidence: ${c.reason}` });
  }
  checks.push({ check: "criterion-evidence", kind: "deterministic", detail: `${report.criteria.length} criteria compared with verification.json against fingerprint ${report.sourceFingerprint.slice(0, 8)}` });

  for (const step of report.steps.pending) add({ kind: "deterministic", check: "step-incomplete", requirement: step, message: `implementation step ${step} is not marked done` });
  checks.push({ check: "step-incomplete", kind: "deterministic", detail: `${report.steps.done}/${report.steps.total} steps done` });

  const counts = { deterministic: findings.filter((f) => f.kind === "deterministic").length, unknown: findings.filter((f) => f.kind === "unknown").length };
  const summary = findings.length === 0
    ? `No drift detected by ${checks.length} deterministic checks for design ${contract.id} revision ${contract.revision}. This does not establish semantic equivalence between the design and the code.`
    : `${counts.deterministic} deterministic drift finding(s) and ${counts.unknown} unknown mapping(s) for design ${contract.id} revision ${contract.revision}. The design was not modified.`;
  return { designId: contract.id, revision: contract.revision, contractHash: bundle.workflow.contractHash, sourceFingerprint: report.sourceFingerprint, findings, checks, summary };
}
