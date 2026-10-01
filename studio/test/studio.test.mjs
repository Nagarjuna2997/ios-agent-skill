import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  Studio,
  applyEdits,
  validateChanges,
  validatePlan,
  parseAnswer,
  run,
} from "../engine.mjs";
import { serve } from "../server.mjs";
const repo = path.resolve(import.meta.dirname, "../..");
async function fixture(t, runner) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-test-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const s = new Studio(root, repo, runner);
  await s.init();
  return s;
}
async function finish(s) {
  for (let i = 0; i < 300 && s.jobs.size; i++)
    await new Promise((r) => setTimeout(r, 10));
  assert.equal(s.jobs.size, 0);
}
test("agent may edit only bounded existing Swift source, not tests or project settings", () => {
  for (const file of [
    "../secret",
    "Tests/ReadingStoreTests.swift",
    "project.yml",
    "App/Other.swift",
  ])
    assert.throws(() =>
      validateChanges({ summary: "x", files: [{ path: file, content: "x" }] }),
    );
  assert.throws(() => validateChanges({ summary: "x", files: [] }));
  assert.throws(() =>
    validateChanges({
      summary: "x",
      files: [{ path: "App/ReadingListApp.swift", content: "" }],
    }),
  );
  assert.equal(
    validateChanges({
      summary: "x",
      files: [{ path: "App/ReadingListApp.swift", content: "import SwiftUI" }],
    }).files.length,
    1,
  );
});
test("client errors and malformed plans cannot masquerade as success", () => {
  assert.throws(
    () => parseAnswer('{"is_error":true,"result":"quota exceeded"}'),
    /quota/,
  );
  assert.throws(() =>
    validatePlan({ summary: "x", screens: [], criteria: [] }),
  );
  assert.deepEqual(
    parseAnswer(JSON.stringify({ result: '```json\n{"a":1}\n```' })),
    { a: 1 },
  );
});
test("resumes saved projects and marks interrupted jobs honestly", async (t) => {
  const s = await fixture(t);
  const p = await s.create("Test", "Reading list");
  p.busy = true;
  await s.save(p);
  await s.init();
  const restored = await s.get(p.id);
  assert.equal(restored.status, "interrupted");
  assert.equal(restored.busy, false);
  assert.throws(() => s.dir("../../secret"));
});
test("planning persists a reviewed plan without editing source", async (t) => {
  const s = await fixture(t, async () =>
    JSON.stringify({
      result: JSON.stringify({
        summary: "A library",
        screens: ["Library"],
        criteria: ["Persists books"],
      }),
    }),
  );
  const p = await s.create("Test", "Reading list", "claude");
  const hash = await s.fingerprint(p.id);
  await s.action(p.id, "plan");
  await finish(s);
  assert.equal((await s.get(p.id)).status, "planned");
  assert.equal(hash, await s.fingerprint(p.id));
});
test("failed verification never produces a verified state", async (t) => {
  const s = await fixture(t, async () => {
    throw Error("Compiler error");
  });
  const p = await s.create("Test", "Reading list");
  await s.action(p.id, "verify");
  await finish(s);
  const end = await s.get(p.id);
  assert.equal(end.status, "failed");
  assert.equal(end.evidence, null);
  assert.match(end.error, /Compiler/);
});
test("completed screenshot hashes reject tampered images and edited source", async (t) => {
  const s = await fixture(t, async (c, a, o) => {
    const dir = path.join(o.cwd, ".ios-agent/evidence");
    await fs.mkdir(dir, { recursive: true });
    for (const n of [
      "empty",
      "add",
      "library",
      "detail",
      "search-empty",
      "error",
    ])
      await fs.writeFile(
        path.join(dir, n + ".png"),
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1]),
      );
    return "test fixture";
  });
  const p = await s.create("Test", "Reading list");
  await s.action(p.id, "verify");
  await finish(s);
  assert.equal((await s.get(p.id)).status, "verified");
  await s.screenshot(p.id, "empty");
  await fs.appendFile(
    path.join(s.dir(p.id), "project/.ios-agent/evidence/empty.png"),
    "x",
  );
  await assert.rejects(s.screenshot(p.id, "empty"), /hash mismatch/);
  await fs.appendFile(
    path.join(s.dir(p.id), "project/App/ReadingStore.swift"),
    "\n",
  );
  await assert.rejects(s.screenshot(p.id, "library"), /stale/);
});
test("process cancellation stops work without success", async () => {
  const c = new AbortController();
  const p = run(process.execPath, ["-e", "setTimeout(()=>{},30000)"], {
    signal: c.signal,
  });
  setTimeout(() => c.abort(), 50);
  await assert.rejects(p, /Cancelled/);
});
test("HTTP rejects cross-origin actions and unauthenticated requests", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-http-"));
  const a = await serve({ port: 0, root, repo });
  t.after(async () => {
    await new Promise((r) => a.server.close(r));
    await fs.rm(root, { recursive: true, force: true });
  });
  assert.equal((await fetch(a.origin + "/api/projects")).status, 403);
  assert.equal(
    (await fetch(a.origin, { headers: { Origin: "https://evil.example" } }))
      .status,
    403,
  );
  const page = await (await fetch(a.origin)).text();
  const token = page.match(/name="studio-token" content="([^"]+)"/)[1];
  const r = await fetch(a.origin + "/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Studio-Token": token },
    body: JSON.stringify({ name: "Local app", brief: "A reading list" }),
  });
  assert.equal(r.status, 201);
  assert.equal((await r.json()).name, "Local app");
});
test("simultaneous requests cannot start two tasks", async (t) => {
  const s = await fixture(t, async () => {
    await new Promise((r) => setTimeout(r, 50));
    throw Error("fixture stop");
  });
  const p = await s.create("Test", "Reading list");
  const results = await Promise.allSettled([
    s.action(p.id, "verify"),
    s.action(p.id, "verify"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  await finish(s);
});
test("modified acceptance files stop execution before a command runs", async (t) => {
  let called = false;
  const s = await fixture(t, async () => {
    called = true;
  });
  const p = await s.create("Test", "Reading list");
  await fs.appendFile(
    path.join(s.dir(p.id), "project/verify.py"),
    "\n# changed",
  );
  await s.action(p.id, "verify");
  await finish(s);
  assert.equal(called, false);
  assert.match((await s.get(p.id)).error, /Acceptance files changed/);
});
test("a source edit during verification invalidates evidence", async (t) => {
  const s = await fixture(t, async (c, a, o) => {
    await fs.appendFile(path.join(o.cwd, "App/ReadingStore.swift"), "\n");
    return "";
  });
  const p = await s.create("Test", "Reading list");
  await s.action(p.id, "verify");
  await finish(s);
  assert.match((await s.get(p.id)).error, /Source changed/);
});
test("client failure detail includes the actionable provider message", async () => {
  await assert.rejects(
    run(process.execPath, [
      "-e",
      'console.log(JSON.stringify({is_error:true,result:"Organization disabled access"}));process.exit(1)',
    ]),
    /Organization disabled access/,
  );
});
test("exclusive export and restore operations block task starts", async (t) => {
  const s = await fixture(t);
  const p = await s.create("Test", "Reading list");
  let unlock;
  const hold = s.exclusive(
    () =>
      new Promise((r) => {
        unlock = r;
      }),
  );
  await assert.rejects(s.action(p.id, "verify"), /running/);
  await assert.rejects(s.restore(p.id), /active/);
  unlock();
  await hold;
  assert.equal(s.reserved, false);
});
test("repair retains the full pre-action undo baseline", async (t) => {
  let calls = 0;
  const s = await fixture(t, async (command) => {
    if (command === "claude")
      return JSON.stringify({
        result: JSON.stringify({
          summary: "fixture",
          files: [
            {
              path:
                ++calls === 1
                  ? "App/ReadingListApp.swift"
                  : "App/ReadingStore.swift",
              content: "changed " + calls,
            },
          ],
        }),
      });
    throw Error("fixture build failure");
  });
  const p = await s.create("Test", "Reading list", "claude");
  p.plan = { summary: "x", screens: ["x"], criteria: ["x"] };
  await s.save(p);
  const before = await s.fingerprint(p.id);
  await s.action(p.id, "build");
  await finish(s);
  assert.equal(calls, 2);
  await s.restore(p.id);
  assert.equal(await s.fingerprint(p.id), before);
});
test("cancellation after verification cannot publish success", async (t) => {
  let id;
  const s = await fixture(t, async () => {
    s.cancel(id);
    return "";
  });
  const p = await s.create("Test", "Reading list");
  id = p.id;
  await s.action(id, "verify");
  await finish(s);
  const end = await s.get(id);
  assert.equal(end.status, "cancelled");
  assert.equal(end.evidence, null);
});
test("unicode app names use a valid neutral bundle identifier", async (t) => {
  const s = await fixture(t);
  const p = await s.create("📚", "Reading list");
  const project = await fs.readFile(
    path.join(s.dir(p.id), "project/ReadingList.xcodeproj/project.pbxproj"),
    "utf8",
  );
  assert.match(project, /com\.example\.myapp\.app/);
  assert.doesNotMatch(project, /dev\.iosagent/);
});
test(
  "export contains source and Xcode project without evidence or derived data",
  { skip: process.platform !== "darwin" },
  async (t) => {
    const s = await fixture(t);
    const p = await s.create("Export", "Reading list");
    const project = path.join(s.dir(p.id), "project");
    await fs.mkdir(path.join(project, ".build"));
    await fs.writeFile(path.join(project, ".build", "private-log"), "excluded");
    await fs.mkdir(path.join(project, ".ios-agent"));
    await fs.writeFile(
      path.join(project, ".ios-agent", "private-log"),
      "excluded",
    );
    const zip = path.join(s.root, "result.zip");
    await fs.writeFile(zip, await s.exportProject(p.id));
    const listing = await run("unzip", ["-l", zip]);
    assert.match(listing, /ReadingListApp.swift/);
    assert.match(listing, /project.pbxproj/);
    assert.doesNotMatch(listing, /private-log/);
  },
);

test("small edits require exact unique context and cannot write outside source", () => {
  const sources = { "App/ReadingListApp.swift": 'let title = "Hello"' };
  assert.equal(
    applyEdits(
      {
        summary: "Rename",
        edits: [
          {
            path: "App/ReadingListApp.swift",
            before: "Hello",
            after: "Welcome",
          },
        ],
      },
      sources,
    ).files[0].content,
    'let title = "Welcome"',
  );
  assert.throws(() =>
    applyEdits(
      {
        summary: "x",
        edits: [{ path: "../test", before: "Hello", after: "x" }],
      },
      sources,
    ),
  );
  assert.throws(() =>
    applyEdits(
      {
        summary: "x",
        edits: [
          { path: "App/ReadingListApp.swift", before: "missing", after: "x" },
        ],
      },
      sources,
    ),
  );
});
test("external edits while a client generates code are preserved", async (t) => {
  let root;
  const s = await fixture(t, async () => {
    await fs.appendFile(
      path.join(root, "project/App/ReadingStore.swift"),
      "\n// user change",
    );
    return JSON.stringify({
      result: JSON.stringify({
        summary: "rewrite",
        files: [{ path: "App/ReadingStore.swift", content: "overwritten" }],
      }),
    });
  });
  const p = await s.create("Test", "Reading list", "claude");
  root = s.dir(p.id);
  p.plan = { summary: "x", screens: ["x"], criteria: ["x"] };
  await s.save(p);
  await s.action(p.id, "build");
  await finish(s);
  assert.match((await s.get(p.id)).error, /Source changed while/);
  assert.match(
    await fs.readFile(
      path.join(root, "project/App/ReadingStore.swift"),
      "utf8",
    ),
    /user change/,
  );
});
