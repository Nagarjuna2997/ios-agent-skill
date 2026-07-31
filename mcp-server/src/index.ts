#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { Finding } from "./analyzers/types.js";
import { analyzeConcurrency } from "./analyzers/concurrency.js";
import { analyzeArchitecture } from "./analyzers/architecture.js";
import { analyzeSwiftUI } from "./analyzers/swiftui.js";
import { analyzeAvailability } from "./analyzers/availability.js";
import { analyzeAppStore, analyzeProjectLevelAppStore } from "./analyzers/appstore.js";
import {
  readProjectContext,
  readSwiftFiles,
  resolveProjectRoot,
  summarizeProject,
} from "./scan.js";
import { renderFindings } from "./report.js";

const VERSION = "2.0.1";

/**
 * Handle CLI flags before starting the stdio transport.
 *
 * Without this, `ios-agent-mcp --help` starts the server and blocks on stdin
 * forever — indistinguishable from a hang, and the first thing someone tries
 * after installing. MCP clients spawn the binary with no arguments, so this
 * never interferes with normal operation.
 */
function handleCLIFlags(argv: string[]): boolean {
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return true;
  }

  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      [
        `ios-agent-mcp ${VERSION}`,
        "",
        "An MCP server that reviews Swift projects for iOS-specific defects.",
        "",
        "This is a Model Context Protocol server. It speaks JSON-RPC over stdio",
        "and is meant to be launched by an MCP client, not run directly.",
        "",
        "USAGE",
        "  ios-agent-mcp              Start the server (stdio transport)",
        "  ios-agent-mcp --help       Show this message",
        "  ios-agent-mcp --version    Print the version",
        "",
        "SETUP",
        "  Claude Code     claude mcp add ios-agent -- npx -y ios-agent-mcp",
        "  Claude Desktop  add to claude_desktop_config.json",
        "  Cursor          add to .cursor/mcp.json",
        "",
        "TOOLS",
        "  analyze_swift_project        Overview plus findings per category",
        "  review_swift_concurrency     Actor isolation and Swift 6 concurrency",
        "  review_swift_architecture    Layer boundaries and testability",
        "  review_swiftui               Views, state, Dynamic Type, tokens",
        "  check_availability_guards    Missing and over-restrictive @available",
        "  audit_app_store_readiness    Purpose strings, privacy, accessibility",
        "",
        "Each tool takes one argument: an absolute path to a Swift project root.",
        "",
        "DOCS  https://github.com/Nagarjuna2997/ios-agent-skill/tree/main/docs/mcp",
        "",
      ].join("\n"),
    );
    return true;
  }

  return false;
}

if (handleCLIFlags(process.argv.slice(2))) {
  process.exit(0);
}

const server = new McpServer({
  name: "ios-agent-mcp",
  version: VERSION,
});

const pathInput = {
  path: z
    .string()
    .describe("Absolute path to the Swift project root (the folder containing Package.swift or the .xcodeproj)."),
};

/** Shared plumbing: resolve, scan, analyze, render — with real errors on bad input. */
async function scanAndRender(
  path: string,
  title: string,
  analyze: (files: Awaited<ReturnType<typeof readSwiftFiles>>) => Promise<Finding[]> | Finding[],
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const root = await resolveProjectRoot(path);
    const files = await readSwiftFiles(root);

    if (files.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No Swift files found under \`${root}\`.\n\nCheck the path points at the project root. Build directories (\`.build\`, \`DerivedData\`, \`Pods\`) are skipped deliberately.`,
          },
        ],
      };
    }

    const findings = await analyze(files);
    return {
      content: [{ type: "text", text: renderFindings(title, findings, files.length) }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Scan failed: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

server.registerTool(
  "review_swift_concurrency",
  {
    title: "Review Swift concurrency and actor isolation",
    description:
      "Check a Swift project for Swift 6 concurrency and isolation defects: @Observable types missing @MainActor, Task.detached, DispatchQueue.main.async in async code, @unchecked Sendable, nonisolated(unsafe), unstructured Tasks in onAppear, empty catch blocks, and types named Task that shadow _Concurrency.Task. Use when reviewing Swift code, migrating to Swift 6, or diagnosing a data race.",
    inputSchema: pathInput,
  },
  async ({ path }) =>
    scanAndRender(path, "Swift Concurrency Review", (files) =>
      files.flatMap(analyzeConcurrency),
    ),
);

server.registerTool(
  "review_swift_architecture",
  {
    title: "Review iOS architecture boundaries",
    description:
      "Check a Swift project for architecture and testability defects: dependencies defaulting to live implementations, the presentation layer naming concrete data-layer types (URLSession, APIClient, ModelContext), singletons resolved inside view models, the domain layer importing UI frameworks, nested NavigationStacks, and deprecated NavigationView. Use when reviewing MVVM or Clean Architecture code, or when a screen cannot be previewed without a network.",
    inputSchema: pathInput,
  },
  async ({ path }) =>
    scanAndRender(path, "Architecture Review", (files) =>
      files.flatMap(analyzeArchitecture),
    ),
);

server.registerTool(
  "review_swiftui",
  {
    title: "Review SwiftUI views and state",
    description:
      "Check SwiftUI code for view and state defects: fixed font sizes and heights that break Dynamic Type, AnyView, deprecated .cornerRadius, literal spacing values instead of design tokens, materials applied over solid backgrounds, transient presentation state stored on models, legacy ObservableObject and @EnvironmentObject, and try!. Use when reviewing or building SwiftUI screens.",
    inputSchema: pathInput,
  },
  async ({ path }) =>
    scanAndRender(path, "SwiftUI Review", (files) => files.flatMap(analyzeSwiftUI)),
);

server.registerTool(
  "check_availability_guards",
  {
    title: "Check iOS availability guards",
    description:
      "Verify that version-gated Apple APIs are guarded on the version where they were INTRODUCED rather than the newest SDK. Catches both missing guards and over-restrictive ones — for example Liquid Glass (iOS 26) guarded at iOS 27, which silently drops every iOS 26 device to the fallback. Also flags Foundation Models used without a runtime SystemLanguageModel.availability check. Use before shipping, or after bumping an SDK.",
    inputSchema: pathInput,
  },
  async ({ path }) =>
    scanAndRender(path, "Availability Guard Check", (files) =>
      files.flatMap(analyzeAvailability),
    ),
);

server.registerTool(
  "audit_app_store_readiness",
  {
    title: "Audit App Store submission readiness",
    description:
      "Check a Swift project for issues that cause App Store rejection or runtime termination: permission-gated frameworks used without an Info.plist purpose string, a missing PrivacyInfo.xcprivacy manifest, unlocalized user-facing strings, icon-only buttons with no accessibility label, and print() used for logging. Use before submitting to App Review.",
    inputSchema: pathInput,
  },
  async ({ path }) => {
    try {
      const root = await resolveProjectRoot(path);
      const [files, context] = await Promise.all([
        readSwiftFiles(root),
        readProjectContext(root),
      ]);
      const findings = [
        ...analyzeProjectLevelAppStore(context),
        ...files.flatMap((file) => analyzeAppStore(file, context)),
      ];
      return {
        content: [
          {
            type: "text" as const,
            text: renderFindings("App Store Readiness Audit", findings, files.length),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Audit failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "analyze_swift_project",
  {
    title: "Analyze a Swift project",
    description:
      "Produce an overview of a Swift project — file and line counts, deployment target, Swift tools version, frameworks in use, whether tests exist — together with a summary count of findings across every rule category (concurrency, architecture, SwiftUI, availability, App Store). Use this first when you are unfamiliar with a codebase, then run the focused tools on whichever category has findings.",
    inputSchema: pathInput,
  },
  async ({ path }) => {
    try {
      const root = await resolveProjectRoot(path);
      const [files, context] = await Promise.all([
        readSwiftFiles(root),
        readProjectContext(root),
      ]);
      const summary = await summarizeProject(root, files);

      const categories = {
        Concurrency: files.flatMap(analyzeConcurrency),
        Architecture: files.flatMap(analyzeArchitecture),
        SwiftUI: files.flatMap(analyzeSwiftUI),
        Availability: files.flatMap(analyzeAvailability),
        "App Store": [
          ...analyzeProjectLevelAppStore(context),
          ...files.flatMap((file) => analyzeAppStore(file, context)),
        ],
      };

      const lines: string[] = [
        "# Swift Project Analysis",
        "",
        "## Structure",
        "",
        `- **Swift files:** ${summary.swiftFileCount}`,
        `- **Lines:** ${summary.lineCount.toLocaleString()}`,
        `- **Deployment target:** ${summary.deploymentTarget ? `iOS ${summary.deploymentTarget}` : "not detected"}`,
        `- **Swift tools version:** ${summary.swiftToolsVersion ?? "not detected"}`,
        `- **Package.swift:** ${summary.hasPackageSwift ? "yes" : "no"}`,
        `- **Xcode project:** ${summary.hasXcodeProject ? "yes" : "no"}`,
        `- **Test files:** ${summary.hasTests ? "found" : "**none found**"}`,
        "",
        `- **Frameworks:** ${summary.frameworks.slice(0, 25).join(", ") || "none detected"}`,
        "",
        "## Findings by category",
        "",
        "| Category | 🔴 Blocker | 🟠 Serious | 🟡 Minor | Tool |",
        "|---|---:|---:|---:|---|",
      ];

      const toolFor: Record<string, string> = {
        Concurrency: "review_swift_concurrency",
        Architecture: "review_swift_architecture",
        SwiftUI: "review_swiftui",
        Availability: "check_availability_guards",
        "App Store": "audit_app_store_readiness",
      };

      let total = 0;
      for (const [name, findings] of Object.entries(categories)) {
        const blocker = findings.filter((f) => f.severity === "blocker").length;
        const serious = findings.filter((f) => f.severity === "serious").length;
        const minor = findings.filter((f) => f.severity === "minor").length;
        total += findings.length;
        lines.push(
          `| ${name} | ${blocker} | ${serious} | ${minor} | \`${toolFor[name]}\` |`,
        );
      }

      lines.push(
        "",
        total === 0
          ? "**No findings in any category.**"
          : `**${total} findings total.** Run the tool in the right-hand column for details on any category.`,
        "",
        "---",
        "",
        "_Static analysis only. It cannot prove the app builds or behaves correctly — run `swift build` and `swift test` for that._",
      );

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
