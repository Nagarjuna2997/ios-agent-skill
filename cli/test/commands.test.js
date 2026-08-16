import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { run, diagnose, commandNames, EXIT_OK, EXIT_USAGE, EXIT_UNHEALTHY } from "../dist/commands.js";
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
  const failed = results.find((r) => r.check === "gitignore");
  assert.equal(failed?.ok, false);
  assert.equal(failed?.remedy, "regenerate-internal", "a stale gitignore has a derivable correct value");
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
  // 2, not 1: a script must be able to tell "the project is unhealthy" from
  // "you called it wrong".
  assert.equal(run(["doctor"], io), EXIT_UNHEALTHY);
  assert.equal(run(["doctor", "--project", "/nonexistent-xyz"], capture(layout.root).io), EXIT_UNHEALTHY);
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

test("--version prints the CLI package version", () => {
  const { io, out } = capture(tempDir());
  assert.equal(run(["--version"], io), 0);
  assert.equal(out.join("\n"), "0.1.0");
});

// MARK: - doctor --fix

test("doctor --fix repairs a stale gitignore", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Fixable", parentDir: parent });
  fs.writeFileSync(layout.gitignore, "wrong");

  const { io } = capture(layout.root);
  assert.equal(run(["doctor", "--fix"], io), EXIT_OK);
  assert.equal(fs.readFileSync(layout.gitignore, "utf8"), gitignoreContents());
});

test("doctor --fix migrates an older layout version forward", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Old", parentDir: parent });
  const config = JSON.parse(fs.readFileSync(layout.config, "utf8"));
  fs.writeFileSync(layout.config, JSON.stringify({ ...config, layoutVersion: 0 }, null, 2));

  assert.ok(diagnose(layout, {}).some((r) => r.check === "layout-version" && !r.ok));

  const { io } = capture(layout.root);
  assert.equal(run(["doctor", "--fix"], io), EXIT_OK);
  assert.equal(JSON.parse(fs.readFileSync(layout.config, "utf8")).layoutVersion, 1);
});

// The point of a --fix flag is that it does NOT guess. A missing App/ has no
// safe automatic answer, so it must stay reported and unrepaired.
test("doctor --fix refuses to invent a missing App directory", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "NoApp", parentDir: parent });
  fs.rmSync(layout.app, { recursive: true });

  const { io } = capture(layout.root);
  assert.equal(run(["doctor", "--fix"], io), EXIT_UNHEALTHY);
  assert.ok(!fs.existsSync(layout.app), "--fix must not fabricate project structure");
});

test("doctor --fix on a healthy project changes nothing", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Fine", parentDir: parent });
  const before = fs.readFileSync(layout.config, "utf8");

  const { io, out } = capture(layout.root);
  assert.equal(run(["doctor", "--fix"], io), EXIT_OK);
  assert.equal(fs.readFileSync(layout.config, "utf8"), before);
  assert.ok(!out.join("\n").includes("applied"));
});

test("every fixable finding actually reports a remedy", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Remedies", parentDir: parent });

  for (const result of diagnose(layout, {})) {
    assert.ok(typeof result.check === "string" && result.check.length > 0, "every check is named");
    assert.ok(result.remedy === null || typeof result.remedy === "string");
  }
});

// MARK: - --json everywhere

test("info, clean, and doctor all emit JSON", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Jsonic", parentDir: parent });

  for (const argv of [["info", "--json"], ["clean", "--json"], ["doctor", "--json"]]) {
    const { io, out } = capture(layout.root);
    run(argv, io);
    const parsed = JSON.parse(out.join("\n"));
    assert.equal(parsed.project_root, layout.root, `${argv[0]} --json must name its root`);
  }
});

test("doctor --json reports health and per-check detail", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Detailed", parentDir: parent });
  fs.writeFileSync(layout.gitignore, "broken");

  const { io, out } = capture(layout.root);
  run(["doctor", "--json"], io);

  const parsed = JSON.parse(out.join("\n"));
  assert.equal(parsed.healthy, false);
  const gitignore = parsed.checks.find((c) => c.check === "gitignore");
  assert.equal(gitignore.ok, false);
  assert.equal(gitignore.fixable, true);
});

test("--json before the subcommand still parses", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "FlagFirst", parentDir: parent });

  const { io, out } = capture(layout.root);
  assert.equal(run(["doctor", "--json"], io), EXIT_OK);
  assert.doesNotThrow(() => JSON.parse(out.join("\n")));
});

// MARK: - completions

test("completions cover every dispatchable command", () => {
  for (const shell of ["bash", "zsh"]) {
    const { io, out } = capture(tempDir());
    assert.equal(run(["completions", shell], io), EXIT_OK);
    const script = out.join("\n");
    for (const name of commandNames()) {
      assert.ok(script.includes(name), `${shell} completions omit "${name}"`);
    }
  }
});

test("completions reject an unknown shell instead of emitting nothing", () => {
  const { io } = capture(tempDir());
  assert.equal(run(["completions", "fish"], io), EXIT_USAGE);
  assert.equal(run(["completions"], io), EXIT_USAGE);
});

// MARK: - help is generated, not maintained

test("help lists every command", () => {
  const { io, out } = capture(tempDir());
  assert.equal(run([], io), EXIT_OK);
  const help = out.join("\n");
  for (const name of commandNames()) {
    assert.ok(help.includes(name), `help omits "${name}"`);
  }
  assert.match(help, /EXIT CODES/);
});
