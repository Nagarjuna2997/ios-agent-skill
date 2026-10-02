import { backendGuide } from "./backend.mjs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  projectText,
  schemeText,
  validateCustomPlan,
  acceptanceSwift,
} from "./project.mjs";
const hash = (b) => createHash("sha256").update(b).digest("hex");
const projectFiles = [
  ".studio-custom.json",
  "AppProject.xcodeproj/project.pbxproj",
  "AppProject.xcodeproj/xcshareddata/xcschemes/AppProject.xcscheme",
  "UITests/AcceptanceTests.swift",
  "acceptance.json",
  "verify.py",
];
const safeSource = (f) =>
  typeof f === "string" &&
  /^App\/(?:[A-Za-z][A-Za-z0-9_]*\/){0,3}[A-Za-z][A-Za-z0-9_]*\.swift$/.test(f);
async function safePath(base, file) {
  if (
    typeof file !== "string" ||
    file.startsWith("/") ||
    file.includes("\\") ||
    file.split("/").some((x) => !x || x === "." || x === "..")
  )
    throw Error("Unsupported project path");
  const parts = file.split("/");
  for (let i = 1; i <= parts.length; i++) {
    try {
      if (
        (await fs.lstat(path.join(base, ...parts.slice(0, i)))).isSymbolicLink()
      )
        throw Error("Symlinks are not supported in project files");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  return path.join(base, file);
}
export async function sourceMap(base) {
  const result = {};
  async function walk(dir) {
    await safePath(base, dir);
    for (const e of await fs.readdir(path.join(base, dir), {
      withFileTypes: true,
    })) {
      const f = dir + "/" + e.name;
      if (e.isSymbolicLink()) throw Error("Symlink source is not supported");
      if (e.isDirectory()) {
        if (f.split("/").length > 4)
          throw Error("Source nesting limit exceeded");
        await walk(f);
      } else {
        if (!safeSource(f))
          throw Error("Custom App folder supports Swift source only: " + f);
        result[f] = await fs.readFile(path.join(base, f), "utf8");
      }
    }
  }
  await walk("App");
  validateSources(result);
  return Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b)),
  );
}
function validateSources(sources) {
  const files = Object.entries(sources);
  if (
    !files.length ||
    files.length > 24 ||
    files.some(
      ([f, s]) =>
        !safeSource(f) ||
        typeof s !== "string" ||
        !s.trim() ||
        Buffer.byteLength(s) > 150000,
    ) ||
    Buffer.byteLength(JSON.stringify(sources)) > 500000
  )
    throw Error("Use 1–24 Swift files under App/, up to 500 KB total.");
  const folded = files.map(([f]) => f.toLowerCase());
  if (new Set(folded).size !== files.length)
    throw Error("Case-colliding source paths");
}
export function customChanges(response, sources) {
  if (
    !response ||
    typeof response.summary !== "string" ||
    !response.summary.trim() ||
    response.summary.length > 3000
  )
    throw Error("Invalid change summary");
  const next = { ...sources };
  if (response.edits) {
    if (
      response.files ||
      response.delete ||
      !Array.isArray(response.edits) ||
      !response.edits.length ||
      response.edits.length > 40
    )
      throw Error("Use files or exact edits, not both");
    for (const e of response.edits) {
      if (
        !Object.hasOwn(next, e.path) ||
        typeof e.before !== "string" ||
        !e.before.length ||
        typeof e.after !== "string" ||
        next[e.path].split(e.before).length !== 2
      )
        throw Error("Edit must match existing Swift source exactly once");
      next[e.path] = next[e.path].replace(e.before, () => e.after);
    }
  } else {
    if (
      !Array.isArray(response.files) ||
      response.files.length > 24 ||
      !Array.isArray(response.delete ?? []) ||
      (response.delete ?? []).length > 24
    )
      throw Error("Invalid file changes");
    const seen = new Set();
    for (const f of response.files) {
      if (
        !safeSource(f.path) ||
        seen.has(f.path) ||
        typeof f.content !== "string"
      )
        throw Error("Invalid or duplicate Swift target");
      seen.add(f.path);
      next[f.path] = f.content;
    }
    for (const f of response.delete ?? []) {
      if (!safeSource(f) || !Object.hasOwn(sources, f) || seen.has(f))
        throw Error("Invalid deletion target");
      delete next[f];
    }
    if (!seen.size && !(response.delete ?? []).length)
      throw Error("No changes supplied");
  }
  validateSources(next);
  return next;
}
export async function customContract(base) {
  let s = "";
  for (const f of projectFiles)
    s += f + (await fs.readFile(await safePath(base, f), "utf8"));
  return hash(s);
}
export async function customFingerprint(base) {
  return hash(
    (await customContract(base)) + JSON.stringify(await sourceMap(base)),
  );
}
async function writeFiles(base, changes) {
  for (const [file, content] of Object.entries(changes)) {
    const dest = await safePath(base, file);
    if (content === null) await fs.rm(dest, { force: true });
    else {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest + ".studio-tmp", content, { flag: "wx" });
      await fs.rename(dest + ".studio-tmp", dest);
    }
  }
}
export async function recoverCustom(studio, p) {
  const journal = path.join(studio.dir(p.id), "transaction.json");
  await fs.rm(journal + ".pending", { force: true });
  let data;
  try {
    data = JSON.parse(await fs.readFile(journal, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return;
    throw e;
  }
  const base = path.join(studio.dir(p.id), "project");
  // Remove only temporary files from a previously interrupted trusted transaction.
  for (const f of Object.keys(data.before))
    await fs.rm((await safePath(base, f)) + ".studio-tmp", { force: true });
  await writeFiles(base, data.before);
  Object.assign(p, data.state, {
    busy: false,
    status: "interrupted",
    evidence: null,
    error:
      "An interrupted file update was rolled back. Your previous source is restored.",
  });
  await studio.save(p);
  await fs.rm(journal);
}
async function transaction(studio, p, changes, update) {
  const base = path.join(studio.dir(p.id), "project");
  const before = {};
  for (const f of Object.keys(changes)) {
    try {
      before[f] = await fs.readFile(await safePath(base, f), "utf8");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      before[f] = null;
    }
  }
  const journal = path.join(studio.dir(p.id), "transaction.json");
  // Publish the complete recovery record atomically, before any project mutation.
  const pending = journal + ".pending";
  const handle = await fs.open(pending, "wx");
  try {
    await handle.writeFile(JSON.stringify({ before, state: p }));
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.rename(pending, journal);
  try {
    await writeFiles(base, changes);
    await update();
    p.contractHash = await customContract(base);
    p.evidence = null;
    await studio.save(p);
    await fs.rm(journal);
  } catch (e) {
    await recoverCustom(studio, p);
    throw e;
  }
}
export async function createCustom(studio, id, name, brief, provider, backend = "none") {
  const base = path.join(studio.dir(id), "project");
  await fs.mkdir(path.join(base, "App"), { recursive: true });
  const bundle = "com.example.app" + id.replaceAll("-", "");
  const sources = {
    "App/AppMain.swift": `import SwiftUI\n@main\nstruct AppMain: App { var body: some Scene { WindowGroup { Text("Create a plan to build your app.").padding() } } }\n`,
  };
  const unplanned = {
    summary: "Not planned",
    screens: [],
    criteria: [],
    journeys: [],
  };
  await writeFiles(base, {
    ...sources,
    ".studio-custom.json": JSON.stringify({ name, bundle, format: 1 }),
    "AppProject.xcodeproj/project.pbxproj": projectText(
      Object.keys(sources),
      name,
      bundle,
    ),
    "AppProject.xcodeproj/xcshareddata/xcschemes/AppProject.xcscheme":
      schemeText(),
    "UITests/AcceptanceTests.swift":
      "// Create and review a plan before building.\n",
    "acceptance.json": JSON.stringify(unplanned),
    "verify.py": await fs.readFile(
      path.join(studio.repo, "studio/templates/verify-custom.py"),
      "utf8",
    ),
    "APP_BRIEF.md": "# " + name + "\n\n" + brief + "\n",
    "THIRD_PARTY_LICENSE.txt": await fs.readFile(
      path.join(studio.repo, "LICENSE"),
      "utf8",
    ),
  });
  const p = {
    id,
    name: name.trim(),
    brief,
    provider,
    template: "custom",
    backend,
    bundle,
    contractHash: await customContract(base),
    status: "draft",
    busy: false,
    messages: [],
    events: [],
    plan: null,
    evidence: null,
    created: new Date().toISOString(),
  };
  await studio.save(p);
  return p;
}
export async function restoreCustom(studio, p) {
  if (!/^\d+$/.test(p.lastRevision ?? "")) throw Error("No previous revision");
  const base = path.join(studio.dir(p.id), "project");
  if (p.contractHash !== (await customContract(base)))
    throw Error("Acceptance files changed. Restore stopped.");
  const sources = JSON.parse(
    await fs.readFile(
      path.join(studio.dir(p.id), "revisions", p.lastRevision, "sources.json"),
      "utf8",
    ),
  );
  validateSources(sources);
  const current = await sourceMap(base);
  const changes = {
    ...Object.fromEntries(Object.keys(current).map((f) => [f, null])),
    ...sources,
    "AppProject.xcodeproj/project.pbxproj": projectText(
      Object.keys(sources),
      p.name,
      p.bundle,
    ),
  };
  await transaction(studio, p, changes, async () => {
    p.lastRevision = null;
    p.status = "restored";
    p.error = null;
  });
  await studio.log(
    p,
    "Previous multi-file revision restored, including removed files. Verify again for current evidence.",
  );
  return p;
}
const planInstructions = `Plan a small offline native SwiftUI iOS app from the user's brief, not a reading-list template. Return only JSON:
{"summary":"scope and assumptions","screens":["screen"],"criteria":["manual visual review","specific testable behavior"],"manualCriteria":[0],"journeys":[{"name":"a user journey","criteria":[1],"steps":[{"action":"tap","role":"button","target":"unique-accessibility-id"},{"action":"type","role":"textField","target":"id","value":"sample"},{"action":"exists","role":"text","target":"visible result"}]}]}
Create 2–5 meaningful journeys covering create/edit/navigation and persistence by relaunch where relevant. Each journey starts with fresh data via --studio-reset; relaunch does NOT reset. Actions: tap, type (appends to field), exists, absent, text (exact label equality, needs value), relaunch (no other fields). Roles: button, textField, secureTextField, text, any. Targets match accessibility identifier or label exactly. Use stable accessibility identifiers for controls. Make assertions about visible outcomes, not just button existence. Avoid gestures, timing-dependent timers, system alerts, unsupported UI automation, and keychain/permissions. No network, accounts, services, payments or third-party dependencies. If requested, explicitly mark those as unimplemented manual scope rather than pretend. Each criterion must be covered by a journey or listed by zero-based index in manualCriteria. Tests are generated and frozen before implementation; do not invent unavailable features. Keep UI journeys short and actions reachable without scrolling. No markdown.`;
export async function executeCustom(
  studio,
  p,
  kind,
  message,
  signal,
  attempt = 0,
) {
  if (signal.aborted) throw Error("Cancelled");
  const dir = studio.dir(p.id),
    base = path.join(dir, "project");
  if (p.contractHash !== (await customContract(base)))
    throw Error(
      "Acceptance files changed. Create a new workspace rather than weakening checks.",
    );
  if (kind === "plan") {
    if (p.plan)
      throw Error(
        "This project’s test plan is frozen. Start another workspace for a different acceptance contract.",
      );
    const before = await customFingerprint(base);
    const prompt = planInstructions + (p.backend === "local" ? "\nOverride offline-only storage: use a local REST backend for all data, no login or paid services. Journeys must verify server data persists across relaunch. " : "") + "\nName: " + p.name + "\nBrief: " + p.brief;
    let answer = await studio.client(prompt, signal, p.provider);
    let plan;
    try { plan = validateCustomPlan(answer); }
    catch (error) {
      await studio.log(p, "Plan validation failed: " + error.message + ". Requesting one corrected plan before freezing any tests.");
      answer = await studio.client(prompt + "\nYour previous plan was invalid: " + error.message + "\nPrevious plan: " + JSON.stringify(answer) + "\nReturn the complete corrected JSON plan. Every zero-based criterion index must appear in journeys.criteria or manualCriteria.", signal, p.provider);
      plan = validateCustomPlan(answer);
    }
    if (signal.aborted) throw Error("Cancelled");
    if (before !== (await customFingerprint(base)))
      throw Error("Source changed while planning. Try again.");
    await transaction(
      studio,
      p,
      {
        "acceptance.json": JSON.stringify(plan, null, 2),
        "UITests/AcceptanceTests.swift": acceptanceSwift(plan),
      },
      async () => {
        p.plan = plan;
        p.status = "planned";
        p.messages.push({ role: "assistant", text: plan.summary });
      },
    );
    await studio.log(
      p,
      `${plan.journeys.length} app-specific UI journeys ready for review. Build plan accepts this frozen test contract.`,
    );
    return;
  }
  if (!p.plan)
    throw Error("Create a plan before building or checking your app.");
  if (kind === "build" || kind === "refine") {
    p.status = attempt ? "repairing" : "generating";
    await studio.save(p);
    const before = await customFingerprint(base),
      sources = await sourceMap(base);
    await studio.log(
      p,
      "Generating your app’s Swift files. Project configuration and planned acceptance tests remain protected.",
    );
    const answer = await studio.client(
      `Build the user's SwiftUI iOS app. Swift 6, iOS 17+. Return only JSON {"summary":"changes","files":[{"path":"App/AppMain.swift","content":"full source"},{"path":"App/Views/HomeView.swift","content":"full source"}],"delete":["App/Obsolete.swift"]}. Files merge with existing source; explicitly delete obsolete files. You may create up to 24 Swift files in App/ subfolders. Keep exactly one @main entry point. For a small change use {"summary":"changes","edits":[{"path":"App/file.swift","before":"unique exact text","after":"replacement"}]} instead. Do not modify tests or project settings. ${p.backend === "local" ? "Use only the configured local REST backend. No other network services." : "No network or backend."} No packages, signing, shell execution or personal branding. Use native SwiftUI navigation, semantic colors, Dynamic Type, accessibility identifiers from frozen journeys. MainActor observable models. On --studio-reset remove only this app's own persisted data before rendering; on --studio-testing still run REAL app functionality, never fake test-only screens/data. Preserve data when relaunched without --studio-reset. Separate models, store, theme and screens into focused files. Handle errors visibly. Implement the user brief, not only the test labels. Review checks must exercise real behavior.\nName: ${p.name}\nBrief: ${p.brief}\nFrozen plan: ${JSON.stringify(p.plan)}\nChange: ${message || "Implement this complete small app with a polished, domain-specific SwiftUI design."}\n${p.backend === "local" ? backendGuide : ""}\nExisting source: ${JSON.stringify(sources)}`,
      signal,
      p.provider,
    );
    const next = customChanges(answer, sources);
    if (signal.aborted) throw Error("Cancelled");
    if (before !== (await customFingerprint(base)))
      throw Error(
        "Source changed while the client was working. Your edits were preserved.",
      );
    if (!attempt) {
      p.lastRevision = Date.now().toString();
      const rev = path.join(dir, "revisions", p.lastRevision);
      await fs.mkdir(rev, { recursive: true });
      await fs.writeFile(
        path.join(rev, "sources.json"),
        JSON.stringify(sources),
      );
    }
    const changes = {
      ...Object.fromEntries(
        Object.keys(sources)
          .filter((f) => !Object.hasOwn(next, f))
          .map((f) => [f, null]),
      ),
      ...next,
      "AppProject.xcodeproj/project.pbxproj": projectText(
        Object.keys(next),
        p.name,
        p.bundle,
      ),
    };
    await transaction(studio, p, changes, async () => {
      p.messages.push({ role: "assistant", text: answer.summary });
    });
    await studio.log(
      p,
      `${Object.keys(next).length} Swift files saved and registered with Xcode. Running the frozen UI journeys…`,
    );
  }
  const logFile = path.join(dir, "verification.log");
  try {
    await fs.copyFile(
      logFile,
      path.join(dir, `verification-${Date.now()}.log`),
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await fs.writeFile(logFile, "");
  p.status = "verifying";
  p.evidence = null;
  await studio.save(p);
  const testedHash = await customFingerprint(base);
  let writes = Promise.resolve();
  const backendEnv = p.backend === "local" ? await studio.backend.environment(p.id, studio.origin, "test-" + Date.now()) : {};
  const redact = s => s.replaceAll(backendEnv.TEST_RUNNER_STUDIO_BACKEND_TOKEN ?? "__no_backend_token__", "[redacted]");
  try {
    await studio.runner("python3", ["verify.py"], {
      cwd: base,
      signal,
      timeout: 1200000,
      env: backendEnv,
      onText: (s) => {
        writes = writes.then(() => fs.appendFile(logFile, redact(s)));
      },
    });
    await writes;
  } catch (e) {
    await writes;
    e.message = redact(e.message);
    if (kind !== "verify" && attempt < 1 && !signal.aborted) {
      await studio.log(
        p,
        "Checks failed. Trying one source-only repair without changing the test contract.",
      );
      return executeCustom(
        studio,
        p,
        "refine",
        "Make the smallest correction for this failed build/test: " + e.message,
        signal,
        attempt + 1,
      );
    }
    throw e;
  }
  if (signal.aborted) throw Error("Cancelled");
  if (
    p.contractHash !== (await customContract(base)) ||
    testedHash !== (await customFingerprint(base))
  )
    throw Error("Source or acceptance contract changed during verification.");
  const screens = {};
  for (const j of p.plan.journeys) {
    const b = await fs.readFile(
      path.join(base, ".ios-agent/evidence", j.screen + ".png"),
    );
    if (
      !b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw Error("Invalid screenshot evidence");
    screens[j.screen] = hash(b);
  }
  if (signal.aborted) throw Error("Cancelled");
  if (testedHash !== (await customFingerprint(base)))
    throw Error("Source changed during evidence collection.");
  p.evidence = {
    sourceHash: testedHash,
    screens,
    date: new Date().toISOString(),
    scope: `Build and ${p.plan.journeys.length} planned UI journeys passed. ${p.plan.manualCriteria.length} manual criteria remain unverified. Plan coverage is not a guarantee of app completeness.`,
  };
  p.status = "verified";
  p.messages.push({ role: "assistant", text: p.evidence.scope });
  await studio.log(
    p,
    "App-specific checks passed. Hashed source, test contract and simulator captures saved.",
  );
}
