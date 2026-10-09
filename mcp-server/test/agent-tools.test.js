// The /ios-build slash command's tool sequence, through the unified MCP server,
// against fake Xcode tools.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fakeXcode, BOOTED } from "./helpers/fake-xcode.js";

async function connect(t, env) {
  const client = new Client({ name: "agent-tools", version: "1" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["dist/unified.js"], env: { ...process.env, ...env } }));
  t.after(() => client.close());
  const call = async (name, args = {}) => {
    const response = await client.callTool({ name, arguments: args });
    const text = response.content.map((p) => p.text ?? "").join("\n");
    return { response, text, json: () => JSON.parse(text) };
  };
  return { client, call };
}

test("slash-command tool sequence: preflight, plan, create, write, build, fix, run, screenshot, logs, report", async (t) => {
  const fake = await fakeXcode(t);
  const { client, call } = await connect(t, fake.env);
  const projectDir = join(fake.root, "Apps", "HabitTracker");

  const { tools } = await client.listTools();
  for (const name of ["ios_preflight", "ios_capabilities", "ios_plan", "ios_create_project", "ios_add_capabilities", "ios_write_files", "ios_add_package", "ios_build", "ios_run", "ios_screenshot", "ios_logs", "ios_progress", "ios_report"]) {
    assert.ok(tools.some((tool) => tool.name === name), name);
  }

  const pre = (await call("ios_preflight")).json();
  assert.equal(pre.chosenSimulator.udid, BOOTED);
  assert.ok(pre.checks.find((c) => c.id === "xcodegen").ok);

  const caps = await call("ios_capabilities", { query: "zzz-no-match" });
  assert.notEqual(caps.response.isError, true, caps.text);
  assert.deepEqual(caps.json().modules, []);

  const planned = await call("ios_plan", {
    projectDir,
    description: "A habit tracker with a list, a detail screen, and settings with dark mode toggle",
    plan: {
      appName: "HabitTracker",
      displayName: "Habits",
      summary: "Track habits.",
      navigation: "tabs",
      screens: [
        { id: "habits", title: "Habits", purpose: "List of habits", topLevel: true },
        { id: "detail", title: "Habit", purpose: "One habit", topLevel: false },
        { id: "settings", title: "Settings", purpose: "Dark mode toggle", topLevel: true },
      ],
    },
  });
  assert.notEqual(planned.response.isError, true, planned.text);
  assert.ok(existsSync(join(projectDir, "PLAN.md")));
  assert.equal((await call("ios_plan", { projectDir, description: "x", plan: { appName: "bad" } })).response.isError, true);

  const created = await call("ios_create_project", { projectDir, name: "HabitTracker", displayName: "Habits" });
  assert.notEqual(created.response.isError, true, created.text);
  const project = created.json();
  assert.equal(project.generated, true);
  assert.equal(project.scheme, "HabitTracker");

  const progressLine = await call("ios_progress", { projectDir, stage: "generating", message: "Writing 3 screens." });
  assert.equal(progressLine.json().line, "[generating] Writing 3 screens.");

  const write = await call("ios_write_files", { projectDir, files: [{ path: "HabitTracker/Views/HabitsView.swift", content: "let broken = AGENT_TEST_ERROR\n" }] });
  assert.deepEqual(write.json().created, ["HabitTracker/Views/HabitsView.swift"]);
  const outside = await call("ios_write_files", { projectDir, files: [{ path: "../escape.swift", content: "x" }] });
  assert.equal(outside.response.isError, true);

  const pkg = await call("ios_add_package", { projectDir, url: "https://github.com/airbnb/lottie-spm.git", version: "4.5.0", products: ["Lottie"] });
  assert.equal(pkg.json().packages[0].name, "lottie-spm");

  const failed = (await call("ios_build", { projectDir })).json();
  assert.equal(failed.success, false);
  assert.equal(failed.errors[0].file, "HabitTracker/Views/HabitsView.swift");
  assert.equal(failed.errors[0].line, 1);
  assert.equal(typeof failed.durationMs, "number");
  assert.ok(!("log" in failed), "raw log is not returned");

  await call("ios_write_files", { projectDir, files: [{ path: "HabitTracker/Views/HabitsView.swift", content: "let fixed = 1\n" }] });
  const built = (await call("ios_build", { projectDir })).json();
  assert.equal(built.success, true);
  assert.equal(built.attempt, 2);

  const run = (await call("ios_run", { projectDir, screen: "settings" })).json();
  assert.equal(run.pid, 4242);
  const launch = (await fake.calls()).find((c) => c.args[1] === "launch");
  assert.deepEqual(launch.args.slice(-5), ["com.example.habittracker", "-ios-agent-sample-data", "YES", "-ios-agent-screen", "settings"]);
  const shot = await call("ios_screenshot", { projectDir, udid: run.udid, name: "settings", waitSeconds: 0 });
  assert.notEqual(shot.response.isError, true, shot.text);
  const logs = (await call("ios_logs", { projectDir, udid: run.udid, seconds: 5 })).json();
  assert.equal(logs.lines.length, 1);

  const added = await call("ios_add_capabilities", { projectDir, capabilities: ["not-a-capability"] });
  assert.notEqual(added.response.isError, true, added.text);
  assert.equal(added.json().unavailable[0].id, "not-a-capability");

  const report = await call("ios_report", { projectDir, status: "complete" });
  assert.notEqual(report.response.isError, true, report.text);
  const markdown = await readFile(join(projectDir, "RUN_REPORT.md"), "utf8");
  assert.match(markdown, /Status: \*\*complete\*\*/);
  assert.match(markdown, /\[generating\] Writing 3 screens\./);
  assert.match(markdown, /settings\.png/);
  assert.match(markdown, /not-a-capability/);
  const state = JSON.parse(await readFile(join(projectDir, ".ios-agent", "state.json"), "utf8"));
  assert.equal(state.builds.length, 2);
  assert.equal(state.run.pid, 4242);
});

test("tools refuse relative project folders and report missing state", async (t) => {
  const fake = await fakeXcode(t);
  const { call } = await connect(t, fake.env);
  const relative = await call("ios_create_project", { projectDir: "relative/App", name: "App1" });
  assert.equal(relative.response.isError, true);
  assert.match(relative.text, /absolute/);
  const missing = await call("ios_report", { projectDir: join(fake.root, "Nothing") });
  assert.equal(missing.response.isError, true);
  assert.match(missing.text, /No run state/);
});
