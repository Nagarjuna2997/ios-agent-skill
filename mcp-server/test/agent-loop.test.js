// The CLI build loop with a scripted brain and fake Xcode tools.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { runAgent } from "../dist/agent/loop.js";
import { ProcessRunner, LoggingRunner } from "../dist/agent/runner.js";
import { loadState, saveState } from "../dist/agent/state.js";
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
      return overrides.refine ? overrides.refine(calls, input) : { files: [{ path: "HabitTracker/Views/StreakBadge.swift", content: "struct StreakBadge {}\n" }] };
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
  assert.deepEqual(result.state.screenshots.map((s) => [s.screen, s.variant]), [
    ["habits", "light"], ["habits", "dark"], ["habits", "xxl"], ["settings", "light"], ["settings", "dark"], ["settings", "xxl"],
  ], "only top-level screens, each with the three design variants");
  assert.equal(result.state.projectDir, ".", "saved run state is checkout-relative");
  assert.ok(result.state.screenshots.every((shot) => !isAbsolute(shot.path)), "saved screenshot references are portable paths inside the project");
  for (const stage of ["[preflight]", "[planning]", "[creating]", "[generating]", "[building] Build attempt 1 of 8.", "[fixing] Fixing 1 error(s) for attempt 2 of 8.", "[launching]", "[screenshots] Captured Settings (settings) in xxl appearance.", "[reporting]"]) {
    assert.ok(lines.some((l) => l.startsWith(stage)), `missing progress line ${stage}\n${lines.join("\n")}`);
  }
  for (const file of ["PLAN.md", "RUN_REPORT.md", ".ios-agent/state.json", ".ios-agent/plan.json", ".ios-agent/screenshots/habits-light.png", ".ios-agent/screenshots/habits-dark.png", ".ios-agent/screenshots/habits-xxl.png", ".ios-agent/screenshots/settings-light.png", ".ios-agent/screenshots/settings-dark.png", ".ios-agent/screenshots/settings-xxl.png"]) {
    assert.ok(existsSync(join(projectDir, file)), file);
  }
  const planMarkdown = await readFile(join(projectDir, "PLAN.md"), "utf8");
  assert.match(planMarkdown, /Design direction[\s\S]*Ocean Ink/);
  assert.match(planMarkdown, /Synthetic preview records: 2/);
  assert.match(planMarkdown, /\| Screen \| Layout \|/);
  const report = await readFile(join(projectDir, "RUN_REPORT.md"), "utf8");
  assert.match(report, /Status: \*\*complete\*\*/);
  assert.match(report, /\[fixing\] Fixing 1 error/);
  assert.match(report, /Nothing\. The app runs in the simulator without accounts\./);
  assert.match(report, /Design evidence/);
  assert.match(report, /light, dark and XXL captured/);
  assert.match(report, /Palette on-color contrast/);
  assert.match(report, /src="\.ios-agent\/screenshots\/habits-light\.png"/, "screenshots use paths relative to the current project checkout");
  const calls = await fake.calls();
  assert.ok(calls.some((c) => c.args[1] === "launch" && c.args.at(-1) === "com.apple.springboard"), "foreground SpringBoard so captures do not show a return link to the previously captured app");
  const launches = calls.filter((c) => c.args[1] === "launch" && c.args.includes("--terminate-running-process"));
  assert.deepEqual(launches.map((c) => c.args.at(-1)), ["habits", "habits", "habits", "settings", "settings", "settings"]);
  assert.deepEqual(launches.map((c) => c.args.slice(-4)), [
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "habits"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "habits"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "habits"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "settings"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "settings"],
    ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "settings"],
  ]);
  const uiCalls = (await fake.calls()).filter((c) => c.tool === "xcrun" && c.args[0] === "simctl" && c.args[1] === "ui");
  assert.ok(uiCalls.some((c) => c.args.slice(-2).join(" ") === "appearance dark"));
  assert.ok(uiCalls.some((c) => c.args.slice(-2).join(" ") === "content_size accessibility-extra-extra-extra-large"));
  assert.deepEqual(uiCalls.slice(-2).map((c) => c.args.slice(-2)), [["appearance", "light"], ["content_size", "large"]], "restore the simulator UI settings after capture");
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
  const legacy = await loadState(projectDir);
  delete legacy.cycleStartedAt;
  await saveState(projectDir, legacy);
  const second = await runAgent({ projectDir, brain, runner, resume: true, screenshotDelayMs: 0 });
  assert.equal(second.state.status, "complete", second.state.failure);
  assert.ok(Date.parse(second.state.cycleStartedAt) >= Date.parse(second.state.updatedAt) - 10_000, "legacy saved runs start timing the resumed cycle instead of using the original run date");
  assert.equal(brain.calls.filter((c) => c[0] === "plan").length, 1);
});

test("provider rate-limit failures are concise in the run report", async (t) => {
  const { projectDir, runner } = await setup(t);
  const brain = scriptedBrain({
    generate: () => { throw new Error('claude exited with 1: {"api_error_status":429,"result":"You have hit the session limit","private":"do-not-copy"}'); },
  });
  const result = await runAgent({ projectDir, description: "habits", brain, runner });
  assert.equal(result.state.status, "failed");
  assert.match(result.state.failure, /HTTP 429.*session limit/);
  assert.doesNotMatch(result.state.failure, /private|do-not-copy/);
  assert.doesNotMatch(await readFile(join(projectDir, "RUN_REPORT.md"), "utf8"), /do-not-copy/);
});

test("refine applies a change to the last app and rebuilds, relaunches and re-screenshots", async (t) => {
  const { projectDir, runner } = await setup(t);
  const calmerDesign = { mood: "quiet and restorative", palette: { name: "Lavender Dusk", primary: "#6842A6", secondary: "#3E7D78", accent: "#D18F42" }, typography: "rounded", shape: "soft", density: "comfortable", motion: "minimal" };
  const brain = scriptedBrain({
    generate: () => [{ path: "HabitTracker/Views/RootView.swift", content: "struct RootView {}\n" }],
    refine: () => ({ files: [{ path: "HabitTracker/Views/StreakBadge.swift", content: "struct StreakBadge {}\n" }], design: calmerDesign }),
  });
  await runAgent({ projectDir, description: "habits", brain, runner, screenshotDelayMs: 0 });
  await assert.rejects(runAgent({ projectDir: join(projectDir, "..", "other"), brain, runner, refine: "x" }), /Nothing to refine/);
  const refined = await runAgent({ projectDir, brain, runner, refine: "Make the visual design calmer", screenshotDelayMs: 0 });
  assert.equal(refined.state.status, "complete", refined.state.failure);
  assert.equal(refined.state.cycle, 2);
  assert.deepEqual(refined.state.refinements.map((r) => r.change), ["Make the visual design calmer"]);
  assert.ok(existsSync(join(projectDir, "HabitTracker", "Views", "StreakBadge.swift")));
  const updatedPlan = JSON.parse(await readFile(join(projectDir, ".ios-agent", "plan.json"), "utf8"));
  assert.equal(updatedPlan.design.palette.name, "Lavender Dusk");
  assert.match(await readFile(join(projectDir, "PLAN.md"), "utf8"), /quiet and restorative/);
  const updatedColors = JSON.parse(await readFile(join(projectDir, "HabitTracker/Resources/Assets.xcassets/BrandPrimary.colorset/Contents.json"), "utf8"));
  assert.notEqual(updatedColors.colors[0].color.components.red, "0.086");
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
