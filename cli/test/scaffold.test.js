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
  assert.deepEqual(sources, ["Assets.xcassets", "ContentView.swift", "NotesApp.swift"]);
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

test("brief and xcodegen keep editable artifacts in App and quote YAML names", () => {
  const { layout } = scaffoldProject({ name: "Yes", parentDir: tempDir(), brief: 'Track "tea"\nOffline first', xcodegen: true });
  assert.deepEqual(fs.readdirSync(layout.root).filter(e => !e.startsWith('.')).sort(), ['App', 'LICENSE', 'README.md']);
  assert.match(fs.readFileSync(path.join(layout.app, 'APP_BRIEF.md'), 'utf8'), /Track "tea"\nOffline first/);
  const spec = fs.readFileSync(path.join(layout.app, 'project.yml'), 'utf8');
  assert.match(spec, /name: "Yes"/);
  assert.match(spec, /path: "YesTests"/);
  assert.match(spec, /target: "Yes"/);
  assert.match(spec, /GENERATE_INFOPLIST_FILE: YES/);
  assert.match(spec, /excludes:\n          - IconLayers/);
  assert.ok(!fs.existsSync(path.join(layout.app, 'Yes.xcodeproj')));
  const dir = path.join(layout.app, 'Yes', 'IconLayers');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.nativeIconCreated, false);
  assert.equal(manifest.layers.length, 3);
  for (const layer of manifest.layers) assert.match(fs.readFileSync(path.join(dir, layer), 'utf8'), /<svg.*viewBox="0 0 1024 1024"/);
});

test("optional artifacts also respect minimal mode", () => {
  const { layout } = scaffoldProject({ name: "Tiny", parentDir: tempDir(), minimal: true, brief: 'A timer', xcodegen: true });
  assert.deepEqual(fs.readdirSync(layout.root), ['App']);
  assert.ok(fs.existsSync(path.join(layout.app, 'BUILD.md')));
});

test("force never overwrites an authored file or partially writes on collision", () => {
  const parentDir = tempDir();
  const app = path.join(parentDir, 'Keep', 'App');
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(path.join(app, 'project.yml'), 'my project');
  assert.throws(() => scaffoldProject({ name: 'Keep', parentDir, force: true, xcodegen: true }), /Refusing to overwrite/);
  assert.equal(fs.readFileSync(path.join(app, 'project.yml'), 'utf8'), 'my project');
  assert.deepEqual(fs.readdirSync(app), ['project.yml']);
});

test("force refuses symlink destinations including internals", () => {
  for (const folder of ['App', '.ios-agent']) {
    const parentDir = tempDir();
    const root = path.join(parentDir, 'Link');
    const external = tempDir();
    fs.mkdirSync(root);
    fs.symlinkSync(external, path.join(root, folder), 'dir');
    assert.throws(() => scaffoldProject({ name: 'Link', parentDir, force: true }), /Refusing/);
    assert.deepEqual(fs.readdirSync(external), []);
    assert.deepEqual(fs.readdirSync(root), [folder]);
  }
});

test("generated apps do not inherit the tool maintainer identity", () => {
  const parent = tempDir();
  try {
    const { layout } = scaffoldProject({ name: "CustomerApp", parentDir: parent, brief: "A personal reading list", xcodegen: true });
    const visit = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) visit(file);
        else assert.doesNotMatch(fs.readFileSync(file, "utf8"), /nagarjuna|nagarjuna2997|nagarjuna2002/i, file);
      }
    };
    visit(layout.root);
    assert.match(fs.readFileSync(path.join(layout.app, 'project.yml'), 'utf8'), /com\.example\.customerapp/);
  } finally { fs.rmSync(parent, { recursive: true, force: true }); }
});
