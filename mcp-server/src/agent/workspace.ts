// High-level operations shared by the MCP tools and the CLI loop.
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  applyCapabilities,
  loadCapabilities,
  loadCatalog,
  resolveCapabilities,
  type AppliedCapability,
  type CatalogEntry,
  type LoadedCapability,
  type Resolution,
} from "./capabilities.js";
import { budget, capabilityRows, PlanSchema, renderPlanMarkdown, type Budget, type CapabilityPlanRow, type Plan } from "./plan.js";
import { buildProject, type BuildResult } from "./build.js";
import { containedPath, initProject, projectPaths, readSpec, regenerate, requireProjectDir, writeSpec, type CreatedProject } from "./project.js";
import { renderRunReport, toolCallCount } from "./report.js";
import type { CommandRunner } from "./runner.js";
import { parseDotEnv, type AppSpec } from "./spec.js";
import { assertCanBuild, attemptsThisCycle, loadState, newRunState, progress, saveState, type ProgressSink, type RunState } from "./state.js";

export async function readEnv(root: string): Promise<Record<string, string>> {
  try {
    return parseDotEnv(await readFile(join(root, ".env"), "utf8"));
  } catch {
    return {};
  }
}

export async function ensureState(root: string, description?: string): Promise<RunState> {
  const existing = await loadState(root);
  if (existing) return existing;
  const state = newRunState({ description: description ?? "(started from MCP tools)", projectDir: root });
  await saveState(root, state);
  return state;
}

export interface PlanOutcome {
  plan: Plan;
  resolution: Resolution;
  rows: CapabilityPlanRow[];
  budget: Budget;
  planPath: string;
  markdown: string;
}

async function capabilityContext(): Promise<{ loaded: Map<string, LoadedCapability>; catalog: CatalogEntry[] }> {
  const loaded = await loadCapabilities();
  return { loaded, catalog: await loadCatalog() };
}

export function requestedCapabilities(plan: Plan): string[] {
  return [...new Set([...plan.capabilities.map((c) => c.id), ...plan.screens.flatMap((s) => s.capabilities)])];
}

/** Validate the plan, resolve capabilities, and write PLAN.md before any code exists. */
export async function writePlan(
  rootDir: string,
  input: unknown,
  options: { description?: string; toolchain?: { xcode?: string; simulator?: string }; sink?: ProgressSink } = {},
): Promise<PlanOutcome> {
  const root = requireProjectDir(rootDir);
  const plan = PlanSchema.parse(input);
  const { loaded, catalog } = await capabilityContext();
  const resolution = resolveCapabilities(requestedCapabilities(plan), loaded, catalog);
  const env = await readEnv(root);
  const rows = capabilityRows(plan, resolution, env);
  const money = budget(resolution, catalog);
  const markdown = renderPlanMarkdown(plan, rows, money, options.toolchain);
  await mkdir(projectPaths(root).agent, { recursive: true });
  await writeFile(join(projectPaths(root).agent, "plan.json"), JSON.stringify(plan, null, 2) + "\n");
  const planPath = join(root, "PLAN.md");
  await writeFile(planPath, markdown);
  const state = await ensureState(root, options.description);
  if (options.description) state.description = options.description;
  if (options.toolchain) state.toolchain = options.toolchain;
  state.unavailable = resolution.unavailable.map((u) => ({ id: u.id, reason: u.reason }));
  progress(
    state,
    "planning",
    `Plan written: ${plan.screens.length} screens, ${plan.models.length} models, ${resolution.ordered.length} capabilities (${resolution.unavailable.length} not available).`,
    options.sink,
  );
  await saveState(root, state);
  return { plan, resolution, rows, budget: money, planPath, markdown };
}

export async function readPlan(root: string): Promise<Plan | undefined> {
  const file = join(projectPaths(root).agent, "plan.json");
  if (!existsSync(file)) return undefined;
  return PlanSchema.parse(JSON.parse(await readFile(file, "utf8")));
}

const sourceWriter = (root: string, spec: AppSpec) => ({
  async writeSourceFile(path: string, content: string | Uint8Array): Promise<"written" | "unchanged" | "kept"> {
    const target = await containedPath(root, `${spec.name}/${path}`);
    const data = typeof content === "string" ? Buffer.from(content) : Buffer.from(content);
    if (existsSync(target)) {
      const current = await readFile(target);
      if (current.equals(data)) return "unchanged";
      return "kept";
    }
    await mkdir(dirname(target), { recursive: true });
    const temp = `${target}.tmp-${process.pid}`;
    await writeFile(temp, data);
    await rename(temp, target);
    return "written";
  },
});

export interface CapabilityOutcome {
  applied: AppliedCapability[];
  unavailable: Resolution["unavailable"];
  added: Resolution["added"];
}

/** Resolve and apply capabilities to an existing project, then regenerate it. */
export async function addCapabilities(rootDir: string, requested: string[], runner: CommandRunner, sink?: ProgressSink): Promise<CapabilityOutcome & { regenerated: boolean; regenerateError?: string; missingSecrets: string[] }> {
  const root = requireProjectDir(rootDir);
  const spec = await readSpec(root);
  const { loaded, catalog } = await capabilityContext();
  const resolution = resolveCapabilities(requested, loaded, catalog);
  const state = await ensureState(root);
  for (const capability of resolution.ordered) {
    if (!spec.capabilities.includes(capability.manifest.id)) progress(state, "capabilities", `Applying capability ${capability.manifest.name} (${capability.manifest.status}).`, sink);
  }
  const { spec: next, applied } = await applyCapabilities(spec, resolution.ordered, sourceWriter(root, spec), await readEnv(root));
  await writeSpec(root, next);
  for (const record of applied) {
    state.capabilities = [
      ...state.capabilities.filter((c) => c.id !== record.id),
      { id: record.id, name: record.name, status: record.status, placeholders: record.placeholders, files: record.files.length, notes: record.notes },
    ];
  }
  for (const missing of resolution.unavailable) {
    if (!state.unavailable.some((u) => u.id === missing.id)) state.unavailable.push({ id: missing.id, reason: missing.reason });
    progress(state, "capabilities", `Skipping ${missing.id}: ${missing.reason}`, sink);
  }
  const regen = await regenerate(root, next, runner);
  if (!regen.generated) progress(state, "capabilities", `XcodeGen did not generate the project: ${regen.reason?.split("\n")[0]}`, sink);
  await saveState(root, state);
  return {
    applied,
    unavailable: resolution.unavailable,
    added: resolution.added,
    regenerated: regen.generated,
    ...(regen.reason ? { regenerateError: regen.reason } : {}),
    missingSecrets: regen.missingSecrets,
  };
}

export async function createProject(
  input: { projectDir: string; name: string; bundleId?: string; displayName?: string; deploymentTarget?: string; capabilities?: string[] },
  runner: CommandRunner,
  sink?: ProgressSink,
): Promise<CreatedProject & { capabilities: CapabilityOutcome }> {
  const { root, spec, files } = await initProject({ ...input, capabilities: input.capabilities ?? [] });
  const state = await ensureState(root);
  progress(state, "creating", `Creating ${spec.name} (${spec.bundleId}, iOS ${spec.deploymentTarget}).`, sink);
  await saveState(root, state);
  const outcome = await addCapabilities(root, input.capabilities ?? [], runner, sink);
  const finalSpec = await readSpec(root);
  const paths = projectPaths(root, finalSpec.name);
  return {
    root,
    name: finalSpec.name,
    scheme: finalSpec.name,
    bundleId: finalSpec.bundleId,
    deploymentTarget: finalSpec.deploymentTarget,
    projectYml: paths.projectYml,
    xcodeproj: paths.xcodeproj,
    generated: outcome.regenerated,
    ...(outcome.regenerateError ? { generateError: outcome.regenerateError } : {}),
    files: [...files, ...outcome.applied.flatMap((a) => a.files.map((f) => `${finalSpec.name}/${f}`))],
    missingSecrets: outcome.missingSecrets,
    capabilities: { applied: outcome.applied, unavailable: outcome.unavailable, added: outcome.added },
  };
}

/** Build with caps enforced and the attempt recorded in the run state. */
export async function recordedBuild(rootDir: string, runner: CommandRunner, options: { udid?: string; scheme?: string; sink?: ProgressSink } = {}): Promise<BuildResult & { attempt: number; cap: number }> {
  const root = requireProjectDir(rootDir);
  const state = await ensureState(root);
  assertCanBuild(state);
  const attempt = attemptsThisCycle(state) + 1;
  progress(state, "building", `Build attempt ${attempt} of ${state.maxBuildAttempts}.`, options.sink);
  await saveState(root, state);
  const result = await buildProject(root, runner, { attempt: state.builds.length + 1, ...(options.udid ? { udid: options.udid } : {}), ...(options.scheme ? { scheme: options.scheme } : {}) });
  const fresh = (await loadState(root)) ?? state;
  fresh.builds.push({
    cycle: fresh.cycle,
    attempt,
    success: result.success,
    errors: result.errors.length,
    warnings: result.warnings.length,
    durationMs: result.durationMs,
    at: new Date().toISOString(),
    firstErrors: result.errors.slice(0, 5),
  });
  progress(
    fresh,
    result.success ? "building" : "fixing",
    result.success ? `Build succeeded in ${(result.durationMs / 1000).toFixed(1)} s.` : `Build failed with ${result.errors.length} error(s); fixing.`,
    options.sink,
  );
  await saveState(root, fresh);
  return { ...result, attempt, cap: fresh.maxBuildAttempts };
}

export async function writeReport(rootDir: string, options: { status?: RunState["status"]; failure?: string } = {}): Promise<{ path: string; markdown: string }> {
  const root = requireProjectDir(rootDir);
  const state = await ensureState(root);
  if (options.status) state.status = options.status;
  if (options.failure) state.failure = options.failure;
  if (options.status === "complete") state.stage = "complete";
  else if (options.status === "failed") state.stage = "failed";
  else if (options.status === "stopped") state.stage = "stopped";
  const plan = await readPlan(root);
  let rows: CapabilityPlanRow[] | undefined;
  let money: Budget | undefined;
  if (plan) {
    const { loaded, catalog } = await capabilityContext();
    const resolution = resolveCapabilities(requestedCapabilities(plan), loaded, catalog);
    rows = capabilityRows(plan, resolution, await readEnv(root));
    money = budget(resolution, catalog);
  }
  await saveState(root, state);
  const markdown = renderRunReport({
    state,
    ...(plan ? { plan } : {}),
    ...(rows ? { rows } : {}),
    ...(money ? { budget: money } : {}),
    toolCalls: await toolCallCount(root),
  });
  const path = join(root, "RUN_REPORT.md");
  await writeFile(path, markdown);
  return { path, markdown };
}
