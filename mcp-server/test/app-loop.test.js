import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  writeFile,
  readFile,
  rm,
  mkdir,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const binary = resolve("dist/unified.js");
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "app-loop-test-"));
  await writeFile(join(root, "BRIEF.md"), "Demo");
  await writeFile(join(root, "source.txt"), "good");
  await writeFile(
    join(root, "check.cjs"),
    `const fs=require('fs');fs.mkdirSync('.ios-agent/evidence',{recursive:true});if(fs.readFileSync('source.txt','utf8')!=='good')process.exit(1);fs.writeFileSync('.ios-agent/evidence/screen.png','evidence');`,
  );
  const checks = {
    protectedFiles: ["check.cjs"],
    checks: [
      {
        id: "test",
        description: "Verify fixture",
        command: process.execPath,
        args: ["check.cjs"],
        timeoutSeconds: 10,
        artifacts: [".ios-agent/evidence/screen.png"],
      },
    ],
    screens: [
      {
        name: "screen",
        checkId: "test",
        artifact: ".ios-agent/evidence/screen.png",
      },
    ],
  };
  await writeFile(join(root, "checks.json"), JSON.stringify(checks));
  await writeFile(
    join(root, "plan.json"),
    JSON.stringify({
      summary: "Demo",
      screens: ["screen"],
      features: ["one"],
      criteria: [{ id: "one", description: "check", checkIds: ["test"] }],
    }),
  );
  await run(
    root,
    "init",
    "--brief",
    "BRIEF.md",
    "--checks",
    "checks.json",
    "--plan",
    "plan.json",
    "--attempts",
    "1",
  );
  return root;
}
const run = (root, action, ...args) =>
  exec(process.execPath, [binary, "loop", action, "--project", root, ...args]);
const state = (root) =>
  readFile(join(root, ".ios-agent/loop/state.json"), "utf8").then(JSON.parse);
test("completion requires check success and retained evidence; unchanged resume skips checks", async () => {
  const root = await fixture();
  try {
    await run(root, "resume", "--verify-only");
    assert.equal((await state(root)).status, "complete");
    assert.match((await run(root, "resume")).stdout, /Already complete/);
    await rm(join(root, ".ios-agent/evidence/screen.png"));
    assert.match(
      (await run(root, "resume", "--verify-only")).stdout,
      /test: PASS/,
    );
    await writeFile(join(root, "source.txt"), "broken");
    await assert.rejects(run(root, "resume", "--verify-only"));
    assert.equal((await state(root)).status, "blocked");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("frozen acceptance files cannot be changed and saved budget must be valid", async () => {
  const root = await fixture();
  try {
    await writeFile(join(root, "check.cjs"), "process.exit(0)");
    await assert.rejects(
      run(root, "resume"),
      /Frozen verification file changed/,
    );
    const saved = await state(root);
    saved.limit = 100;
    await writeFile(
      join(root, ".ios-agent/loop/state.json"),
      JSON.stringify(saved),
    );
    await assert.rejects(run(root, "resume"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("evidence symlink cannot write outside project", async () => {
  if (process.platform === "win32") return;
  const root = await fixture(),
    outside = await mkdtemp(join(tmpdir(), "loop-outside-"));
  try {
    await mkdir(join(root, ".ios-agent"), { recursive: true });
    await symlink(outside, join(root, ".ios-agent/evidence"));
    await assert.rejects(
      run(root, "resume", "--verify-only"),
      /Symlink evidence path rejected/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
test("exhausted retry budget stops without starting Claude", async () => {
  const root = await fixture();
  try {
    await writeFile(join(root, "source.txt"), "broken");
    const saved = await state(root);
    saved.attempts = 1;
    await writeFile(
      join(root, ".ios-agent/loop/state.json"),
      JSON.stringify(saved),
    );
    await assert.rejects(run(root, "resume"));
    assert.equal((await state(root)).reason, "Retry limit reached.");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("interrupt terminates the child and releases lock for resume", async () => {
  if (process.platform === "win32") return;
  const root = await fixture();
  try {
    const script = `require('fs').writeFileSync('.ios-agent/child.pid',String(process.pid));setInterval(()=>{},1000);`;
    await writeFile(join(root, "long.cjs"), script);
    const saved = await state(root);
    saved.config.checks[0].args = ["long.cjs"];
    await writeFile(
      join(root, ".ios-agent/loop/state.json"),
      JSON.stringify(saved),
    );
    const child = spawn(
      process.execPath,
      [binary, "loop", "resume", "--project", root, "--verify-only"],
      { stdio: "ignore" },
    );
    let pid;
    for (let i = 0; i < 100; i++) {
      try {
        pid = Number(
          await readFile(join(root, ".ios-agent/child.pid"), "utf8"),
        );
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 20));
      }
    }
    assert.ok(pid);
    child.kill("SIGTERM");
    await new Promise((r) => child.once("exit", r));
    assert.throws(() => process.kill(pid, 0));
    await assert.rejects(readFile(join(root, ".ios-agent/loop/lock")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("failed check feeds a bounded repair adapter and rechecks before completion", async () => {
  if (process.platform === "win32") return;
  const root = await fixture();
  try {
    const { chmod } = await import("node:fs/promises");
    const bin = join(root, ".ios-agent/bin");
    await mkdir(bin, { recursive: true });
    await writeFile(
      join(bin, "claude"),
      `#!/usr/bin/env node\nlet input='';process.stdin.on('data',d=>input+=d);process.stdin.on('end',()=>{if(!input.includes('FAILURES:'))process.exit(2);require('fs').writeFileSync('source.txt','good');console.error('adapter diagnostic');console.log(JSON.stringify({result:'Fixed',is_error:false}));});`,
    );
    await chmod(join(bin, "claude"), 0o755);
    await writeFile(join(root, "source.txt"), "broken");
    await exec(
      process.execPath,
      [binary, "loop", "resume", "--project", root],
      { env: { ...process.env, PATH: bin + ":" + process.env.PATH } },
    );
    const saved = await state(root);
    assert.equal(saved.status, "complete");
    assert.equal(saved.attempts, 1);
    assert.ok(saved.events.some((e) => e.message === "test: FAIL"));
    assert.ok(saved.events.some((e) => e.message === "test: PASS"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("cached completion rejects symlink evidence even with matching content", async () => {
  if (process.platform === "win32") return;
  const root = await fixture();
  const outside = await mkdtemp(join(tmpdir(), "loop-cached-"));
  try {
    await run(root, "resume", "--verify-only");
    await writeFile(join(outside, "screen.png"), "evidence");
    await rm(join(root, ".ios-agent/evidence"), { recursive: true });
    await symlink(outside, join(root, ".ios-agent/evidence"));
    await assert.rejects(
      run(root, "resume", "--verify-only"),
      /Symlink evidence path rejected/,
    );
    assert.notEqual((await state(root)).status, "complete");
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
test("artifact outputs cannot alter fingerprinted source paths", async () => {
  const root = await fixture();
  try {
    const config = JSON.parse(
      await readFile(join(root, "checks.json"), "utf8"),
    );
    config.checks[0].artifacts = ["screenshots/home.png"];
    config.screens[0].artifact = "screenshots/home.png";
    await writeFile(join(root, "checks.json"), JSON.stringify(config));
    await rm(join(root, ".ios-agent/loop"), { recursive: true });
    await assert.rejects(
      run(
        root,
        "init",
        "--brief",
        "BRIEF.md",
        "--checks",
        "checks.json",
        "--plan",
        "plan.json",
      ),
      /canonical paths inside/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
