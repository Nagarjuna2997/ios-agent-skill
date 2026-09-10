import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProject,
  installApp,
  launchApp,
  openDeepLink,
  runTests,
  screenshot,
  simulatorBoot,
  simulatorList,
  simulatorShutdown,
  terminateApp,
} from "../dist/simulator.js";

class FakeRunner {
  calls = [];
  next = { stdout: "", stderr: "", exitCode: 0 };

  async run(command, args, options = {}) {
    this.calls.push({ command, args, options });
    return { command, args, ...this.next };
  }
}

test("simulatorList parses devices by runtime", async () => {
  const runner = new FakeRunner();
  runner.next.stdout = JSON.stringify({
    devices: {
      "com.apple.CoreSimulator.SimRuntime.iOS-27-0": [
        { name: "iPhone 17", udid: "UDID-1", state: "Shutdown", isAvailable: true },
      ],
    },
  });

  const result = await simulatorList(runner);

  assert.deepEqual(result.devices, [
    {
      name: "iPhone 17",
      udid: "UDID-1",
      state: "Shutdown",
      runtime: "com.apple.CoreSimulator.SimRuntime.iOS-27-0",
      isAvailable: true,
    },
  ]);
  assert.deepEqual(runner.calls[0].args, ["simctl", "list", "devices", "available", "--json"]);
});

test("simctl app lifecycle commands are constructed safely", async () => {
  const runner = new FakeRunner();

  await simulatorBoot(runner, "UDID");
  await simulatorShutdown(runner, "UDID");
  await installApp(runner, "UDID", "/tmp/App.app");
  await launchApp(runner, "UDID", "com.example.App", ["--ui-testing"]);
  await terminateApp(runner, "UDID", "com.example.App");
  await openDeepLink(runner, "UDID", "example://onboarding");

  assert.deepEqual(runner.calls.map((call) => call.args.slice(0, 3)), [
    ["simctl", "boot", "UDID"],
    ["simctl", "shutdown", "UDID"],
    ["simctl", "install", "UDID"],
    ["simctl", "launch", "UDID"],
    ["simctl", "terminate", "UDID"],
    ["simctl", "openurl", "UDID"],
  ]);
  assert.deepEqual(runner.calls[3].args, ["simctl", "launch", "UDID", "com.example.App", "--ui-testing"]);
});

test("screenshot writes to the requested PNG path", async () => {
  const runner = new FakeRunner();
  await screenshot(runner, "UDID", "/tmp/ios-agent-simulator-test/screen.png");

  assert.deepEqual(runner.calls[0].args, [
    "simctl",
    "io",
    "UDID",
    "screenshot",
    "/tmp/ios-agent-simulator-test/screen.png",
  ]);
});

test("buildProject requires a project or workspace", async () => {
  const runner = new FakeRunner();
  await assert.rejects(
    () => buildProject(runner, { scheme: "App" }),
    /requires either project or workspace/,
  );
});

test("buildProject and runTests construct xcodebuild commands", async () => {
  const runner = new FakeRunner();

  await buildProject(runner, {
    project: "/tmp/App.xcodeproj",
    scheme: "App",
    configuration: "Debug",
    derivedDataPath: "/tmp/Derived",
  });
  await runTests(runner, {
    workspace: "/tmp/App.xcworkspace",
    scheme: "App",
    destination: "platform=iOS Simulator,name=iPhone 17",
  });

  assert.equal(runner.calls[0].command, "xcodebuild");
  assert.deepEqual(runner.calls[0].args, [
    "build",
    "-scheme",
    "App",
    "-project",
    "/tmp/App.xcodeproj",
    "-destination",
    "generic/platform=iOS Simulator",
    "-configuration",
    "Debug",
    "-derivedDataPath",
    "/tmp/Derived",
  ]);
  assert.equal(runner.calls[1].command, "xcodebuild");
  assert.deepEqual(runner.calls[1].args, [
    "test",
    "-scheme",
    "App",
    "-workspace",
    "/tmp/App.xcworkspace",
    "-destination",
    "platform=iOS Simulator,name=iPhone 17",
  ]);
});

test('environment reports installed profiles instead of inventing Duo support',async()=>{
  const {simulatorEnvironment}=await import('../dist/simulator.js');
  const runner={run:async(command,args)=>({command,args,exitCode:0,stderr:'',stdout:command==='xcodebuild'?'Xcode 26.6':command==='xcode-select'?'/Applications/Xcode.app/Contents/Developer':JSON.stringify({runtimes:[],devicetypes:[{name:'iPhone 17',identifier:'phone17'}],devices:{}})})};
  const environment=await simulatorEnvironment(runner);
  assert.deepEqual(environment.duoDeviceTypes,[]);
  assert.equal(environment.deviceTypes[0].name,'iPhone 17');
});

test('show uses selected Xcode, waits for boot, and rejects unknown devices',async()=>{
  const {showSimulator}=await import('../dist/simulator.js');
  const calls=[];
  const runner={run:async(command,args)=>{
    calls.push([command,args]);
    return {command,args,exitCode:0,stderr:'',stdout:command==='xcode-select'?'/Applications/Xcode Beta.app/Contents/Developer\n':args[1]==='list'?JSON.stringify({devices:{ios:[{name:'Phone',udid:'device',state:'Booted',isAvailable:true}]}}):''};
  }};
  await showSimulator(runner,'device');
  assert.ok(calls.some(([cmd,args])=>cmd==='xcrun'&&args[1]==='bootstatus'));
  assert.ok(calls.some(([cmd,args])=>cmd==='open'&&args[1]==='/Applications/Xcode Beta.app/Contents/Developer/Applications/Simulator.app'));
  assert.ok(!calls.some(([,args])=>args[1]==='boot'));
  await assert.rejects(()=>showSimulator(runner,'absent'),/available UDID/);
});
