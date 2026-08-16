#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { ExecFileRunner } from "./runner.js";
import {
  buildProject,
  installApp,
  launchApp,
  openDeepLink,
  runTests,
  screenshot,
  simulatorBoot,
  simulatorList,
  simulatorShutdown,
  summarize,
  terminateApp,
} from "./simulator.js";

const VERSION = "0.1.0";

function handleCLIFlags(argv: string[]): boolean {
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return true;
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      [
        `ios-simulator-mcp ${VERSION}`,
        "",
        "MCP server for safe iOS Simulator runtime workflows.",
        "",
        "USAGE",
        "  ios-simulator-mcp           Start the MCP server over stdio",
        "  ios-simulator-mcp --help    Show this message",
        "  ios-simulator-mcp --version Print the version",
        "",
        "TOOLS",
        "  simulator_list",
        "  simulator_boot",
        "  simulator_shutdown",
        "  build_project",
        "  run_tests",
        "  install_app",
        "  launch_app",
        "  terminate_app",
        "  open_deep_link",
        "  screenshot",
        "",
        "No tool erases a simulator. Reset/destructive flows require a future guarded tool.",
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

const runner = new ExecFileRunner();
const server = new McpServer({ name: "ios-simulator-mcp", version: VERSION });

const udidInput = {
  udid: z.string().describe("Simulator UDID. Use simulator_list first when unsure."),
};

function okText(title: string, payload: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: `${title}\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`` }],
    structuredContent: payload,
  };
}

function errorText(error: unknown) {
  return {
    content: [{ type: "text" as const, text: `Simulator command failed: ${error instanceof Error ? error.message : String(error)}` }],
    isError: true,
  };
}

server.registerTool(
  "simulator_list",
  {
    title: "List available iOS simulators",
    description:
      "List available Simulator devices using xcrun simctl. Use before booting, installing, launching, or capturing screenshots when you do not know the simulator UDID.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await simulatorList(runner);
      return okText("# Simulator List", { devices: result.devices });
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "simulator_boot",
  {
    title: "Boot an iOS simulator",
    description:
      "Boot a simulator by UDID using xcrun simctl boot. Use before install_app, launch_app, screenshot, or open_deep_link. This does not erase or reset simulator content.",
    inputSchema: udidInput,
  },
  async ({ udid }) => {
    try {
      return okText("# Simulator Booted", summarize(await simulatorBoot(runner, udid)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "simulator_shutdown",
  {
    title: "Shut down an iOS simulator",
    description:
      "Shut down a simulator by UDID using xcrun simctl shutdown. Use after runtime validation to clean up a booted simulator. This does not erase content.",
    inputSchema: udidInput,
  },
  async ({ udid }) => {
    try {
      return okText("# Simulator Shut Down", summarize(await simulatorShutdown(runner, udid)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "install_app",
  {
    title: "Install an app bundle",
    description:
      "Install a built .app bundle into a simulator using xcrun simctl install. Use after build_project or after locating a derived-data app bundle.",
    inputSchema: { ...udidInput, appPath: z.string().describe("Path to a built .app bundle.") },
  },
  async ({ udid, appPath }) => {
    try {
      return okText("# App Installed", summarize(await installApp(runner, udid, appPath)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "launch_app",
  {
    title: "Launch an installed app",
    description:
      "Launch an installed app in the simulator by bundle identifier. Optional arguments are passed after the bundle id and are useful for UI-test/debug launch flags.",
    inputSchema: { ...udidInput, bundleId: z.string(), args: z.array(z.string()).optional() },
  },
  async ({ udid, bundleId, args }) => {
    try {
      return okText("# App Launched", summarize(await launchApp(runner, udid, bundleId, args ?? [])));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "terminate_app",
  {
    title: "Terminate an app",
    description: "Terminate a running simulator app by bundle identifier without uninstalling it or resetting its state.",
    inputSchema: { ...udidInput, bundleId: z.string() },
  },
  async ({ udid, bundleId }) => {
    try {
      return okText("# App Terminated", summarize(await terminateApp(runner, udid, bundleId)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "open_deep_link",
  {
    title: "Open a deep link",
    description:
      "Open a URL in the simulator using xcrun simctl openurl. Use to verify deep links, universal links, onboarding routes, and state restoration.",
    inputSchema: { ...udidInput, url: z.string().url() },
  },
  async ({ udid, url }) => {
    try {
      return okText("# Deep Link Opened", summarize(await openDeepLink(runner, udid, url)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "screenshot",
  {
    title: "Capture a simulator screenshot",
    description:
      "Capture a simulator screenshot to a PNG path using xcrun simctl io screenshot. Use as evidence for visual review and before/after comparison.",
    inputSchema: { ...udidInput, outputPath: z.string().describe("Output PNG path.") },
  },
  async ({ udid, outputPath }) => {
    try {
      return okText("# Screenshot Captured", summarize(await screenshot(runner, udid, outputPath)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "build_project",
  {
    title: "Build an Xcode project or workspace",
    description:
      "Run xcodebuild build for a project or workspace. Use before installing and launching the app. Requires a scheme and either project or workspace.",
    inputSchema: {
      project: z.string().optional(),
      workspace: z.string().optional(),
      scheme: z.string(),
      destination: z.string().optional(),
      configuration: z.string().optional(),
      derivedDataPath: z.string().optional(),
    },
  },
  async (input) => {
    try {
      return okText("# Project Built", summarize(await buildProject(runner, input)));
    } catch (error) {
      return errorText(error);
    }
  },
);

server.registerTool(
  "run_tests",
  {
    title: "Run Xcode tests",
    description:
      "Run xcodebuild test for a project or workspace. Use to verify runtime/test behavior before visual review. Requires an explicit destination.",
    inputSchema: {
      project: z.string().optional(),
      workspace: z.string().optional(),
      scheme: z.string(),
      destination: z.string(),
      configuration: z.string().optional(),
      derivedDataPath: z.string().optional(),
    },
  },
  async (input) => {
    try {
      return okText("# Tests Run", summarize(await runTests(runner, input)));
    } catch (error) {
      return errorText(error);
    }
  },
);

await server.connect(new StdioServerTransport());
