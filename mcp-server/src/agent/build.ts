// xcodebuild invocation and structured diagnostics. The agent never hands the
// model a raw build log: it gets {file, line, column, message} records, with
// the full log saved under .ios-agent/logs for a human.
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";
import type { CommandRunner } from "./runner.js";
import { projectPaths, readSpec, requireProjectDir } from "./project.js";
import { chooseSimulator, parseSimulators } from "./toolchain.js";

export interface Diagnostic {
  severity: "error" | "warning";
  file?: string;
  line?: number;
  column?: number;
  message: string;
}

export interface BuildResult {
  success: boolean;
  errors: Diagnostic[];
  warnings: Diagnostic[];
  durationMs: number;
  scheme: string;
  destination: string;
  appPath?: string;
  logPath: string;
  /** Present when xcodebuild itself could not run. */
  toolError?: string;
}

const LOCATED = /^(.+?):(\d+):(?:(\d+):)?\s+(error|warning|fatal error):\s+(.+)$/;
const UNLOCATED = /^(?:(?:ld|clang|swift-frontend|xcodebuild|actool|ibtool|codesign)(?:\[\d+\])?:\s+)?(error|warning):\s+(.+)$/;

export function parseBuildOutput(text: string, root?: string): { errors: Diagnostic[]; warnings: Diagnostic[] } {
  const seen = new Set<string>();
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    let diagnostic: Diagnostic | undefined;
    const located = line.match(LOCATED);
    if (located && !/^\s/.test(line)) {
      let file = located[1]!;
      if (root && isAbsolute(file)) {
        // Xcode resolves workspace aliases (notably /var -> /private/var on macOS).
        // Keep external diagnostics absolute; only app-contained paths are editable.
        let canonicalRoot = root;
        let canonicalFile = file;
        try { canonicalRoot = realpathSync(root); } catch { /* synthetic/missing root */ }
        try { canonicalFile = realpathSync(file); } catch { /* deleted/generated source */ }
        if (canonicalFile.startsWith(canonicalRoot + sep)) file = relative(canonicalRoot, canonicalFile);
        else if (file.startsWith(root + sep)) file = relative(root, file);
      }
      diagnostic = {
        severity: located[4] === "warning" ? "warning" : "error",
        file,
        line: Number(located[2]),
        ...(located[3] ? { column: Number(located[3]) } : {}),
        message: located[5]!.trim(),
      };
    } else {
      const unlocated = line.trim().match(UNLOCATED);
      if (unlocated) diagnostic = { severity: unlocated[1] === "warning" ? "warning" : "error", message: unlocated[2]!.trim() };
    }
    if (!diagnostic) continue;
    const id = `${diagnostic.severity}|${diagnostic.file ?? ""}|${diagnostic.line ?? ""}|${diagnostic.column ?? ""}|${diagnostic.message}`;
    if (seen.has(id)) continue;
    seen.add(id);
    // Packages and generated sources are not the model's to fix; keep them but after app errors.
    (diagnostic.severity === "error" ? errors : warnings).push(diagnostic);
  }
  const appFirst = (a: Diagnostic, b: Diagnostic) =>
    Number(Boolean(a.file?.includes("DerivedData"))) - Number(Boolean(b.file?.includes("DerivedData")));
  return { errors: errors.sort(appFirst).slice(0, 100), warnings: warnings.sort(appFirst).slice(0, 50) };
}

export async function resolveDestination(runner: CommandRunner, udid?: string): Promise<string> {
  const list = await runner.run("xcrun", ["simctl", "list", "devices", "available", "--json"], { timeoutMs: 60_000 });
  if (list.exitCode === 0) {
    const simulator = chooseSimulator(parseSimulators(list.stdout), udid);
    if (simulator) return `platform=iOS Simulator,id=${simulator.udid}`;
    if (udid) throw new Error(`No available simulator with UDID ${udid}.`);
  }
  return "generic/platform=iOS Simulator";
}

export async function buildProject(
  rootDir: string,
  runner: CommandRunner,
  options: { scheme?: string; udid?: string; attempt?: number; timeoutMs?: number } = {},
): Promise<BuildResult> {
  const root = requireProjectDir(rootDir);
  const spec = await readSpec(root);
  const paths = projectPaths(root, spec.name);
  const scheme = options.scheme ?? spec.name;
  const logPath = join(paths.logs, `build-${options.attempt ?? Date.now()}.log`);
  await mkdir(paths.logs, { recursive: true });
  if (!existsSync(paths.xcodeproj)) {
    return {
      success: false,
      errors: [{ severity: "error", message: `${spec.name}.xcodeproj does not exist. Regenerate the project (XcodeGen) before building.` }],
      warnings: [],
      durationMs: 0,
      scheme,
      destination: "",
      logPath,
      toolError: "missing-project",
    };
  }
  const destination = await resolveDestination(runner, options.udid);
  const args = [
    "-project", `${spec.name}.xcodeproj`,
    "-scheme", scheme,
    "-configuration", "Debug",
    "-destination", destination,
    "-derivedDataPath", paths.derivedData,
    "CODE_SIGNING_ALLOWED=NO",
    "build",
  ];
  const result = await runner.run("xcodebuild", args, { cwd: root, timeoutMs: options.timeoutMs ?? 15 * 60_000 });
  const log = `$ xcodebuild ${args.join(" ")}\n${result.stdout}\n${result.stderr}`;
  await writeFile(logPath, log);
  const parsed = parseBuildOutput(`${result.stdout}\n${result.stderr}`, root);
  const appPath = join(paths.derivedData, "Build", "Products", "Debug-iphonesimulator", `${spec.name}.app`);
  const success = result.exitCode === 0 && parsed.errors.length === 0;
  if (!success && !parsed.errors.length) {
    const reason = result.spawnError
      ? `xcodebuild could not start (${result.spawnError}). Install Xcode and run ios_preflight.`
      : result.timedOut
        ? `xcodebuild timed out after ${Math.round(result.durationMs / 1000)} s.`
        : `xcodebuild exited with ${result.exitCode} without a parseable diagnostic; see ${relative(root, logPath)}.`;
    parsed.errors.push({ severity: "error", message: reason });
  }
  return {
    success,
    errors: parsed.errors,
    warnings: parsed.warnings,
    durationMs: result.durationMs,
    scheme,
    destination,
    ...(success && existsSync(appPath) ? { appPath } : {}),
    logPath,
    ...(result.spawnError ? { toolError: result.spawnError } : {}),
  };
}
