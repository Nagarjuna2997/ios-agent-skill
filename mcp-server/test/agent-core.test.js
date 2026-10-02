// Unit and fake-toolchain integration tests for the iOS build agent core.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, symlink, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import YAML from "yaml";
import { chooseSimulator, parseSimulators, parseXcodeVersion, preflight } from "../dist/agent/toolchain.js";
import { parseBuildOutput } from "../dist/agent/build.js";
import {
  newAppSpec,
  parseDotEnv,
  renderBaseXcconfig,
  renderEnvExample,
  renderProjectYml,
  renderSecretsXcconfig,
  toYaml,
  xcconfigValue,
} from "../dist/agent/spec.js";
import { containedPath, writeProjectFiles, addPackage, readSpec } from "../dist/agent/project.js";
import { ProcessRunner, LoggingRunner } from "../dist/agent/runner.js";
import { runApp, screenshot, appLogs } from "../dist/agent/simulator.js";
import { createProject, recordedBuild, writeReport, writePlan } from "../dist/agent/workspace.js";
import { loadState, saveState } from "../dist/agent/state.js";
import { PlanSchema } from "../dist/agent/plan.js";
import { fakeXcode, BOOTED, NEWER } from "./helpers/fake-xcode.js";

const simctl = (devices) => JSON.stringify({ devices });
const dev = (udid, name, state, type = "iPhone-17") => ({ udid, name, state, isAvailable: true, deviceTypeIdentifier: `com.apple.CoreSimulator.SimDeviceType.${type}` });

describe("toolchain detection", () => {
  test("parses iOS simulators only and prefers a booted iPhone", () => {
    const list = parseSimulators(
      simctl({
        "com.apple.CoreSimulator.SimRuntime.iOS-26-4": [dev("A", "iPhone A", "Shutdown")],
        "com.apple.CoreSimulator.SimRuntime.iOS-27-0": [dev("B", "iPhone B", "Shutdown"), dev("C", "iPad C", "Booted", "iPad-Pro")],
        "com.apple.CoreSimulator.SimRuntime.watchOS-12-0": [dev("W", "Watch", "Booted", "Apple-Watch")],
      }),
    );
    assert.deepEqual(list.map((s) => s.udid).sort(), ["A", "B", "C"]);
    assert.deepEqual(list.find((s) => s.udid === "B").runtimeVersion, [27, 0]);
    // No booted iPhone: the iPhone on the newest runtime wins, not the booted iPad.
    assert.equal(chooseSimulator(list).udid, "B");
    list.find((s) => s.udid === "A").state = "Booted";
    assert.equal(chooseSimulator(list).udid, "A");
    assert.equal(chooseSimulator(list, "c").udid, "C");
    assert.equal(chooseSimulator(list, "missing"), undefined);
    assert.equal(chooseSimulator([]), undefined);
  });

  test("parses xcodebuild -version", () => {
    assert.deepEqual(parseXcodeVersion("Xcode 27.0\nBuild version 27A266a\n"), { version: "27.0", build: "27A266a" });
    assert.equal(parseXcodeVersion("xcode-select: error"), undefined);
  });

  test("preflight reports each missing tool with its install command", async (t) => {
    const { env } = await fakeXcode(t);
    const withTools = await preflight(new ProcessRunner({ ...process.env, ...env }));
    const byId = Object.fromEntries(withTools.checks.map((c) => [c.id, c]));
    assert.equal(byId.xcode.ok, true);
    assert.match(byId.xcode.detail, /Xcode 27\.0 \(27A266a\)/);
    assert.equal(byId["simulator-sdk"].ok, true);
    assert.equal(byId.simulator.ok, true);
    assert.equal(byId.xcodegen.ok, true);
    assert.equal(byId.macos.ok, process.platform === "darwin");
    const empty = await mkdtemp(join(tmpdir(), "no-tools-"));
    t.after(() => rm(empty, { recursive: true, force: true }));
    const without = await preflight(new ProcessRunner({ PATH: empty }));
    assert.equal(without.ok, false);
    const missing = Object.fromEntries(without.checks.map((c) => [c.id, c]));
    assert.match(missing.xcode.fix, /Mac App Store/);
    assert.match(missing.xcodegen.fix, /brew install xcodegen/);
    assert.match(missing.simulator.fix, /Devices and Simulators/);
  });
});

describe("build output parsing", () => {
  const root = "/Users/me/Apps/Habits";
  const log = [
    `${root}/Habits/Views/List.swift:12:9: error: cannot find 'Habit' in scope`,
    `${root}/Habits/Views/List.swift:12:9: error: cannot find 'Habit' in scope`,
    `        Habit()`,
    `${root}/Habits/Views/List.swift:3:1: note: did you mean 'Habits'?`,
    `${root}/Habits/App.swift:4: error: expected declaration`,
    `${root}/Habits/App.swift:7:2: warning: variable 'x' was never used`,
    "ld: error: Undefined symbols for architecture arm64",
    "xcodebuild: error: Unable to find a destination matching the provided destination specifier",
    "warning: The iOS Simulator deployment target is set to 12.0",
    "** BUILD FAILED **",
  ].join("\n");

  test("returns located, deduplicated errors with project-relative paths", () => {
    const { errors, warnings } = parseBuildOutput(log, root);
    assert.deepEqual(errors[0], { severity: "error", file: "Habits/Views/List.swift", line: 12, column: 9, message: "cannot find 'Habit' in scope" });
    assert.deepEqual(errors[1], { severity: "error", file: "Habits/App.swift", line: 4, message: "expected declaration" });
    assert.ok(errors.some((e) => !e.file && /Undefined symbols/.test(e.message)));
    assert.ok(errors.some((e) => /Unable to find a destination/.test(e.message)));
    assert.equal(errors.length, 4);
    assert.equal(warnings.length, 2);
    assert.ok(!errors.concat(warnings).some((d) => /did you mean/.test(d.message)));
  });

  test("an empty or successful log has no diagnostics", () => {
    assert.deepEqual(parseBuildOutput("** BUILD SUCCEEDED **"), { errors: [], warnings: [] });
  });
});

describe("app spec rendering", () => {
  test("rejects unsafe names, bundle ids and deployment targets", () => {
    for (const name of ["habit", "My App", "App", "SwiftUI", "1Up", "A".repeat(41)]) assert.throws(() => newAppSpec({ name }), /Swift identifier/);
    assert.throws(() => newAppSpec({ name: "Habits", bundleId: "habits" }), /reverse DNS/);
    assert.throws(() => newAppSpec({ name: "Habits", deploymentTarget: "16.0" }), /Deployment target/);
    assert.equal(newAppSpec({ name: "Habits" }).bundleId, "com.example.habits");
  });

  test("YAML strings stay strings and nested structures round-trip", () => {
    const value = { name: "Yes", on: "On", list: ["a", { b: 1 }], empty: {}, none: [], nested: { "key with space": true } };
    assert.deepEqual(YAML.parse(toYaml(value)), value);
  });

  test("project.yml carries targets, packages, entitlements, Info.plist and client keys only", () => {
    const spec = newAppSpec({ name: "Habits", bundleId: "org.example.habits", deploymentTarget: "17.0" });
    spec.entitlements["com.apple.developer.applesignin"] = ["Default"];
    spec.infoPlist.NSLocationWhenInUseUsageDescription = "Shows nearby places.";
    spec.packages.push({ name: "Lottie", url: "https://github.com/airbnb/lottie-spm.git", version: { from: "4.5.0" }, products: ["Lottie"] });
    spec.secrets.push({ key: "MAPS_KEY", description: "d", whereToGet: "w", kind: "client" }, { key: "STRIPE_SECRET", description: "d", whereToGet: "w", kind: "server" });
    spec.appIconName = "AppIcon";
    const project = YAML.parse(renderProjectYml(spec));
    const target = project.targets.Habits;
    assert.equal(project.name, "Habits");
    assert.equal(project.settings.base.SWIFT_VERSION, "6.0");
    assert.deepEqual(project.packages.Lottie, { url: "https://github.com/airbnb/lottie-spm.git", from: "4.5.0" });
    assert.deepEqual(target.dependencies, [{ package: "Lottie", product: "Lottie" }]);
    assert.deepEqual(target.entitlements.properties["com.apple.developer.applesignin"], ["Default"]);
    assert.equal(target.info.properties.NSLocationWhenInUseUsageDescription, "Shows nearby places.");
    assert.equal(target.info.properties.MAPS_KEY, "$(MAPS_KEY)");
    assert.equal(target.info.properties.STRIPE_SECRET, undefined, "server secrets never reach the app");
    assert.equal(target.settings.base.PRODUCT_BUNDLE_IDENTIFIER, "org.example.habits");
    assert.equal(target.settings.base.ASSETCATALOG_COMPILER_APPICON_NAME, "AppIcon");
    assert.deepEqual(project.schemes.Habits.build.targets, { Habits: "all" });
  });

  test("xcconfig escapes URLs, .env parsing, and missing keys become placeholders", () => {
    assert.equal(xcconfigValue("https://x.supabase.co"), "https:/$()/x.supabase.co");
    assert.deepEqual(parseDotEnv("# c\nA=1\nexport B=\"two words\"\nlower=x\nC='3'\n"), { A: "1", B: "two words", C: "3" });
    const spec = newAppSpec({ name: "Habits" });
    spec.buildSettings.API_BASE = "https://api.example.com";
    assert.match(renderBaseXcconfig(spec), /#include\? "Secrets.xcconfig"\nAPI_BASE|API_BASE = https:\/\$\(\)\/api.example.com/);
    spec.secrets.push({ key: "SUPABASE_URL", description: "Project URL", whereToGet: "https://supabase.com/dashboard", kind: "client" }, { key: "SERVER_KEY", description: "s", whereToGet: "w", kind: "server" });
    const { text, missing } = renderSecretsXcconfig(spec, { SUPABASE_URL: "https://abc.supabase.co", SERVER_KEY: "never" });
    assert.match(text, /SUPABASE_URL = https:\/\$\(\)\/abc.supabase.co/);
    assert.doesNotMatch(text, /SERVER_KEY|never/);
    assert.deepEqual(missing, []);
    assert.deepEqual(renderSecretsXcconfig(spec, {}).missing, ["SUPABASE_URL"]);
    assert.match(renderEnvExample(spec), /SERVER-SIDE ONLY/);
  });
});

describe("path containment", () => {
  test("refuses traversal, absolute, hidden and symlinked paths", async (t) => {
    const root = await mkdtemp(join(tmpdir(), "contain-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    for (const bad of ["/etc/passwd", "../x.swift", "App/../../x.swift", "App/.hidden/x.swift", "App\\x.swift", "", "App//x.swift"]) {
      await assert.rejects(containedPath(root, bad), /Refusing/, bad);
    }
    const outside = await mkdtemp(join(tmpdir(), "outside-"));
    t.after(() => rm(outside, { recursive: true, force: true }));
    await mkdir(join(root, "App"));
    await symlink(outside, join(root, "App", "Linked"));
    await assert.rejects(containedPath(root, "App/Linked/x.swift"), /symbolic link/);
    assert.equal(await containedPath(root, "App/Views/x.swift"), join(root, "App", "Views", "x.swift"));
  });
});

describe("plan schema", () => {
  const base = {
    appName: "Habits",
    displayName: "Habits",
    summary: "Track daily habits.",
    navigation: "tabs",
    screens: [{ id: "list", title: "Habits", purpose: "List", topLevel: true }],
  };
  test("accepts a minimal plan and fills defaults", () => {
    const plan = PlanSchema.parse(base);
    assert.deepEqual(plan.models, []);
    assert.deepEqual(plan.screens[0].capabilities, []);
  });
  test("rejects duplicate screens, no top-level screen and more than five tabs", () => {
    assert.throws(() => PlanSchema.parse({ ...base, screens: [base.screens[0], base.screens[0]] }), /Duplicate screen id/);
    assert.throws(() => PlanSchema.parse({ ...base, screens: [{ ...base.screens[0], topLevel: false }] }), /topLevel/);
    const six = Array.from({ length: 6 }, (_, i) => ({ id: `s${i}`, title: `S${i}`, purpose: "p", topLevel: true }));
    assert.throws(() => PlanSchema.parse({ ...base, screens: six }), /five/);
    assert.throws(() => PlanSchema.parse({ ...base, appName: "habits" }), /UpperCamelCase/);
  });
});

describe("project workflow against fake Xcode", () => {
  async function setup(t, mode) {
    const fake = await fakeXcode(t, { mode });
    const root = join(fake.root, "Out", "Habits");
    const runner = new LoggingRunner(new ProcessRunner({ ...process.env, ...fake.env }), join(root, ".ios-agent", "tool-log.jsonl"));
    return { fake, root, runner };
  }

  test("create, write, fail a build, fix it, run, screenshot, logs and report", async (t) => {
    const { fake, root, runner } = await setup(t);
    const lines = [];
    const created = await createProject({ projectDir: root, name: "Habits", capabilities: [] }, runner, (l) => lines.push(l));
    assert.equal(created.generated, true, created.generateError);
    assert.equal(created.scheme, "Habits");
    assert.ok(existsSync(join(root, "Habits.xcodeproj", "project.pbxproj")));
    for (const file of ["project.yml", "Config/Base.xcconfig", "Config/Secrets.xcconfig", ".env.example", ".gitignore", "Habits/App/HabitsApp.swift", "Habits/App/AgentLaunch.swift"]) {
      assert.ok(existsSync(join(root, file)), file);
    }
    assert.match(await readFile(join(root, ".gitignore"), "utf8"), /^\.env$/m);
    assert.match(await readFile(join(root, ".gitignore"), "utf8"), /^Config\/Secrets\.xcconfig$/m);
    assert.ok(lines.some((l) => l.startsWith("[creating]")));
    await assert.rejects(createProject({ projectDir: root, name: "Habits" }, runner), /already exists/);

    const written = await writeProjectFiles(root, [{ path: "Habits/Views/HabitList.swift", content: "struct HabitList { let x = AGENT_TEST_ERROR }\n" }], runner);
    assert.deepEqual(written.created, ["Habits/Views/HabitList.swift"]);
    assert.equal(written.regenerated, true);
    assert.match(await readFile(join(root, "Habits.xcodeproj", "project.pbxproj"), "utf8"), /HabitList\.swift/);
    await assert.rejects(writeProjectFiles(root, [{ path: "Config/Base.xcconfig", content: "x" }], runner), /under Habits\//);
    await assert.rejects(writeProjectFiles(root, [{ path: "Habits/run.sh", content: "x" }], runner), /Unsupported file type/);

    const failed = await recordedBuild(root, runner);
    assert.equal(failed.success, false);
    assert.equal(failed.attempt, 1);
    assert.deepEqual(failed.errors, [{ severity: "error", file: "Habits/Views/HabitList.swift", line: 1, column: 28, message: "cannot find 'AGENT_TEST_ERROR' in scope" }]);
    assert.equal(failed.warnings.length, 1);
    assert.match(failed.destination, new RegExp(BOOTED));

    const fixed = await writeProjectFiles(root, [{ path: "Habits/Views/HabitList.swift", content: "struct HabitList {}\n" }], runner);
    assert.equal(fixed.regenerated, false, "editing an existing file does not regenerate");
    const passed = await recordedBuild(root, runner);
    assert.equal(passed.success, true);
    assert.equal(passed.attempt, 2);
    assert.ok(passed.appPath.endsWith("Habits.app"));

    const run = await runApp(root, runner, { launchArguments: ["-ios-agent-screen", "list"] });
    assert.deepEqual({ udid: run.udid, pid: run.pid, bundleId: run.bundleId, booted: run.booted }, { udid: BOOTED, pid: 4242, bundleId: "com.example.habits", booted: false });
    const launch = (await fake.calls()).find((c) => c.args[1] === "launch");
    assert.deepEqual(launch.args.slice(-3), ["com.example.habits", "-ios-agent-screen", "list"]);
    const shot = await screenshot(root, runner, BOOTED, "list");
    assert.ok(shot.path.endsWith(join(".ios-agent", "screenshots", "list.png")));
    await assert.rejects(screenshot(root, runner, BOOTED, "../x"), /Screenshot name/);
    const logs = await appLogs(root, runner, BOOTED, 30);
    assert.deepEqual(logs.lines, ["2026-10-02 03:00:00.000 Df App[4242:1] launched"]);

    const state = await loadState(root);
    state.screenshots.push({ screen: "list", path: shot.path });
    await saveState(root, state);
    const report = await writeReport(root, { status: "complete" });
    assert.match(report.markdown, /Status: \*\*complete\*\*/);
    assert.match(report.markdown, /\| 1 \| 1 \| failed \| 1 \|/);
    assert.match(report.markdown, /\| 1 \| 2 \| success \| 0 \|/);
    assert.match(report.markdown, /<img src="\.ios-agent\/screenshots\/list\.png"/);
    assert.match(report.markdown, /External tool calls logged: \d+/);
    const toolLog = (await readFile(join(root, ".ios-agent", "tool-log.jsonl"), "utf8")).trim().split("\n").map((l) => JSON.parse(l));
    assert.ok(toolLog.some((e) => e.command === "xcodebuild" && e.args.includes("build")));
    assert.ok(!JSON.stringify(toolLog).includes("AGENT_TEST_ERROR"), "tool log stores commands, never output");
  });

  test("attempt cap and wall-clock cap stop further builds", async (t) => {
    const { root, runner } = await setup(t);
    await createProject({ projectDir: root, name: "Habits" }, runner);
    const state = await loadState(root);
    state.maxBuildAttempts = 1;
    await saveState(root, state);
    await recordedBuild(root, runner);
    await assert.rejects(recordedBuild(root, runner), /attempt cap reached \(1/);
    const late = await loadState(root);
    late.maxBuildAttempts = 8;
    late.deadlineAt = new Date(Date.now() - 1000).toISOString();
    await saveState(root, late);
    await assert.rejects(recordedBuild(root, runner), /Wall-clock cap/);
  });

  test("boots the newest iPhone when none is booted and reports XcodeGen failures", async (t) => {
    const { root, runner, fake } = await setup(t, "no-booted");
    await createProject({ projectDir: root, name: "Habits" }, runner);
    await recordedBuild(root, runner);
    const run = await runApp(root, runner);
    assert.equal(run.udid, NEWER);
    assert.equal(run.booted, true);
    assert.ok((await fake.calls()).some((c) => c.args[1] === "boot" && c.args[2] === NEWER));

    const broken = await setup(t, "xcodegen-fail");
    const created = await createProject({ projectDir: broken.root, name: "Broken" }, broken.runner);
    assert.equal(created.generated, false);
    assert.match(created.generateError, /Spec validation error/);
    const build = await recordedBuild(broken.root, broken.runner);
    assert.equal(build.success, false);
    assert.match(build.errors[0].message, /does not exist/);
  });

  test("adds a Swift package to the spec and regenerates", async (t) => {
    const { root, runner } = await setup(t);
    await createProject({ projectDir: root, name: "Habits" }, runner);
    const added = await addPackage(root, { name: "Lottie", url: "https://github.com/airbnb/lottie-spm.git", version: { from: "4.5.0" }, products: ["Lottie"] }, runner);
    assert.equal(added.regenerate.generated, true);
    assert.equal((await readSpec(root)).packages.length, 1);
    assert.match(await readFile(join(root, "project.yml"), "utf8"), /lottie-spm/);
    await assert.rejects(addPackage(root, { name: "Lottie", url: "https://github.com/other/lottie.git", version: { from: "1.0.0" }, products: ["Lottie"] }, runner), /conflicts/);
    await assert.rejects(addPackage(root, { name: "Bad", url: "http://example.com/x.git", version: { from: "1.0.0" }, products: ["X"] }, runner), /https/);
  });

  test("the plan writes PLAN.md before any project exists", async (t) => {
    const { root } = await setup(t);
    const outcome = await writePlan(
      root,
      {
        appName: "Habits",
        displayName: "Habits",
        summary: "Track daily habits.",
        navigation: "tabs",
        screens: [
          { id: "list", title: "Habits", purpose: "Today's habits", topLevel: true },
          { id: "settings", title: "Settings", purpose: "Appearance", topLevel: true },
        ],
        models: [{ name: "Habit", persisted: true, fields: [{ name: "title", type: "String" }] }],
        capabilities: [{ id: "no-such-capability", reason: "test" }],
      },
      { description: "A habit tracker" },
    );
    assert.ok(existsSync(join(root, "PLAN.md")));
    assert.match(outcome.markdown, /\| Habits \(`list`\) \| tab bar \| Today's habits \|/);
    assert.match(outcome.markdown, /Habit\*\* \(stored on device with SwiftData\): title: String/);
    assert.match(outcome.markdown, /Not built: no module yet/);
    assert.equal(outcome.resolution.unavailable[0].id, "no-such-capability");
    assert.equal((await loadState(root)).description, "A habit tracker");
  });
});

test("writeFiles validates input before writing anything", async (t) => {
  const fake = await fakeXcode(t);
  const root = join(fake.root, "App2", "Notes");
  const runner = new ProcessRunner({ ...process.env, ...fake.env });
  await createProject({ projectDir: root, name: "Notes" }, runner);
  await assert.rejects(writeProjectFiles(root, [{ path: "Notes/x.swift" }], runner), /content is required/);
  await assert.rejects(writeProjectFiles(root, Array.from({ length: 201 }, (_, i) => ({ path: `Notes/F${i}.swift`, content: "" })), runner), /At most 200/);
  await writeFile(join(root, "Notes", "Keep.swift"), "struct Keep {}\n");
  const deleted = await writeProjectFiles(root, [{ path: "Notes/Keep.swift", delete: true }], runner);
  assert.deepEqual(deleted.deleted, ["Notes/Keep.swift"]);
  assert.equal(deleted.regenerated, true);
});
