import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Studio } from "../engine.mjs";
import { customChanges, sourceMap } from "../custom.mjs";
import {
  validateCustomPlan,
  acceptanceSwift,
  projectText,
  swiftString,
} from "../project.mjs";
const repo = path.resolve(import.meta.dirname, "../..");
const plan = () => ({
  summary: "A counter with saved state",
  screens: ["Counter", "Settings"],
  criteria: ["Increment shows one", "Settings opens"],
  manualCriteria: [],
  journeys: [
    {
      name: "Count",
      criteria: [0],
      steps: [
        { action: "tap", role: "button", target: "increment" },
        { action: "text", role: "text", target: "count", value: "1" },
      ],
    },
    {
      name: "Settings",
      criteria: [1],
      steps: [
        { action: "tap", role: "button", target: "settings" },
        { action: "exists", role: "text", target: "Settings" },
      ],
    },
  ],
});
async function setup(t, runner) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-custom-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const s = new Studio(root, repo, runner);
  await s.init();
  return s;
}
async function finish(s) {
  for (let i = 0; i < 400 && s.jobs.size; i++)
    await new Promise((r) => setTimeout(r, 10));
  assert.equal(s.jobs.size, 0);
}
test("custom file edits add, remove and preserve Swift files without escaping the app", () => {
  const original = { "App/AppMain.swift": "entry", "App/Old.swift": "old" };
  const next = customChanges(
    {
      summary: "new",
      files: [{ path: "App/Views/Home.swift", content: "view" }],
      delete: ["App/Old.swift"],
    },
    original,
  );
  assert.deepEqual(next, {
    "App/AppMain.swift": "entry",
    "App/Views/Home.swift": "view",
  });
  for (const target of [
    "../escape.swift",
    "App/../../escape.swift",
    "UITests/Test.swift",
    "App/project.pbxproj",
    "App/.hidden.swift",
    "App/a-b.swift",
  ])
    assert.throws(() =>
      customChanges(
        { summary: "x", files: [{ path: target, content: "x" }] },
        original,
      ),
    );
  assert.throws(
    () =>
      customChanges(
        { summary: "x", files: [{ path: "App/appMain.swift", content: "x" }] },
        original,
      ),
    /Case/,
  );
  assert.throws(() =>
    customChanges(
      {
        summary: "x",
        files: [],
        delete: ["App/AppMain.swift", "App/Old.swift"],
      },
      original,
    ),
  );
  assert.equal(
    customChanges(
      {
        summary: "x",
        edits: [{ path: "App/Old.swift", before: "old", after: "new" }],
      },
      original,
    )["App/Old.swift"],
    "new",
  );
});
test("plans require substantive journeys and classify all criteria", () => {
  const p = validateCustomPlan(plan());
  assert.equal(p.journeys[1].screen, "journey-2");
  const missing = plan();
  missing.criteria.push("Uncovered");
  assert.throws(() => validateCustomPlan(missing), /criterion/);
  missing.manualCriteria = [2];
  assert.equal(validateCustomPlan(missing).manualCriteria.length, 1);
  const noAssert = plan();
  noAssert.journeys[0].steps[1] = {
    action: "tap",
    role: "button",
    target: "increment",
  };
  assert.throws(() => validateCustomPlan(noAssert), /assertions/);
  const command = plan();
  command.journeys[0].steps[0] = { action: "shell", target: "rm" };
  assert.throws(() => validateCustomPlan(command), /Unsupported/);
});
test("Swift test literals escape interpolation and cannot inject code", () => {
  const p = plan();
  p.journeys[0].steps[1].value = '"; fatalError() // \\(evil)\n';
  const text = acceptanceSwift(validateCustomPlan(p));
  assert.ok(text.includes(swiftString(p.journeys[0].steps[1].value)));
  assert.match(text, /XCTAssertEqual/);
  assert.match(text, /keepAlways/);
});
test("custom project is independent of reading list and starts without test claims", async (t) => {
  const s = await setup(t);
  const p = await s.create("任意 App", "A timer", "codex", "custom");
  assert.equal(p.template, "custom");
  assert.equal(p.evidence, null);
  const base = path.join(s.dir(p.id), "project");
  const pbx = await fs.readFile(
    path.join(base, "AppProject.xcodeproj/project.pbxproj"),
    "utf8",
  );
  assert.doesNotMatch(pbx, /ReadingList|dev.iosagent|Nagarjuna/);
  assert.match(pbx, /com.example.app/);
  await s.action(p.id, "verify");
  await finish(s);
  assert.match((await s.get(p.id)).error, /Create a plan/);
});
test("multi-file build freezes tests, registers files, and undo restores deleted files", async (t) => {
  let codeCalls = 0;
  const s = await setup(t, async (command) => {
    if (command === "claude")
      return JSON.stringify({
        result: JSON.stringify(
          ++codeCalls === 1
            ? plan()
            : {
                summary: "New files",
                files: [
                  { path: "App/NewMain.swift", content: "new" },
                  { path: "App/Models/Model.swift", content: "model" },
                ],
                delete: codeCalls === 2 ? ["App/AppMain.swift"] : [],
              },
        ),
      });
    throw Error("synthetic compile failure");
  });
  const p = await s.create("Counter", "Counter", "claude", "custom");
  await s.action(p.id, "plan");
  await finish(s);
  const before = await s.fingerprint(p.id);
  const base = path.join(s.dir(p.id), "project");
  const tests = await fs.readFile(
    path.join(base, "UITests/AcceptanceTests.swift"),
    "utf8",
  );
  await s.action(p.id, "build");
  await finish(s);
  assert.equal((await s.get(p.id)).status, "failed");
  assert.equal(codeCalls, 3);
  assert.match(
    await fs.readFile(
      path.join(base, "AppProject.xcodeproj/project.pbxproj"),
      "utf8",
    ),
    /App\/Models\/Model.swift/,
  );
  assert.equal(
    await fs.readFile(path.join(base, "UITests/AcceptanceTests.swift"), "utf8"),
    tests,
  );
  await s.restore(p.id);
  assert.equal(await s.fingerprint(p.id), before);
  assert.deepEqual(Object.keys(await sourceMap(base)), ["App/AppMain.swift"]);
});
test("restart rolls back interrupted multi-file transaction and restores coherent state", async (t) => {
  const s = await setup(t);
  const p = await s.create("X", "Y", "codex", "custom");
  const base = path.join(s.dir(p.id), "project");
  const source = await fs.readFile(
    path.join(base, "App/AppMain.swift"),
    "utf8",
  );
  await fs.writeFile(
    path.join(s.dir(p.id), "transaction.json"),
    JSON.stringify({
      before: { "App/AppMain.swift": source, "App/New.swift": null },
      state: p,
    }),
  );
  await fs.writeFile(path.join(base, "App/AppMain.swift"), "partial");
  await fs.writeFile(path.join(base, "App/New.swift"), "partial");
  await s.init();
  assert.equal((await s.get(p.id)).status, "interrupted");
  assert.equal(
    await fs.readFile(path.join(base, "App/AppMain.swift"), "utf8"),
    source,
  );
  await assert.rejects(fs.access(path.join(base, "App/New.swift")));
});
test("custom source symlinks and tampered contracts are rejected before execution", async (t) => {
  let calls = 0;
  const s = await setup(t, async () => {
    calls++;
  });
  const p = await s.create("X", "Y", "codex", "custom");
  const base = path.join(s.dir(p.id), "project");
  await fs.symlink("/tmp", path.join(base, "App/Escape"));
  await assert.rejects(s.fingerprint(p.id), /Symlink/);
  await fs.unlink(path.join(base, "App/Escape"));
  await fs.appendFile(
    path.join(base, "UITests/AcceptanceTests.swift"),
    "changed",
  );
  await s.action(p.id, "plan");
  await finish(s);
  assert.equal(calls, 0);
  assert.match((await s.get(p.id)).error, /Acceptance files/);
});
test("custom verification records dynamic captures, invalidates after an external edit", async (t) => {
  const s = await setup(t, async (command, args, options) => {
    if (command === "claude")
      return JSON.stringify({ result: JSON.stringify(plan()) });
    const d = path.join(options.cwd, ".ios-agent/evidence");
    await fs.mkdir(d, { recursive: true });
    for (const n of ["journey-1", "journey-2"])
      await fs.writeFile(
        path.join(d, n + ".png"),
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
    return "";
  });
  const p = await s.create("Counter", "counter", "claude", "custom");
  await s.action(p.id, "plan");
  await finish(s);
  await s.action(p.id, "verify");
  await finish(s);
  assert.equal((await s.get(p.id)).status, "verified");
  await s.screenshot(p.id, "journey-1");
  await assert.rejects(s.screenshot(p.id, "../../x"), /Unknown/);
  await fs.appendFile(
    path.join(s.dir(p.id), "project/App/AppMain.swift"),
    "\n",
  );
  await assert.rejects(s.screenshot(p.id, "journey-1"), /stale/);
});
test("replanning cannot weaken a frozen custom acceptance contract", async (t) => {
  const s = await setup(t, async () =>
    JSON.stringify({ result: JSON.stringify(plan()) }),
  );
  const p = await s.create("Counter", "counter", "claude", "custom");
  await s.action(p.id, "plan");
  await finish(s);
  const before = await s.contract(p.id);
  await s.action(p.id, "plan");
  await finish(s);
  assert.match((await s.get(p.id)).error, /frozen/);
  assert.equal(await s.contract(p.id), before);
});

test("Swift literals preserve backslash sequences and encode control characters", () => {
  assert.equal(swiftString("\\/"), '"\\\\/"');
  assert.equal(swiftString("\\u1234"), '"\\\\u1234"');
  assert.equal(swiftString("\b\f"), '"\\u{8}\\u{c}"');
  assert.equal(swiftString("\\(value)"), '"\\\\(value)"');
});
test("interrupted journal preparation is discarded without touching completed source", async (t) => {
  const s = await setup(t);
  const p = await s.create("X", "Y", "codex", "custom");
  const before = await s.fingerprint(p.id);
  await fs.writeFile(
    path.join(s.dir(p.id), "transaction.json.pending"),
    '{"partial":',
  );
  await s.init();
  assert.equal(await s.fingerprint(p.id), before);
  await assert.rejects(
    fs.access(path.join(s.dir(p.id), "transaction.json.pending")),
  );
});

test("custom generation preserves concurrent user edits", async (t) => {
  let base;
  let calls = 0;
  const s = await setup(t, async () => {
    if (++calls === 1)
      return JSON.stringify({ result: JSON.stringify(plan()) });
    await fs.appendFile(
      path.join(base, "App/AppMain.swift"),
      "\n// external change",
    );
    return JSON.stringify({
      result: JSON.stringify({
        summary: "replace",
        files: [{ path: "App/AppMain.swift", content: "replacement" }],
      }),
    });
  });
  const p = await s.create("Counter", "Counter", "claude", "custom");
  base = path.join(s.dir(p.id), "project");
  await s.action(p.id, "plan");
  await finish(s);
  await s.action(p.id, "build");
  await finish(s);
  assert.match((await s.get(p.id)).error, /Source changed while/);
  assert.match(
    await fs.readFile(path.join(base, "App/AppMain.swift"), "utf8"),
    /external change/,
  );
});
test("custom source changing during a test run cannot receive evidence", async (t) => {
  const s = await setup(t, async (command, args, options) => {
    if (command === "claude")
      return JSON.stringify({ result: JSON.stringify(plan()) });
    await fs.appendFile(
      path.join(options.cwd, "App/AppMain.swift"),
      "\n// concurrent change",
    );
    return "";
  });
  const p = await s.create("Counter", "Counter", "claude", "custom");
  await s.action(p.id, "plan");
  await finish(s);
  await s.action(p.id, "verify");
  await finish(s);
  const state = await s.get(p.id);
  assert.equal(state.evidence, null);
  assert.match(state.error, /changed during verification/);
});
