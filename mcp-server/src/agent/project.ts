// Project workspace operations: create, write files, add packages, regenerate.
// Every write is confined to the project directory the caller chose; paths
// with "..", absolute paths, hidden segments and symlinked parents are refused.
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { z } from "zod";
import { commandFailed, type CommandRunner } from "./runner.js";
import { renderXcodeProject } from "./xcodeproj.js";
import {
  GITIGNORE,
  PackageSchema,
  newAppSpec,
  parseDotEnv,
  renderBaseXcconfig,
  renderEnvExample,
  renderProjectYml,
  renderSecretsXcconfig,
  renderWidgetBundle,
  type AppSpec,
  type PackageDependency,
} from "./spec.js";

export const AGENT_DIR = ".ios-agent";

export interface ProjectPaths {
  root: string;
  agent: string;
  spec: string;
  state: string;
  toolLog: string;
  derivedData: string;
  logs: string;
  screenshots: string;
  sources: string;
  projectYml: string;
  xcodeproj: string;
}

export function projectPaths(root: string, name?: string): ProjectPaths {
  const agent = join(root, AGENT_DIR);
  return {
    root,
    agent,
    spec: join(agent, "spec.json"),
    state: join(agent, "state.json"),
    toolLog: join(agent, "tool-log.jsonl"),
    derivedData: join(agent, "DerivedData"),
    logs: join(agent, "logs"),
    screenshots: join(agent, "screenshots"),
    sources: join(root, name ?? "App"),
    projectYml: join(root, "project.yml"),
    xcodeproj: join(root, `${name ?? "App"}.xcodeproj`),
  };
}

export function requireProjectDir(dir: string): string {
  if (!dir || !isAbsolute(dir)) throw new Error("projectDir must be an absolute path.");
  const root = resolve(dir);
  if (root === sep || root.split(sep).filter(Boolean).length < 2) throw new Error("projectDir is too broad; choose a dedicated folder for the app.");
  return root;
}

/** Resolve a relative path inside root, refusing traversal, hidden segments and symlinked parents. */
export async function containedPath(root: string, relativePath: string): Promise<string> {
  if (!relativePath || isAbsolute(relativePath) || relativePath.includes("\\") || relativePath.includes("\0")) {
    throw new Error(`Refusing path ${JSON.stringify(relativePath)}: use a relative path with forward slashes.`);
  }
  const segments = relativePath.split("/");
  if (segments.some((s) => s === "" || s === "." || s === ".." || s.startsWith("."))) {
    throw new Error(`Refusing path ${JSON.stringify(relativePath)}: empty, relative or hidden segments are not allowed.`);
  }
  const target = resolve(root, relativePath);
  if (!target.startsWith(root + sep)) throw new Error(`Refusing path outside the project: ${relativePath}`);
  let current = root;
  for (const segment of segments.slice(0, -1)) {
    current = join(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing to write through a symbolic link: ${relative(root, current)}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") break;
      throw error;
    }
  }
  try {
    if ((await lstat(target)).isSymbolicLink()) throw new Error(`Refusing to overwrite a symbolic link: ${relativePath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return target;
}

async function atomicWrite(path: string, data: string | Buffer): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temp, data);
  await rename(temp, path);
}

export async function readSpec(root: string): Promise<AppSpec> {
  try {
    return JSON.parse(await readFile(projectPaths(root).spec, "utf8")) as AppSpec;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error("No ios-agent project here. Call ios_create_project first.");
    throw error;
  }
}

export async function writeSpec(root: string, spec: AppSpec): Promise<void> {
  await atomicWrite(projectPaths(root).spec, JSON.stringify(spec, null, 2) + "\n");
}

export interface RegenerateResult {
  generated: boolean;
  /** Which writer produced the .xcodeproj: XcodeGen, or the built-in folder-synchronized writer. */
  generator: "xcodegen" | "builtin";
  xcodeproj: string;
  missingSecrets: string[];
  reason?: string;
}

/** Re-render every derived file from the spec, then run XcodeGen. */
export async function regenerate(root: string, spec: AppSpec, runner: CommandRunner): Promise<RegenerateResult> {
  const paths = projectPaths(root, spec.name);
  await atomicWrite(paths.projectYml, renderProjectYml(spec));
  await atomicWrite(join(root, "Config", "Base.xcconfig"), renderBaseXcconfig(spec));
  for (const ext of spec.extensions ?? []) {
    if (ext.kind === "widgetkit") await atomicWrite(join(root, ext.name, `${ext.name}Bundle.swift`), renderWidgetBundle(ext));
  }
  let env: Record<string, string> = {};
  try {
    env = parseDotEnv(await readFile(join(root, ".env"), "utf8"));
  } catch {
    env = {};
  }
  const secrets = renderSecretsXcconfig(spec, env);
  await atomicWrite(join(root, "Config", "Secrets.xcconfig"), secrets.text);
  await atomicWrite(join(root, ".env.example"), renderEnvExample(spec));
  if (!existsSync(join(root, ".gitignore"))) await atomicWrite(join(root, ".gitignore"), GITIGNORE);
  // XcodeGen renders project.yml when it is installed. Without it (or with
  // IOS_AGENT_PROJECT_GENERATOR=builtin) the built-in writer renders the same
  // spec into a folder-synchronized project, so XcodeGen is optional.
  const choice = process.env.IOS_AGENT_PROJECT_GENERATOR;
  if (choice !== "builtin") {
    const result = await runner.run("xcodegen", ["generate", "--spec", "project.yml", "--project", "."], { cwd: root, timeoutMs: 120_000 });
    if (result.exitCode === 0) return { generated: true, generator: "xcodegen", xcodeproj: paths.xcodeproj, missingSecrets: secrets.missing };
    if (!result.spawnError || choice === "xcodegen") {
      return { generated: false, generator: "xcodegen", xcodeproj: paths.xcodeproj, missingSecrets: secrets.missing, reason: commandFailed(result) };
    }
  }
  const project = await renderXcodeProject(root, spec);
  for (const [path, content] of Object.entries(project.files)) await atomicWrite(join(root, path), content);
  return { generated: true, generator: "builtin", xcodeproj: paths.xcodeproj, missingSecrets: secrets.missing };
}

const STARTER = (name: string): Record<string, string> => ({
  [`${name}/App/${name}App.swift`]: `import SwiftUI

@main
struct ${name}App: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
`,
  [`${name}/App/AgentLaunch.swift`]: `import Foundation

/// The build agent uses launch arguments to select a screenshot screen and
/// seed synthetic demo data. These flags affect only the agent-launched process.
enum AgentLaunch {
    static var requestedScreen: String? {
        UserDefaults.standard.string(forKey: "ios-agent-screen")
    }

    static var usesSampleData: Bool {
        UserDefaults.standard.bool(forKey: "ios-agent-sample-data")
    }
}
`,
  [`${name}/Views/RootView.swift`]: `import SwiftUI

struct RootView: View {
    var body: some View {
        ContentUnavailableView("${name}", systemImage: "hammer", description: Text("The agent replaces this view with the planned screens."))
    }
}

#Preview {
    RootView()
}
`,
  [`${name}/Resources/Assets.xcassets/Contents.json`]: `{\n  "info" : { "author" : "xcode", "version" : 1 }\n}\n`,
});

export const CreateProjectInput = z
  .object({
    projectDir: z.string().min(1),
    name: z.string().min(1),
    bundleId: z.string().optional(),
    displayName: z.string().max(30).optional(),
    deploymentTarget: z.string().optional(),
    capabilities: z.array(z.string()).default([]),
  })
  .strict();

export interface CreatedProject {
  root: string;
  name: string;
  scheme: string;
  bundleId: string;
  deploymentTarget: string;
  projectYml: string;
  xcodeproj: string;
  generated: boolean;
  generateError?: string;
  files: string[];
  missingSecrets: string[];
}

/** Create the folder layout and spec; capabilities are applied by the caller before regeneration. */
export async function initProject(input: z.infer<typeof CreateProjectInput>): Promise<{ root: string; spec: AppSpec; files: string[] }> {
  const root = requireProjectDir(input.projectDir);
  if (existsSync(projectPaths(root).spec)) throw new Error("An ios-agent project already exists in this folder. Use a new folder, or resume/refine the existing run.");
  const spec = newAppSpec({
    name: input.name,
    ...(input.bundleId ? { bundleId: input.bundleId } : {}),
    ...(input.displayName ? { displayName: input.displayName } : {}),
    ...(input.deploymentTarget ? { deploymentTarget: input.deploymentTarget } : {}),
  });
  await mkdir(root, { recursive: true });
  const files: string[] = [];
  for (const [path, content] of Object.entries(STARTER(spec.name))) {
    await atomicWrite(await containedPath(root, path), content);
    files.push(path);
  }
  await writeSpec(root, spec);
  return { root, spec, files };
}

export const FileChange = z
  .object({
    path: z.string().min(1).max(300),
    content: z.string().max(512 * 1024).optional(),
    encoding: z.enum(["utf8", "base64"]).default("utf8"),
    delete: z.boolean().default(false),
  })
  .strict()
  .refine((f) => f.delete || f.content !== undefined, "content is required unless delete is true");
export type FileChangeInput = z.input<typeof FileChange>;

const ALLOWED_EXTENSIONS = /\.(swift|json|strings|xcstrings|stringsdict|png|jpg|jpeg|pdf|svg|lottie|riv|html|css|js|md|txt|usdz|reality|xcprivacy|storekit|gpx|mp3|m4a|wav|mp4|ttf|otf)$/i;

export interface WriteResult {
  written: string[];
  deleted: string[];
  created: string[];
  regenerated: boolean;
  regenerateError?: string;
}

/** Write app source and resources under `<Name>/`. Adding or removing files regenerates the Xcode project. */
export async function writeProjectFiles(rootDir: string, changes: FileChangeInput[], runner: CommandRunner): Promise<WriteResult> {
  const root = requireProjectDir(rootDir);
  const spec = await readSpec(root);
  if (changes.length > 200) throw new Error("At most 200 files per call.");
  const parsed = changes.map((c) => FileChange.parse(c));
  const result: WriteResult = { written: [], deleted: [], created: [], regenerated: false };
  for (const change of parsed) {
    if (!change.path.startsWith(`${spec.name}/`)) throw new Error(`Write app files under ${spec.name}/ (got ${change.path}). Project settings change through capabilities and packages.`);
    if (!ALLOWED_EXTENSIONS.test(change.path) && !change.path.includes(".xcassets/")) throw new Error(`Unsupported file type: ${change.path}`);
    const target = await containedPath(root, change.path);
    if (change.delete) {
      if (existsSync(target)) {
        await rm(target, { force: true });
        result.deleted.push(change.path);
      }
      continue;
    }
    const isNew = !existsSync(target);
    const data = change.encoding === "base64" ? Buffer.from(change.content!, "base64") : change.content!;
    await atomicWrite(target, data);
    result.written.push(change.path);
    if (isNew) result.created.push(change.path);
  }
  if (result.created.length || result.deleted.length || !existsSync(projectPaths(root, spec.name).xcodeproj)) {
    const regen = await regenerate(root, spec, runner);
    result.regenerated = regen.generated;
    if (!regen.generated && regen.reason) result.regenerateError = regen.reason;
  }
  return result;
}

export async function addPackage(rootDir: string, input: PackageDependency, runner: CommandRunner): Promise<{ spec: AppSpec; regenerate: RegenerateResult }> {
  const root = requireProjectDir(rootDir);
  const pkg = PackageSchema.parse(input);
  const spec = await readSpec(root);
  const existing = spec.packages.find((p) => p.name === pkg.name || p.url === pkg.url);
  if (existing && (existing.url !== pkg.url || existing.name !== pkg.name)) throw new Error(`Package ${pkg.name} conflicts with existing ${existing.name} (${existing.url}).`);
  spec.packages = [...spec.packages.filter((p) => p.name !== pkg.name), existing ? { ...pkg, products: [...new Set([...existing.products, ...pkg.products])] } : pkg];
  await writeSpec(root, spec);
  return { spec, regenerate: await regenerate(root, spec, runner) };
}
