import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { run, diagnose } from "../dist/commands.js";
import { discoverProject } from "../dist/discover.js";
import { layoutFor, gitignoreContents } from "../dist/layout.js";
import { scaffoldProject } from "../dist/scaffold.js";

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ios-agent-cmd-"));
}

function capture(cwd, env = {}) {
  const out = [];
  const err = [];
  return {
    io: { out: (t) => out.push(t), err: (t) => err.push(t), cwd: () => cwd, env },
    out,
    err,
  };
}

// MARK: discovery

test("discovery walks up from a nested directory", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Deep", parentDir: parent });
  const nested = path.join(layout.app, "Deep");

  const found = discoverProject(nested, {});
  assert.equal(found?.layout.root, layout.root);
  assert.equal(found?.source, "ancestor");
});

test("discovery returns undefined rather than guessing", () => {
  assert.equal(discoverProject(tempDir(), {}), undefined);
});

test("IOS_AGENT_HOME overrides the walk", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Env", parentDir: parent });

  const found = discoverProject("/", { IOS_AGENT_HOME: layout.root });
  assert.equal(found?.layout.root, layout.root);
  assert.equal(found?.source, "environment");
});

test("an explicit root beats the environment", () => {
  const parent = tempDir();
  const a = scaffoldProject({ name: "Aaa", parentDir: parent }).layout;
  const b = scaffoldProject({ name: "Bbb", parentDir: parent }).layout;

  const found = discoverProject("/", { IOS_AGENT_HOME: a.root }, b.root);
  assert.equal(found?.layout.root, b.root);
  assert.equal(found?.source, "explicit");
});

// MARK: where

test("where --json is machine readable and names its own root", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Whereto", parentDir: parent });
  const { io, out } = capture(layout.root);

  assert.equal(run(["where", "--json"], io), 0);

  const payload = JSON.parse(out.join("\n"));
  assert.equal(payload.project_root, layout.root);
  assert.equal(payload.resolved_from, "ancestor");
  assert.equal(payload.internal_dir, ".ios-agent");
  assert.equal(payload.paths.cache, layout.cache);
  assert.ok(payload.global_cache.length > 0);
});

test("where fails loudly outside a project", () => {
  const { io, err } = capture(tempDir());
  assert.equal(run(["where"], io), 1);
  assert.match(err.join("\n"), /No \.ios-agent/);
});

// MARK: clean

test("clean removes disposable entries and keeps config", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Dirty", parentDir: parent });
  fs.mkdirSync(layout.cache, { recursive: true });
  fs.writeFileSync(path.join(layout.cache, "blob.bin"), "x");
  fs.mkdirSync(layout.logs, { recursive: true });
  fs.writeFileSync(layout.state, "{}");
  fs.mkdirSync(layout.templates, { recursive: true });

  const { io } = capture(layout.root);
  assert.equal(run(["clean"], io), 0);

  assert.ok(!fs.existsSync(layout.cache));
  assert.ok(!fs.existsSync(layout.logs));
  assert.ok(!fs.existsSync(layout.state));
  assert.ok(fs.existsSync(layout.config), "config is tracked and must survive");
  assert.ok(fs.existsSync(layout.templates), "template overrides are tracked and must survive");
});

test("clean --dry-run deletes nothing", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Dry", parentDir: parent });
  fs.mkdirSync(layout.cache, { recursive: true });

  const { io, out } = capture(layout.root);
  assert.equal(run(["clean", "--dry-run"], io), 0);

  assert.ok(fs.existsSync(layout.cache));
  assert.match(out.join("\n"), /Would remove/);
});

test("clean never touches App/", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Safe", parentDir: parent });
  const before = fs.readdirSync(path.join(layout.app, "Safe")).sort();

  const { io } = capture(layout.root);
  run(["clean"], io);

  assert.deepEqual(fs.readdirSync(path.join(layout.app, "Safe")).sort(), before);
});

// MARK: doctor

test("doctor passes on a fresh scaffold", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Healthy", parentDir: parent });

  const results = diagnose(layout, {});
  const failures = results.filter((r) => !r.ok);
  assert.deepEqual(failures.map((f) => f.message), []);
});

// Mutation checks: doctor must actually fail when the layout is broken,
// otherwise it is a green light that means nothing.
test("doctor catches a stale gitignore", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Stale", parentDir: parent });
  fs.writeFileSync(layout.gitignore, "*\n");

  const results = diagnose(layout, {});
  assert.ok(results.some((r) => !r.ok && /stale/.test(r.message)));
});

test("doctor catches a tool-owned directory leaking to the root", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Leaky", parentDir: parent });
  fs.mkdirSync(path.join(layout.root, "cache"));

  const results = diagnose(layout, {});
  assert.ok(results.some((r) => !r.ok && /leaked to the project root/.test(r.message)));
});

test("doctor catches a corrupt config", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Corrupt", parentDir: parent });
  fs.writeFileSync(layout.config, "{ not json");

  const results = diagnose(layout, {});
  assert.ok(results.some((r) => !r.ok && /unreadable/.test(r.message)));
});

test("doctor exits non-zero when a check fails", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Failing", parentDir: parent });
  fs.writeFileSync(layout.gitignore, "nonsense");

  const { io } = capture(layout.root);
  assert.equal(run(["doctor"], io), 1);
});

// MARK: init and refusal to guess

test("init adopts an existing directory", () => {
  const root = tempDir();
  const { io } = capture(root);

  assert.equal(run(["init"], io), 0);

  const layout = layoutFor(root);
  assert.ok(fs.existsSync(layout.config));
  assert.equal(fs.readFileSync(layout.gitignore, "utf8"), gitignoreContents());
});

test("init is idempotent", () => {
  const root = tempDir();
  const { io } = capture(root);
  run(["init"], io);
  const first = fs.readFileSync(layoutFor(root).config, "utf8");

  assert.equal(run(["init"], io), 0);
  assert.equal(fs.readFileSync(layoutFor(root).config, "utf8"), first);
});

test("an unknown command exits non-zero instead of doing something", () => {
  const { io, err } = capture(tempDir());
  assert.equal(run(["frobnicate"], io), 1);
  assert.match(err.join("\n"), /Unknown command/);
});

test("new refuses without a name", () => {
  const { io } = capture(tempDir());
  assert.equal(run(["new"], io), 1);
});

test("new scaffolds into cwd", () => {
  const root = tempDir();
  const { io } = capture(root);

  assert.equal(run(["new", "FromCLI"], io), 0);
  assert.ok(fs.existsSync(path.join(root, "FromCLI", "App", "FromCLI", "FromCLIApp.swift")));
});

test("help exits zero", () => {
  const { io, out } = capture(tempDir());
  assert.equal(run([], io), 0);
  assert.match(out.join("\n"), /ios-agent/);
});
