import { testProject, screenSmokeTests } from "./testing.js";
import { snapshotFiles, snapshotHash } from "./remote.js";
// The autonomous build loop used by `ios-agent-mcp build`:
// description -> plan -> project -> capabilities -> code -> build/fix (capped)
// -> launch -> screenshot each top-level screen -> RUN_REPORT.md.
// Every stage is recorded in .ios-agent/state.json so a stopped run resumes.
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { reviewVisualRound, visualInputs, type VisualInput, type VisualRound } from "./visual-review.js";
import { parseBuildOutput, type Diagnostic } from "./build.js";
import { loadCapabilities, loadCatalog } from "./capabilities.js";
import type { Plan } from "./plan.js";
import { projectPaths, readSpec, writeSpec, regenerate, requireProjectDir, writeProjectFiles, type FileChangeInput } from "./project.js";
import type { CommandRunner } from "./runner.js";
import { ensureBooted, runApp, screenshot } from "./simulator.js";
import type { AppSpec } from "./spec.js";
import { attemptsThisCycle, loadState, newRunState, progress, saveState, type ProgressSink, type RunState } from "./state.js";
import { chooseSimulator, preflight } from "./toolchain.js";
import { addCapabilities, createProject, readPlan, recordedBuild, requestedCapabilities, updatePlanDesign, writePlan, writeReport } from "./workspace.js";

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
  generateTests?(input: { plan: Plan; spec: AppSpec; files: SourceFile[] }): Promise<FileChangeInput[]>;
  reviewDesign?(input: VisualInput): Promise<unknown>;
  repairDesign?(input: { plan: Plan; spec: AppSpec; files: SourceFile[]; review: VisualRound }): Promise<FileChangeInput[]>;
  plan(input: { description: string; capabilities: CapabilityBrief[]; catalog: Array<{ id: string; name: string; category: string }>; deploymentFloor: string }): Promise<unknown>;
  generate(input: { plan: Plan; spec: AppSpec; capabilities: CapabilityBrief[]; files: SourceFile[] }): Promise<FileChangeInput[]>;
  fix(input: { plan: Plan; spec: AppSpec; errors: Diagnostic[]; files: SourceFile[]; attempt: number; maxAttempts: number }): Promise<FileChangeInput[]>;
  refine(input: { plan: Plan; spec: AppSpec; change: string; screenshots?: VisualInput[]; capabilities: CapabilityBrief[]; files: SourceFile[] }): Promise<{ files: FileChangeInput[]; capabilities?: string[]; design?: Plan["design"] }>;
}

export interface LoopOptions {
  projectDir: string;
  remoteRetry?: boolean;
  remote?: { id?: string; build(root: string): ReturnType<typeof recordedBuild> };
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
  design?: string;
  screenshotDelayMs?: number;
  maxVisualRepairs?: number;
}

export interface LoopResult {
  state: RunState;
  reportPath: string;
  planPath?: string;
}

const MILESTONES = ["planned", "created", "generated", "tests-generated", "built", "launched", "screenshots"] as const;
type Milestone = (typeof MILESTONES)[number];
type StateWithMilestones = RunState & { milestones?: Partial<Record<Milestone, string>> };

const reached = (state: StateWithMilestones, m: Milestone) => Boolean(state.milestones?.[m]);
const mark = (state: StateWithMilestones, m: Milestone) => {
  state.milestones = { ...(state.milestones ?? {}), [m]: new Date().toISOString() };
};

function conciseFailure(error: unknown): string {
  if (error && typeof error === "object" && "issues" in error && Array.isArray(error.issues)) {
    return error.issues.slice(0, 4).map((issue: {path?: unknown[]; message?: string}) => `${issue.path?.join(".") || "plan"}: ${issue.message || "invalid value"}`).join("; ").slice(0, 500);
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/api_error_status["']?\s*:\s*429/.test(message)) {
    const detail = message.match(/"result"\s*:\s*"([^"]{1,300})/i)?.[1];
    return `Provider returned HTTP 429${detail ? `: ${detail}` : "; retry after its session limit resets."}`;
  }
  const jsonStart = message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const payload = JSON.parse(message.slice(jsonStart)) as { result?: unknown; message?: unknown; error?: unknown };
      const detail = [payload.result, payload.message, payload.error].find((value) => typeof value === "string");
      const prefix = message.slice(0, jsonStart).trimEnd();
      return `${prefix}${prefix ? " " : ""}${typeof detail === "string" ? detail : "(structured provider response omitted)"}`.slice(0, 500);
    } catch {
      // Fall through to a bounded first-line diagnostic for non-JSON output.
    }
  }
  return message.split("\n")[0]!.slice(0, 500);
}

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
  if (spec.tests) { await walk(join(root, spec.name + "Tests")); await walk(join(root, spec.name + "UITests")); }
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

async function buildAndFix(root: string, options: LoopOptions, state: StateWithMilestones, plan: Plan, visualOnly = false): Promise<boolean> {
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
    const result = options.remote ? await options.remote.build(root) : await recordedBuild(root, options.runner, { ...(options.udid ? { udid: options.udid } : {}), ...(sink ? { sink } : {}) });
    if (result.success) {
      const after = ((await loadState(root)) ?? fresh) as StateWithMilestones;
      delete after.visualRepairPending;
      mark(after, "built");
      if (options.remote) { mark(after, "launched"); mark(after, "screenshots"); }
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
    if (!changes.length || (options.remote && changes.every(c => files.some(f => f.path === c.path && f.content === c.content)))) {
      const stuck = (await loadState(root)) ?? after;
      progress(stuck, "fixing", "The model proposed no changes; stopping.", sink);
      await saveState(root, stuck);
      return false;
    }
    if (visualOnly) assertVisualChanges(changes, spec.name);
    await writeProjectFiles(root, changes, options.runner);
  }
}

function assertVisualChanges(changes: FileChangeInput[], name: string): void {
  if (changes.some(c => !c.path.startsWith(`${name}/Views/`) || !c.path.endsWith(".swift") || c.path.includes("..") || c.delete)) throw new Error("Visual repair must only replace Swift files under the app's Views directory.");
}

export async function launchAndCapture(root: string, options: Pick<LoopOptions, "runner" | "sink" | "udid" | "screenshotDelayMs"> & { device?: "iphone" | "ipad" }, plan: Plan): Promise<void> {
  const captureHash = snapshotHash(await snapshotFiles(root));
  const saved = await loadState(root);
  if (saved?.buildSourceHash !== captureHash) throw new Error("Source changed since the build; rebuild before capture.");
  const sink = options.sink;
  const screens = plan.screens.filter((s) => s.topLevel);
  let state = (await loadState(root))!;
  progress(state, "launching", "Launching in the simulator.", sink);
  await saveState(root, state);
  const { simulator } = await ensureBooted(options.runner, options.udid);
  const device = options.device ?? (/iPad/i.test(simulator.name) ? "ipad" : "iphone");
  if (!options.device) state.primaryCaptureDevice = device;
  state.toolchain = { ...state.toolchain, simulator: `${simulator.name} (iOS ${simulator.runtimeVersion.join(".")})` };
  await saveState(root, state);
  const originalAppearance = await options.runner.run("xcrun", ["simctl", "ui", simulator.udid, "appearance"], { timeoutMs: 30_000 });
  const originalContentSize = await options.runner.run("xcrun", ["simctl", "ui", simulator.udid, "content_size"], { timeoutMs: 30_000 });
  const restoreAppearance = originalAppearance.exitCode === 0 && /\bdark\b/i.test(originalAppearance.stdout) ? "dark" : "light";
  const restoreContentSize = originalContentSize.exitCode === 0 ? originalContentSize.stdout.trim().split(/\s+/).at(-1) || "large" : "large";
  // A direct simctl launch can leave iOS's "back to previous app" status item
  // in every capture. Foreground SpringBoard first so the evidence shows the
  // app as a developer sees it when opening it from the Home Screen.
  const home = await options.runner.run("xcrun", ["simctl", "launch", simulator.udid, "com.apple.springboard"], { timeoutMs: 30_000 });
  if (home.exitCode !== 0) progress(state, "launching", "Could not foreground SpringBoard before capture; screenshots may include the previous-app status item.", sink);
  const variants = [
    { id: "light", appearance: "light", contentSize: "large" },
    { id: "dark", appearance: "dark", contentSize: "large" },
    { id: "xxl", appearance: "light", contentSize: "accessibility-extra-extra-extra-large" },
  ] as const;
  try {
    for (const screen of screens) {
      for (const variant of variants) {
        for (const [setting, value] of [["appearance", variant.appearance], ["content_size", variant.contentSize]] as const) {
          const changed = await options.runner.run("xcrun", ["simctl", "ui", simulator.udid, setting, value], { timeoutMs: 30_000 });
          if (changed.exitCode !== 0) throw new Error(`Simulator ${setting}=${value} was rejected: ${changed.stderr || changed.stdout}`);
        }
        const run = await runApp(root, options.runner, { udid: simulator.udid, launchArguments: ["-ios-agent-sample-data", "YES", "-ios-agent-screen", screen.id] });
        // The first SwiftUI frame can still be the launch screen on a cold simulator.
        // Leave enough time for app startup and the requested screen's state to settle.
        await new Promise((r) => setTimeout(r, options.screenshotDelayMs ?? 8000));
        const shot = await screenshot(root, options.runner, run.udid, `${screen.id}-${device === "ipad" ? "ipad-" : ""}${variant.id}`);
        state = (await loadState(root))!;
        state.run = { udid: run.udid, simulator: run.simulator, ...(run.pid ? { pid: run.pid } : {}) };
        const screenshotPath = relative(root, shot.path).split("\\").join("/");
        state.screenshots = [...state.screenshots.filter((s) => !(s.screen === screen.id && s.variant === variant.id && (s.device ?? "iphone") === device)), { screen: screen.id, variant: variant.id, device, path: screenshotPath }];
        progress(state, "screenshots", `Captured ${screen.title} (${screen.id}) in ${variant.id} appearance.`, sink);
        await saveState(root, state);
      }
    }
  } finally {
    await options.runner.run("xcrun", ["simctl", "ui", simulator.udid, "appearance", restoreAppearance], { timeoutMs: 30_000 });
    await options.runner.run("xcrun", ["simctl", "ui", simulator.udid, "content_size", restoreContentSize], { timeoutMs: 30_000 });
  }
  if (!options.device && device === "iphone") {
    const check = await preflight(options.runner);
    const ipad = check.toolchain.simulators.find(s => /iPad/i.test(s.name));
    if (ipad) await launchAndCapture(root, {...options, udid: ipad.udid, device: "ipad"}, plan);
    else {
      state = (await loadState(root))!;
      progress(state, "screenshots", "iPad capture unavailable: install an iPad simulator to verify tablet layout.", sink);
      await saveState(root, state);
    }
  }
  state = (await loadState(root))!;
  if (snapshotHash(await snapshotFiles(root)) !== captureHash) throw new Error("Source changed during capture; rebuild and recapture.");
  if (state.buildSourceHash === captureHash) state.captureSourceHash = captureHash;
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
    state.cycleStartedAt = new Date().toISOString();
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
    const testCapped = (state.tests ?? []).filter(test => test.cycle === state.cycle).length >= 3;
    const capped = state.status === "failed" && (testCapped || (!reached(state, "built") && attemptsThisCycle(state) > 0 && (!options.remote || (attemptsThisCycle(state) >= state.maxBuildAttempts && !state.builds.at(-1)?.success))));
    if (capped) {
      state.cycle += 1;
      state.cycleStartedAt = new Date().toISOString();
    }
    // Older saved runs predate cycleStartedAt. Start their resumed cycle now
    // instead of reporting elapsed time from the original planning session.
    state.cycleStartedAt ??= new Date().toISOString();
    state.status = "running";
    delete state.failure;
    state.deadlineAt = new Date(Date.now() + (options.wallClockMinutes ?? 25) * 60_000).toISOString();
    progress(state, state.stage, capped ? "Resuming with a new build attempt budget." : "Resuming the stopped run.", sink);
    await saveState(root, state);
  }

  const backendId = options.remote ? options.remote.id ?? "github" : "local";
  if ((state.verificationBackend ?? "local") !== backendId) {
    if (state.builds.length) state.cycle += 1;
    delete state.milestones?.built;
    delete state.milestones?.launched;
    delete state.milestones?.screenshots;
    delete state.run;
    state.screenshots = [];
    delete state.toolchain;
  }
  state.verificationBackend = backendId;
  await saveState(root, state);
  if (options.remoteRetry && options.remote) {
    state.cycle += 1;
    state.cycleStartedAt = new Date().toISOString();
    delete state.milestones?.built;
    delete state.milestones?.launched;
    delete state.milestones?.screenshots;
    progress(state, "preflight", "Explicit remote retry: starting a new Actions job and build budget.", sink);
    await saveState(root, state);
  }

  // Preflight: record the toolchain; without Xcode the run can still plan and write code.
  const check = await preflight(options.runner);
  const simulator = chooseSimulator(check.toolchain.simulators, options.udid);
  state = (await loadState(root)) as StateWithMilestones;
  if (!options.remote) state.toolchain = {
    ...(check.toolchain.xcode ? { xcode: `Xcode ${check.toolchain.xcode.version}${check.toolchain.xcode.build ? ` (${check.toolchain.xcode.build})` : ""}` } : {}),
    ...(simulator ? { simulator: `${simulator.name} (iOS ${simulator.runtimeVersion.join(".")})` } : {}),
  };
  const missing = check.checks.filter((c) => !c.ok);
  // Builds need the Apple tools themselves; the platform line is informational.
  const blocking = missing.filter((c) => ["xcode", "simulator-sdk", "simulator"].includes(c.id));
  progress(state, "preflight", options.remote ? "Remote macOS verification selected; local Apple tools are not required." : missing.length ? `Missing: ${missing.map((c) => `${c.id} (${c.fix ?? c.detail})`).join("; ")}` : `Toolchain ready: ${state.toolchain?.xcode}, ${state.toolchain?.simulator}.`, sink);
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
      let proposal;
      let outcome;
      try {
        proposal = await options.brain.plan(input);
        outcome = await writePlan(root, proposal, { description: state.description, ...(state.toolchain ? { toolchain: state.toolchain } : {}), ...(sink ? { sink } : {}) });
      } catch (error) {
        progress(state, "planning", `Plan rejected (${conciseFailure(error)}); asking once more.`, sink);
        await saveState(root, state);
        proposal = await options.brain.plan({ ...input, description: `${state.description}\n\nThe previous plan was invalid: ${conciseFailure(error)}` });
        outcome = await writePlan(root, proposal, { description: state.description, ...(state.toolchain ? { toolchain: state.toolchain } : {}), ...(sink ? { sink } : {}) });
      }
      plan = outcome.plan;
      state = (await loadState(root)) as StateWithMilestones;
      mark(state, "planned");
      progress(state, "planning", `PLAN.md written (${relative(process.cwd(), outcome.planPath) || outcome.planPath}).`, sink);
      await saveState(root, state);
    }
    if (options.design) {
      if (reached(state, "created")) throw new Error("Use --refine to change design after code generation.");
      const direction = options.design === "first" ? plan.designDirections?.[0] : plan.designDirections?.find(d => d.id === options.design);
      if (!direction) throw new Error("Unknown design direction; choose an ID from PLAN.md.");
      plan = (await writePlan(root, { ...plan, selectedDesign: direction.id, design: direction.design })).plan;
    }
    if (options.planOnly) return await finish(root, "stopped", "plan only", sink);
    if (plan.designDirections && !plan.selectedDesign) return await finish(root, "stopped", "Choose a design direction from PLAN.md, then --resume --design <id>.", sink);

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
      const currentHash = snapshotHash(await snapshotFiles(root));
      const screenshots = state.captureSourceHash === currentHash && state.screenshots.length ? (await visualInputs(root, plan, state)).map(s => ({...s, plan: plan!})) : [];
      progress(state, "generating", screenshots.length ? `Refinement uses current pixels for ${screenshots.length} screens.` : "No current screenshots available; refinement uses source only.", sink);
      const result = await options.brain.refine({ plan, spec, screenshots, change: options.refine, capabilities: await capabilityBriefs(), files: await sourceFiles(root, spec) });
      if (result.design) {
        const outcome = await updatePlanDesign(root, result.design, sink ? { sink } : {});
        plan = outcome.plan;
        progress((await loadState(root))!, "planning", `Design direction updated: ${plan.design.mood}; palette ${plan.design.palette.name}.`, sink);
      }
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
      if (options.brain.generateTests && !spec.tests) {
        spec.tests = true;
        await writeSpec(root, spec);
      }
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

    if (options.brain.generateTests && !reached(state, "built")) {
      const spec = await readSpec(root);
      if (!reached(state, "tests-generated")) {
        spec.tests = true;
        await writeSpec(root, spec);
        const appFiles = await sourceFiles(root, spec);
        const files = await options.brain.generateTests({plan, spec, files: appFiles});
        const viewModels = appFiles.filter(f => f.path.includes("/ViewModels/")).flatMap(f => [...f.content.matchAll(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map(m => m[1]!));
        for (const name of viewModels) {
          const test = files.find(f => f.path === `${spec.name}Tests/${name}Tests.swift`);
          if (!test?.content || !/@Test\b/.test(test.content) || !/#(?:expect|require)\s*\(/.test(test.content)) throw new Error(`Missing behavioral Swift Testing assertions for ${name}`);
        }
        files.push({path: `${spec.name}UITests/PlannedScreenTests.swift`, content: screenSmokeTests(plan.screens)});
        if (files.some(f => f.delete || !["Tests", "UITests"].some(suffix => f.path.startsWith(spec.name + suffix + "/") && f.path.endsWith(".swift")))) throw new Error("Test generation may only write test Swift files");
        if (!files.some(f => f.path.startsWith(spec.name + "Tests/")) || !files.some(f => f.path.startsWith(spec.name + "UITests/"))) throw new Error("Both unit and UI tests are required");
        await writeProjectFiles(root, files, options.runner);
        await regenerate(root, spec, options.runner);
        state = (await loadState(root)) as StateWithMilestones;
        mark(state, "tests-generated"); await saveState(root, state);
      }
    }

    if (blocking.length && !options.remote) return await finish(root, "failed", `toolchain missing: ${blocking.map((c) => c.id).join(", ")}`, sink);

    if (options.brain.reviewDesign && state.captureSourceHash !== snapshotHash(await snapshotFiles(root))) {
      delete state.milestones?.built; delete state.milestones?.screenshots; delete state.milestones?.launched;
      await saveState(root, state);
    }
    if (!reached(state, "built")) {
      const built = await buildAndFix(root, options, state, plan, state.visualRepairPending === true);
      if (!built) return await finish(root, "failed", "the app did not build within the attempt or time cap", sink);
    }
    state = (await loadState(root)) as StateWithMilestones;
    if (!options.remote && !reached(state, "screenshots")) await launchAndCapture(root, options, plan);
    if (options.brain.reviewDesign) {
      for (;;) {
        state = (await loadState(root)) as StateWithMilestones;
        const spec = await readSpec(root);
        const files = await sourceFiles(root, spec);
        progress(state, "screenshots", "Reviewing screenshot pixels against the approved design and HIG checklist.", sink);
        await saveState(root, state);
        const reviewHash = snapshotHash(await snapshotFiles(root));
        if (state.captureSourceHash !== reviewHash) throw new Error("Visual evidence is stale; rebuild and recapture.");
        const review = await reviewVisualRound(root, plan, files, state, input => options.brain.reviewDesign!(input));
        state = (await loadState(root)) as StateWithMilestones;
        if (snapshotHash(await snapshotFiles(root)) !== reviewHash) throw new Error("Source changed during visual review; rebuild and recapture.");
        state.visualReviews = [...(state.visualReviews ?? []).filter(r => r.key !== review.key), review];
        await saveState(root, state);
        if (review.status === "pass") break;
        if (review.status === "unknown") return await finish(root, "stopped", "Visual review inconclusive; inspect the saved screenshots and findings.", sink);
        if (state.visualReviews.filter(r => r.cycle === review.cycle).length >= (options.maxVisualRepairs ?? 2) + 1 || timeLeft(state) <= 0 || attemptsThisCycle(state) >= state.maxBuildAttempts) return await finish(root, "stopped", "Visual repair budget exhausted; unresolved findings saved.", sink);
        if (!options.brain.repairDesign) return await finish(root, "stopped", "Visual findings require repair; no repair provider configured.", sink);
        const changes = await options.brain.repairDesign({plan, spec, files, review});
        if (!changes.length || changes.every(c => files.some(f => f.path === c.path && f.content === c.content))) return await finish(root, "stopped", "Visual repair proposed no changes.", sink);
        // A visual critique may edit views only, never models, credentials or project configuration.
        assertVisualChanges(changes, spec.name);
        state.visualRepairPending = true;
        delete state.milestones?.built;
        delete state.milestones?.launched;
        delete state.milestones?.screenshots;
        state.screenshots = [];
        await saveState(root, state);
        await writeProjectFiles(root, changes, options.runner);
        if (!await buildAndFix(root, options, state, plan, true)) return await finish(root, "failed", "Visual repair did not build within the budget.", sink);
        if (!options.remote) await launchAndCapture(root, options, plan);
      }
    }
    const finalSpec = await readSpec(root);
    if (finalSpec.tests) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const fresh = (await loadState(root))!;
        const hash = snapshotHash(await snapshotFiles(root));
        const previous = fresh.tests?.at(-1);
        const tests = previous?.sourceHash === hash && previous.status === "passed" && existsSync(join(root, previous.logPath)) && existsSync(join(root, previous.resultBundle)) ? previous : options.remote ? previous : await testProject(root, options.runner, options.udid);
        if (tests?.status === "passed" && tests.sourceHash === hash) {
          if (!existsSync(join(root, tests.logPath)) || !existsSync(join(root, tests.resultBundle))) return await finish(root, "stopped", "Saved test artifacts are missing; rerun verification.", sink);
          break;
        }
        if (!tests || (options.remote && tests.sourceHash !== hash) || tests.status === "unavailable" || attempt === 3 || timeLeft(fresh) <= 0) return await finish(root, "failed", "Tests did not pass; inspect the recorded test evidence.", sink);
        const files = await sourceFiles(root, finalSpec);
        const errors = parseBuildOutput(await readFile(join(root, tests.logPath), "utf8"), root).errors;
        const changes = await options.brain.fix({plan, spec: finalSpec, files, errors: errors.length ? errors : [{severity: "error", message: `Test run failed (${tests.failed} failures, ${tests.skipped} skipped). Preserve tests and repair app behavior.`}], attempt, maxAttempts: 3});
        const compilerTests = new Set(errors.filter(e => e.file?.startsWith(finalSpec.name + "Tests/") || e.file?.startsWith(finalSpec.name + "UITests/")).map(e => e.file));
        if (!changes.length || changes.some(c => c.delete || (!c.path.startsWith(finalSpec.name + "/") && !compilerTests.has(c.path)))) throw new Error("Test repair may only replace app source or a test file with a compiler diagnostic");
        for (const change of changes.filter(c => compilerTests.has(c.path))) {
          const original = files.find(f => f.path === change.path)?.content ?? "";
          const count = (text: string) => (text.match(/#expect|#require|XCTAssert|@Test\b|func test/g) ?? []).length;
          if (count(change.content ?? "") < count(original)) throw new Error("Test compiler repair removed tests or assertions");
        }
        await writeProjectFiles(root, changes, options.runner);
        if (!await buildAndFix(root, options, fresh, plan)) return await finish(root, "failed", "Test repair did not build", sink);
        if (!options.remote) await launchAndCapture(root, options, plan);
        if (options.brain.reviewDesign) {
          const after = (await loadState(root))!;
          const review = await reviewVisualRound(root, plan, await sourceFiles(root, finalSpec), after, input => options.brain.reviewDesign!(input));
          after.visualReviews = [...(after.visualReviews ?? []).filter(r => r.key !== review.key), review]; await saveState(root, after);
          if (review.status !== "pass") return await finish(root, "stopped", "Test repair requires renewed visual review; findings saved.", sink);
        }
      }
    }
    return await finish(root, "complete", undefined, sink);
  } catch (error) {
    const message = conciseFailure(error);
    const current = (await loadState(root)) ?? state;
    progress(current, "failed", message, sink);
    await saveState(root, current);
    return await finish(root, "failed", message, sink);
  }
}
