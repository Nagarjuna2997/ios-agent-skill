#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PreviewSessions } from "./previews.js";
import { startViewer } from "./viewer.js";
import { readFile } from "node:fs/promises";
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
  simulatorEnvironment,
  showSimulator,
  simulatorShutdown,
  summarize,
  terminateApp,
} from "./simulator.js";

const VERSION = "0.2.0";

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
        "  ios-simulator-mcp --viewer UDID  Start a local browser preview",
        "  ios-simulator-mcp --help    Show this message",
        "  ios-simulator-mcp --version Print the version",
        "",
        "TOOLS",
        "  simulator_list / simulator_environment",
        "  simulator_show / simulator_preview_start / simulator_preview_stop",
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
if (process.argv.includes('--viewer')) {
  const udid = process.argv[process.argv.indexOf('--viewer')+1];
  if (!udid || !z.string().uuid().safeParse(udid).success) throw new Error('--viewer requires a Simulator UDID');
  const device = (await simulatorList(runner)).devices.find(d=>d.udid===udid && d.state==='Booted');
  if (!device) throw new Error('Boot the selected simulator before starting the viewer.');
  const viewer = await startViewer(runner,udid);
  process.stdout.write(viewer.url+'\n');
  const stop=async()=>{await viewer.close();process.exit(0);};
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
  await new Promise(()=>{});
}
const server = new McpServer({ name: "ios-simulator-mcp", version: VERSION });

const udidInput = {
  udid: z.string().uuid().describe("Simulator UDID. Use simulator_list first when unsure."),
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
    inputSchema: { ...udidInput, outputPath: z.string().describe("Output PNG path."), includeImage:z.boolean().default(false) },
  },
  async ({ udid, outputPath, includeImage }) => {
    try {
      const captured = summarize(await screenshot(runner, udid, outputPath));
      const response = okText("# Screenshot Captured",{...captured,udid,outputPath});
      if (!includeImage) return response;
      const bytes = await readFile(outputPath);
      if (bytes.length > 10*1024*1024) throw new Error('Image exceeds 10 MB; use its saved file path instead.');
      return {content:[...response.content,{type:'image' as const,mimeType:'image/png',data:bytes.toString('base64')}],structuredContent:response.structuredContent};
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

const previews = new PreviewSessions(udid=>startViewer(runner,udid));
server.registerTool('simulator_environment',{title:'Installed Xcode and device support',description:'Report selected Xcode, installed runtimes and real device profiles, including Duo when installed. Does not download or update Xcode.',inputSchema:{}},async()=>{
  try{return okText('Simulator environment',await simulatorEnvironment(runner));}catch(error){return errorText(error);}
});
server.registerTool('simulator_show',{title:'Show native Simulator',description:'Boot and wait for a selected available device, then open its native Simulator window for touch/keyboard interaction.',inputSchema:udidInput},async({udid})=>{
  try{return okText('Simulator visible',await showSimulator(runner,udid));}catch(error){return errorText(error);}
});
server.registerTool('simulator_preview_start',{title:'Open sidebar simulator preview',description:'Start a token-protected loopback screenshot viewer for a booted device. Open the returned URL in the client sidebar/browser. Read-only visual preview; interact in the native Simulator. Not a public hosted simulator.',inputSchema:udidInput},async({udid})=>{
  try{
    const device=(await simulatorList(runner)).devices.find(d=>d.udid===udid && d.state==='Booted');
    if(!device) throw new Error('Choose a booted simulator from simulator_list.');
    const preview=await previews.start(udid);
    return okText('Simulator preview',{url:preview.url,device,mode:'read-only screenshot preview',stopTool:'simulator_preview_stop'});
  }catch(error){return errorText(error);}
});
server.registerTool('simulator_preview_stop',{title:'Close simulator preview',description:'Stop this server’s preview for a device and remove its temporary screenshots; leaves the Simulator running.',inputSchema:udidInput},async({udid})=>{
  try{await previews.stop(udid);return okText('Preview stopped',{udid});}catch(error){return errorText(error);}
});
const closePreviews=()=>previews.shutdown();
process.once('SIGINT',async()=>{await closePreviews();process.exit(0);});
process.once('SIGTERM',async()=>{await closePreviews();process.exit(0);});
const transport=new StdioServerTransport();
await server.connect(transport);
const onclose=transport.onclose;
transport.onclose=()=>{onclose?.();void closePreviews();};
