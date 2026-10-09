import { executeAgent, agentFingerprint } from "./agent-bridge.mjs";
import {
  createCustom,
  customContract,
  customFingerprint,
  executeCustom,
  recoverCustom,
  restoreCustom,
} from "./custom.mjs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export async function atomic(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = file + ".tmp";
  await fs.writeFile(temp, JSON.stringify(value, null, 2));
  await fs.rename(temp, file);
}
export function parseAnswer(text) {
  const envelope = JSON.parse(text);
  if (envelope.is_error)
    throw Error(envelope.result || "The coding client failed.");
  let value = envelope.result;
  if (typeof value !== "string")
    throw Error("The coding client returned no answer.");
  value = value
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");
  return JSON.parse(value);
}
export function validatePlan(p) {
  if (
    !p ||
    typeof p.summary !== "string" ||
    !Array.isArray(p.screens) ||
    !Array.isArray(p.criteria) ||
    !p.criteria.length ||
    !p.screens.length
  )
    throw Error("Incomplete plan. Try planning again.");
  for (const key of ["screens", "criteria"])
    if (
      p[key].length > 15 ||
      p[key].some((x) => typeof x !== "string" || x.length > 1000)
    )
      throw Error("Invalid plan details.");
  return {
    summary: p.summary.slice(0, 2000),
    screens: p.screens,
    criteria: p.criteria,
  };
}
export function validateChanges(p) {
  const allowed = new Set([
    "App/ReadingListApp.swift",
    "App/ReadingStore.swift",
  ]);
  if (
    !p ||
    !Array.isArray(p.files) ||
    !p.files.length ||
    p.files.length > 2 ||
    typeof p.summary !== "string"
  )
    throw Error("Invalid code response. No files were changed.");
  const seen = new Set();
  for (const f of p.files) {
    if (
      !allowed.has(f.path) ||
      seen.has(f.path) ||
      typeof f.content !== "string" ||
      !f.content.trim() ||
      Buffer.byteLength(f.content) > 150000
    )
      throw Error(
        "Code response targets an unsupported file. No files were changed.",
      );
    seen.add(f.path);
  }
  return p;
}
export function applyEdits(answer, sources) {
  if (
    !Array.isArray(answer.edits) ||
    !answer.edits.length ||
    answer.edits.length > 12 ||
    typeof answer.summary !== "string"
  )
    throw Error("Invalid edit response");
  const changed = {};
  for (const e of answer.edits) {
    if (
      !Object.hasOwn(sources, e.path) ||
      typeof e.before !== "string" ||
      !e.before.length ||
      typeof e.after !== "string"
    )
      throw Error("Invalid edit target");
    const text = changed[e.path] ?? sources[e.path];
    if (text.split(e.before).length !== 2)
      throw Error("Edit context must match exactly once. No files changed.");
    changed[e.path] = text.replace(e.before, () => e.after);
  }
  return validateChanges({
    summary: answer.summary,
    files: Object.entries(changed).map(([path, content]) => ({
      path,
      content,
    })),
  });
}
function failureDetail(out, err) {
  try {
    const value = JSON.parse(out);
    if (value.is_error && typeof value.result === "string") return value.result;
  } catch {}
  const diagnostic = out
    .split("\n")
    .filter((line) => /error:|failed|Waiting.+to exist/.test(line))
    .slice(-25)
    .join("\n");
  return (diagnostic || out + "\n" + err).slice(-5000);
}
export async function run(
  command,
  args,
  { cwd, signal, onText = () => {}, timeout = 600000, env = {} } = {},
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(Error("Cancelled"));
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...Object.fromEntries(
          Object.entries(env).filter(([k]) => k !== "STUDIO_PROMPT"),
        ),
      },
      stdio: ["pipe", "pipe", "pipe"],
      detached: process.platform !== "win32",
    });
    let out = "",
      err = "",
      reason;
    const stop = () => {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    };
    const abort = () => {
      reason = "Cancelled";
      stop();
    };
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => {
      reason = "Command timed out";
      stop();
      hardStop();
    }, timeout);
    let killTimer;
    const hardStop = () => {
      if (killTimer) return;
      killTimer = setTimeout(() => {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {}
      }, 3000);
      killTimer.unref();
    };
    signal?.addEventListener("abort", hardStop, { once: true });
    function collect(chunk, isErr) {
      const s = chunk.toString();
      if (isErr) err = (err + s).slice(-120000);
      else out += s;
      onText(s);
      if (out.length > 2000000) {
        out = out.slice(-2000000);
        reason = "Command output limit exceeded";
        stop();
        hardStop();
      }
    }
    child.stdout.on("data", (x) => collect(x, false));
    child.stderr.on("data", (x) => collect(x, true));
    const cleanup = () => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      signal?.removeEventListener("abort", abort);
      signal?.removeEventListener("abort", hardStop);
    };
    child.on("error", (e) => {
      cleanup();
      reject(e);
    });
    child.on("close", (code) => {
      cleanup();
      reason
        ? reject(Error(reason))
        : code === 0
          ? resolve(out)
          : reject(
              Error(`${command} failed (${code}). ${failureDetail(out, err)}`),
            );
    });
    child.stdin.end(env.STUDIO_PROMPT || "");
  });
}
export class Studio {
  constructor(root, repo, runner = run) {
    this.root = root;
    this.repo = repo;
    this.runner = runner;
    this.jobs = new Map();
    this.reserved = false;
  }
  dir(id) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw Error("Invalid project");
    return path.join(this.root, id);
  }
  async init() {
    await fs.mkdir(this.root, { recursive: true });
    for (const p of await this.list()) {
      if (p.template === "custom") await recoverCustom(this, p);
      if (p.busy) {
        p.busy = false;
        p.status = "interrupted";
        p.error =
          "Studio restarted. Your source and completed evidence are saved. Build again to continue.";
        await this.save(p);
      }
    }
  }
  async list() {
    const entries = await fs.readdir(this.root);
    const result = [];
    for (const id of entries) {
      if (!/^[a-f0-9-]{36}$/.test(id)) continue;
      try {
        result.push(await this.get(id));
      } catch {}
    }
    return result.sort((a, b) => b.updated.localeCompare(a.updated));
  }
  async get(id) {
    return JSON.parse(
      await fs.readFile(path.join(this.dir(id), "state.json"), "utf8"),
    );
  }
  async save(p) {
    p.updated = new Date().toISOString();
    await atomic(path.join(this.dir(p.id), "state.json"), p);
  }
  async create(name, brief, provider = "codex", template = "reading-list", backend = "none") {
    if (!["none", "local"].includes(backend) || (backend === "local" && template !== "custom")) throw Error("Backend requires a custom project");
    if (!["agent", "custom", "reading-list"].includes(template))
      throw Error("Unknown project foundation");
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 60 ||
      typeof brief !== "string" ||
      !brief.trim() ||
      brief.length > 10000
    )
      throw Error("Enter an app name and a brief (up to 10,000 characters).");
    if (!["claude", "codex"].includes(provider))
      throw Error("Unsupported client");
    if (template === "agent" && provider !== "claude") throw Error("Shared agent requires Claude Code; choose it explicitly.");
    const id = randomUUID(),
      dir = this.dir(id);
    await fs.mkdir(dir);
    if (template === "agent") {
      const p = {id,provider,template,name:name.trim(),brief,status:"draft",busy:false,messages:[],events:[],plan:null,evidence:null,created:new Date().toISOString()};
      await fs.mkdir(path.join(dir,"project")); await this.save(p); return p;
    }
    if (template === "custom")
      return createCustom(this, id, name, brief, provider, backend);
    await fs.cp(
      path.join(this.repo, "samples/ReadingList"),
      path.join(dir, "project"),
      {
        recursive: true,
        filter: (s) =>
          !s
            .split(path.sep)
            .some((x) => [".build", ".ios-agent", "xcuserdata", ".env", "Secrets.xcconfig"].includes(x)),
      },
    );
    const projectFile = path.join(
      dir,
      "project/ReadingList.xcodeproj/project.pbxproj",
    );
    const slug =
      name
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()
        .slice(0, 40) || "myapp";
    const bundle = "com.example." + slug + ".app" + id.slice(0, 8);
    await fs.writeFile(
      projectFile,
      (await fs.readFile(projectFile, "utf8")).replaceAll(
        "dev.iosagent.demo",
        bundle,
      ),
    );
    const spec = path.join(dir, "project/project.yml");
    await fs.writeFile(
      spec,
      (await fs.readFile(spec, "utf8")).replaceAll("dev.iosagent.demo", bundle),
    );
    await fs.writeFile(
      path.join(dir, "project/APP_BRIEF.md"),
      "# " + name + "\n\n" + brief + "\n",
    );
    await fs.copyFile(
      path.join(this.repo, "LICENSE"),
      path.join(dir, "project/THIRD_PARTY_LICENSE.txt"),
    );
    const p = {
      id,
      provider,
      contractHash: await this.contract(id),
      name: name.trim(),
      brief,
      status: "draft",
      busy: false,
      messages: [],
      events: [],
      plan: null,
      evidence: null,
      created: new Date().toISOString(),
    };
    await this.save(p);
    return p;
  }
  async log(p, text) {
    p.events.push({ time: new Date().toISOString(), text: text.slice(-5000) });
    p.events = p.events.slice(-160);
    await this.save(p);
  }
  async fingerprint(id) {
    if ((await this.get(id)).template === "agent") return agentFingerprint(this,id);
    if ((await this.get(id)).template === "custom")
      return customFingerprint(path.join(this.dir(id), "project"));
    const base = path.join(this.dir(id), "project");
    let text = await this.contract(id);
    for (const f of ["App/ReadingListApp.swift", "App/ReadingStore.swift"]) {
      if ((await fs.lstat(path.join(base, f))).isSymbolicLink())
        throw Error("Symlink source is not supported");
      text += f + (await fs.readFile(path.join(base, f), "utf8"));
    }
    return digest(text);
  }
  async contract(id) {
    const base = path.join(this.dir(id), "project");
    try {
      await fs.lstat(path.join(base, ".studio-custom.json"));
      return customContract(base);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    let value = "";
    for (const file of [
      "verify.py",
      "Tests/ReadingStoreTests.swift",
      "UITests/ReadingListUITests.swift",
      "ReadingList.xcodeproj/project.pbxproj",
      "ReadingList.xcodeproj/xcshareddata/xcschemes/ReadingList.xcscheme",
    ]) {
      const stat = await fs.lstat(path.join(base, file));
      if (stat.isSymbolicLink())
        throw Error("Symlink in protected project files");
      value += file + (await fs.readFile(path.join(base, file), "utf8"));
    }
    return digest(value);
  }
  async exclusive(work) {
    if (this.jobs.size || this.reserved)
      throw Error("Wait for the active task to finish.");
    this.reserved = true;
    try {
      return await work();
    } finally {
      this.reserved = false;
    }
  }
  async restore(id) {
    return this.exclusive(() => this.restoreUnlocked(id));
  }
  async restoreUnlocked(id) {
    const p = await this.get(id);
    if (p.template === "custom") return restoreCustom(this, p);
    if (!p.lastRevision) throw Error("No previous revision.");
    if (!/^\d+$/.test(p.lastRevision)) throw Error("Invalid revision");
    const dir = path.join(this.dir(id), "revisions", p.lastRevision);
    for (const f of await fs.readdir(dir)) {
      if (!["ReadingListApp.swift", "ReadingStore.swift"].includes(f)) continue;
      await fs.copyFile(
        path.join(dir, f),
        path.join(this.dir(id), "project/App", f),
      );
    }
    p.evidence = null;
    p.status = "restored";
    p.error = null;
    p.lastRevision = null;
    await this.log(
      p,
      "Previous source restored. Verify before using the preview.",
    );
    return p;
  }
  async exportProject(id) {
    return this.exclusive(() => this.exportUnlocked(id));
  }
  async exportUnlocked(id) {
    const before = await this.fingerprint(id);
    const dir = this.dir(id);
    const staging = await fs.mkdtemp(path.join(dir, "export-"));
    try {
      const target = path.join(staging, "AppProject");
      await fs.cp(path.join(dir, "project"), target, {
        recursive: true,
        filter: (p) =>
          !p
            .split(path.sep)
            .some((x) => [".build", ".ios-agent", "xcuserdata", ".env", "Secrets.xcconfig"].includes(x)),
      });
      const zip = path.join(staging, "project.zip");
      await this.runner("ditto", ["-c", "-k", "--norsrc", "--keepParent", target, zip]);
      if (before !== (await this.fingerprint(id)))
        throw Error("Source changed during export. Export again.");
      return await fs.readFile(zip);
    } finally {
      await fs.rm(staging, { recursive: true, force: true });
    }
  }
  async client(prompt, signal, provider = "codex") {
    if (provider === "claude")
      return parseAnswer(
        await this.runner(
          "claude",
          [
            "-p",
            "--output-format",
            "json",
            "--max-turns",
            "1",
            "--tools",
            "",
            "--strict-mcp-config",
            "--mcp-config",
            '{"mcpServers":{}}',
            "--no-session-persistence",
            "--setting-sources",
            "user",
          ],
          { cwd: this.root, signal, env: { STUDIO_PROMPT: prompt } },
        ),
      );
    const scratch = await fs.mkdtemp(path.join(this.root, "client-"));
    const output = path.join(scratch, "answer.json");
    try {
      await this.runner(
        "codex",
        [
          "exec",
          "--ignore-user-config",
          "--skip-git-repo-check",
          "--ephemeral",
          "--sandbox",
          "read-only",
          "-c",
          'approval_policy="never"',
          "-c",
          "features.shell_tool=false",
          "--output-last-message",
          output,
          "-",
        ],
        {
          cwd: scratch,
          signal,
          env: {
            STUDIO_PROMPT:
              "Do not use tools. Return only the requested JSON.\n" + prompt,
          },
        },
      );
      return JSON.parse(
        (await fs.readFile(output, "utf8"))
          .trim()
          .replace(/^```(?:json)?\s*/, "")
          .replace(/\s*```$/, ""),
      );
    } finally {
      await fs.rm(scratch, { recursive: true, force: true });
    }
  }
  async action(id, kind, message) {
    if (this.jobs.size || this.reserved)
      throw Error(
        "Another task is running. Stop it or wait before starting a new task.",
      );
    if (!["plan", "build", "refine", "verify"].includes(kind))
      throw Error("Unknown action");
    this.reserved = true;
    let p;
    try {
      p = await this.get(id);
      if (
        kind === "refine" &&
        (typeof message !== "string" ||
          !message.trim() ||
          message.length > 10000)
      )
        throw Error("Describe your change.");
      if (["build", "refine"].includes(kind) && !p.plan)
        throw Error("Create a plan first.");
    } catch (e) {
      this.reserved = false;
      throw e;
    }
    const controller = new AbortController();
    this.jobs.set(id, controller);
    this.reserved = false;
    p.busy = true;
    p.error = null;
    p.status = kind;
    p.messages.push({
      role: "user",
      text:
        kind === "refine"
          ? message
          : {
              plan: "Plan my app",
              build: "Build this plan",
              verify:
                p.template === "custom"
                  ? "Run the planned app checks"
                  : "Run the reading-list acceptance checks",
            }[kind],
    });
    try {
      await this.save(p);
    } catch (e) {
      this.jobs.delete(id);
      throw e;
    }
    this.execute(p, kind, message, controller.signal)
      .catch(async (e) => {
        p.status = controller.signal.aborted ? "cancelled" : "failed";
        p.error = e.message;
        await this.log(p, e.message);
      })
      .finally(async () => {
        p.busy = false;
        try {
          await this.save(p);
        } finally {
          this.jobs.delete(id);
        }
      })
      .catch((e) => console.error("Could not persist task state:", e.message));
    return p;
  }
  cancel(id) {
    this.jobs.get(id)?.abort();
  }
  async execute(p, kind, message, signal, attempt = 0) {
    if (p.template === "agent") return executeAgent(this,p,kind,message,signal);
    if (p.template === "custom")
      return executeCustom(this, p, kind, message, signal, attempt);
    if (signal.aborted) throw Error("Cancelled");
    const project = path.join(this.dir(p.id), "project");
    if (p.contractHash && p.contractHash !== (await this.contract(p.id)))
      throw Error(
        "Acceptance files changed. Create a new workspace to use the original checks.",
      );
    if (kind === "plan") {
      p.plan = validatePlan(
        await this.client(
          `Plan an iOS app based on this brief: ${p.brief}\nThis first studio uses a reading-list starter with persistence, search, progress and accessible empty/error states. Be honest about extensions. Return only JSON {"summary":"...","screens":["..."],"criteria":["testable behavior"]}. No markdown.`,
          signal,
          p.provider,
        ),
      );
      if (signal.aborted) throw Error("Cancelled");
      p.status = "planned";
      p.messages.push({ role: "assistant", text: p.plan.summary });
      await this.log(p, "Plan ready for review. No source edited.");
      return;
    }
    if (kind === "build" || kind === "refine") {
      p.status = attempt > 0 ? "repairing" : "generating";
      await this.save(p);
      const generationHash = await this.fingerprint(p.id);
      let source = "";
      const sources = {};
      for (const file of [
        "App/ReadingListApp.swift",
        "App/ReadingStore.swift",
      ]) {
        sources[file] = await fs.readFile(path.join(project, file), "utf8");
        source += `\nFILE ${file}\n${sources[file]}`;
      }
      await this.log(
        p,
        "Your coding client is preparing Swift changes. Existing tests and project settings are protected.",
      );
      const response = await this.client(
        `You build SwiftUI iOS apps. Return JSON only: {"summary":"changes","files":[{"path":"App/ReadingListApp.swift","content":"full Swift file"}]}. For small refinements prefer {"summary":"changes","edits":[{"path":"App/ReadingListApp.swift","before":"exact unique existing text","after":"replacement text"}]} instead of files. You may also modify App/ReadingStore.swift. No other files. Preserve existing type names, public store API, test launch arguments and accessibility identifiers. Preserve tested visible strings: "Your next chapter starts here", "Library unavailable", "Mark as unread", "Mark as finished". The add-book identifier must be unique on each visible screen. iOS 17+; @MainActor observable state; accessible empty/error states. No network, external dependencies, personal branding, shell execution or signing. Implement the request using the existing project.\nApp name: ${p.name}\nBrief: ${p.brief}\nPlan: ${JSON.stringify(p.plan)}\nRequested change: ${message || "Implement the plan with a polished SwiftUI design. Preserve the reading-list behaviors."}\n${source}`,
        signal,
        p.provider,
      );
      const answer = response.edits
        ? applyEdits(response, sources)
        : validateChanges(response);
      if (signal.aborted) throw Error("Cancelled");
      if (generationHash !== (await this.fingerprint(p.id)))
        throw Error(
          "Source changed while the client was working. Your edits were preserved; try again.",
        );
      if (attempt === 0) {
        const revision = Date.now().toString();
        const backup = path.join(this.dir(p.id), "revisions", revision);
        await fs.mkdir(backup, { recursive: true });
        for (const file of [
          "App/ReadingListApp.swift",
          "App/ReadingStore.swift",
        ])
          await fs.writeFile(
            path.join(backup, path.basename(file)),
            await fs.readFile(path.join(project, file)),
          );
        p.lastRevision = revision;
      }
      p.evidence = null;
      await this.save(p);
      for (const file of answer.files)
        await fs.writeFile(path.join(project, file.path), file.content);
      p.messages.push({ role: "assistant", text: answer.summary });
      await this.log(
        p,
        "Swift files saved. Building and testing on the simulator…",
      );
    }
    const logFile = path.join(this.dir(p.id), "verification.log");
    try {
      await fs.copyFile(
        logFile,
        path.join(this.dir(p.id), `verification-${Date.now()}.log`),
      );
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await fs.writeFile(logFile, "");
    p.status = "verifying";
    p.evidence = null;
    await this.save(p);
    // Reuse the repository acceptance script; no agent-defined commands or tests run here.
    const testedHash = await this.fingerprint(p.id);
    let writes = Promise.resolve();
    try {
      await this.runner("python3", ["verify.py"], {
        cwd: project,
        signal,
        timeout: 1200000,
        onText: (s) => {
          writes = writes.then(() => fs.appendFile(logFile, s));
        },
      });
      await writes;
    } catch (e) {
      await writes;
      if (kind !== "verify" && attempt < 1 && !signal.aborted) {
        await this.log(
          p,
          "Verification failed. Attempting one bounded repair, keeping the tests unchanged.",
        );
        return this.execute(
          p,
          "refine",
          "Repair this build/test failure with the smallest source-only change: " +
            e.message,
          signal,
          attempt + 1,
        );
      }
      throw e;
    }
    if (p.contractHash && p.contractHash !== (await this.contract(p.id)))
      throw Error("Acceptance files changed during verification.");
    if (testedHash !== (await this.fingerprint(p.id)))
      throw Error("Source changed during verification. Run checks again.");
    const names = [
      "empty",
      "add",
      "library",
      "detail",
      "search-empty",
      "error",
    ];
    const hashes = {};
    for (const name of names) {
      const b = await fs.readFile(
        path.join(project, ".ios-agent/evidence", name + ".png"),
      );
      if (
        !b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        throw Error("Invalid screenshot evidence");
      hashes[name] = digest(b);
    }
    if (signal.aborted) throw Error("Cancelled");
    if (testedHash !== (await this.fingerprint(p.id)))
      throw Error("Source changed during evidence collection.");
    if (signal.aborted) throw Error("Cancelled");
    p.evidence = {
      sourceHash: testedHash,
      screens: hashes,
      date: new Date().toISOString(),
      scope:
        "Reading-list acceptance tests; custom plan criteria require separate review.",
    };
    p.status = "verified";
    p.messages.push({
      role: "assistant",
      text: "Reading-list build and acceptance tests passed. Six simulator captures are ready. Review your additional plan criteria before calling the whole app complete.",
    });
    await this.log(
      p,
      "Verification passed. Source and screenshot hashes saved.",
    );
  }
  async screenshot(id, name) {
    const p = await this.get(id);
    const names =
      p.template === "agent" ? Object.keys(p.evidence?.screens ?? {}) : p.template === "custom"
        ? (p.plan?.journeys ?? []).map((j) => j.screen)
        : ["empty", "add", "library", "detail", "search-empty", "error"];
    if (!names.includes(name)) throw Error("Unknown screenshot");
    if (!p.evidence || p.evidence.sourceHash !== (await this.fingerprint(id)))
      throw Error("Preview is stale. Verify again.");
    if (p.template === "agent") {
      const file = p.evidence.paths[name];
      if (typeof file !== "string" || !/^\.ios-agent\/screenshots\/[a-zA-Z0-9_.-]+\.png$/.test(file)) throw Error("Invalid screenshot path");
      const root = await fs.realpath(path.join(this.dir(id), "project"));
      const actual = await fs.realpath(path.join(root,file));
      if (!actual.startsWith(root + path.sep)) throw Error("Screenshot escapes project");
    }
    const b = await fs.readFile(
      p.template === "agent" ? path.join(this.dir(id), "project", p.evidence.paths[name]) : path.join(this.dir(id), "project/.ios-agent/evidence", name + ".png"),
    );
    if (digest(b) !== p.evidence.screens[name])
      throw Error("Preview hash mismatch");
    return b;
  }
}
