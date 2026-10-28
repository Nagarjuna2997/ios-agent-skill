import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Studio } from "../engine.mjs";
import { installWorkspace } from "../workspace.mjs";
import { importCopy, importedChanges, executeImported } from "../imported.mjs";
installWorkspace(Studio);
test("import copies app and inventory, preserves original, refuses test edits and verifies selected scheme", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-import-test-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const original = path.join(root, "original"),
    storage = path.join(root, "storage");
  await fs.mkdir(
    path.join(original, "Probe.xcodeproj/xcshareddata/xcschemes"),
    { recursive: true },
  );
  await fs.writeFile(
    path.join(original, "Probe.xcodeproj/project.pbxproj"),
    "productName = Probe; IPHONEOS_DEPLOYMENT_TARGET = 17.0;",
  );
  await fs.writeFile(
    path.join(
      original,
      "Probe.xcodeproj/xcshareddata/xcschemes/Probe.xcscheme",
    ),
    "<Scheme/>",
  );
  await fs.mkdir(path.join(original, "App"));
  await fs.writeFile(path.join(original, "App/View.swift"), "struct View {}");
  await fs.writeFile(path.join(original, ".env"), "TOKEN=private");
  const calls = [];
  const s = new Studio(storage, process.cwd(), async (c, args) => {
    calls.push([c, args]);
    return "";
  });
  await s.init();
  const p = await importCopy(s, original, "codex");
  assert.equal(p.scheme, "Probe");
  assert.deepEqual(p.importInfo.deploymentTargets, ["17.0"]);
  await assert.rejects(fs.access(path.join(s.dir(p.id), "project/.env")));
  await assert.rejects(
    executeImported(s, p, "verify", "", new AbortController().signal),
    /Select/,
  );
  p.simulator = "00000000-0000-0000-0000-000000000001";
  p.evidence = { old: true };
  await executeImported(s, p, "verify", "", new AbortController().signal);
  assert.equal(p.verification.tests, "xcodebuild-test-passed");
  assert.equal(p.evidence, null);
  assert.match(p.messages.at(-1).text, /Capture unavailable/);
  assert.ok(calls[0][1].includes("CODE_SIGNING_ALLOWED=NO"));
  assert.equal(
    await fs.readFile(path.join(original, "App/View.swift"), "utf8"),
    "struct View {}",
  );
  assert.throws(
    () =>
      importedChanges(
        { files: [{ path: "Tests/Test.swift", content: "skip" }] },
        { "Tests/Test.swift": "test" },
      ),
    /application Swift/,
  );
  assert.throws(
    () =>
      importedChanges(
        { files: [{ path: "../escape.swift", content: "x" }] },
        {},
      ),
    /application Swift/,
  );
});
test("imported edits refuse package manifests and flat or disguised test files", () => {
  for (const [name, content] of [
    ["Package.swift", "import PackageDescription"],
    ["App/FeatureTests.swift", "test"],
    ["App/Behavior.swift", "import Testing\n@Test func testBehavior() {}"],
  ])
    assert.throws(
      () =>
        importedChanges(
          { files: [{ path: name, content: "replaced" }] },
          { [name]: content },
        ),
      /application Swift/,
    );
});
test("build-input fingerprint includes binary assets and large source files", async (t) => {
  const { importedHash } = await import("../imported.mjs");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "studio-assets-hash-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = path.join(root, "project");
  await fs.mkdir(project);
  const studio = { dir: () => root };
  await fs.writeFile(path.join(project, "image.png"), Buffer.from([1, 2, 3]));
  await fs.writeFile(path.join(project, "Large.swift"), "x".repeat(600000));
  const before = await importedHash(studio, "x");
  await fs.writeFile(path.join(project, "image.png"), Buffer.from([1, 2, 4]));
  assert.notEqual(before, await importedHash(studio, "x"));
  const next = await importedHash(studio, "x");
  await fs.appendFile(path.join(project, "Large.swift"), "y");
  assert.notEqual(next, await importedHash(studio, "x"));
});

test('imported repairs are bounded, preserve failure logs, and never repair verify-only requests', async t => {
  const { runImportedRepairs } = await import('../imported.mjs');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-repair-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const studio = { dir: () => root, settings: { repairLimit: 1 }, log: async () => {} };
  await fs.writeFile(path.join(root, 'verification.log'), 'error: invalid expression\nTOKEN=private\n');
  let calls = 0;
  await runImportedRepairs(studio, {id:'p'}, 'build', 'Fix app', new AbortController().signal, async (kind, prompt) => {
    if (++calls === 1) throw Object.assign(Error('build failed'), {nativeTestFailure:true});
    assert.equal(kind, 'refine'); assert.match(prompt, /invalid expression/); assert.doesNotMatch(prompt, /private/);
  });
  assert.equal(calls, 2);
  assert.equal((await fs.readdir(path.join(root, 'verification-attempts'))).length, 1);
  calls = 0;
  await assert.rejects(runImportedRepairs(studio, {id:'p'}, 'verify', '', new AbortController().signal, async () => {
    calls++; throw Object.assign(Error('failed'), {nativeTestFailure:true});
  }), /failed/);
  assert.equal(calls, 1);
  calls = 0;
  await assert.rejects(runImportedRepairs(studio, {id:'p'}, 'build', '', new AbortController().signal, async () => {
    calls++; throw Error('provider unavailable');
  }), /provider unavailable/);
  assert.equal(calls, 1);
});

test('import verification rejects external inputs and scripts instead of claiming workspace coverage', async t => {
  const {validateImportedInputs}=await import('../build-inputs.mjs');
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-inputs-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const file=path.join(root,'project.pbxproj'),files=[{path:'project.pbxproj'}];
  for(const text of ['path = ../Outside.swift;', 'path = "/tmp/Outside.swift";', 'isa = PBXShellScriptBuildPhase;', 'isa = XCRemoteSwiftPackageReference;', 'sourceTree = CUSTOM_ROOT;']) {
    await fs.writeFile(file,text);await assert.rejects(validateImportedInputs(root,files));
  }
  await fs.writeFile(file,'path = App/View.swift; sourceTree = "<group>";');
  await validateImportedInputs(root,files);
});

test('scheme actions and oversized configuration cannot bypass imported validation', async t => {
  const {validateImportedInputs}=await import('../build-inputs.mjs');
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-config-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const file=path.join(root,'App.xcscheme');
  await fs.writeFile(file,'<ExecutionAction><ActionContent scriptText="command"/></ExecutionAction>');
  await assert.rejects(validateImportedInputs(root),/self-contained/);
  await fs.writeFile(file,' '.repeat(500001)+'<ExecutionAction/>');
  await assert.rejects(validateImportedInputs(root),/validation limit/);
});
