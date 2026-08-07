import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { findProjectRootUpwards, resolveRootFrom, projectRootFrom } from "../dist/resources.js";

test("projectRootFrom still returns just the path", () => {
  assert.equal(projectRootFrom(["--project", "/p"], {}), path.resolve("/p"));
});

// MARK: - .ios-agent marker discovery
//
// The CLI writes `.ios-agent/`; this server only reads it, as a root marker.
// That is what lets the two agree on a project without either configuring the
// other, and it is the reason a client spawning the server from a nested
// directory no longer silently analyzes whatever subtree it landed in.

test("findProjectRootUpwards finds the marker from a nested directory", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "marker-"));
  const nested = path.join(root, "App", "MyApp", "Views");
  fs.mkdirSync(path.join(root, ".ios-agent"), { recursive: true });
  fs.mkdirSync(nested, { recursive: true });

  assert.equal(findProjectRootUpwards(nested), fs.realpathSync(root));
});

test("findProjectRootUpwards returns undefined rather than guessing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nomarker-"));
  assert.equal(findProjectRootUpwards(root), undefined);
});

test("a file named .ios-agent is not a marker", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "filemarker-"));
  fs.writeFileSync(path.join(root, ".ios-agent"), "not a directory");

  assert.equal(findProjectRootUpwards(root), undefined);
});

test("resolveRootFrom prefers --project over everything", () => {
  const resolved = resolveRootFrom(["--project", "/explicit"], { IOS_AGENT_PROJECT: "/env" });
  assert.equal(resolved.source, "flag");
  assert.equal(resolved.root, path.resolve("/explicit"));
});

test("resolveRootFrom prefers the environment over a marker", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "envwins-"));
  fs.mkdirSync(path.join(root, ".ios-agent"));

  const resolved = resolveRootFrom([], { IOS_AGENT_PROJECT: "/env", PWD: root });
  assert.equal(resolved.source, "environment");
});

test("resolveRootFrom falls back to the marker, then to cwd", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "markerwins-"));
  const nested = path.join(root, "deep");
  fs.mkdirSync(path.join(root, ".ios-agent"));
  fs.mkdirSync(nested);

  const found = resolveRootFrom([], { PWD: nested });
  assert.equal(found.source, "marker");
  assert.equal(found.root, fs.realpathSync(root));

  const bare = fs.mkdtempSync(path.join(os.tmpdir(), "bare-"));
  const fallback = resolveRootFrom([], { PWD: bare });
  assert.equal(fallback.source, "cwd");
  assert.equal(fallback.root, bare);
});
