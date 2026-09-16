import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  readdir,
  stat,
  lstat,
  open,
  rm,
} from "node:fs/promises";
import { resolve, join, relative, isAbsolute } from "node:path";
import { z } from "zod";

const Check = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string().min(1),
    command: z.string().min(1),
    args: z.array(z.string()),
    timeoutSeconds: z.number().int().min(1).max(1800).default(600),
    artifacts: z.array(z.string()).default([]),
  })
  .strict();
const Config = z
  .object({
    protectedFiles: z.array(z.string().min(1)).min(1),
    checks: z.array(Check).min(1),
    screens: z
      .array(
        z.object({
          name: z.string().min(1),
          checkId: z.string(),
          artifact: z.string().min(1),
        }),
      )
      .min(1),
  })
  .strict();
const Plan = z.object({
  summary: z.string().min(1),
  screens: z.array(z.string()).min(1),
  features: z.array(z.string()).min(1),
  criteria: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1),
        checkIds: z.array(z.string()).min(1),
      }),
    )
    .min(1),
});
type ConfigData = z.infer<typeof Config>;
type PlanData = z.infer<typeof Plan>;
type Result = {
  id: string;
  passed: boolean;
  exitCode: number | null;
  log: string;
  logHash?: string;
  artifacts: string[];
  artifactHashes?: Record<string, string>;
  reason?: string;
};
type State = {
  version: 1;
  protectedHashes: Record<string, string>;
  brief: string;
  plan: PlanData;
  config: ConfigData;
  attempts: number;
  limit: number;
  status: "planned" | "implementing" | "checking" | "blocked" | "complete";
  reason?: string;
  fingerprint?: string;
  results: Result[];
  events: { at: string; message: string }[];
};
const hash = (text: string | Uint8Array) =>
  createHash("sha256").update(text).digest("hex");
async function save(path: string, data: unknown) {
  await writeFile(path + ".tmp", JSON.stringify(data, null, 2) + "\n");
  await rename(path + ".tmp", path);
}
function local(root: string, path: string) {
  if (path.replaceAll("\\", "/").startsWith(".ios-agent/loop"))
    throw Error("Artifacts cannot target loop state");
  const full = resolve(root, path);
  const rel = relative(root, full);
  if (
    isAbsolute(path) ||
    rel.startsWith("..") ||
    !rel ||
    rel.replaceAll("\\", "/").startsWith(".ios-agent/loop")
  )
    throw Error(`Expected project-relative artifact: ${path}`);
  return full;
}
function validate(config: ConfigData, plan?: PlanData) {
  const artifacts = config.checks.flatMap((c) => c.artifacts);
  for (const artifact of artifacts) {
    if (
      !artifact.startsWith(".ios-agent/evidence/") ||
      artifact
        .split("/")
        .some((part) => !part || part === "." || part === "..") ||
      artifact.includes("\\")
    )
      throw Error(
        "Artifacts must use canonical paths inside .ios-agent/evidence/",
      );
  }
  if (new Set(artifacts).size !== artifacts.length)
    throw Error("Duplicate artifact ownership");
  const ids = new Set(config.checks.map((c) => c.id));
  if (ids.size !== config.checks.length) throw Error("Duplicate check IDs");
  for (const screen of config.screens) {
    const check = config.checks.find((c) => c.id === screen.checkId);
    if (!check?.artifacts.includes(screen.artifact))
      throw Error(`Screen ${screen.name} lacks a producing check/artifact`);
  }
  if (plan) {
    if (
      plan.screens.some(
        (name) => !config.screens.some((screen) => screen.name === name),
      ) ||
      config.screens.some((screen) => !plan.screens.includes(screen.name))
    )
      throw Error("Plan must cover exactly the configured screens");
  }
  if (plan)
    for (const criterion of plan.criteria)
      for (const id of criterion.checkIds)
        if (!ids.has(id)) throw Error(`Unknown acceptance check ${id}`);
}
// Spawn argv directly: no shell interpretation. Logs are bounded; long processes have a hard deadline.
export async function runProcess(
  command: string,
  args: string[],
  cwd: string,
  timeoutSeconds: number,
  log: string,
  input?: string,
) {
  const handle = await open(log, "w");
  let bytes = 0;
  let stdout = "";
  const writes: Promise<unknown>[] = [];
  try {
    return await new Promise<{
      exitCode: number | null;
      timedOut: boolean;
      stdout: string;
      interrupted: boolean;
    }>((done) => {
      const child = spawn(command, args, {
        cwd,
        stdio: ["pipe", "pipe", "pipe"],
        detached: process.platform !== "win32",
      });
      let timedOut = false;
      let interrupted = false;
      let settled = false;
      let escalation: NodeJS.Timeout | undefined;
      const kill = (signal: NodeJS.Signals) => {
        try {
          if (process.platform !== "win32" && child.pid)
            process.kill(-child.pid, signal);
          else child.kill(signal);
        } catch {}
      };
      const stop = () => {
        kill("SIGTERM");
        escalation ??= setTimeout(() => kill("SIGKILL"), 5000);
        escalation.unref();
      };
      const interrupt = () => {
        interrupted = true;
        stop();
      };
      process.once("SIGINT", interrupt);
      process.once("SIGTERM", interrupt);
      const timer = setTimeout(() => {
        timedOut = true;
        stop();
      }, timeoutSeconds * 1000);
      const record = (data: Buffer) => {
        if (bytes < 4 * 1024 * 1024) {
          bytes += data.length;
          writes.push(handle.write(data));
        }
      };
      child.stdout.on("data", (data: Buffer) => {
        if (stdout.length < 4 * 1024 * 1024) stdout += data.toString();
        record(data);
      });
      child.stderr.on("data", record);
      const finish = (exitCode: number | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (escalation) clearTimeout(escalation);
        process.removeListener("SIGINT", interrupt);
        process.removeListener("SIGTERM", interrupt);
        done({ exitCode, timedOut, stdout, interrupted });
      };
      child.on("error", (error) => {
        record(Buffer.from(error.message));
        finish(null);
      });
      child.on("close", finish);
      child.stdin.on("error", () => {});
      child.stdin.end(input);
    });
  } finally {
    await Promise.all(writes);
    await handle.close();
  }
}
async function safeArtifact(root: string, path: string) {
  const full = local(root, path);
  let part = root;
  for (const component of relative(root, full).split("/")) {
    part = join(part, component);
    try {
      if ((await lstat(part)).isSymbolicLink())
        throw Error(`Symlink evidence path rejected: ${path}`);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  return full;
}
async function fingerprint(root: string) {
  const entries: string[] = [];
  async function walk(dir: string) {
    for (const ent of (await readdir(dir, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      if (
        [
          ".git",
          ".ios-agent",
          "node_modules",
          ".build",
          "DerivedData",
          "build",
          "xcuserdata",
          "project.xcworkspace",
        ].includes(ent.name) ||
        ent.name.endsWith(".xcresult")
      )
        continue;
      const path = join(dir, ent.name);
      if (ent.isDirectory()) await walk(path);
      else if (ent.isSymbolicLink())
        throw Error(`Symlink source not supported: ${path}`);
      else if (ent.isFile())
        entries.push(relative(root, path) + ":" + hash(await readFile(path)));
    }
  }
  await walk(root);
  return hash(entries.join("\n"));
}
async function claude(
  root: string,
  prompt: string,
  log: string,
  planning: boolean,
) {
  const args = [
    "-p",
    "--output-format",
    "json",
    "--max-turns",
    "12",
    "--strict-mcp-config",
    "--mcp-config",
    '{"mcpServers":{}}',
    "--tools",
    planning ? "Read,Glob,Grep" : "Read,Glob,Grep,Edit,Write",
    "--allowedTools",
    planning ? "Read,Glob,Grep" : "Read,Glob,Grep,Edit,Write",
    "--permission-mode",
    planning ? "default" : "acceptEdits",
  ];
  const result = await runProcess("claude", args, root, 600, log, prompt);
  if (result.exitCode !== 0 || result.timedOut || result.interrupted)
    throw Error(`Claude did not finish. See ${log}`);
  const raw = JSON.parse(result.stdout);
  if (raw.is_error) throw Error(`Claude returned an error. See ${log}`);
  return String(raw.result ?? "");
}
export async function appLoop(argv: string[]) {
  const action = argv[0];
  const value = (flag: string) => {
    const i = argv.indexOf(flag);
    return i < 0 ? undefined : argv[i + 1];
  };
  const root = resolve(value("--project") ?? process.cwd());
  const directory = join(root, ".ios-agent", "loop");
  await mkdir(directory, { recursive: true });
  const statePath = join(directory, "state.json");
  if (action === "status") {
    console.log(await readFile(statePath, "utf8"));
    return;
  }
  const lockPath = join(directory, "lock");
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    const pid = Number(await readFile(lockPath, "utf8"));
    if (!Number.isInteger(pid) || pid <= 0)
      throw Error("Unrecognized loop lock; inspect before removing it.");
    let alive = true;
    try {
      process.kill(pid, 0);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ESRCH") alive = false;
    }
    if (alive) throw Error("Another loop is active.");
    await rm(lockPath);
    lock = await open(lockPath, "wx");
  }
  await lock.writeFile(String(process.pid));
  try {
    if (action === "init") {
      try {
        await stat(statePath);
        throw Error("A saved loop already exists; use resume.");
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      }
      const briefPath = value("--brief");
      const configPath = value("--checks");
      if (!briefPath || !configPath)
        throw Error("init requires --brief brief.md --checks checks.json");
      const brief = await readFile(resolve(root, briefPath), "utf8");
      const config = Config.parse(
        JSON.parse(await readFile(resolve(root, configPath), "utf8")),
      );
      validate(config);
      for (const c of config.checks)
        for (const a of c.artifacts) local(root, a);
      const prompt = `Plan an iOS app from this brief. Do not edit files. Return ONLY JSON, no markdown, shaped {"summary":"...","screens":["..."],"features":["..."],"criteria":[{"id":"...","description":"...","checkIds":["existing-check-id"]}]}. Every criterion needs supplied check IDs. Use exactly the supplied screen names in screens. Do not invent verification claims.\nBRIEF:\n${brief}\nCHECKS:\n${JSON.stringify(config)}`;
      const response = value("--plan")
        ? await readFile(resolve(root, value("--plan")!), "utf8")
        : await claude(root, prompt, join(directory, "plan.log"), true);
      const plan = Plan.parse(
        JSON.parse(response.replace(/^```(?:json)?\s*|\s*```$/g, "")),
      );
      validate(config, plan);
      const limit = Number(value("--attempts") ?? 3);
      if (!Number.isInteger(limit) || limit < 1 || limit > 10)
        throw Error("Attempts must be 1–10");
      const protectedHashes: Record<string, string> = {};
      for (const file of config.protectedFiles)
        protectedHashes[file] = hash(await readFile(local(root, file), "utf8"));
      const state: State = {
        version: 1,
        protectedHashes,
        brief,
        plan,
        config,
        attempts: 0,
        limit,
        status: "planned",
        results: [],
        events: [],
      };
      await save(statePath, state);
      console.log(
        `Plan saved: ${statePath}. Review checks/plan, then run loop resume.`,
      );
      return;
    }
    if (action !== "resume")
      throw Error(
        "Usage: ios-agent-mcp loop init|resume|status --project PATH [--brief brief.md --checks checks.json --attempts 3] [--verify-only]",
      );
    const parsed = JSON.parse(await readFile(statePath, "utf8"));
    const StateSchema = z
      .object({
        version: z.literal(1),
        protectedHashes: z.record(z.string()),
        brief: z.string(),
        plan: Plan,
        config: Config,
        attempts: z.number().int().min(0).max(10),
        limit: z.number().int().min(1).max(10),
        status: z.enum([
          "planned",
          "implementing",
          "checking",
          "blocked",
          "complete",
        ]),
        reason: z.string().optional(),
        fingerprint: z.string().optional(),
        results: z.array(
          z.object({
            id: z.string(),
            passed: z.boolean(),
            exitCode: z.number().int().nullable(),
            log: z.string(),
            logHash: z.string().optional(),
            artifacts: z.array(z.string()),
            artifactHashes: z.record(z.string()).optional(),
            reason: z.string().optional(),
          }),
        ),
        events: z.array(z.object({ at: z.string(), message: z.string() })),
      })
      .strict();
    const state: State = StateSchema.parse(parsed);
    if (
      new Set(state.results.map((r) => r.id)).size !== state.results.length ||
      state.results.some(
        (r) =>
          !state.config.checks.some(
            (c) =>
              c.id === r.id &&
              JSON.stringify(c.artifacts) === JSON.stringify(r.artifacts),
          ),
      )
    )
      throw Error("Invalid saved check results");
    state.config = Config.parse(state.config);
    state.plan = Plan.parse(state.plan);
    validate(state.config, state.plan);
    if (
      !Number.isInteger(state.limit) ||
      state.limit < 1 ||
      state.limit > 10 ||
      !Number.isInteger(state.attempts) ||
      state.attempts < 0
    )
      throw Error("Invalid saved retry budget");
    const checkProtected = async () => {
      for (const file of state.config.protectedFiles)
        if (
          hash(await readFile(local(root, file), "utf8")) !==
          state.protectedHashes[file]
        )
          throw Error(
            `Frozen verification file changed: ${file}. Restore it before resuming.`,
          );
    };
    await checkProtected();
    const evidenceValid = async (r: Result) => {
      try {
        if (
          !r.log.startsWith(".ios-agent/loop/") ||
          hash(await readFile(resolve(root, r.log))) !== r.logHash
        )
          return false;
      } catch {
        return false;
      }
      for (const file of r.artifacts) {
        try {
          if (
            hash(await readFile(await safeArtifact(root, file), "base64")) !==
            r.artifactHashes?.[file]
          )
            return false;
        } catch {
          return false;
        }
      }
      return true;
    };
    for (const r of state.results)
      if (r.passed && !(await evidenceValid(r))) r.passed = false;
    const event = async (message: string) => {
      state.events.push({ at: new Date().toISOString(), message });
      await save(statePath, state);
      console.log(message);
    };
    const resolvedArtifacts = state.config.checks.flatMap((c) =>
      c.artifacts.map((a) => local(root, a)),
    );
    if (new Set(resolvedArtifacts).size !== resolvedArtifacts.length)
      throw Error("Duplicate resolved artifact paths");
    const initialFingerprint = await fingerprint(root);
    if (
      state.status === "complete" &&
      state.fingerprint === initialFingerprint &&
      state.results.length === state.config.checks.length &&
      state.results.every((r) => r.passed)
    ) {
      console.log(
        "Already complete; source unchanged. Saved evidence retained.",
      );
      return;
    }
    if (state.fingerprint !== initialFingerprint) state.results = [];
    const verify = async () => {
      await checkProtected();
      state.fingerprint = await fingerprint(root);
      const before = state.fingerprint;
      state.status = "checking";
      await event("Running acceptance checks");
      for (const check of state.config.checks) {
        if (state.results.some((r) => r.id === check.id && r.passed)) continue;
        const log = join(directory, `${state.attempts}-${check.id}.log`);
        for (const a of check.artifacts)
          await rm(await safeArtifact(root, a), { force: true });
        const output = await runProcess(
          check.command,
          check.args,
          root,
          check.timeoutSeconds,
          log,
        );
        if (output.interrupted)
          throw Error("Interrupted; saved checks can be resumed.");
        let passed = output.exitCode === 0 && !output.timedOut;
        let reason = output.timedOut ? "Timed out" : undefined;
        for (const a of check.artifacts) {
          try {
            const info = await stat(await safeArtifact(root, a));
            if (!info.isFile() || !info.size) throw Error("empty");
          } catch {
            passed = false;
            reason = `Missing/nonempty artifact required: ${a}`;
          }
        }
        const artifactHashes: Record<string, string> = {};
        if (passed)
          for (const a of check.artifacts)
            artifactHashes[a] = hash(
              await readFile(await safeArtifact(root, a), "base64"),
            );
        const result: Result = {
          logHash: hash(await readFile(log)),
          artifactHashes,
          id: check.id,
          passed,
          exitCode: output.exitCode,
          log: relative(root, log),
          artifacts: check.artifacts,
          reason,
        };
        state.results = state.results
          .filter((r) => r.id !== check.id)
          .concat(result);
        await event(`${check.id}: ${passed ? "PASS" : "FAIL"}`);
      }
      if ((await fingerprint(root)) !== before) {
        state.results = [];
        state.fingerprint = undefined;
        await save(statePath, state);
        throw Error("Source changed during verification; rerun checks.");
      }
      return (
        state.results.length === state.config.checks.length &&
        state.results.every((r) => r.passed)
      );
    };
    while (true) {
      if (await verify()) {
        await checkProtected();
        state.status = "complete";
        state.reason = undefined;
        await event(
          "Complete: every configured acceptance check passed. Screenshots are evidence, not automatic visual judgment.",
        );
        return;
      }
      if (argv.includes("--verify-only") || state.attempts >= state.limit) {
        state.status = "blocked";
        state.reason = argv.includes("--verify-only")
          ? "Verification failed; no agent changes requested."
          : "Retry limit reached.";
        await event(state.reason);
        process.exitCode = 1;
        return;
      }
      state.attempts++;
      state.status = "implementing";
      await event(`Implementation attempt ${state.attempts}/${state.limit}`);
      const contract = JSON.stringify({
        brief: state.brief,
        plan: state.plan,
        config: state.config,
        protectedHashes: state.protectedHashes,
      });
      const failures = await Promise.all(
        state.results
          .filter((r) => !r.passed)
          .map(async (r) => ({
            check: r.id,
            reason: r.reason,
            output: (await readFile(resolve(root, r.log), "utf8")).slice(
              -14000,
            ),
          })),
      );
      try {
        await claude(
          root,
          `Implement/fix this iOS app. Edit implementation source within this project only. Never edit frozen files: ${state.config.protectedFiles.join(", ")}. Never weaken checks or edit .ios-agent/loop, the check configuration or verification scripts. No git commits, publishing, or dependency installation. Your edits will be independently verified.\n${contract}\nFAILURES:\n${JSON.stringify(failures)}`,
          join(directory, `agent-${state.attempts}.log`),
          false,
        );
      } catch (e) {
        state.status = "blocked";
        state.reason = String(e);
        await event(state.reason);
        process.exitCode = 1;
        return;
      }
      const disk = JSON.parse(await readFile(statePath, "utf8")) as State;
      if (
        JSON.stringify({
          brief: disk.brief,
          plan: disk.plan,
          config: disk.config,
          protectedHashes: disk.protectedHashes,
        }) !== contract
      )
        throw Error(
          "Agent changed frozen acceptance contract; inspect before resuming.",
        );
      await checkProtected();
      state.results = [];
      state.fingerprint = undefined;
      await save(statePath, state);
    }
  } catch (error) {
    try {
      const existing = JSON.parse(await readFile(statePath, "utf8"));
      existing.status = "blocked";
      existing.reason = error instanceof Error ? error.message : String(error);
      await save(statePath, existing);
    } catch {}
    throw error;
  } finally {
    await lock.close();
    await rm(join(directory, "lock"), { force: true });
  }
}
