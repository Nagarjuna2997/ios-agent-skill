// The CLI build loop with a scripted brain and fake Xcode tools.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runAgent } from "../dist/agent/loop.js";
import { ProcessRunner, LoggingRunner } from "../dist/agent/runner.js";
import { extractJson, filesFrom } from "../dist/agent/brain.js";
import { fakeXcode } from "./helpers/fake-xcode.js";

const PLAN = {
  appName: "HabitTracker",
  displayName: "Habits",
  summary: "Track daily habits with a list, a detail screen and settings.",
  navigation: "tabs",
  screens: [
    { id: "habits", title: "Habits", purpose: "List of habits", topLevel: true },
    { id: "habit-detail", title: "Habit", purpose: "One habit's history", topLevel: false },
    { id: "settings", title: "Settings", purpose: "Dark mode toggle", topLevel: true },
  ],
  models: [{ name: "Habit", persisted: false, fields: [{ name: "title", type: "String" }], sampleData: [{ title: "Walk outside" }, { title: "Read for ten minutes" }] }],
  capabilities: [],
  assumptions: ["Habits reset at midnight local time."],
};

function scriptedBrain(overrides = {}) {
  const calls = [];
  const brain = {
    calls,
    async plan(input) {
      calls.push(["plan", input.description]);
      return overrides.plan ? overrides.plan(calls) : PLAN;
    },
    async generate(input) {
      calls.push(["generate", input.files.length]);
      if (overrides.generate) return overrides.generate(calls);
      return [
        { path: "HabitTracker/Views/RootView.swift", content: "struct RootView { let broken = AGENT_TEST_ERROR }\n" },
        { path: "HabitTracker/Models/Habit.swift", content: "struct Habit { let title: String }\n" },
      ];
    },
    async fix(input) {
      calls.push(["fix", input.errors.map((e) => `${e.file}:${e.line}`).join(","), input.attempt]);
      if (overrides.fix) return overrides.fix(calls, input);
      return [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }];
    },
    async refine(input) {
      calls.push(["refine", input.change]);
      return { files: [{ path: "HabitTracker/Views/StreakBadge.swift", content: "struct StreakBadge {}\n" }] };
    },
  };
  return brain;
}

async function setup(t, mode) {
  const fake = await fakeXcode(t, { mode });
  const projectDir = join(fake.root, "apps", "habits");
  const runner = new LoggingRunner(new ProcessRunner({ ...process.env, ...fake.env }), join(projectDir, ".ios-agent", "tool-log.jsonl"));
  return { fake, projectDir, runner };
}

test("description to screenshots: plan, create, generate, fail, fix, build, launch, capture, report", async (t) => {
  const { projectDir, runner, fake } = await setup(t);
  const lines = [];
  const brain = scriptedBrain();
  const result = await runAgent({ projectDir, description: "A habit tracker with a list, a detail screen, and settings with dark mode toggle", brain, runner, sink: (l) => lines.push(l), screenshotDelayMs: 0 });
  assert.equal(result.state.status, "complete", result.state.failure);
  assert.deepEqual(brain.calls.map((c) => c[0]), ["plan", "generate", "fix"]);
  assert.deepEqual(brain.calls[2].slice(1), ["HabitTracker/Views/RootView.swift:1", 1]);
  assert.equal(result.state.builds.length, 2);
  assert.deepEqual(result.state.screenshots.map((s) => s.screen), ["habits", "settings"], "only top-level screens");
  for (const stage of ["[preflight]", "[planning]", "[creating]", "[generating]", "[building] Build attempt 1 of 8.", "[fixing] Fixing 1 error(s) for attempt 2 of 8.", "[launching]", "[screenshots] Captured Settings (settings).", "[reporting]"]) {
    assert.ok(lines.some((l) => l.startsWith(stage)), `missing progress line ${stage}\n${lines.join("\n")}`);
  }
  for (const file of ["PLAN.md", "RUN_REPORT.md", ".ios-agent/state.json", ".ios-agent/plan.json", ".ios-agent/screenshots/habits.png", ".ios-agent/screenshots/settings.png"]) {
    assert.ok(existsSync(join(projectDir, file)), file);
  }
  const planMarkdown = await readFile(join(projectDir, "PLAN.md"), "utf8");
  assert.match(planMarkdown, /Design direction[\s\S]*Ocean Ink/);
  assert.match(planMarkdown, /Synthetic preview records: 2/);
  const report = await readFile(join(projectDir, "RUN_REPORT.md"), "utf8");
  assert.match(report, /Status: \*\*complete\*\*/);
  assert.match(report, /\[fixing\] Fixing 1 error/);
  assert.match(report, /Nothing\. The app runs in the simulator without accounts\./);
  const launches = (await fake.calls()).filter((c) => c.args[1] === "launch");
  assert.deepEqual(launches.map((c) => c.args.at(-1)), ["habits", "settings"]);
  assert.deepEqual(launches.map((c) => c.args.slice(-4)), [
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "habits"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "settings"],
  ]);
  await assert.rejects(runAgent({ projectDir, description: "again", brain, runner }), /already has a run/);
});

test("an invalid plan gets one corrected retry", async (t) => {
  const { projectDir, runner } = await setup(t);
  const brain = scriptedBrain({ plan: (calls) => (calls.length === 1 ? { appName: "habit tracker" } : PLAN) });
  const result = await runAgent({ projectDir, description: "habits", brain, runner, screenshotDelayMs: 0, planOnly: true });
  assert.equal(result.state.failure, "plan only");
  assert.equal(brain.calls.filter((c) => c[0] === "plan").length, 2);
  assert.match(brain.calls[1][1], /previous plan was invalid/);
  assert.ok(existsSync(join(projectDir, "PLAN.md")));
  assert.ok(!existsSync(join(projectDir, "project.yml")), "plan-only writes no project");
});

test("the attempt cap stops a run that never builds, and resume gets a new budget", async (t) => {
  const { projectDir, runner } = await setup(t);
  let fixed = false;
  const brain = scriptedBrain({
    fix: (calls, input) => (fixed ? [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }] : [{ path: input.errors[0].file, content: "struct RootView { let still = AGENT_TEST_ERROR }\n" }]),
  });
  const first = await runAgent({ projectDir, description: "habits", brain, runner, maxBuildAttempts: 2, screenshotDelayMs: 0 });
  assert.equal(first.state.status, "failed");
  assert.match(first.state.failure, /attempt or time cap/);
  assert.equal(first.state.builds.length, 2);
  assert.match(await readFile(join(projectDir, "RUN_REPORT.md"), "utf8"), /Last errors:\n\n- HabitTracker\/Views\/RootView\.swift:1:/);

  fixed = true;
  const resumed = await runAgent({ projectDir, brain, runner, resume: true, screenshotDelayMs: 0 });
  assert.equal(resumed.state.status, "complete", resumed.state.failure);
  assert.equal(resumed.state.cycle, 2);
  assert.equal(brain.calls.filter((c) => c[0] === "plan").length, 1, "resume does not re-plan");
  assert.equal(brain.calls.filter((c) => c[0] === "generate").length, 1, "resume does not regenerate");
});

test("an interrupted run resumes from the stage where it stopped", async (t) => {
  const { projectDir, runner } = await setup(t);
  let failOnce = true;
  const brain = scriptedBrain({
    generate: () => {
      if (failOnce) {
        failOnce = false;
        throw new Error("network dropped");
      }
      return [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }];
    },
  });
  const first = await runAgent({ projectDir, description: "habits", brain, runner, screenshotDelayMs: 0 });
  assert.equal(first.state.status, "failed");
  assert.equal(first.state.failure, "network dropped");
  const second = await runAgent({ projectDir, brain, runner, resume: true, screenshotDelayMs: 0 });
  assert.equal(second.state.status, "complete", second.state.failure);
  assert.equal(brain.calls.filter((c) => c[0] === "plan").length, 1);
});

test("refine applies a change to the last app and rebuilds, relaunches and re-screenshots", async (t) => {
  const { projectDir, runner } = await setup(t);
  const brain = scriptedBrain({ generate: () => [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }] });
  await runAgent({ projectDir, description: "habits", brain, runner, screenshotDelayMs: 0 });
  await assert.rejects(runAgent({ projectDir: join(projectDir, "..", "other"), brain, runner, refine: "x" }), /Nothing to refine/);
  const refined = await runAgent({ projectDir, brain, runner, refine: "Show a streak badge", screenshotDelayMs: 0 });
  assert.equal(refined.state.status, "complete", refined.state.failure);
  assert.equal(refined.state.cycle, 2);
  assert.deepEqual(refined.state.refinements.map((r) => r.change), ["Show a streak badge"]);
  assert.ok(existsSync(join(projectDir, "HabitTracker", "Views", "StreakBadge.swift")));
  assert.equal(refined.state.builds.filter((b) => b.cycle === 2).length, 1);
});

test("without Xcode the run still plans and writes code, then reports what is missing", async (t) => {
  const { projectDir } = await setup(t);
  const bare = new ProcessRunner({ PATH: "/nonexistent" });
  const brain = scriptedBrain({ generate: () => [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }] });
  const result = await runAgent({ projectDir, description: "habits", brain, runner: bare, screenshotDelayMs: 0 });
  assert.equal(result.state.status, "failed");
  assert.match(result.state.failure, /toolchain missing: .*xcode/);
  assert.equal(result.state.builds.length, 0);
  assert.ok(existsSync(join(projectDir, "HabitTracker", "Views", "RootView.swift")));
  const report = await readFile(join(projectDir, "RUN_REPORT.md"), "utf8");
  assert.match(report, /Missing: .*Mac App Store/);
  // Without XcodeGen the built-in writer still produces the Xcode project.
  assert.ok(existsSync(join(projectDir, "HabitTracker.xcodeproj", "project.pbxproj")));
});

test("model output parsing tolerates fences and preambles but not malformed files", () => {
  assert.deepEqual(extractJson('```json\n{"files":[]}\n```'), { files: [] });
  assert.deepEqual(extractJson('Here you go: {"a":"}{"} trailing'), { a: "}{" });
  assert.throws(() => extractJson("no json"), /did not return JSON/);
  assert.throws(() => extractJson('{"a": 1'), /incomplete/);
  assert.deepEqual(filesFrom({ files: [{ path: "A/x.swift", content: "x" }, { path: "A/y.swift", delete: true }] }), [{ path: "A/x.swift", content: "x" }, { path: "A/y.swift", delete: true }]);
  assert.throws(() => filesFrom({}), /no files array/);
  assert.throws(() => filesFrom({ files: [{ content: "x" }] }), /no path/);
});
