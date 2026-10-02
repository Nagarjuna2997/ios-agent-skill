// Detects the Apple toolchain actually installed on this Mac. Nothing here
// hardcodes an Xcode version or a simulator name: the newest available iOS
// runtime and an iPhone on it are chosen at run time.
import type { CommandRunner } from "./runner.js";

export interface Simulator {
  udid: string;
  name: string;
  state: string;
  runtime: string;
  runtimeVersion: number[];
  deviceType: string;
  isAvailable: boolean;
}

export interface Toolchain {
  platform: NodeJS.Platform;
  node: string;
  xcode?: { version: string; build?: string };
  iosSimulatorSdk?: string;
  simulators: Simulator[];
  xcodegen?: string;
}

export interface PreflightCheck {
  id: "macos" | "node" | "xcode" | "simulator-sdk" | "simulator" | "xcodegen";
  ok: boolean;
  detail: string;
  fix?: string;
}

export interface Preflight {
  ok: boolean;
  toolchain: Toolchain;
  checks: PreflightCheck[];
}

const IOS_RUNTIME = /SimRuntime\.iOS-(\d+(?:-\d+)*)$/;

/** Parse `xcrun simctl list devices available --json` into iOS simulators. */
export function parseSimulators(json: string): Simulator[] {
  const data = JSON.parse(json) as {
    devices?: Record<string, Array<{ udid: string; name: string; state: string; isAvailable?: boolean; deviceTypeIdentifier?: string }>>;
  };
  const out: Simulator[] = [];
  for (const [runtime, devices] of Object.entries(data.devices ?? {})) {
    const match = runtime.match(IOS_RUNTIME);
    if (!match) continue;
    const runtimeVersion = match[1]!.split("-").map(Number);
    for (const device of devices) {
      out.push({
        udid: device.udid,
        name: device.name,
        state: device.state,
        runtime,
        runtimeVersion,
        deviceType: device.deviceTypeIdentifier ?? "",
        isAvailable: device.isAvailable !== false,
      });
    }
  }
  return out;
}

const compareVersions = (a: number[], b: number[]) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d;
  }
  return 0;
};

const isPhone = (s: Simulator) => /iPhone/i.test(s.deviceType) || /^iPhone/i.test(s.name);

/**
 * Choose a simulator: an explicitly requested UDID, else a booted iPhone, else
 * an iPhone on the newest installed iOS runtime, else any available iOS device.
 */
export function chooseSimulator(simulators: Simulator[], udid?: string): Simulator | undefined {
  const available = simulators.filter((s) => s.isAvailable);
  if (udid) return available.find((s) => s.udid.toLowerCase() === udid.toLowerCase());
  const booted = available.find((s) => s.state === "Booted" && isPhone(s));
  if (booted) return booted;
  const byNewest = [...available].sort((a, b) => compareVersions(b.runtimeVersion, a.runtimeVersion));
  return byNewest.find(isPhone) ?? byNewest[0];
}

export function parseXcodeVersion(text: string): { version: string; build?: string } | undefined {
  const version = text.match(/Xcode\s+(\d+(?:\.\d+)*)/)?.[1];
  if (!version) return undefined;
  const build = text.match(/Build version\s+(\S+)/)?.[1];
  return build ? { version, build } : { version };
}

export async function detectToolchain(runner: CommandRunner): Promise<Toolchain> {
  const toolchain: Toolchain = { platform: process.platform, node: process.versions.node, simulators: [] };
  const xcode = await runner.run("xcodebuild", ["-version"], { timeoutMs: 30_000 });
  if (xcode.exitCode === 0) {
    const parsed = parseXcodeVersion(xcode.stdout);
    if (parsed) toolchain.xcode = parsed;
    const sdk = await runner.run("xcrun", ["--sdk", "iphonesimulator", "--show-sdk-version"], { timeoutMs: 30_000 });
    if (sdk.exitCode === 0 && sdk.stdout.trim()) toolchain.iosSimulatorSdk = sdk.stdout.trim();
    const list = await runner.run("xcrun", ["simctl", "list", "devices", "available", "--json"], { timeoutMs: 60_000 });
    if (list.exitCode === 0) {
      try {
        toolchain.simulators = parseSimulators(list.stdout);
      } catch {
        toolchain.simulators = [];
      }
    }
  }
  const xcodegen = await runner.run("xcodegen", ["--version"], { timeoutMs: 30_000 });
  if (xcodegen.exitCode === 0) toolchain.xcodegen = xcodegen.stdout.trim().replace(/^Version:\s*/i, "") || "installed";
  return toolchain;
}

export async function preflight(runner: CommandRunner): Promise<Preflight> {
  const toolchain = await detectToolchain(runner);
  const nodeMajor = Number(toolchain.node.split(".")[0]);
  const simulator = chooseSimulator(toolchain.simulators);
  const checks: PreflightCheck[] = [
    {
      id: "macos",
      ok: toolchain.platform === "darwin",
      detail: toolchain.platform === "darwin" ? "macOS" : `This is ${toolchain.platform}; building iOS apps requires macOS.`,
      ...(toolchain.platform === "darwin" ? {} : { fix: "Run the agent on a Mac with Xcode installed." }),
    },
    {
      id: "node",
      ok: nodeMajor >= 20,
      detail: `Node.js ${toolchain.node}`,
      ...(nodeMajor >= 20 ? {} : { fix: "Install Node.js 20 or newer (https://nodejs.org or `brew install node`)." }),
    },
    {
      id: "xcode",
      ok: Boolean(toolchain.xcode),
      detail: toolchain.xcode ? `Xcode ${toolchain.xcode.version}${toolchain.xcode.build ? ` (${toolchain.xcode.build})` : ""}` : "xcodebuild did not run.",
      ...(toolchain.xcode
        ? {}
        : { fix: "Install Xcode from the Mac App Store, open it once to finish setup, then run `sudo xcode-select -s /Applications/Xcode.app`." }),
    },
    {
      id: "simulator-sdk",
      ok: Boolean(toolchain.iosSimulatorSdk),
      detail: toolchain.iosSimulatorSdk ? `iOS Simulator SDK ${toolchain.iosSimulatorSdk}` : "No iOS Simulator SDK found.",
      ...(toolchain.iosSimulatorSdk ? {} : { fix: "In Xcode, open Settings > Components and install an iOS platform, or run `xcodebuild -downloadPlatform iOS`." }),
    },
    {
      id: "simulator",
      ok: Boolean(simulator),
      detail: simulator ? `${simulator.name} (${simulator.runtimeVersion.join(".")}, ${simulator.udid})` : "No available iOS simulator device.",
      ...(simulator ? {} : { fix: "In Xcode, open Window > Devices and Simulators and add an iPhone simulator for the installed iOS runtime." }),
    },
    {
      id: "xcodegen",
      // Optional: without XcodeGen the built-in writer generates a folder-synchronized project.
      ok: true,
      detail: toolchain.xcodegen
        ? `XcodeGen ${toolchain.xcodegen}`
        : "XcodeGen is not on PATH; projects are written by the built-in generator (needs Xcode 16 or later). Optional: `brew install xcodegen`.",
    },
  ];
  return { ok: checks.every((c) => c.ok), toolchain, checks };
}
