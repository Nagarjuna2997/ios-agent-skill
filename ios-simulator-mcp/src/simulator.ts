import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { assertOk, CommandResult, Runner } from "./runner.js";

export interface SimulatorDevice {
  name: string;
  udid: string;
  state: string;
  runtime: string;
  isAvailable: boolean;
}

export interface SimulatorList {
  devices: SimulatorDevice[];
}

export async function simulatorList(runner: Runner): Promise<SimulatorList> {
  const result = assertOk(await runner.run("xcrun", ["simctl", "list", "devices", "available", "--json"]));
  const parsed = JSON.parse(result.stdout) as {
    devices?: Record<string, Array<{ name: string; udid: string; state: string; isAvailable?: boolean }>>;
  };
  const devices = Object.entries(parsed.devices ?? {}).flatMap(([runtime, entries]) =>
    entries.map((device) => ({
      name: device.name,
      udid: device.udid,
      state: device.state,
      runtime,
      isAvailable: device.isAvailable ?? true,
    })),
  );
  return { devices };
}

export async function simulatorBoot(runner: Runner, udid: string): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "boot", udid], { timeoutMs: 120_000 }));
}

export async function simulatorShutdown(runner: Runner, udid: string): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "shutdown", udid], { timeoutMs: 60_000 }));
}

export async function installApp(runner: Runner, udid: string, appPath: string): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "install", udid, resolve(appPath)], { timeoutMs: 120_000 }));
}

export async function launchApp(
  runner: Runner,
  udid: string,
  bundleId: string,
  args: string[] = [],
): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "launch", udid, bundleId, ...args], { timeoutMs: 60_000 }));
}

export async function terminateApp(runner: Runner, udid: string, bundleId: string): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "terminate", udid, bundleId], { timeoutMs: 30_000 }));
}

export async function openDeepLink(runner: Runner, udid: string, url: string): Promise<CommandResult> {
  return assertOk(await runner.run("xcrun", ["simctl", "openurl", udid, url], { timeoutMs: 30_000 }));
}

export async function screenshot(runner: Runner, udid: string, outputPath: string): Promise<CommandResult> {
  const absolute = resolve(outputPath);
  await mkdir(dirname(absolute), { recursive: true });
  return assertOk(await runner.run("xcrun", ["simctl", "io", udid, "screenshot", absolute], { timeoutMs: 30_000 }));
}

export async function buildProject(
  runner: Runner,
  input: {
    project?: string;
    workspace?: string;
    scheme: string;
    destination?: string;
    configuration?: string;
    derivedDataPath?: string;
  },
): Promise<CommandResult> {
  const args = ["build", "-scheme", input.scheme];
  if (input.project) args.push("-project", resolve(input.project));
  if (input.workspace) args.push("-workspace", resolve(input.workspace));
  if (!input.project && !input.workspace) {
    throw new Error("build_project requires either project or workspace.");
  }
  args.push("-destination", input.destination ?? "generic/platform=iOS Simulator");
  if (input.configuration) args.push("-configuration", input.configuration);
  if (input.derivedDataPath) args.push("-derivedDataPath", resolve(input.derivedDataPath));
  return assertOk(await runner.run("xcodebuild", args, { timeoutMs: 10 * 60_000 }));
}

export async function runTests(
  runner: Runner,
  input: {
    project?: string;
    workspace?: string;
    scheme: string;
    destination: string;
    configuration?: string;
    derivedDataPath?: string;
  },
): Promise<CommandResult> {
  const args = ["test", "-scheme", input.scheme];
  if (input.project) args.push("-project", resolve(input.project));
  if (input.workspace) args.push("-workspace", resolve(input.workspace));
  if (!input.project && !input.workspace) {
    throw new Error("run_tests requires either project or workspace.");
  }
  args.push("-destination", input.destination);
  if (input.configuration) args.push("-configuration", input.configuration);
  if (input.derivedDataPath) args.push("-derivedDataPath", resolve(input.derivedDataPath));
  return assertOk(await runner.run("xcodebuild", args, { timeoutMs: 20 * 60_000 }));
}

export function summarize(result: CommandResult): Record<string, unknown> {
  return {
    command: result.command,
    args: result.args,
    exitCode: result.exitCode,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}
