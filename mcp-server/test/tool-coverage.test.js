// Every tool the unified server registers is exercised by at least one test.
//
// Simulator and Xcode tools run against fake `xcrun`, `xcodebuild`,
// `xcode-select` and `open` executables placed first on PATH, so this suite runs
// on Linux CI and asserts the exact commands each tool issues without touching a
// real simulator. The final test enforces the coverage rule itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const BOOTED = "11111111-2222-3333-4444-555555555555";
const SHUTDOWN = "66666666-7777-8888-9999-AAAAAAAAAAAA";
const FAILING = "DEADBEEF-0000-0000-0000-000000000000";

// One script answers for every fake tool; its file name says which tool it is.
const FAKE = `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_TOOL_LOG, JSON.stringify({ tool, args }) + "\\n");
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const device = (udid, state) => ({ udid, name: "iPhone Fixture", state, isAvailable: true, deviceTypeIdentifier: "com.apple.CoreSimulator.SimDeviceType.iPhone-Fixture" });
const devices = { "com.apple.CoreSimulator.SimRuntime.iOS-27-0": [device("${BOOTED}", "Booted"), device("${SHUTDOWN}", "Shutdown")] };
if (args.includes("${FAILING}")) { process.stderr.write("Unable to boot device in current state: Booted\\n"); process.exit(149); }
if (tool === "xcrun" && args[0] === "simctl") {
  if (args[1] === "list" && args.includes("available")) { process.stdout.write(JSON.stringify({ devices })); process.exit(0); }
  if (args[1] === "list") {
    process.stdout.write(JSON.stringify({ devices, runtimes: [{ name: "iOS 27.0", identifier: "com.apple.CoreSimulator.SimRuntime.iOS-27-0", isAvailable: true }], devicetypes: [{ name: "iPhone Fixture", identifier: "com.apple.CoreSimulator.SimDeviceType.iPhone-Fixture" }] }));
    process.exit(0);
  }
  if (args[1] === "io") { fs.writeFileSync(args[args.length - 1], PNG); process.exit(0); }
  process.stdout.write("ok\\n"); process.exit(0);
}
if (tool === "xcodebuild" && args[0] === "-version") { process.stdout.write("Xcode 27.0\\nBuild version 27A000\\n"); process.exit(0); }
if (tool === "xcodebuild") { process.stdout.write("** " + args[0].toUpperCase() + " SUCCEEDED **\\n"); process.exit(0); }
if (tool === "xcode-select") { process.stdout.write("/Applications/Xcode.app/Contents/Developer\\n"); process.exit(0); }
process.exit(0);
`;

async function harness(t) {
  const root = await mkdtemp(join(tmpdir(), "ios-tool-coverage-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  await mkdir(bin);
  for (const name of ["xcrun", "xcodebuild", "xcode-select", "open"]) {
    await writeFile(join(bin, name), FAKE);
    await chmod(join(bin, name), 0o755);
  }
  const log = join(root, "commands.jsonl");
  await writeFile(log, "");
  const client = new Client({ name: "tool-coverage", version: "1" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: ["dist/unified.js", "--project", root],
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, HOME: root, USERPROFILE: root, FAKE_TOOL_LOG: log },
    }),
  );
  t.after(() => client.close());
  const commands = async () =>
    (await readFile(log, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  const call = async (name, args = {}) => {
    const response = await client.callTool({ name, arguments: args });
    const text = response.content.map((part) => part.text ?? "").join("\n");
    return { response, text };
  };
  return { root, client, commands, call };
}

const ran = (commands, tool, ...prefix) =>
  commands.some((c) => c.tool === tool && prefix.every((value, i) => c.args[i] === value));

test("simulator lifecycle tools issue the documented simctl commands", async (t) => {
  const { commands, call } = await harness(t);

  for (const [name, args] of [
    ["simulator_boot", { udid: SHUTDOWN }],
    ["install_app", { udid: BOOTED, appPath: "Build/App.app" }],
    ["launch_app", { udid: BOOTED, bundleId: "org.example.App", args: ["--uitesting"] }],
    ["terminate_app", { udid: BOOTED, bundleId: "org.example.App" }],
    ["open_deep_link", { udid: BOOTED, url: "example://items/42" }],
    ["simulator_shutdown", { udid: BOOTED }],
  ]) {
    const { response, text } = await call(name, args);
    assert.notEqual(response.isError, true, `${name}: ${text}`);
  }

  const log = await commands();
  assert.ok(ran(log, "xcrun", "simctl", "boot", SHUTDOWN));
  // The bundle path is resolved before it reaches simctl. The simulator
  // server's working directory is the unified server's, not the project root.
  const install = log.find((c) => c.args[1] === "install");
  assert.equal(install.args[2], BOOTED);
  assert.ok(install.args[3].endsWith("/Build/App.app") && resolve(install.args[3]) === install.args[3]);
  assert.ok(ran(log, "xcrun", "simctl", "launch", BOOTED, "org.example.App", "--uitesting"));
  assert.ok(ran(log, "xcrun", "simctl", "terminate", BOOTED, "org.example.App"));
  assert.ok(ran(log, "xcrun", "simctl", "openurl", BOOTED, "example://items/42"));
  assert.ok(ran(log, "xcrun", "simctl", "shutdown", BOOTED));
  // Nothing in this suite may erase or reset a device.
  assert.ok(!log.some((c) => c.args.includes("erase") || c.args.includes("reset")));
});

test("screenshot writes the PNG and can return it inline", async (t) => {
  const { root, commands, call } = await harness(t);
  const output = join(root, "evidence", "home.png");
  const saved = await call("screenshot", { udid: BOOTED, outputPath: output });
  assert.notEqual(saved.response.isError, true, saved.text);
  assert.equal(saved.response.content.length, 1);
  assert.ok(ran(await commands(), "xcrun", "simctl", "io", BOOTED, "screenshot", output));
  const inline = await call("screenshot", { udid: BOOTED, outputPath: output, includeImage: true });
  const image = inline.response.content.find((part) => part.type === "image");
  assert.equal(image.mimeType, "image/png");
  assert.deepEqual(Buffer.from(image.data, "base64"), await readFile(output));
});

test("simulator tools report command failures and reject invalid input", async (t) => {
  const { commands, call } = await harness(t);
  const failed = await call("simulator_boot", { udid: FAILING });
  assert.equal(failed.response.isError, true);
  assert.match(failed.text, /Simulator command failed/);
  assert.match(failed.text, /Unable to boot device/);
  // Schema validation happens before any command runs.
  const before = (await commands()).length;
  for (const [name, args] of [
    ["simulator_boot", { udid: "not-a-udid" }],
    ["open_deep_link", { udid: BOOTED, url: "not a url" }],
    ["run_tests", { scheme: "App", project: "App.xcodeproj" }],
  ]) {
    const { response } = await call(name, args);
    assert.equal(response.isError, true, name);
  }
  assert.equal((await commands()).length, before);
});

test("build and test tools construct xcodebuild invocations", async (t) => {
  const { commands, call } = await harness(t);
  const build = await call("build_project", { project: "App.xcodeproj", scheme: "App" });
  assert.notEqual(build.response.isError, true, build.text);
  assert.match(build.text, /BUILD SUCCEEDED/);
  const tests = await call("run_tests", {
    workspace: "App.xcworkspace",
    scheme: "App",
    destination: `platform=iOS Simulator,id=${BOOTED}`,
    configuration: "Debug",
  });
  assert.notEqual(tests.response.isError, true, tests.text);
  const missing = await call("build_project", { scheme: "App" });
  assert.equal(missing.response.isError, true);
  assert.match(missing.text, /requires either project or workspace/);

  const log = await commands();
  const buildArgs = log.find((c) => c.tool === "xcodebuild" && c.args[0] === "build").args;
  assert.deepEqual(buildArgs.slice(0, 3), ["build", "-scheme", "App"]);
  assert.equal(buildArgs[3], "-project");
  assert.ok(buildArgs[4].endsWith("/App.xcodeproj"));
  assert.deepEqual(buildArgs.slice(5), ["-destination", "generic/platform=iOS Simulator"]);
  const testArgs = log.find((c) => c.tool === "xcodebuild" && c.args[0] === "test").args;
  assert.equal(testArgs[3], "-workspace");
  assert.deepEqual(testArgs.slice(5), ["-destination", `platform=iOS Simulator,id=${BOOTED}`, "-configuration", "Debug"]);
});

test("environment, native Simulator window and sidebar preview tools", async (t) => {
  const { commands, call } = await harness(t);

  const environment = await call("simulator_environment");
  assert.notEqual(environment.response.isError, true, environment.text);
  assert.match(environment.text, /Xcode 27\.0/);
  assert.match(environment.text, /iOS 27\.0/);

  const show = await call("simulator_show", { udid: SHUTDOWN });
  assert.notEqual(show.response.isError, true, show.text);
  const log = await commands();
  assert.ok(ran(log, "xcrun", "simctl", "boot", SHUTDOWN), "a shut-down device is booted first");
  assert.ok(ran(log, "xcrun", "simctl", "bootstatus", SHUTDOWN, "-b"));
  assert.ok(
    ran(log, "open", "-a", "/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app", "--args", "-CurrentDeviceUDID", SHUTDOWN),
  );
  const unknown = await call("simulator_show", { udid: "12345678-1234-1234-1234-123456789012" });
  assert.equal(unknown.response.isError, true);

  // A preview needs a booted device and must be loopback-only and tokenized.
  const refused = await call("simulator_preview_start", { udid: SHUTDOWN });
  assert.equal(refused.response.isError, true);
  assert.match(refused.text, /booted simulator/);
  const started = await call("simulator_preview_start", { udid: BOOTED });
  assert.notEqual(started.response.isError, true, started.text);
  const url = started.text.match(/"url":\s*"([^"]+)"/)[1];
  assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/[a-f0-9]{64}\/$/);
  const frame = await fetch(new URL("frame.png", url));
  assert.equal(frame.status, 200);
  assert.equal(frame.headers.get("content-type"), "image/png");
  assert.equal((await fetch(url.replace(/[a-f0-9]{64}\/$/, "wrong/"))).status, 404);
  const stopped = await call("simulator_preview_stop", { udid: BOOTED });
  assert.notEqual(stopped.response.isError, true, stopped.text);
  await assert.rejects(fetch(url));
});

test("reference tools: updates, icon plan and guide outline", async (t) => {
  const { call } = await harness(t);

  const updates = await call("get_apple_updates", { query: "Xcode", limit: 3 });
  assert.notEqual(updates.response.isError, true, updates.text);
  const parsed = JSON.parse(updates.text);
  assert.ok(JSON.stringify(parsed).length > 2);

  const icon = await call("plan_app_icon", { appName: "Shelf", concept: "A stack of three books" });
  assert.notEqual(icon.response.isError, true, icon.text);
  assert.match(icon.text, /Shelf/);
  assert.equal((await call("plan_app_icon", { appName: "Shelf", concept: "x" })).response.isError, true);

  const outline = await call("get_reference_outline", { path: "docs/swiftui/navigation.md" });
  assert.notEqual(outline.response.isError, true, outline.text);
  assert.match(outline.text, /NavigationStack/);
  // Only indexed repository files can be outlined; other paths are never read.
  const outside = await call("get_reference_outline", { path: "../../etc/passwd" });
  assert.deepEqual(JSON.parse(outside.text), { error: "Unknown indexed reference" });
});

test("every registered tool is named in at least one test", async (t) => {
  const { client } = await harness(t);
  const { tools } = await client.listTools();
  const dir = new URL(".", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".test.js"));
  const sources = (await Promise.all(files.map((f) => readFile(new URL(f, dir), "utf8")))).join("\n");
  const untested = tools.map((tool) => tool.name).filter((name) => !sources.includes(`'${name}'`) && !sources.includes(`"${name}"`));
  assert.deepEqual(untested, [], `tools without a test: ${untested.join(", ")}`);
});
