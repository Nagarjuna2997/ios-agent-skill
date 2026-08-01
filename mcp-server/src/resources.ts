import { resolve } from "node:path";

import { analyzeConcurrency } from "./analyzers/concurrency.js";
import { analyzeArchitecture } from "./analyzers/architecture.js";
import { analyzeSwiftUI } from "./analyzers/swiftui.js";
import { analyzeAvailability } from "./analyzers/availability.js";
import { analyzeAppStore, analyzeProjectLevelAppStore } from "./analyzers/appstore.js";
import { analyzeMemory } from "./analyzers/memory.js";
import { analyzeSecurity } from "./analyzers/security.js";
import { analyzeTesting, analyzeTestCoverage } from "./analyzers/testing.js";
import { analyzePerformance } from "./analyzers/performance.js";
import { Finding, sortFindings } from "./analyzers/types.js";
import {
  readProjectContext,
  readSwiftFiles,
  resolveProjectRoot,
  summarizeProject,
} from "./scan.js";

/**
 * Resource-backed project state.
 *
 * Tools are verbs the model chooses to call. Resources are nouns a client can
 * read without being asked — so `ios://project/info` lets a client attach the
 * project's shape to context up front, instead of the model having to think to
 * run an analysis first.
 *
 * WHY THERE IS A CONFIGURED ROOT
 *
 * Resources are addressed by a fixed URI with no arguments, so `ios://project/…`
 * only means something if the server knows which project it is. MCP clients
 * already configure servers per project — `.cursor/mcp.json` lives in the
 * repository, `claude mcp add` is run from it — so a root passed at launch fits
 * how the server is actually deployed.
 *
 * WHY THERE IS NO ios://project/build-status
 *
 * It would have to run `xcodebuild`. That needs macOS and Xcode, and it breaks
 * the `filesystem: read, network: none` contract that lets this package install
 * anywhere in ~26 KB. Build and simulator state belong in the separate package
 * that already requires a full toolchain — see ROADMAP.md.
 */

/** Resolve the project root from an explicit flag, the environment, or cwd. */
export function projectRootFrom(argv: string[], env: NodeJS.ProcessEnv): string {
  const flagIndex = argv.indexOf("--project");
  if (flagIndex !== -1 && argv[flagIndex + 1]) {
    return resolve(argv[flagIndex + 1]);
  }
  if (env.IOS_AGENT_PROJECT) {
    return resolve(env.IOS_AGENT_PROJECT);
  }
  return resolve(env.PWD ?? process.cwd());
}

export interface ResourcePayload {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Every resource states the root it used.
 *
 * The root is implicit — it comes from a flag, the environment, or the working
 * directory the client happened to spawn the server in. A reader who cannot see
 * which of those won has no way to tell an empty project from a wrong path.
 */
function payload(uri: string, body: Record<string, unknown>): ResourcePayload {
  return {
    uri,
    mimeType: "application/json",
    text: `${JSON.stringify(body, null, 2)}\n`,
  };
}

function unavailable(uri: string, root: string, reason: string): ResourcePayload {
  return payload(uri, {
    project_root: root,
    available: false,
    reason,
    fix: "Launch the server with `--project /path/to/project`, or set IOS_AGENT_PROJECT. MCP clients usually set this in the per-project config file.",
  });
}

/** Scan once; every resource in a read is served from the same snapshot. */
async function snapshot(root: string) {
  const resolved = await resolveProjectRoot(root);
  const [files, context] = await Promise.all([
    readSwiftFiles(resolved),
    readProjectContext(resolved),
  ]);
  return { resolved, files, context };
}

export async function projectInfoResource(
  uri: string,
  root: string,
): Promise<ResourcePayload> {
  try {
    const { resolved, files } = await snapshot(root);
    if (files.length === 0) {
      return unavailable(uri, resolved, "No Swift files found under this path.");
    }

    const summary = await summarizeProject(resolved, files);
    return payload(uri, {
      project_root: resolved,
      available: true,
      swift_files: summary.swiftFileCount,
      lines: summary.lineCount,
      deployment_target: summary.deploymentTarget,
      swift_tools_version: summary.swiftToolsVersion,
      ui_framework: summary.uiFramework,
      architecture: summary.architecture,
      // The evidence ships with the verdict. "MVVM" alone is a guess presented
      // as a fact; the reader must be able to check it.
      architecture_evidence: summary.architectureEvidence,
      uses_dependency_injection: summary.usesDependencyInjection,
      has_tests: summary.hasTests,
      has_package_swift: summary.hasPackageSwift,
      has_xcode_project: summary.hasXcodeProject,
      frameworks: summary.frameworks,
    });
  } catch (error) {
    return unavailable(
      uri,
      root,
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function projectDependenciesResource(
  uri: string,
  root: string,
): Promise<ResourcePayload> {
  try {
    const { resolved, files } = await snapshot(root);
    const summary = await summarizeProject(resolved, files);
    return payload(uri, {
      project_root: resolved,
      available: true,
      third_party: summary.dependencies,
      // Apple frameworks are not dependencies you manage, but they are the
      // best available signal for what the app actually does.
      apple_frameworks: summary.frameworks,
    });
  } catch (error) {
    return unavailable(
      uri,
      root,
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function projectIssuesResource(
  uri: string,
  root: string,
): Promise<ResourcePayload> {
  try {
    const { resolved, files, context } = await snapshot(root);
    if (files.length === 0) {
      return unavailable(uri, resolved, "No Swift files found under this path.");
    }

    const categories: Record<string, Finding[]> = {
      concurrency: files.flatMap(analyzeConcurrency),
      architecture: files.flatMap(analyzeArchitecture),
      swiftui: files.flatMap(analyzeSwiftUI),
      availability: files.flatMap(analyzeAvailability),
      memory: files.flatMap(analyzeMemory),
      security: files.flatMap(analyzeSecurity),
      performance: files.flatMap(analyzePerformance),
      testing: [...analyzeTestCoverage(files), ...files.flatMap(analyzeTesting)],
      app_store: [
        ...analyzeProjectLevelAppStore(context),
        ...files.flatMap((file) => analyzeAppStore(file, context)),
      ],
    };

    const all = sortFindings(Object.values(categories).flat());

    return payload(uri, {
      project_root: resolved,
      available: true,
      files_checked: files.length,
      counts: {
        blocker: all.filter((f) => f.severity === "blocker").length,
        serious: all.filter((f) => f.severity === "serious").length,
        minor: all.filter((f) => f.severity === "minor").length,
        total: all.length,
      },
      by_category: Object.fromEntries(
        Object.entries(categories).map(([name, found]) => [name, found.length]),
      ),
      // Capped: a resource is attached to context wholesale, so an unbounded
      // list would crowd out the conversation it is meant to inform.
      issues: all.slice(0, 100),
      truncated: all.length > 100 ? all.length - 100 : 0,
    });
  } catch (error) {
    return unavailable(
      uri,
      root,
      error instanceof Error ? error.message : String(error),
    );
  }
}
