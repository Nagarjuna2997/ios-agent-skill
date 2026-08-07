#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { VERSION } from "./version.js";

import { Finding } from "./analyzers/types.js";
import { analyzeConcurrency } from "./analyzers/concurrency.js";
import { analyzeArchitecture } from "./analyzers/architecture.js";
import { analyzeSwiftUI } from "./analyzers/swiftui.js";
import { analyzeAvailability } from "./analyzers/availability.js";
import { analyzeAppStore, analyzeProjectLevelAppStore } from "./analyzers/appstore.js";
import { lintSkill } from "./analyzers/skill.js";
import { analyzeMemory } from "./analyzers/memory.js";
import { analyzeSecurity } from "./analyzers/security.js";
import { analyzeTesting, analyzeTestCoverage } from "./analyzers/testing.js";
import { analyzePerformance } from "./analyzers/performance.js";
import {
  readProjectContext,
  readSwiftFiles,
  resolveProjectRoot,
  summarizeProject,
} from "./scan.js";
import { renderFindings, renderSkillLint } from "./report.js";
import { buildReviewOutput, reviewOutputShape } from "./result.js";
import {
  projectDependenciesResource,
  projectInfoResource,
  projectIssuesResource,
  resolveRootFrom,
} from "./resources.js";

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
        "  ios-agent-mcp --project P  Serve ios:// resources for project P",
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
        "  review_swift_memory          Retain cycles and object lifetime",
        "  review_swift_security        Secrets, storage, ATS, TLS, weak crypto",
        "  review_swift_testing         Flaky, vacuous, and missing tests",
        "  review_swift_performance     Work on the render path",
        "  lint_skill                   Skill metadata, agent tool grants, mirrors",
        "",
        "Each tool takes one argument: an absolute path. The first ten want a",
        "Swift project root; lint_skill wants an Agent Skill repository root.",
        "",
        "RESOURCES  (require --project or IOS_AGENT_PROJECT)",
        "  ios://project/info           Structure, architecture, DI, frameworks",
        "  ios://project/dependencies   Third-party packages and Apple frameworks",
        "  ios://project/issues         Every finding, all categories",
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
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}> {
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
        structuredContent: { ...buildReviewOutput(title, [], 0) },
      };
    }

    const findings = await analyze(files);
    // Both halves, always: markdown for a human reading the transcript, and
    // structuredContent for a workflow that must branch without parsing prose.
    return {
      content: [{ type: "text", text: renderFindings(title, findings, files.length) }],
      structuredContent: { ...buildReviewOutput(title, findings, files.length) },
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
    outputSchema: reviewOutputShape,
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
    outputSchema: reviewOutputShape,
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
    outputSchema: reviewOutputShape,
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
    outputSchema: reviewOutputShape,
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
        Memory: files.flatMap(analyzeMemory),
        Security: files.flatMap(analyzeSecurity),
        Performance: files.flatMap(analyzePerformance),
        Testing: [...analyzeTestCoverage(files), ...files.flatMap(analyzeTesting)],
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
        "## Shape",
        "",
        `- **UI framework:** ${summary.uiFramework}`,
        `- **Architecture:** ${summary.architecture}`,
        `  - evidence: ${summary.architectureEvidence.join("; ") || "none"}`,
        `- **Dependency injection:** ${summary.usesDependencyInjection ? "protocol existentials injected through init" : "**not detected** — no `any Protocol` initializer parameters found"}`,
        `- **Third-party dependencies:** ${summary.dependencies.slice(0, 20).join(", ") || "none detected"}`,
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
        Memory: "review_swift_memory",
        Security: "review_swift_security",
        Performance: "review_swift_performance",
        Testing: "review_swift_testing",
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

      const everyFinding = Object.values(categories).flat();

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        structuredContent: {
          ...buildReviewOutput("Project analysis", everyFinding, files.length),
          project: {
            swift_files: summary.swiftFileCount,
            lines: summary.lineCount,
            deployment_target: summary.deploymentTarget,
            swift_tools_version: summary.swiftToolsVersion,
            ui_framework: summary.uiFramework,
            architecture: summary.architecture,
            architecture_evidence: summary.architectureEvidence,
            dependencies: summary.dependencies,
            frameworks: summary.frameworks,
            uses_dependency_injection: summary.usesDependencyInjection,
            has_tests: summary.hasTests,
            has_package_swift: summary.hasPackageSwift,
            has_xcode_project: summary.hasXcodeProject,
          },
          categories: Object.fromEntries(
            Object.entries(categories).map(([name, found]) => [
              name,
              {
                blocker: found.filter((f) => f.severity === "blocker").length,
                serious: found.filter((f) => f.severity === "serious").length,
                minor: found.filter((f) => f.severity === "minor").length,
                tool: toolFor[name],
              },
            ]),
          ),
        },
      };
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

server.registerTool(
  "lint_skill",
  {
    title: "Lint an Agent Skill repository",
    description:
      "Validate the metadata of an Agent Skill repository rather than Swift source: SKILL.md frontmatter (required keys, kebab-case name, semver version, description length limits), subagent definitions in .claude/agents/ (name matches filename, unknown tool names, and read-only agents that are nonetheless granted Edit or Write), whether generated mirror files such as CLAUDE.md and AGENTS.md have drifted from SKILL.md, and backtick-quoted doc paths that do not resolve. Use when authoring or reviewing a skill, before publishing a release, or when a subagent or skill is not being invoked as expected.",
    inputSchema: {
      path: z
        .string()
        .describe(
          "Absolute path to the skill repository root (the folder containing SKILL.md).",
        ),
    },
  },
  async ({ path }) => {
    try {
      const root = await resolveProjectRoot(path);
      const result = await lintSkill(root);
      return { content: [{ type: "text" as const, text: renderSkillLint(result) }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Lint failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "review_swift_memory",
  {
    title: "Review memory and retain cycles",
    description:
      "Check a Swift project for retain cycles and lifetime defects: repeating Timers and block-based NotificationCenter observers capturing self strongly, Combine sinks stored in a cancellables set owned by the same object, non-weak delegate properties, stored closure properties capturing self, `unowned self` in escaping closures, and long-running unstructured Tasks that keep an object alive after its screen is gone. Use when memory grows over time, when deinit is never called, or before shipping a screen with timers or subscriptions.",
    inputSchema: pathInput,
    outputSchema: reviewOutputShape,
  },
  async ({ path }) =>
    scanAndRender(path, "Memory Review", (files) => files.flatMap(analyzeMemory)),
);

server.registerTool(
  "review_swift_security",
  {
    title: "Review iOS security",
    description:
      "Check a Swift project for security defects: hardcoded API keys, tokens, and passwords in source; credentials written to UserDefaults instead of the Keychain; App Transport Security disabled; cleartext http:// endpoints; TLS server trust accepted without evaluation; MD5 and SHA-1; Keychain items with over-permissive accessibility; non-cryptographic randomness used for nonces and salts; secrets written to logs; and string interpolation into evaluated JavaScript. Use before shipping, during a security review, or when handling credentials.",
    inputSchema: pathInput,
    outputSchema: reviewOutputShape,
  },
  async ({ path }) =>
    scanAndRender(path, "Security Review", (files) => files.flatMap(analyzeSecurity)),
);

server.registerTool(
  "review_swift_testing",
  {
    title: "Review test suite quality",
    description:
      "Check a Swift test suite for defects that make it unreliable or vacuous: tests that wait by sleeping, tests with no assertion at all, `await` inside an XCTAssert autoclosure (which does not compile), live URLSession calls in tests, `try!`, static mutable state that makes results order-dependent, long expectation timeouts covering for races, and XCTAssertTrue on an equality that hides both values on failure. Also reports when a project has no tests or very few. Use when tests are flaky, before trusting a green suite, or when adding coverage.",
    inputSchema: pathInput,
    outputSchema: reviewOutputShape,
  },
  async ({ path }) =>
    scanAndRender(path, "Test Suite Review", (files) => [
      ...analyzeTestCoverage(files),
      ...files.flatMap(analyzeTesting),
    ]),
);

server.registerTool(
  "review_swift_performance",
  {
    title: "Review SwiftUI and Swift performance",
    description:
      "Check for runtime cost that shows up as dropped frames: DateFormatter and JSONDecoder allocated inside `body`, collections sorted or filtered on every render, ForEach over indices instead of stable identity, non-lazy stacks inside a ScrollView, AsyncImage with no frame, blocking file or network I/O on the render path, and GeometryReader wrapping an entire body. Use when scrolling stutters, launch is slow, or before shipping a list-heavy screen.",
    inputSchema: pathInput,
    outputSchema: reviewOutputShape,
  },
  async ({ path }) =>
    scanAndRender(path, "Performance Review", (files) =>
      files.flatMap(analyzePerformance),
    ),
);

// Resources: nouns a client can read without the model deciding to ask.
//
// The root comes from --project, IOS_AGENT_PROJECT, or the working directory
// the client spawned the server in. Every payload reports which one won, so an
// empty project is never mistaken for a wrong path.
const RESOLVED_ROOT = resolveRootFrom(process.argv.slice(2), process.env);
const PROJECT_ROOT = RESOLVED_ROOT.root;

server.registerResource(
  "project-info",
  "ios://project/info",
  {
    title: "iOS project info",
    description:
      "Structure and shape of the configured Swift project: file and line counts, deployment target, UI framework, inferred architecture with the evidence behind it, whether dependency injection is in use, and which Apple frameworks it imports.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [await projectInfoResource(uri.href, PROJECT_ROOT, RESOLVED_ROOT.source)],
  }),
);

server.registerResource(
  "project-dependencies",
  "ios://project/dependencies",
  {
    title: "iOS project dependencies",
    description:
      "Third-party packages resolved from Package.swift, Package.resolved, or a Podfile, plus the Apple frameworks the project imports.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [await projectDependenciesResource(uri.href, PROJECT_ROOT)],
  }),
);

server.registerResource(
  "project-issues",
  "ios://project/issues",
  {
    title: "iOS project issues",
    description:
      "Every finding across all nine analysis categories for the configured project, with counts by severity and by category. Capped at 100 issues, with the remainder reported as a count.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [await projectIssuesResource(uri.href, PROJECT_ROOT)],
  }),
);

const transport = new StdioServerTransport();


await server.connect(transport);
