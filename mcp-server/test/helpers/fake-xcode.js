// Fake xcodebuild / xcrun / xcodegen executables for agent tests on any OS.
//
// They behave like the real tools only as far as the agent depends on them:
// XcodeGen writes an .xcodeproj, xcodebuild fails with located Swift errors
// when a source contains the marker AGENT_TEST_ERROR and otherwise produces an
// app bundle, and simctl lists, boots, installs, launches and screenshots.
// Every invocation is appended to FAKE_XCODE_LOG as JSON.
import { chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const BOOTED = "11111111-2222-3333-4444-555555555555";
export const NEWER = "66666666-7777-8888-9999-AAAAAAAAAAAA";

const SCRIPT = `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_XCODE_LOG, JSON.stringify({ tool, args, cwd: process.cwd() }) + "\\n");
const mode = process.env.FAKE_XCODE_MODE || "";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && !e.name.endsWith(".xcodeproj")) walk(full, out);
    else if (e.isFile()) out.push(full);
  }
  return out;
}
if (tool === "xcodegen") {
  if (args[0] === "--version") { console.log("Version: 2.42.0"); process.exit(0); }
  if (mode.includes("xcodegen-fail")) { console.error("Spec validation error: fake failure"); process.exit(1); }
  const spec = fs.readFileSync(path.join(process.cwd(), "project.yml"), "utf8");
  const name = JSON.parse(spec.match(/^name: (.+)$/m)[1]);
  const proj = path.join(process.cwd(), name + ".xcodeproj");
  fs.mkdirSync(proj, { recursive: true });
  const sources = walk(path.join(process.cwd(), name)).map((f) => path.relative(process.cwd(), f)).sort();
  fs.writeFileSync(path.join(proj, "project.pbxproj"), "// fake\\n" + sources.join("\\n") + "\\n");
  console.log("Created project at " + proj);
  process.exit(0);
}
if (tool === "xcodebuild") {
  if (args[0] === "-version") { console.log("Xcode 27.0\\nBuild version 27A266a"); process.exit(0); }
  const get = (flag) => args[args.indexOf(flag) + 1];
  const project = get("-project");
  const name = project.replace(/\\.xcodeproj$/, "");
  const derived = get("-derivedDataPath");
  console.log("Command line invocation: xcodebuild " + args.join(" "));
  const errors = [];
  for (const file of walk(path.join(process.cwd(), name)).filter((f) => f.endsWith(".swift"))) {
    fs.readFileSync(file, "utf8").split("\\n").forEach((line, i) => {
      const col = line.indexOf("AGENT_TEST_ERROR");
      if (col >= 0) errors.push(file + ":" + (i + 1) + ":" + (col + 1) + ": error: cannot find 'AGENT_TEST_ERROR' in scope");
    });
  }
  if (errors.length) {
    for (const e of errors) { console.log(e); console.log(e); }
    console.log("warning: fake warning about deployment target");
    console.log("** BUILD FAILED **");
    process.exit(65);
  }
  const app = path.join(derived, "Build", "Products", "Debug-iphonesimulator", name + ".app");
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(path.join(app, "Info.plist"), "fake");
  console.log("** BUILD SUCCEEDED **");
  process.exit(0);
}
if (tool === "xcrun") {
  if (args[0] === "--sdk") { console.log("27.0"); process.exit(0); }
  if (args[0] !== "simctl") process.exit(1);
  const device = (udid, name, state, type) => ({ udid, name, state, isAvailable: true, deviceTypeIdentifier: "com.apple.CoreSimulator.SimDeviceType." + type });
  const devices = mode.includes("no-booted")
    ? { "com.apple.CoreSimulator.SimRuntime.iOS-26-4": [device("${BOOTED}", "iPhone Old", "Shutdown", "iPhone-Old")], "com.apple.CoreSimulator.SimRuntime.iOS-27-0": [device("${NEWER}", "iPhone New", "Shutdown", "iPhone-New"), device("AAAAAAAA-0000-0000-0000-000000000000", "iPad New", "Shutdown", "iPad-New")] }
    : { "com.apple.CoreSimulator.SimRuntime.iOS-27-0": [device("${BOOTED}", "iPhone Fixture", "Booted", "iPhone-Fixture")], "com.apple.CoreSimulator.SimRuntime.watchOS-12-0": [device("BBBBBBBB-0000-0000-0000-000000000000", "Watch", "Booted", "Apple-Watch")] };
  const sub = args[1];
  if (sub === "list") { process.stdout.write(JSON.stringify({ devices })); process.exit(0); }
  if (sub === "boot" || sub === "bootstatus" || sub === "install") process.exit(0);
  if (sub === "launch") { console.log(args[args.indexOf("--terminate-running-process") + 2] + ": 4242"); process.exit(0); }
  if (sub === "io") { fs.writeFileSync(args[args.length - 1], PNG); process.exit(0); }
  if (sub === "spawn") { console.log("Timestamp               Ty Process[PID:TID]"); console.log("2026-10-02 03:00:00.000 Df App[4242:1] launched"); process.exit(0); }
  process.exit(0);
}
process.exit(127);
`;

export async function fakeXcode(t, { mode = "" } = {}) {
  const root = await mkdtemp(join(tmpdir(), "fake-xcode-"));
  const bin = join(root, "bin");
  await mkdir(bin);
  for (const name of ["xcodebuild", "xcrun", "xcodegen"]) {
    await writeFile(join(bin, name), SCRIPT);
    await chmod(join(bin, name), 0o755);
  }
  const log = join(root, "calls.jsonl");
  await writeFile(log, "");
  const env = { PATH: `${bin}:${process.env.PATH}`, FAKE_XCODE_LOG: log, FAKE_XCODE_MODE: mode };
  t?.after?.(async () => (await import("node:fs/promises")).rm(root, { recursive: true, force: true }));
  return {
    root,
    env,
    calls: async () => (await readFile(log, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l)),
  };
}
