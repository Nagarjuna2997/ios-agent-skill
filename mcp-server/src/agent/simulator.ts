// Simulator operations for the agent: run (boot, install, launch), screenshot
// and logs. The device is chosen from what is installed on this Mac.
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { commandFailed, type CommandRunner } from "./runner.js";
import { projectPaths, readSpec, requireProjectDir } from "./project.js";
import { chooseSimulator, parseSimulators, type Simulator } from "./toolchain.js";

export interface RunResult {
  udid: string;
  simulator: string;
  bundleId: string;
  pid?: number;
  booted: boolean;
}

async function simulators(runner: CommandRunner): Promise<Simulator[]> {
  const list = await runner.run("xcrun", ["simctl", "list", "devices", "available", "--json"], { timeoutMs: 60_000 });
  if (list.exitCode !== 0) throw new Error(`Cannot list simulators: ${commandFailed(list)}`);
  return parseSimulators(list.stdout);
}

export async function ensureBooted(runner: CommandRunner, udid?: string): Promise<{ simulator: Simulator; booted: boolean }> {
  const simulator = chooseSimulator(await simulators(runner), udid);
  if (!simulator) throw new Error(udid ? `No available simulator with UDID ${udid}.` : "No available iOS simulator. Run ios_preflight for the fix.");
  let booted = false;
  if (simulator.state !== "Booted") {
    const boot = await runner.run("xcrun", ["simctl", "boot", simulator.udid], { timeoutMs: 180_000 });
    if (boot.exitCode !== 0 && !/current state: Booted/i.test(boot.stderr)) throw new Error(`Could not boot ${simulator.name}: ${commandFailed(boot)}`);
    booted = true;
  }
  const status = await runner.run("xcrun", ["simctl", "bootstatus", simulator.udid, "-b"], { timeoutMs: 300_000 });
  if (status.exitCode !== 0) throw new Error(`${simulator.name} did not finish booting: ${commandFailed(status)}`);
  return { simulator, booted };
}

/** Install the last successful build and launch it, optionally with launch arguments. */
export async function runApp(
  rootDir: string,
  runner: CommandRunner,
  options: { udid?: string; launchArguments?: string[] } = {},
): Promise<RunResult> {
  const root = requireProjectDir(rootDir);
  const spec = await readSpec(root);
  const appPath = join(projectPaths(root, spec.name).derivedData, "Build", "Products", "Debug-iphonesimulator", `${spec.name}.app`);
  if (!existsSync(appPath)) throw new Error("No built app found. Run ios_build successfully first.");
  const { simulator, booted } = await ensureBooted(runner, options.udid);
  const install = await runner.run("xcrun", ["simctl", "install", simulator.udid, appPath], { timeoutMs: 180_000 });
  if (install.exitCode !== 0) throw new Error(`Install failed: ${commandFailed(install)}`);
  const launch = await runner.run(
    "xcrun",
    ["simctl", "launch", "--terminate-running-process", simulator.udid, spec.bundleId, ...(options.launchArguments ?? [])],
    { timeoutMs: 120_000 },
  );
  if (launch.exitCode !== 0) throw new Error(`Launch failed: ${commandFailed(launch)}`);
  const pid = launch.stdout.match(/:\s*(\d+)\s*$/m)?.[1];
  return { udid: simulator.udid, simulator: simulator.name, bundleId: spec.bundleId, booted, ...(pid ? { pid: Number(pid) } : {}) };
}

const PNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export async function screenshot(rootDir: string, runner: CommandRunner, udid: string, name: string): Promise<{ path: string; bytes: number }> {
  const root = requireProjectDir(rootDir);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(name)) throw new Error("Screenshot name must be letters, digits, - or _ (max 64).");
  const dir = projectPaths(root).screenshots;
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${name}.png`);
  const result = await runner.run("xcrun", ["simctl", "io", udid, "screenshot", "--type=png", path], { timeoutMs: 60_000 });
  if (result.exitCode !== 0) throw new Error(`Screenshot failed: ${commandFailed(result)}`);
  const bytes = await readFile(path);
  if (!bytes.subarray(0, 8).equals(PNG)) throw new Error("The simulator did not produce a PNG.");
  return { path, bytes: bytes.length };
}

export async function appLogs(rootDir: string, runner: CommandRunner, udid: string, seconds: number): Promise<{ lines: string[]; truncated: boolean }> {
  const root = requireProjectDir(rootDir);
  const spec = await readSpec(root);
  const window = Math.max(1, Math.min(600, Math.round(seconds)));
  const result = await runner.run(
    "xcrun",
    ["simctl", "spawn", udid, "log", "show", "--last", `${window}s`, "--style", "compact", "--predicate", `process == "${spec.name}" OR subsystem == "${spec.bundleId}"`],
    { timeoutMs: 120_000 },
  );
  if (result.exitCode !== 0) throw new Error(`Log query failed: ${commandFailed(result)}`);
  const lines = result.stdout.split(/\r?\n/).filter((l) => l.trim() && !/^Timestamp\s/.test(l));
  return { lines: lines.slice(-500), truncated: lines.length > 500 };
}
