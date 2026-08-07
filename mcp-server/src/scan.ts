import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { SourceFile } from "./analyzers/types.js";
import { ProjectContext } from "./analyzers/appstore.js";

const SKIP_DIRS = new Set([
  ".git", ".build", "DerivedData", "Pods", "Carthage",
  "node_modules", ".swiftpm", "build", "vendor", "Vendor",
]);

const MAX_FILES = 2000;
const MAX_FILE_BYTES = 512 * 1024;

/** Walk a directory collecting paths that match `accept`. */
async function walk(
  root: string,
  accept: (path: string) => boolean,
  limit: number,
): Promise<string[]> {
  const found: string[] = [];

  async function visit(dir: string): Promise<void> {
    if (found.length >= limit) return;

    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return; // unreadable directory — skip rather than fail the whole scan
    }

    for (const entry of entries) {
      if (found.length >= limit) return;
      const full = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.endsWith(".xcodeproj")) continue;
        await visit(full);
      } else if (accept(full)) {
        found.push(full);
      }
    }
  }

  await visit(root);
  return found;
}

/**
 * Resolve and validate a project root.
 *
 * Rejects paths that do not exist or are not directories, so a typo produces a
 * clear error rather than an empty, falsely-clean report.
 */
export async function resolveProjectRoot(path: string): Promise<string> {
  const root = resolve(path);
  let info;
  try {
    info = await stat(root);
  } catch {
    throw new Error(`Path does not exist: ${root}`);
  }
  if (!info.isDirectory()) {
    throw new Error(`Not a directory: ${root}`);
  }
  return root;
}

/**
 * Is this a package manifest rather than application source?
 *
 * `Package.swift` and its versioned variants are build configuration. Analyzing
 * them inflates file counts and produces findings against code that is not part
 * of the app.
 */
function isManifest(path: string): boolean {
  return /(^|\/)Package(@swift-[\d.]+)?\.swift$/.test(path.split(sep).join("/"));
}

/** Read every Swift source file under `root`, capped for safety. */
export async function readSwiftFiles(root: string): Promise<SourceFile[]> {
  const paths = await walk(
    root,
    (p) => p.endsWith(".swift") && !isManifest(p),
    MAX_FILES,
  );
  const files: SourceFile[] = [];

  for (const path of paths) {
    try {
      const info = await stat(path);
      if (info.size > MAX_FILE_BYTES) continue;
      const content = await readFile(path, "utf8");
      files.push({ path: relative(root, path).split(sep).join("/"), content });
    } catch {
      // Unreadable file — skip it rather than aborting the scan.
    }
  }

  return files;
}

/** Gather the project-level context the App Store checks need. */
export async function readProjectContext(root: string): Promise<ProjectContext> {
  const plists = await walk(root, (p) => p.endsWith("Info.plist"), 20);
  const manifests = await walk(root, (p) => p.endsWith("PrivacyInfo.xcprivacy"), 5);

  let infoPlist = "";
  for (const path of plists) {
    try {
      infoPlist += await readFile(path, "utf8");
    } catch {
      // ignore
    }
  }

  // An Info.plist or an Xcode project means this is an app target, not a
  // library. App Store rules only apply to the former.
  const xcodeprojs = await walk(root, (p) => p.endsWith(".pbxproj"), 3);
  const isApp = plists.length > 0 || xcodeprojs.length > 0;

  return { infoPlist, hasPrivacyManifest: manifests.length > 0, isApp };
}

export interface ProjectSummary {
  swiftFileCount: number;
  lineCount: number;
  deploymentTarget: string | null;
  swiftToolsVersion: string | null;
  frameworks: string[];
  hasTests: boolean;
  hasPackageSwift: boolean;
  hasXcodeProject: boolean;
  /** SwiftUI, UIKit, both, or neither — inferred from imports. */
  uiFramework: "SwiftUI" | "UIKit" | "SwiftUI + UIKit" | "unknown";
  /** Best-effort architecture read. Evidence is reported alongside it. */
  architecture: string;
  architectureEvidence: string[];
  /** Third-party packages, from Package.swift / Podfile / project.pbxproj. */
  dependencies: string[];
  /** True when at least one dependency crosses an injected protocol boundary. */
  usesDependencyInjection: boolean;
}

/**
 * Infer the architecture from file naming and type shape.
 *
 * Deliberately reports EVIDENCE rather than a bare verdict. "MVVM" with nothing
 * behind it is a guess presented as a fact; "MVVM — 12 *ViewModel/*Model types,
 * Views/ and ViewModels/ directories" is a claim the reader can check. When the
 * signals are weak it says so instead of picking the most popular answer.
 */
function inferArchitecture(files: SourceFile[]): {
  architecture: string;
  evidence: string[];
} {
  const paths = files.map((f) => f.path);
  const evidence: string[] = [];

  const count = (test: RegExp) => paths.filter((p) => test.test(p)).length;
  const typeCount = (test: RegExp) =>
    files.filter((f) => test.test(f.content)).length;

  const viewModels = typeCount(/\b(?:final\s+)?class\s+\w*(?:ViewModel|Model)\b/);
  const useCases = count(/UseCases?\//i) + typeCount(/protocol\s+\w*UseCase\b/);
  const repositories = typeCount(/protocol\s+\w*Repository\b/);
  const coordinators = typeCount(/\bclass\s+\w*Coordinator\b/);
  const stores = typeCount(/\b(?:struct|enum)\s+\w*(?:Reducer|Feature)\b/) +
    typeCount(/import\s+ComposableArchitecture/);

  const hasLayerDirs =
    count(/(^|\/)(Domain|Data|Presentation)\//i) >= 2;
  const hasMVVMDirs = count(/(^|\/)ViewModels?\//i) > 0 && count(/(^|\/)Views?\//i) > 0;

  if (stores > 0) {
    evidence.push(`${stores} Reducer/Feature type(s) or a ComposableArchitecture import`);
    return { architecture: "The Composable Architecture", evidence };
  }

  if (hasLayerDirs || (useCases > 0 && repositories > 0)) {
    if (hasLayerDirs) evidence.push("Domain/, Data/, and Presentation/ directories");
    if (useCases > 0) evidence.push(`${useCases} use-case protocol(s) or a UseCases/ directory`);
    if (repositories > 0) evidence.push(`${repositories} repository protocol(s)`);
    return { architecture: "Clean Architecture", evidence };
  }

  if (coordinators > 0) {
    evidence.push(`${coordinators} Coordinator type(s)`);
    if (viewModels > 0) evidence.push(`${viewModels} view-model type(s)`);
    return { architecture: "MVVM + Coordinator", evidence };
  }

  if (viewModels > 0 || hasMVVMDirs) {
    if (viewModels > 0) evidence.push(`${viewModels} ViewModel/Model type(s)`);
    if (hasMVVMDirs) evidence.push("Views/ and ViewModels/ directories");
    return { architecture: "MVVM", evidence };
  }

  return {
    architecture: "not determined",
    evidence: ["no view-model, use-case, repository, or coordinator types found"],
  };
}

/** Third-party package names from whichever manifest the project uses. */
async function readDependencies(root: string): Promise<string[]> {
  const found = new Set<string>();

  for (const path of await walk(root, (p) => p.endsWith("Package.swift"), 5)) {
    try {
      const content = await readFile(path, "utf8");
      for (const match of content.matchAll(/url:\s*"https?:\/\/[^"]*\/([\w.-]+?)(?:\.git)?"/g)) {
        found.add(match[1]);
      }
    } catch {
      // ignore
    }
  }

  // SwiftPM through Xcode records resolved packages here.
  for (const path of await walk(root, (p) => p.endsWith("Package.resolved"), 5)) {
    try {
      const content = await readFile(path, "utf8");
      for (const match of content.matchAll(/"(?:identity|package)"\s*:\s*"([^"]+)"/g)) {
        found.add(match[1]);
      }
    } catch {
      // ignore
    }
  }

  for (const path of await walk(root, (p) => /(^|\/)Podfile$/.test(p), 3)) {
    try {
      const content = await readFile(path, "utf8");
      for (const match of content.matchAll(/^\s*pod\s+['"]([^'"\/]+)/gm)) {
        found.add(match[1]);
      }
    } catch {
      // ignore
    }
  }

  return [...found].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/** A structural overview of the project, independent of rule violations. */
export async function summarizeProject(
  root: string,
  files: SourceFile[],
): Promise<ProjectSummary> {
  const frameworks = new Set<string>();
  let lineCount = 0;

  for (const file of files) {
    lineCount += file.content.split("\n").length;
    for (const match of file.content.matchAll(/^\s*import\s+(\w+)/gm)) {
      frameworks.add(match[1]);
    }
  }

  let deploymentTarget: string | null = null;
  let swiftToolsVersion: string | null = null;

  const packages = await walk(root, (p) => p.endsWith("Package.swift"), 5);
  if (packages.length > 0) {
    try {
      const content = await readFile(packages[0], "utf8");
      swiftToolsVersion = /swift-tools-version:\s*([\d.]+)/.exec(content)?.[1] ?? null;
      deploymentTarget = /\.iOS\(\.v(\d+)\)/.exec(content)?.[1] ?? null;
    } catch {
      // ignore
    }
  }

  if (!deploymentTarget) {
    const pbxproj = await walk(root, (p) => p.endsWith("project.pbxproj"), 3);
    if (pbxproj.length > 0) {
      try {
        const content = await readFile(pbxproj[0], "utf8");
        deploymentTarget = /IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+)/.exec(content)?.[1] ?? null;
      } catch {
        // ignore
      }
    }
  }

  const xcodeprojs = await walk(root, (p) => p.endsWith(".pbxproj"), 3);
  const { architecture, evidence } = inferArchitecture(files);
  const dependencies = await readDependencies(root);

  const usesSwiftUI = frameworks.has("SwiftUI");
  const usesUIKit = frameworks.has("UIKit");
  const uiFramework = usesSwiftUI && usesUIKit
    ? "SwiftUI + UIKit"
    : usesSwiftUI
      ? "SwiftUI"
      : usesUIKit
        ? "UIKit"
        : "unknown";

  // An injected protocol existential in an initializer is the signal. A project
  // that only ever constructs concrete types has no seam, whatever it is called.
  const usesDependencyInjection = files.some((file) =>
    /init\s*\([^)]*:\s*any\s+\w+/.test(file.content),
  );

  return {
    swiftFileCount: files.length,
    lineCount,
    deploymentTarget,
    swiftToolsVersion,
    frameworks: [...frameworks].sort(),
    hasTests: files.some((f) => /Tests?\.swift$/.test(f.path)),
    hasPackageSwift: packages.length > 0,
    hasXcodeProject: xcodeprojs.length > 0,
    uiFramework,
    architecture,
    architectureEvidence: evidence,
    dependencies,
    usesDependencyInjection,
  };
}
