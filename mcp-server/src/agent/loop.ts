// The autonomous build loop used by `ios-agent-mcp build`:
// description -> plan -> project -> capabilities -> code -> build/fix (capped)
// -> launch -> screenshot each top-level screen -> RUN_REPORT.md.
// Every stage is recorded in .ios-agent/state.json so a stopped run resumes.
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Diagnostic } from "./build.js";
import { loadCapabilities, loadCatalog } from "./capabilities.js";
import type { Plan } from "./plan.js";
import { projectPaths, readSpec, requireProjectDir, writeProjectFiles, type FileChangeInput } from "./project.js";
import type { CommandRunner } from "./runner.js";
import { runApp, screenshot } from "./simulator.js";
import type { AppSpec } from "./spec.js";
import { attemptsThisCycle, loadState, newRunState, progress, saveState, type ProgressSink, type RunState } from "./state.js";
import { chooseSimulator, preflight } from "./toolchain.js";
import { addCapabilities, createProject, readPlan, recordedBuild, requestedCapabilities, writePlan, writeReport } from "./workspace.js";

export interface SourceFile {
  path: string;
  content: string;
}

export interface CapabilityBrief {
  id: string;
  name: string;
  category: string;
  description: string;
  default: boolean;
  credentials: string[];
  usage?: string;
}

/** The language-model side of the loop. Implementations: headless Claude Code, or a fake in tests. */
export interface Brain {
  plan(input: { description: string; capabilities: CapabilityBrief[]; catalog: Array<{ id: string; name: string; category: string }>; deploymentFloor: string }): Promise<unknown>;
  generate(input: { plan: Plan; spec: AppSpec; capabilities: CapabilityBrief[]; files: SourceFile[] }): Promise<FileChangeInput[]>;
  fix(input: { plan: Plan; spec: AppSpec; errors: Diagnostic[]; files: SourceFile[]; attempt: number; maxAttempts: number }): Promise<FileChangeInput[]>;
  refine(input: { plan: Plan; spec: AppSpec; change: string; capabilities: CapabilityBrief[]; files: SourceFile[] }): Promise<{ files: FileChangeInput[]; capabilities?: string[] }>;
}

export interface LoopOptions {
  projectDir: string;
  description?: string;
  brain: Brain;
  runner: CommandRunner;
  sink?: ProgressSink;
  maxBuildAttempts?: number;
  wallClockMinutes?: number;
  resume?: boolean;
  refine?: string;
  udid?: string;
  /** Stop after PLAN.md, before any code. */
  planOnly?: boolean;
  screenshotDelayMs?: number;
}

export interface LoopResult {
  state: RunState;
  reportPath: string;
  planPath?: string;
}

const MILESTONES = ["planned", "created", "generated", "built", "launched", "screenshots"] as const;
type Milestone = (typeof MILESTONES)[number];
type StateWithMilestones = RunState & { milestones?: Partial<Record<Milestone, string>> };

const reached = (state: StateWithMilestones, m: Milestone) => Boolean(state.milestones?.[m]);
const mark = (state: StateWithMilestones, m: Milestone) => {
  state.milestones = { ...(state.milestones ?? {}), [m]: new Date().toISOString() };
};

async function sourceFiles(root: string, spec: AppSpec, limitBytes = 400_000): Promise<SourceFile[]> {
  const base = join(root, spec.name);
  const out: SourceFile[] = [];
  let total = 0;
  const walk = async (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.endsWith(".xcassets")) await walk(full);
      } else if (entry.name.endsWith(".swift")) {
        const content = await readFile(full, "utf8");
        if (total + content.length > limitBytes) continue;
        total += content.length;
        out.push({ path: relative(root, full).split("\\").join("/"), content });
      }
    }
  };
  await walk(base);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function capabilityBriefs(ids?: string[]): Promise<CapabilityBrief[]> {
  const loaded = await loadCapabilities();
  return [...loaded.values()]
    .filter(({ manifest }) => !ids || ids.includes(manifest.id))
    .map(({ manifest: m }) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      description: m.description,
      default: m.default,
      credentials: m.credentialsNeeded.map((c) => c.key),
      usage: m.usage,
    }));
}

const timeLeft = (state: RunState) => Date.parse(state.deadlineAt) - Date.now();

async function buildAndFix(root: string, options: LoopOptions, state: StateWithMilestones, plan: Plan): Promise<boolean> {
  const sink = options.sink;
  for (;;) {
    const fresh = ((await loadState(root)) ?? state) as StateWithMilestones;
    if (attemptsThisCycle(fresh) >= fresh.maxBuildAttempts) {
      progress(fresh, "fixing", `Stopping: ${fresh.maxBuildAttempts} build attempts used without a clean build.`, sink);
      await saveState(root, fresh);
      return false;
    }
    if (timeLeft(fresh) <= 0) {
      progress(fresh, "fixing", "Stopping: wall-clock cap reached.", sink);
      await saveState(root, fresh);
      return false;
    }
    const result = await recordedBuild(root, options.runner, { ...(options.udid ? { udid: options.udid } : {}), ...(sink ? { sink } : {}) });
    if (result.success) {
      const after = ((await loadState(root)) ?? fresh) as StateWithMilestones;
      mark(after, "built");
      await saveState(root, after);
      return true;
    }
    if (result.toolError || result.errors.some((e) => /does not exist\. Regenerate|could not start/.test(e.message))) {
      const after = (await loadState(root)) ?? fresh;
      progress(after, "fixing", `Stopping: the build tool itself failed (${result.errors[0]?.message ?? "unknown"}).`, sink);
      await saveState(root, after);
      return false;
    }
    if (result.attempt >= result.cap) continue;
    const spec = await readSpec(root);
    const named = new Set(result.errors.map((e) => e.file).filter(Boolean));
    const files = (await sourceFiles(root, spec)).sort((a, b) => Number(named.has(b.path)) - Number(named.has(a.path)));
    const after = (await loadState(root)) ?? fresh;
    progress(after, "fixing", `Fixing ${result.errors.length} error(s) for attempt ${result.attempt + 1} of ${result.cap}.`, sink);
    await saveState(root, after);
    const changes = await options.brain.fix({ plan, spec, errors: result.errors, files, attempt: result.attempt, maxAttempts: result.cap });
    if (!changes.length) {
      const stuck = (await loadState(root)) ?? after;
      progress(stuck, "fixing", "The model proposed no changes; stopping.", sink);
      await saveState(root, stuck);
      return false;
    }
    await writeProjectFiles(root, changes, options.runner);
  }
}

async function launchAndCapture(root: string, options: LoopOptions, plan: Plan): Promise<void> {
  const sink = options.sink;
  const screens = plan.screens.filter((s) => s.topLevel);
  let state = (await loadState(root))!;
  progress(state, "launching", "Launching in the simulator.", sink);
  await saveState(root, state);
  for (const screen of screens) {
    const run = await runApp(root, options.runner, { ...(options.udid ? { udid: options.udid } : {}), launchArguments: ["-ios-agent-screen", screen.id] });
    await new Promise((r) => setTimeout(r, options.screenshotDelayMs ?? 3000));
    const shot = await screenshot(root, options.runner, run.udid, screen.id);
    state = (await loadState(root))!;
    state.run = { udid: run.udid, simulator: run.simulator, ...(run.pid ? { pid: run.pid } : {}) };
    state.screenshots = [...state.screenshots.filter((s) => s.screen !== screen.id), { screen: screen.id, path: shot.path }];
    progress(state, "screenshots", `Captured ${screen.title} (${screen.id}).`, sink);
    await saveState(root, state);
  }
  state = (await loadState(root))!;
  mark(state as StateWithMilestones, "launched");
  mark(state as StateWithMilestones, "screenshots");
  await saveState(root, state);
}

async function finish(root: string, status: RunState["status"], failure: string | undefined, sink?: ProgressSink): Promise<LoopResult> {
  const state = (await loadState(root))!;
  progress(state, "reporting", status === "complete" ? "Writing RUN_REPORT.md." : `Writing RUN_REPORT.md (${failure ?? status}).`, sink);
  await saveState(root, state);
  const report = await writeReport(root, { status, ...(failure ? { failure } : {}) });
  return { state: (await loadState(root))!, reportPath: report.path, planPath: join(root, "PLAN.md") };
}

export async function runAgent(options: LoopOptions): Promise<LoopResult> {
  const root = requireProjectDir(options.projectDir);
  const sink = options.sink;
  let state = (await loadState(root)) as StateWithMilestones | undefined;

  if (options.refine) {
    if (!state || !existsSync(projectPaths(root).spec)) throw new Error("Nothing to refine in this folder. Build an app first.");
    state.cycle += 1;
    state.status = "running";
    delete state.failure;
    state.deadlineAt = new Date(Date.now() + (options.wallClockMinutes ?? 25) * 60_000).toISOString();
    state.refinements.push({ at: new Date().toISOString(), change: options.refine });
    progress(state, "generating", `Refining: ${options.refine}`, sink);
    await saveState(root, state);
  } else if (state && !options.resume) {
    throw new Error("This folder already has a run. Use --resume to continue it or --refine to change it.");
  } else if (!state) {
    if (!options.description) throw new Error("A description is required for a new run.");
    state = newRunState({
      description: options.description,
      projectDir: root,
      ...(options.maxBuildAttempts ? { maxBuildAttempts: options.maxBuildAttempts } : {}),
      ...(options.wallClockMinutes ? { wallClockMinutes: options.wallClockMinutes } : {}),
    });
    await saveState(root, state);
  } else {
    // A run that stopped on its attempt or time cap gets a fresh attempt budget.
    const capped = state.status === "failed" && !reached(state, "built") && attemptsThisCycle(state) > 0;
    if (capped) state.cycle += 1;
    state.status = "running";
    delete state.failure;
    state.deadlineAt = new Date(Date.now() + (options.wallClockMinutes ?? 25) * 60_000).toISOString();
    progress(state, state.stage, capped ? "Resuming with a new build attempt budget." : "Resuming the stopped run.", sink);
    await saveState(root, state);
  }

  // Preflight: record the toolchain; without Xcode the run can still plan and write code.
  const check = await preflight(options.runner);
  const simulator = chooseSimulator(check.toolchain.simulators, options.udid);
  state = (await loadState(root)) as StateWithMilestones;
  state.toolchain = {
    ...(check.toolchain.xcode ? { xcode: `Xcode ${check.toolchain.xcode.version}${check.toolchain.xcode.build ? ` (${check.toolchain.xcode.build})` : ""}` } : {}),
    ...(simulator ? { simulator: `${simulator.name} (iOS ${simulator.runtimeVersion.join(".")})` } : {}),
  };
  const missing = check.checks.filter((c) => !c.ok);
  // Builds need the Apple tools themselves; the platform line is informational.
  const blocking = missing.filter((c) => ["xcode", "simulator-sdk", "simulator", "xcodegen"].includes(c.id));
  progress(state, "preflight", missing.length ? `Missing: ${missing.map((c) => `${c.id} (${c.fix ?? c.detail})`).join("; ")}` : `Toolchain ready: ${state.toolchain.xcode}, ${state.toolchain.simulator}.`, sink);
  await saveState(root, state);

  try {
    // Plan.
    let plan = await readPlan(root);
    if (!plan || !reached(state, "planned")) {
      progress(state, "planning", "Planning screens, data model and capabilities.", sink);
      await saveState(root, state);
      const loaded = await loadCapabilities();
      const catalog = await loadCatalog();
      const input = {
        description: state.description,
        capabilities: await capabilityBriefs(),
        catalog: catalog.filter((e) => !loaded.has(e.id)).map((e) => ({ id: e.id, name: e.name, category: e.category })),
        deploymentFloor: "17.0",
      };
      let proposal = await options.brain.plan(input);
      let outcome;
      try {
        outcome = await writePlan(root, proposal, { description: state.description, ...(state.toolchain ? { toolchain: state.toolchain } : {}), ...(sink ? { sink } : {}) });
      } catch (error) {
        progress(state, "planning", `Plan rejected (${error instanceof Error ? error.message.split("\n")[0] : error}); asking once more.`, sink);
        await saveState(root, state);
        proposal = await options.brain.plan({ ...input, description: `${state.description}\n\nThe previous plan was invalid: ${error instanceof Error ? error.message : String(error)}` });
        outcome = await writePlan(root, proposal, { description: state.description, ...(state.toolchain ? { toolchain: state.toolchain } : {}), ...(sink ? { sink } : {}) });
      }
      plan = outcome.plan;
      state = (await loadState(root)) as StateWithMilestones;
      mark(state, "planned");
      progress(state, "planning", `PLAN.md written (${relative(process.cwd(), outcome.planPath) || outcome.planPath}).`, sink);
      await saveState(root, state);
    }
    if (options.planOnly) return await finish(root, "stopped", "plan only", sink);

    // Project and capabilities.
    if (!reached(state, "created")) {
      await createProject(
        { projectDir: root, name: plan.appName, displayName: plan.displayName, ...(plan.bundleId ? { bundleId: plan.bundleId } : {}), capabilities: requestedCapabilities(plan) },
        options.runner,
        sink,
      );
      state = (await loadState(root)) as StateWithMilestones;
      mark(state, "created");
      await saveState(root, state);
    }

    // Code.
    if (options.refine) {
      const spec = await readSpec(root);
      const result = await options.brain.refine({ plan, spec, change: options.refine, capabilities: await capabilityBriefs(), files: await sourceFiles(root, spec) });
      if (result.capabilities?.length) await addCapabilities(root, result.capabilities, options.runner, sink);
      if (result.files.length) await writeProjectFiles(root, result.files, options.runner);
      state = (await loadState(root)) as StateWithMilestones;
      progress(state, "generating", `Refinement wrote ${result.files.length} file(s).`, sink);
      delete state.milestones?.built;
      delete state.milestones?.launched;
      delete state.milestones?.screenshots;
      await saveState(root, state);
    } else if (!reached(state, "generated")) {
      const spec = await readSpec(root);
      progress(state, "generating", `Writing SwiftUI code for ${plan.screens.length} screens.`, sink);
      await saveState(root, state);
      const changes = await options.brain.generate({ plan, spec, capabilities: await capabilityBriefs(spec.capabilities), files: await sourceFiles(root, spec) });
      if (!changes.length) throw new Error("The model returned no source files.");
      await writeProjectFiles(root, changes, options.runner);
      state = (await loadState(root)) as StateWithMilestones;
      mark(state, "generated");
      progress(state, "generating", `Wrote ${changes.length} file(s).`, sink);
      await saveState(root, state);
    }

    if (blocking.length) return await finish(root, "failed", `toolchain missing: ${blocking.map((c) => c.id).join(", ")}`, sink);

    if (!reached(state, "built")) {
      const built = await buildAndFix(root, options, state, plan);
      if (!built) return await finish(root, "failed", "the app did not build within the attempt or time cap", sink);
    }
    state = (await loadState(root)) as StateWithMilestones;
    if (!reached(state, "screenshots")) await launchAndCapture(root, options, plan);
    return await finish(root, "complete", undefined, sink);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const current = (await loadState(root)) ?? state;
    progress(current, "failed", message.split("\n")[0]!, sink);
    await saveState(root, current);
    return await finish(root, "failed", message.split("\n")[0], sink);
  }
}
