// Run state shared by the slash-command path (MCP tools) and the CLI loop.
// It makes runs resumable and enforces the attempt and wall-clock caps.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Diagnostic } from "./build.js";
import { projectPaths } from "./project.js";

export const STAGES = [
  "preflight",
  "planning",
  "creating",
  "capabilities",
  "generating",
  "building",
  "fixing",
  "launching",
  "screenshots",
  "reporting",
  "complete",
  "failed",
  "stopped",
] as const;
export type Stage = (typeof STAGES)[number];

export interface BuildRecord {
  cycle: number;
  attempt: number;
  success: boolean;
  errors: number;
  warnings: number;
  durationMs: number;
  at: string;
  firstErrors: Diagnostic[];
}

export interface RunState {
  version: 1;
  description: string;
  projectDir: string;
  startedAt: string;
  /** Start time for the current build/refinement cycle; older state files fall back to startedAt. */
  cycleStartedAt?: string;
  updatedAt: string;
  deadlineAt: string;
  /** Minutes allowed per cycle, counted from the cycle's first build. */
  wallClockMinutes?: number;
  stage: Stage;
  status: "running" | "complete" | "failed" | "stopped";
  maxBuildAttempts: number;
  /** Incremented by each refinement; build attempts are capped per cycle. */
  cycle: number;
  builds: BuildRecord[];
  run?: { udid: string; simulator: string; pid?: number };
  /** `variant` is light, dark or xxl for the design evidence matrix; older state files omit it. */
  screenshots: Array<{ screen: string; path: string; variant?: "light" | "dark" | "xxl" }>;
  visualRepairPending?: boolean;
  buildSourceHash?: string;
  captureSourceHash?: string;
  visualReviews?: import("./visual-review.js").VisualRound[];
  designEvidence?: { contrast: Array<{ color: string; light: number; dark: number; passesAA: boolean }>; passesAA: boolean; paletteMatchesPlan?: boolean };
  capabilities: Array<{ id: string; name: string; status: string; placeholders: string[]; files: number; notes: string[] }>;
  unavailable: Array<{ id: string; reason: string }>;
  progress: Array<{ at: string; stage: Stage; message: string }>;
  refinements: Array<{ at: string; change: string }>;
  verificationBackend?: string;
  toolchain?: { sdk?: string; xcode?: string; simulator?: string };
  failure?: string;
}

export const DEFAULT_MAX_BUILD_ATTEMPTS = 8;
export const DEFAULT_WALL_CLOCK_MINUTES = 25;

export function newRunState(input: { description: string; projectDir: string; maxBuildAttempts?: number; wallClockMinutes?: number; now?: Date }): RunState {
  const now = input.now ?? new Date();
  const minutes = input.wallClockMinutes ?? DEFAULT_WALL_CLOCK_MINUTES;
  return {
    version: 1,
    description: input.description,
    // The state file travels with the project; keep it usable after a checkout
    // moves to another machine instead of persisting a developer's home path.
    projectDir: ".",
    startedAt: now.toISOString(),
    cycleStartedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    deadlineAt: new Date(now.getTime() + minutes * 60_000).toISOString(),
    wallClockMinutes: minutes,
    stage: "preflight",
    status: "running",
    maxBuildAttempts: input.maxBuildAttempts ?? DEFAULT_MAX_BUILD_ATTEMPTS,
    cycle: 1,
    builds: [],
    screenshots: [],
    capabilities: [],
    unavailable: [],
    progress: [],
    refinements: [],
  };
}

export async function loadState(root: string): Promise<RunState | undefined> {
  try {
    return JSON.parse(await readFile(projectPaths(root).state, "utf8")) as RunState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export async function saveState(root: string, state: RunState): Promise<void> {
  const file = projectPaths(root).state;
  state.updatedAt = new Date().toISOString();
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  await writeFile(temp, JSON.stringify(state, null, 2) + "\n");
  await rename(temp, file);
}

export type ProgressSink = (line: string) => void;

/** Record a short status line in the state and echo it to whoever is watching. */
export function progress(state: RunState, stage: Stage, message: string, sink?: ProgressSink): string {
  state.stage = stage;
  const line = `[${stage}] ${message}`;
  state.progress.push({ at: new Date().toISOString(), stage, message });
  if (state.progress.length > 500) state.progress = state.progress.slice(-500);
  sink?.(line);
  return line;
}

export function attemptsThisCycle(state: RunState): number {
  return state.builds.filter((b) => b.cycle === state.cycle).length;
}

/**
 * Start a fresh attempt budget and deadline, for a refinement or a resumed run.
 * The previous cycles' builds stay in the history.
 */
export function startCycle(state: RunState, options: { change?: string; minutes?: number; now?: Date } = {}): void {
  const now = options.now ?? new Date();
  if (state.builds.some((b) => b.cycle === state.cycle)) state.cycle += 1;
  state.cycleStartedAt = now.toISOString();
  state.status = "running";
  delete state.failure;
  state.deadlineAt = new Date(now.getTime() + (options.minutes ?? state.wallClockMinutes ?? DEFAULT_WALL_CLOCK_MINUTES) * 60_000).toISOString();
  if (options.change) state.refinements.push({ at: now.toISOString(), change: options.change });
}

/** Throws a user-facing error when another build would exceed the caps. */
export function assertCanBuild(state: RunState, now = new Date()): void {
  if (attemptsThisCycle(state) >= state.maxBuildAttempts) {
    throw new Error(`Build attempt cap reached (${state.maxBuildAttempts} this run). Write RUN_REPORT.md with ios_report and stop; a refinement (ios_build with newCycle) starts a new budget.`);
  }
  if (now.getTime() > Date.parse(state.deadlineAt)) {
    throw new Error(`Wall-clock cap reached (deadline ${state.deadlineAt}). Write RUN_REPORT.md with ios_report and stop.`);
  }
}
