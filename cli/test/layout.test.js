import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  INTERNAL_DIR,
  INTERNAL_ENTRIES,
  disposableEntries,
  gitignoreContents,
  globalCacheDir,
  layoutFor,
} from "../dist/layout.js";

test("layoutFor puts everything internal under one directory", () => {
  const layout = layoutFor("/tmp/Demo");
  for (const [key, value] of Object.entries(layout)) {
    if (key === "root" || key === "app" || key === "internal") continue;
    assert.ok(
      value.startsWith(layout.internal + path.sep),
      `${key} (${value}) escaped ${layout.internal}`,
    );
  }
});

test("layoutFor is pure and absolute", () => {
  const a = layoutFor("relative/Demo");
  assert.ok(path.isAbsolute(a.root));
  assert.deepEqual(layoutFor("/tmp/Demo"), layoutFor("/tmp/Demo/"));
});

test("the gitignore unignores exactly the tracked entries", () => {
  const contents = gitignoreContents();
  const lines = contents.split("\n");
  assert.ok(lines.includes("*"), "must ignore everything first");
  assert.ok(lines.includes("!.gitignore"), "must keep itself");

  for (const entry of INTERNAL_ENTRIES) {
    const token = entry.kind === "directory" ? `!${entry.name}/` : `!${entry.name}`;
    assert.equal(
      lines.includes(token),
      entry.tracked,
      `${entry.name} tracked=${entry.tracked} but gitignore ${lines.includes(token) ? "unignores" : "ignores"} it`,
    );
  }
});

// The whole safety argument for a non-interactive `clean` is that these two
// sets are complements. If they ever overlap, clean deletes tracked work.
test("clean never targets a tracked entry", () => {
  const disposable = new Set(disposableEntries().map((e) => e.name));
  const tracked = INTERNAL_ENTRIES.filter((e) => e.tracked).map((e) => e.name);
  for (const name of tracked) {
    assert.ok(!disposable.has(name), `${name} is both tracked and disposable`);
  }
  assert.equal(disposable.size + tracked.length, INTERNAL_ENTRIES.length);
});

test("config.json is the only tracked file", () => {
  const trackedFiles = INTERNAL_ENTRIES.filter((e) => e.tracked && e.kind === "file");
  assert.deepEqual(trackedFiles.map((e) => e.name), ["config.json"]);
});

test("global cache follows each platform's own convention", () => {
  assert.equal(
    globalCacheDir({}, "darwin", "/Users/x"),
    path.join("/Users/x", "Library", "Caches", "ios-agent"),
  );
  assert.equal(
    globalCacheDir({ LOCALAPPDATA: "C:\\Users\\x\\AppData\\Local" }, "win32", "C:\\Users\\x"),
    path.join("C:\\Users\\x\\AppData\\Local", "ios-agent", "Cache"),
  );
  // path.resolve, not path.join, because that is what globalCacheDir uses on
  // the XDG value — and on Windows `path.resolve("/xdg")` anchors to the
  // current drive (`D:\\xdg`) while `path.join` does not (`\\xdg`). A literal
  // expectation here passes on Linux and macOS and fails on Windows, which is
  // exactly how this got through three local runs and one CI run before the
  // windows-latest job existed.
  assert.equal(
    globalCacheDir({ XDG_CACHE_HOME: "/xdg" }, "linux", "/home/x"),
    path.join(path.resolve("/xdg"), "ios-agent"),
  );
  assert.equal(globalCacheDir({}, "linux", "/home/x"), path.join("/home/x", ".cache", "ios-agent"));
});

test("IOS_AGENT_CACHE_DIR wins on every platform", () => {
  for (const platform of ["darwin", "win32", "linux"]) {
    assert.equal(globalCacheDir({ IOS_AGENT_CACHE_DIR: "/override" }, platform, "/home/x"), path.resolve("/override"));
  }
});

test("the internal directory name is a dotfile", () => {
  assert.ok(INTERNAL_DIR.startsWith("."), "must be hidden on POSIX");
});
