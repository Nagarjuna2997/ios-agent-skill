// Capability verification: build each capability into a minimal app on this
// Mac. A capability may only be marked verified after this passes and writes
// verification.json next to its manifest.
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { applyCapabilities, loadCapabilities, resolveCapabilities, type LoadedCapability } from "./capabilities.js";
import { buildProject } from "./build.js";
import { initProject, readSpec, regenerate, writeProjectFiles, writeSpec, containedPath } from "./project.js";
import type { CommandRunner } from "./runner.js";
import { preflight } from "./toolchain.js";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface VerifyOutcome {
  status: "verified" | "failed" | "blocked";
  reason?: string;
  errors?: Array<{ file?: string; line?: number; message: string }>;
  toolchain?: string;
}

export interface VerificationRecord extends VerifyOutcome {
  id: string;
  checkedAt: string;
}

async function buildMinimalApp(capability: LoadedCapability, all: Map<string, LoadedCapability>, runner: CommandRunner, extraFiles: Record<string, string>, keep: boolean): Promise<VerifyOutcome> {
  const check = await preflight(runner);
  const toolchain = check.toolchain.xcode ? `Xcode ${check.toolchain.xcode.version}${check.toolchain.xcode.build ? ` (${check.toolchain.xcode.build})` : ""}` : undefined;
  const blocking = check.checks.filter((c) => !c.ok && ["xcode", "simulator-sdk", "simulator"].includes(c.id));
  if (blocking.length) {
    return {
      status: "blocked",
      reason: `Preflight failed: ${blocking.map((c) => c.id).join(", ")}`,
      ...(toolchain ? { toolchain } : {}),
    };
  }
  const work = await mkdtemp(join(tmpdir(), `ios-agent-verify-${capability.manifest.id}-`));
  try {
    const root = join(work, "VerifyApp");
    await initProject({ projectDir: root, name: "VerifyApp", capabilities: [] });
    const spec = await readSpec(root);
    const resolution = resolveCapabilities([capability.manifest.id], all);
    const writer = {
      async writeSourceFile(path: string, content: string | Uint8Array) {
        const target = await containedPath(root, `${spec.name}/${path}`);
        await mkdir(dirname(target), { recursive: true });
        if (existsSync(target)) return "kept" as const;
        await writeFile(target, content);
        return "written" as const;
      },
    };
    const { spec: next } = await applyCapabilities(spec, resolution.ordered, writer);
    await writeSpec(root, next);
    if (Object.keys(extraFiles).length) {
      await writeProjectFiles(root, Object.entries(extraFiles).map(([path, content]) => ({ path: `${next.name}/${path}`, content })), runner);
    }
    const regen = await regenerate(root, next, runner);
    if (!regen.generated) return { status: "failed", reason: `XcodeGen failed: ${regen.reason}`, ...(toolchain ? { toolchain } : {}) };
    const build = await buildProject(root, runner, { attempt: 1 });
    return build.success
      ? { status: "verified", ...(toolchain ? { toolchain } : {}) }
      : {
          status: "failed",
          reason: `${build.errors.length} build error(s)`,
          errors: build.errors.slice(0, 20).map((e) => ({ ...(e.file ? { file: e.file } : {}), ...(e.line ? { line: e.line } : {}), message: e.message })),
          ...(toolchain ? { toolchain } : {}),
        };
  } finally {
    if (!keep) await rm(work, { recursive: true, force: true });
  }
}

export async function verifyCapability(id: string, runner: CommandRunner, options: { dir?: string; keep?: boolean } = {}): Promise<VerificationRecord> {
  const all = await loadCapabilities(options.dir);
  const capability = all.get(id);
  if (!capability) throw new Error(`Unknown capability ${id}`);
  const context = {
    id,
    buildMinimalApp: (extraFiles: Record<string, string> = {}) => buildMinimalApp(capability, all, runner, extraFiles, options.keep ?? false),
  };
  let outcome: VerifyOutcome;
  if (capability.verifyModule?.endsWith(".js")) {
    const module = (await import(pathToFileURL(capability.verifyModule).href)) as { default?: (ctx: typeof context) => Promise<VerifyOutcome> };
    outcome = module.default ? await module.default(context) : await context.buildMinimalApp();
  } else {
    outcome = await context.buildMinimalApp();
  }
  return { id, checkedAt: new Date().toISOString(), ...outcome };
}

/** Record a passing verification next to the source manifest and mark it verified. Other outcomes only record. */
export async function recordVerification(sourceCapabilitiesDir: string, record: VerificationRecord): Promise<void> {
  const folder = join(sourceCapabilitiesDir, record.id);
  await writeFile(join(folder, "verification.json"), JSON.stringify(record, null, 2) + "\n");
  const manifestPath = join(folder, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
  if (record.status === "verified") {
    manifest.status = "verified";
    manifest.statusNote = `Built into a minimal app with ${record.toolchain ?? "Xcode"} on ${record.checkedAt.slice(0, 10)}.`;
  } else if (record.status === "failed") {
    manifest.status = "untested";
    manifest.statusNote = `Last verification failed on ${record.checkedAt.slice(0, 10)}: ${record.reason ?? "build failed"}.`;
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
