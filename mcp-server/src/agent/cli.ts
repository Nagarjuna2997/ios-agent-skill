import { newUsage, modelUsage, saveUsage } from '../efficiency/usage.js';
import { fingerprint, memoryContext, setMemory } from '../efficiency/memory.js';
import { appendFile } from 'node:fs/promises';
// `ios-agent-mcp build "<description>"` and companions:
//   build "<description>" [--out DIR] [--max-attempts N] [--minutes N] [--udid UDID] [--model M] [--plan-only] [--design ID]
//   build --resume --out DIR
//   build --refine "<change>" --out DIR
//   preflight
//   capabilities list | verify <id...>|--all [--write DIR] [--keep]
//   install-command [--global | --project DIR]
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GitHubBuildBackend } from "./remote.js";
import { ClaudeCodeBrain } from "./brain.js";
import { loadCapabilities } from "./capabilities.js";
import { runAgent } from "./loop.js";
import { projectPaths } from "./project.js";
import { LoggingRunner, ProcessRunner } from "./runner.js";
import { loadState } from "./state.js";
import { preflight } from "./toolchain.js";
import { recordVerification, verifyCapability } from "./verify.js";

function parse(args: string[]): { positional: string[]; flags: Map<string, string | true> } {
  const flags = new Map<string, string | true>();
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith("--")) {
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--") && !["--memory", "--efficiency-report", "--remote", "--remote-retry", "--resume", "--plan-only", "--all", "--global", "--keep"].includes(arg)) {
        flags.set(arg.slice(2), next);
        i++;
      } else flags.set(arg.slice(2), true);
    } else positional.push(arg);
  }
  return { positional, flags };
}

const str = (flags: Map<string, string | true>, key: string) => {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "app";

const USAGE = `ios-agent-mcp build "<description>" [--out DIR] [--max-attempts 8] [--minutes 25] [--udid UDID] [--model MODEL] [--plan-only] [--design ID]
ios-agent-mcp build --resume --out DIR
ios-agent-mcp build "<description>" --remote --remote-repo OWNER/REPO --remote-tool-ref FULL_SHA --remote-xcode VERSION [--remote-runner macos-15]
ios-agent-mcp build --refine "<change>" --out DIR
ios-agent-mcp preflight
ios-agent-mcp capabilities list | verify <id...>|--all [--write CAPABILITIES_DIR] [--keep]
ios-agent-mcp install-command [--global | --project DIR]

build plans the app (PLAN.md), creates the Xcode project (XcodeGen when installed, otherwise the built-in writer),
applies capabilities, writes SwiftUI with headless Claude Code (claude -p), builds and fixes errors (capped),
launches in the simulator, screenshots each top-level screen and writes RUN_REPORT.md.
Opt-in efficiency: --memory (enable verified project memory), --repeat-threshold 3 (2–10), --efficiency-report (local usage).\nDisable memory: ios-agent-mcp memory disable --project DIR. Omit --repeat-threshold to disable intervention.\nLocal verification requires macOS, Xcode 16 or later, an iOS simulator and a signed-in Claude Code CLI. XcodeGen is optional.`;

export async function buildCLI(args: string[]): Promise<number> {
  const { positional, flags } = parse(args);
  if (flags.has("help")) {
    console.log(USAGE);
    return 0;
  }
  if (flags.has("remote-retry") && (!flags.has("remote") || !flags.has("resume"))) throw new Error("--remote-retry requires --remote --resume");
  const description = positional.join(" ").trim();
  const resume = flags.has("resume");
  const refine = str(flags, "refine");
  if (!description && !resume && !refine) {
    console.error(USAGE);
    return 1;
  }
  const out = resolve(str(flags, "out") ?? join(process.cwd(), "ios-agent-apps", slug(description)));
  const runner = new LoggingRunner(new ProcessRunner(), projectPaths(out).toolLog);
  const enabled=flags.has('memory')||flags.has('repeat-threshold')||flags.has('efficiency-report');
  const usage=newUsage(),started=Date.now();usage.toolCalls=null;usage.responseBytes=null;usage.resourceReads=null;usage.resourceBytes=null;
  const threshold=flags.has('repeat-threshold')?Number(str(flags,'repeat-threshold')):undefined;
  if(threshold!==undefined&&(!Number.isInteger(threshold)||threshold<2||threshold>10))throw Error('--repeat-threshold must be 2–10');
  if(flags.has('memory'))await setMemory(out,true);
  const context=async()=>{const t=Date.now();try{const state=await loadState(out);const text=await memoryContext(out,await fingerprint(out,state?.toolchain));usage.memoryCharacters+=text.length;return text;}catch{console.error('Memory unavailable; continuing without learned context.');return '';}finally{usage.overheadMs+=Date.now()-t;}};
  const brain = new ClaudeCodeBrain({ ...(flags.has('memory')?{context}:{}), ...(enabled?{onUsage:async(e:unknown)=>{modelUsage(usage,e);const t=Date.now();try{usage.elapsedMs=Date.now()-started;await saveUsage(out,usage);}catch{console.error('Usage checkpoint unavailable; provider outcome preserved.');}finally{usage.overheadMs+=Date.now()-t;}}}:{}), runner: new ProcessRunner(), ...(str(flags, "model") ? { model: str(flags, "model")! } : {}) });
  const maxAttempts = Number(str(flags, "max-attempts") ?? 8);
  const minutes = Number(str(flags, "minutes") ?? (flags.has("remote") ? 60 : 25));
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new Error("--max-attempts must be 1-20");
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) throw new Error("--minutes must be 1-240");
  const remote = flags.has("remote") ? new GitHubBuildBackend({
    sink: line => console.log(line),
    repo: str(flags, "remote-repo") ?? "", toolRef: str(flags, "remote-tool-ref") ?? "", xcode: str(flags, "remote-xcode") ?? "",
    ...(str(flags, "remote-runner") ? { runnerLabel: str(flags, "remote-runner")! } : {}),
  }, new ProcessRunner()) : undefined;
  if (remote) console.log(`Remote build uploads generated app source to ${str(flags, "remote-repo")}. Check repository visibility and Actions billing. Only source/configuration is selected; .env and Secrets.xcconfig are excluded.`);
  console.log("Visual review sends synthetic simulator screenshots and the design brief to your configured Claude model; one repair pass plus verification. Review PLAN.md before continuing.");
  console.log(`Project folder: ${out}`);
  const priorBuilds=enabled?(await loadState(out))?.builds.length??0:0;
  const result = await runAgent({
    projectDir: out,
    ...(enabled?{efficiency:{invocation:usage.session,memory:flags.has('memory'),threshold,onOverhead:(ms:number)=>{usage.overheadMs+=ms;},onIntervention:()=>{usage.interventions++;}}}:{}),
    ...(description ? { description } : {}),
    brain,
    runner,
    ...(remote ? { remote, remoteRetry: flags.has("remote-retry") } : {}),
    sink: (line) => console.log(line),
    maxBuildAttempts: maxAttempts,
    wallClockMinutes: minutes,
    resume,
    ...(refine ? { refine } : {}),
    ...(str(flags, "udid") ? { udid: str(flags, "udid")! } : {}),
    maxVisualRepairs: 1,
    planOnly: flags.has("plan-only"),
    ...(str(flags, "design") ? { design: str(flags, "design")! } : {}),
  });
  if(enabled){usage.buildAttempts=Math.max(0,result.state.builds.length-priorBuilds);usage.buildRetries=Math.max(0,usage.buildAttempts-1);usage.status=result.state.status;usage.elapsedMs=Date.now()-started;await saveUsage(out,usage);await appendFile(result.reportPath,`\n## Efficiency (opt-in)\n\nMeasured model calls: ${usage.modelCalls}; completed builds: ${result.state.builds.length}; interventions: ${usage.interventions}; elapsed: ${usage.elapsedMs} ms (includes overhead).\n\nInput/output/cache-read tokens: ${usage.inputTokens??'unavailable'}/${usage.outputTokens??'unavailable'}/${usage.cachedInputTokens??'unavailable'}. Cost unavailable. MCP calls are not observable in this CLI path. Details: .ios-agent/efficiency/usage.json.\n`);}
  console.log(`\n${result.state.status === "complete" ? "Done" : `Stopped (${result.state.failure ?? result.state.status})`}. Report: ${result.reportPath}`);
  return result.state.status === "complete" || result.state.failure?.startsWith("Choose a design direction") || (flags.has("plan-only") && result.state.failure === "plan only") ? 0 : 1;
}

export async function preflightCLI(): Promise<number> {
  const result = await preflight(new ProcessRunner());
  for (const check of result.checks) console.log(`${check.ok ? "ok     " : "missing"} ${check.id.padEnd(14)} ${check.detail}${check.ok || !check.fix ? "" : `\n        fix: ${check.fix}`}`);
  return result.ok ? 0 : 1;
}

export async function capabilitiesCLI(args: string[]): Promise<number> {
  const { positional, flags } = parse(args);
  const [command, ...ids] = positional;
  const loaded = await loadCapabilities();
  if (command === "list" || !command) {
    for (const { manifest: m } of [...loaded.values()].sort((a, b) => a.manifest.category.localeCompare(b.manifest.category) || a.manifest.id.localeCompare(b.manifest.id))) {
      console.log(`${m.status.padEnd(9)} ${m.category.padEnd(18)} ${m.id.padEnd(28)} ${m.default ? "default " : "        "}${m.credentialsNeeded.length ? `needs ${m.credentialsNeeded.map((c) => c.key).join(", ")}` : ""}`);
    }
    return 0;
  }
  if (command === "verify") {
    const targets = flags.has("all") ? [...loaded.keys()].sort() : ids;
    if (!targets.length) throw new Error("Name capability ids or pass --all.");
    const runner = new ProcessRunner();
    const write = str(flags, "write");
    let failures = 0;
    for (const id of targets) {
      const record = await verifyCapability(id, runner, { keep: flags.has("keep") });
      console.log(`${record.status.padEnd(9)} ${id}${record.reason ? `: ${record.reason}` : ""}`);
      for (const error of record.errors ?? []) console.log(`          ${error.file ? `${error.file}:${error.line ?? "?"}: ` : ""}${error.message}`);
      if (record.status !== "verified") failures++;
      if (write) await recordVerification(resolve(write), record);
    }
    return failures ? 1 : 0;
  }
  throw new Error(`Unknown capabilities command: ${command}`);
}

/** Install the /ios-build slash command for Claude Code. */
export async function installCommandCLI(args: string[]): Promise<number> {
  const { flags } = parse(args);
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, "..", "..", "data", "commands", "ios-build.md");
  if (!existsSync(source)) throw new Error("The bundled command file is missing; rebuild the package.");
  const base = flags.has("global") ? join(homedir(), ".claude") : join(resolve(str(flags, "project") ?? process.cwd()), ".claude");
  const target = join(base, "commands", "ios-build.md");
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  // Point at the server that is running now: a checkout build, or the npm package that was invoked.
  const server = join(here, "..", "unified.js");
  const connect = server.includes(`${"_npx"}`) ? "npx -y ios-agent-mcp@latest" : `node ${JSON.stringify(server)}`;
  console.log(`Installed /ios-build at ${target}. The command uses the ios-agent MCP server (2.10.0 or later): claude mcp add ios-agent -- ${connect}`);
  return 0;
}

export async function statusCLI(dir: string): Promise<number> {
  const state = await loadState(resolve(dir));
  if (!state) {
    console.error("No run in this folder.");
    return 1;
  }
  console.log(`${state.status} at ${state.stage}; ${state.builds.length} build(s); ${state.screenshots.length} screenshot(s)`);
  return 0;
}
