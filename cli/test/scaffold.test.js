import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { scaffoldProject, validateProjectName, ensureInternal, ScaffoldError } from "../dist/scaffold.js";
import { layoutFor, INTERNAL_ENTRIES } from "../dist/layout.js";
import { readConfig } from "../dist/config.js";

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ios-agent-test-"));
}

test("a full scaffold shows the user four entries and hides the rest", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "MyApp", parentDir: parent });

  const visible = fs.readdirSync(layout.root).filter((e) => !e.startsWith(".")).sort();
  assert.deepEqual(visible, ["App", "LICENSE", "README.md"]);

  const hidden = fs.readdirSync(layout.root).filter((e) => e.startsWith(".")).sort();
  assert.deepEqual(hidden, [".gitignore", ".ios-agent"]);
});

test("minimal mode creates App/ and nothing else", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Tiny", parentDir: parent, minimal: true });

  assert.deepEqual(fs.readdirSync(layout.root), ["App"]);
  assert.ok(!fs.existsSync(layout.internal), ".ios-agent must not exist until needed");
});

test("the internal directory materialises on demand", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Lazy", parentDir: parent, minimal: true });

  ensureInternal(layout);

  assert.ok(fs.existsSync(layout.internal));
  assert.ok(fs.existsSync(layout.gitignore));
});

test("ensureInternal is idempotent", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Twice", parentDir: parent });
  const before = fs.readdirSync(layout.internal).sort();

  ensureInternal(layout);

  assert.deepEqual(fs.readdirSync(layout.internal).sort(), before);
});

test("generated Swift lands under App/<Name>/", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Notes", parentDir: parent });

  const sources = fs.readdirSync(path.join(layout.app, "Notes")).sort();
  assert.deepEqual(sources, ["ContentView.swift", "NotesApp.swift"]);
  assert.ok(fs.existsSync(path.join(layout.app, "NotesTests", "NotesTests.swift")));

  const entry = fs.readFileSync(path.join(layout.app, "Notes", "NotesApp.swift"), "utf8");
  assert.match(entry, /struct NotesApp: App/);
});

// The design's one hard invariant: nothing tool-owned at the project root.
test("no internal entry name appears at the project root", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Clean", parentDir: parent });

  for (const entry of INTERNAL_ENTRIES) {
    assert.ok(
      !fs.existsSync(path.join(layout.root, entry.name)),
      `${entry.name} leaked to the project root`,
    );
  }
});

test("config records the app and a layout version", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Configured", parentDir: parent });

  const config = readConfig(layout);
  assert.equal(config.name, "Configured");
  assert.equal(config.layoutVersion, 1);
  assert.deepEqual(config.apps.map((a) => a.path), ["App/Configured"]);
});

// Stored POSIX-style so a Windows-authored config is readable on the macOS
// machine that builds the app — this file is tracked, so it crosses machines.
test("config paths never contain a backslash", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Portable", parentDir: parent });

  const raw = fs.readFileSync(layout.config, "utf8");
  assert.ok(!raw.includes("\\\\"), "config must not embed Windows separators");
});

test("scaffolding refuses a non-empty directory unless forced", () => {
  const parent = tempDir();
  fs.mkdirSync(path.join(parent, "Existing"));
  fs.writeFileSync(path.join(parent, "Existing", "keep.txt"), "mine");

  assert.throws(() => scaffoldProject({ name: "Existing", parentDir: parent }), ScaffoldError);

  const { layout } = scaffoldProject({ name: "Existing", parentDir: parent, force: true });
  assert.ok(fs.existsSync(path.join(layout.root, "keep.txt")), "force must not delete existing work");
});

test("an empty existing directory is fine", () => {
  const parent = tempDir();
  fs.mkdirSync(path.join(parent, "Empty"));
  assert.doesNotThrow(() => scaffoldProject({ name: "Empty", parentDir: parent }));
});

test("names are validated against Swift and Windows both", () => {
  assert.doesNotThrow(() => validateProjectName("MyApp"));
  assert.doesNotThrow(() => validateProjectName("A"));

  for (const bad of ["", "9Lives", "my-app", "my app", "../escape", "My/App", "app.name"]) {
    assert.throws(() => validateProjectName(bad), ScaffoldError, `"${bad}" should be rejected`);
  }
  for (const reserved of ["CON", "nul", "COM1", "lpt9"]) {
    assert.throws(() => validateProjectName(reserved), ScaffoldError, `"${reserved}" is reserved on Windows`);
  }
});

test("a path separator in the name cannot escape the parent directory", () => {
  const parent = tempDir();
  assert.throws(() => scaffoldProject({ name: "../evil", parentDir: parent }), ScaffoldError);
  assert.ok(!fs.existsSync(path.join(path.dirname(parent), "evil")));
});

test("the root gitignore does not duplicate the internal one", () => {
  const parent = tempDir();
  const { layout } = scaffoldProject({ name: "Rooted", parentDir: parent });

  const rootIgnore = fs.readFileSync(path.join(layout.root, ".gitignore"), "utf8");
  assert.ok(!/^\.ios-agent/m.test(rootIgnore), "internal rules belong next to the files they govern");
});

test("scaffold reports every path it created", () => {
  const parent = tempDir();
  const { created } = scaffoldProject({ name: "Reported", parentDir: parent });

  assert.ok(created.length > 0);
  for (const target of created) {
    assert.ok(fs.existsSync(target), `${target} was reported but does not exist`);
  }
});
