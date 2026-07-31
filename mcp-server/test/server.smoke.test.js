import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * End-to-end: launch the real server over stdio, speak the real protocol.
 *
 * The unit tests prove the analyzers work. This proves the server actually
 * starts, registers its tools, and returns results a client can read — which
 * unit tests cannot tell you.
 */
let client;
let transport;
let fixture;

before(async () => {
  // A deliberately bad Swift project.
  fixture = await mkdtemp(join(tmpdir(), "ios-agent-mcp-"));
  await mkdir(join(fixture, "Sources", "Views"), { recursive: true });
  await writeFile(
    join(fixture, "Sources", "Views", "FeedView.swift"),
    [
      "import SwiftUI",
      "",
      "@Observable",
      "final class FeedModel {",
      "    var posts: [String] = []",
      "    func load() {",
      "        Task.detached {",
      "            DispatchQueue.main.async { self.posts = [] }",
      "        }",
      "    }",
      "}",
      "",
      "struct FeedView: View {",
      "    var body: some View {",
      "        AnyView(Text(\"Feed\").font(.system(size: 17)))",
      "    }",
      "}",
      "",
    ].join("\n"),
  );
  await writeFile(join(fixture, "Package.swift"), "// swift-tools-version: 5.9\n");

  transport = new StdioClientTransport({
    command: "node",
    args: [new URL("../dist/index.js", import.meta.url).pathname],
  });
  client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => {
  await client?.close();
  if (fixture) await rm(fixture, { recursive: true, force: true });
});

describe("cli flags", () => {
  const bin = new URL("../dist/index.js", import.meta.url).pathname;

  // Regression: without flag handling, `--help` started the stdio server and
  // blocked on stdin forever — indistinguishable from a hang, and the first
  // thing anyone tries after installing.
  test("--help prints usage and exits 0", () => {
    const result = spawnSync("node", [bin, "--help"], { encoding: "utf8", timeout: 10_000 });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /ios-agent-mcp/);
    assert.match(result.stdout, /analyze_swift_project/);
    assert.match(result.stdout, /claude mcp add/);
  });

  test("--version prints just the version and exits 0", () => {
    const result = spawnSync("node", [bin, "--version"], { encoding: "utf8", timeout: 10_000 });
    assert.equal(result.status, 0);
    assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+$/);
  });

  test("-h and -v are accepted too", () => {
    for (const flag of ["-h", "-v"]) {
      const result = spawnSync("node", [bin, flag], { encoding: "utf8", timeout: 10_000 });
      assert.equal(result.status, 0, `${flag} should exit 0`);
      assert.ok(result.stdout.length > 0, `${flag} should print something`);
    }
  });
});

describe("mcp server", () => {
  test("starts and advertises every tool", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "analyze_swift_project",
      "audit_app_store_readiness",
      "check_availability_guards",
      "lint_skill",
      "review_swift_architecture",
      "review_swift_concurrency",
      "review_swiftui",
    ]);
  });

  test("every tool has a description stating when to use it", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      assert.ok(tool.description, `${tool.name} has no description`);
      assert.ok(
        tool.description.length >= 80,
        `${tool.name} description is too vague to route on`,
      );
      assert.match(tool.description, /Use when|Use this|Use before/,
        `${tool.name} description does not say WHEN to use it`);
    }
  });

  test("finds the planted concurrency defects", async () => {
    const result = await client.callTool({
      name: "review_swift_concurrency",
      arguments: { path: fixture },
    });
    const text = result.content[0].text;
    assert.match(text, /observable-without-mainactor/);
    assert.match(text, /task-detached/);
    assert.match(text, /dispatchqueue-main-async/);
    assert.match(text, /FeedView\.swift:\d+/);
  });

  test("project analysis summarizes structure and categories", async () => {
    const result = await client.callTool({
      name: "analyze_swift_project",
      arguments: { path: fixture },
    });
    const text = result.content[0].text;
    assert.match(text, /Swift files:\*\* 1/);
    assert.match(text, /Concurrency/);
    assert.match(text, /review_swift_concurrency/);
  });

  test("lint_skill reports over the wire on this repository", async () => {
    const result = await client.callTool({
      name: "lint_skill",
      arguments: { path: new URL("../../", import.meta.url).pathname },
    });
    const text = result.content[0].text;
    assert.match(text, /# Skill Repository Lint/);
    assert.match(text, /\*\*Subagent definitions:\*\* 10/);
    assert.match(text, /No findings/);
  });

  test("lint_skill on a non-skill directory says so rather than passing silently", async () => {
    const result = await client.callTool({
      name: "lint_skill",
      arguments: { path: fixture },
    });
    assert.match(result.content[0].text, /skill-file-missing|not found/);
  });

  test("a bad path returns an error, not a false clean bill of health", async () => {
    const result = await client.callTool({
      name: "review_swiftui",
      arguments: { path: "/nonexistent/path/xyz" },
    });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /does not exist/i);
  });

  test("a clean project reports zero findings explicitly", async () => {
    const clean = await mkdtemp(join(tmpdir(), "ios-agent-mcp-clean-"));
    await mkdir(join(clean, "Sources"), { recursive: true });
    await writeFile(
      join(clean, "Sources", "Model.swift"),
      [
        "import Foundation",
        "",
        "@MainActor",
        "@Observable",
        "final class Model {",
        "    private(set) var items: [String] = []",
        "}",
        "",
      ].join("\n"),
    );

    const result = await client.callTool({
      name: "review_swift_concurrency",
      arguments: { path: clean },
    });
    assert.match(result.content[0].text, /No findings/);
    await rm(clean, { recursive: true, force: true });
  });
});
