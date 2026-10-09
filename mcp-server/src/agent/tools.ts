// MCP tools for the iOS build agent. The /ios-build slash command drives these
// in order; the CLI loop calls the same functions directly.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { capabilityRecipe, loadCapabilities, loadCatalog, CATEGORIES } from "./capabilities.js";
import { addPackage, projectPaths, requireProjectDir, writeProjectFiles } from "./project.js";
import { LoggingRunner, ProcessRunner, type CommandRunner } from "./runner.js";
import { appLogs, runApp, screenshot } from "./simulator.js";
import { STAGES, loadState, progress, saveState } from "./state.js";
import { chooseSimulator, preflight } from "./toolchain.js";
import { addCapabilities, createProject, ensureState, recordedBuild, writePlan, writeReport } from "./workspace.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

const ok = (value: unknown): ToolResult => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
const fail = (error: unknown): ToolResult => ({
  isError: true,
  content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
});

/** Runner factory: tests can inject one; by default each project logs its own tool calls. */
export type RunnerFactory = (projectDir?: string) => CommandRunner;
export const defaultRunnerFactory: RunnerFactory = (projectDir) => {
  const base = new ProcessRunner();
  return projectDir ? new LoggingRunner(base, projectPaths(requireProjectDir(projectDir)).toolLog) : base;
};

const projectDir = z.string().min(1).describe("Absolute path of the app's project folder. Every file the agent writes stays inside it.");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function registerAgentTools(server: McpServer, runners: RunnerFactory = defaultRunnerFactory): void {
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;
  const writes = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

  server.registerTool(
    "ios_preflight",
    {
      title: "Check the Mac before building",
      description: "Use before building an app with the iOS build agent: checks macOS, Node, Xcode, the iOS Simulator SDK, an available simulator and XcodeGen, and gives the install command for anything missing.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => {
      try {
        const result = await preflight(runners());
        const simulator = chooseSimulator(result.toolchain.simulators);
        return ok({ ok: result.ok, checks: result.checks, chosenSimulator: simulator ? { name: simulator.name, udid: simulator.udid, runtime: simulator.runtimeVersion.join(".") } : null });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_capabilities",
    {
      title: "Search app capabilities",
      description: "Use when planning an app to find capability modules (sign-in, payments, maps, charts, launch screen, ...) with status, cost model and required credentials, plus catalog entries that have no module yet. recipeFor returns implementation guidance for one id.",
      inputSchema: {
        query: z.string().max(100).optional(),
        category: z.enum(CATEGORIES).optional(),
        includeCatalog: z.boolean().default(true),
        recipeFor: z.string().max(60).optional(),
      },
      annotations: readOnly,
    },
    async ({ query, category, includeCatalog, recipeFor }) => {
      try {
        const loaded = await loadCapabilities();
        const catalog = await loadCatalog();
        const match = (text: string) => !query || text.toLowerCase().includes(query.toLowerCase());
        const modules = [...loaded.values()]
          .filter(({ manifest: m }) => (!category || m.category === category) && match(`${m.id} ${m.name} ${m.description} ${m.category}`))
          .map(({ manifest: m }) => ({
            id: m.id,
            name: m.name,
            category: m.category,
            default: m.default,
            appleNative: m.appleNative,
            status: m.status,
            cost: m.cost.model,
            credentials: m.credentialsNeeded.map((c) => c.key),
            alternatives: m.alternatives,
            usage: m.usage,
          }));
        const catalogOnly = includeCatalog
          ? catalog.filter((e) => !loaded.has(e.id) && (!category || e.category === category) && match(`${e.id} ${e.name} ${e.category}`)).slice(0, 60)
          : [];
        const recipe = recipeFor && loaded.has(recipeFor) ? await capabilityRecipe(loaded.get(recipeFor)!) : undefined;
        return ok({ modules, catalogOnly, ...(recipe ? { recipe } : {}) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_plan",
    {
      title: "Write the build plan",
      description:
        "Use this first for a new app, before any code: validates the plan (screens, navigation, design direction and palette, model sample records, capabilities), includes the default SwiftUI design system, resolves module dependencies, and writes PLAN.md with costs, credentials and what will be built. New models need at least two synthetic sampleData records. Screen ids are kebab-case; capability ids come from ios_capabilities.",
      inputSchema: {
        projectDir,
        description: z.string().min(1).max(2000).describe("The user's request, verbatim."),
        plan: z.record(z.unknown()).describe("Plan JSON: appName, displayName, summary, navigation, design{mood,palette{name,primary,secondary,accent},typography,shape,density,motion}, screens[], models[{name,persisted,fields[],sampleData[2+ synthetic records]}], capabilities[], features[], assumptions[]."),
      },
      annotations: writes,
    },
    async (input) => {
      try {
        const outcome = await writePlan(input.projectDir, input.plan, { description: input.description });
        return ok({
          planPath: outcome.planPath,
          capabilities: outcome.rows,
          budget: outcome.budget,
          unavailable: outcome.resolution.unavailable,
          next: "Show PLAN.md to the user, then call ios_create_project with the resolved capability ids.",
        });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_create_project",
    {
      title: "Create the Xcode project",
      description:
        "Use this after ios_plan to create the SwiftUI app project (XcodeGen project.yml, Config xcconfigs, gitignored .env secrets, starter sources) and apply capabilities in dependency order. Returns paths, scheme, files and each capability's usage notes for code generation.",
      inputSchema: {
        projectDir,
        name: z.string().describe("UpperCamelCase Swift identifier, e.g. HabitTracker"),
        bundleId: z.string().optional(),
        displayName: z.string().max(30).optional(),
        deploymentTarget: z.string().optional().describe("iOS version, default 17.0; raised automatically for capabilities that need more."),
        capabilities: z.array(z.string()).default([]),
      },
      annotations: writes,
    },
    async (input) => {
      try {
        const created = await createProject(input, runners(input.projectDir));
        const loaded = await loadCapabilities();
        return ok({
          ...created,
          usage: created.capabilities.applied.map((a) => ({ id: a.id, usage: loaded.get(a.id)?.manifest.usage, files: a.files })),
          next: created.generated
            ? "Write the screens with ios_write_files. The root view must honor AgentLaunch.requestedScreen."
            : "XcodeGen did not run; check ios_preflight before building.",
        });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_add_capabilities",
    {
      title: "Add capabilities to the project",
      description: "Use when a refinement needs another capability: applies more capability modules (with their dependencies) to an existing project and regenerates the Xcode project.",
      inputSchema: { projectDir, capabilities: z.array(z.string()).min(1) },
      annotations: writes,
    },
    async ({ projectDir: dir, capabilities }) => {
      try {
        const outcome = await addCapabilities(dir, capabilities, runners(dir));
        const loaded = await loadCapabilities();
        return ok({ ...outcome, usage: outcome.applied.map((a) => ({ id: a.id, usage: loaded.get(a.id)?.manifest.usage })) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_write_files",
    {
      title: "Write app source files",
      description: "Use this to write or delete the app's Swift and resource files under <AppName>/ in the project. Adding or removing files regenerates the Xcode project. Paths are relative to the project folder; nothing outside it can be written.",
      inputSchema: {
        projectDir,
        files: z
          .array(
            z.object({
              path: z.string().describe("e.g. HabitTracker/Views/HabitListView.swift"),
              content: z.string().optional(),
              encoding: z.enum(["utf8", "base64"]).default("utf8"),
              delete: z.boolean().default(false),
            }),
          )
          .min(1)
          .max(200),
      },
      annotations: { ...writes, destructiveHint: true },
    },
    async ({ projectDir: dir, files }) => {
      try {
        return ok(await writeProjectFiles(dir, files, runners(dir)));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_add_package",
    {
      title: "Add a Swift package",
      description: "Use when the app needs a Swift package that no Apple framework covers: adds a Swift Package Manager dependency to project.yml and regenerates the Xcode project.",
      inputSchema: {
        projectDir,
        url: z.string().url(),
        version: z.string().regex(/^\d+\.\d+\.\d+$/).describe("Minimum version (up to next major)."),
        products: z.array(z.string()).min(1),
        name: z.string().optional().describe("Package name; defaults to the repository name."),
      },
      annotations: writes,
    },
    async ({ projectDir: dir, url, version, products, name }) => {
      try {
        const derived = name ?? url.replace(/\.git$/, "").split("/").filter(Boolean).at(-1) ?? "Package";
        const outcome = await addPackage(dir, { name: derived, url, version: { from: version }, products }, runners(dir));
        return ok({ packages: outcome.spec.packages, regenerated: outcome.regenerate.generated, ...(outcome.regenerate.reason ? { regenerateError: outcome.regenerate.reason } : {}) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_build",
    {
      title: "Build the app",
      description:
        "Use this after writing code to build for the iOS Simulator with xcodebuild. Returns {success, errors:[{file,line,column,message}], warnings, durationMs}, never the raw log. Enforces 8 attempts and 25 minutes per cycle; the clock starts at the cycle's first build. Pass newCycle (and change) on the first build of a refinement or a resumed run to start a fresh budget.",
      inputSchema: {
        projectDir,
        scheme: z.string().optional(),
        udid: z.string().optional(),
        newCycle: z.boolean().optional().describe("Start a new attempt budget and deadline (refinement or resume)."),
        change: z.string().max(500).optional().describe("The refinement being applied, recorded in RUN_REPORT.md."),
      },
      annotations: writes,
    },
    async ({ projectDir: dir, scheme, udid, newCycle, change }) => {
      try {
        const result = await recordedBuild(dir, runners(dir), { ...(scheme ? { scheme } : {}), ...(udid ? { udid } : {}), ...(newCycle ? { newCycle } : {}), ...(change ? { change } : {}) });
        return ok(result);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_run",
    {
      title: "Run the app in the simulator",
      description: "Use this after a successful ios_build to boot a simulator if needed (newest installed iOS runtime unless a UDID is given), install the app and launch it. Synthetic sample data is enabled by default for a useful demo; set sampleData=false to see the app's normal state. screen opens that screen via -ios-agent-screen.",
      inputSchema: { projectDir, udid: z.string().optional(), screen: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/).optional(), sampleData: z.boolean().default(true) },
      annotations: writes,
    },
    async ({ projectDir: dir, udid, screen, sampleData }) => {
      try {
        const root = requireProjectDir(dir);
        const launchArguments = [...(sampleData ? ["-ios-agent-sample-data", "YES"] : []), ...(screen ? ["-ios-agent-screen", screen] : [])];
        const result = await runApp(root, runners(root), { ...(udid ? { udid } : {}), launchArguments });
        const state = await ensureState(root);
        state.run = { udid: result.udid, simulator: result.simulator, ...(result.pid ? { pid: result.pid } : {}) };
        state.toolchain = { ...(state.toolchain ?? {}), simulator: result.simulator };
        progress(state, "launching", `Launched on ${result.simulator}${screen ? ` at screen ${screen}` : ""}${sampleData ? " with synthetic sample data" : ""}.`);
        await saveState(root, state);
        return ok(result);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_screenshot",
    {
      title: "Screenshot the simulator",
      description: "Use this after ios_run to save a PNG of the simulator screen under .ios-agent/screenshots/<name>.png and record it for RUN_REPORT.md.",
      inputSchema: { projectDir, udid: z.string(), name: z.string(), waitSeconds: z.number().min(0).max(10).default(2) },
      annotations: writes,
    },
    async ({ projectDir: dir, udid, name, waitSeconds }) => {
      try {
        const root = requireProjectDir(dir);
        await sleep(waitSeconds * 1000);
        const shot = await screenshot(root, runners(root), udid, name);
        const state = await ensureState(root);
        state.screenshots = [...state.screenshots.filter((s) => s.screen !== name), { screen: name, path: shot.path }];
        progress(state, "screenshots", `Captured ${name}.`);
        await saveState(root, state);
        return ok(shot);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_logs",
    {
      title: "Read app logs",
      description: "Use when the app crashes or misbehaves after launch: returns recent log lines from the running app in the simulator (unified logging, at most 500 lines).",
      inputSchema: { projectDir, udid: z.string(), seconds: z.number().min(1).max(600).default(30) },
      annotations: readOnly,
    },
    async ({ projectDir: dir, udid, seconds }) => {
      try {
        return ok(await appLogs(dir, runners(dir), udid, seconds));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_progress",
    {
      title: "Record a progress line",
      description: "Use this at every stage of an /ios-build run to record the stage and the short status line shown to the user, so RUN_REPORT.md contains the same progress log.",
      inputSchema: { projectDir, stage: z.enum(STAGES), message: z.string().min(1).max(300) },
      annotations: writes,
    },
    async ({ projectDir: dir, stage, message }) => {
      try {
        const root = requireProjectDir(dir);
        const state = await ensureState(root);
        const line = progress(state, stage, message);
        await saveState(root, state);
        return ok({ line });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ios_report",
    {
      title: "Write the run report",
      description: "Use this to finish every /ios-build run: writes RUN_REPORT.md from the run state with result, screenshots, capabilities (applied, status, awaiting credentials), builds, what needs the user's accounts or money, next steps and the progress log.",
      inputSchema: {
        projectDir,
        status: z.enum(["complete", "failed", "stopped"]).optional(),
        failure: z.string().max(500).optional(),
      },
      annotations: writes,
    },
    async ({ projectDir: dir, status, failure }) => {
      try {
        const root = requireProjectDir(dir);
        if (!(await loadState(root))) throw new Error("No run state in this folder.");
        const report = await writeReport(root, { ...(status ? { status } : {}), ...(failure ? { failure } : {}) });
        return ok({ path: report.path });
      } catch (error) {
        return fail(error);
      }
    },
  );
}
