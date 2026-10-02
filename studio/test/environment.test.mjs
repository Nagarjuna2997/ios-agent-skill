import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  commonToolDirectories,
  detachedExec,
  loginShellPath,
  mergePath,
  parseShellPath,
  resolveToolPath,
} from "../environment.mjs";

test("PATH merge keeps order, removes duplicates and drops relative entries", () => {
  assert.equal(
    mergePath("/a:/b", "/b:.::relative:/c", undefined, "/a:/d"),
    "/a:/b:/c:/d",
  );
});

test("shell PATH is read only between markers, ignoring shell startup noise", () => {
  assert.equal(
    parseShellPath("Last login\nwelcome\n__STUDIO_PATH__/x/bin:/usr/bin__STUDIO_PATH__\n"),
    "/x/bin:/usr/bin",
  );
  assert.equal(parseShellPath("no markers"), "");
  assert.equal(parseShellPath("__STUDIO_PATH__/unterminated"), "");
});

test("login shell lookup runs only on macOS with a supported shell and fails closed", async () => {
  const calls = [];
  const exec = (program, args, options, done) => {
    calls.push({ program, args, options });
    done(null, "motd __STUDIO_PATH__/Users/me/.nvm/bin:/usr/bin__STUDIO_PATH__");
  };
  assert.equal(await loginShellPath({ platform: "linux", exec }), "");
  assert.equal(calls.length, 0);
  assert.equal(
    await loginShellPath({ platform: "darwin", shell: "/bin/bash", exec }),
    "/Users/me/.nvm/bin:/usr/bin",
  );
  assert.equal(calls[0].program, "/bin/bash");
  assert.equal(calls[0].args[0], "-ilc");
  assert.ok(calls[0].options.timeout > 0);
  // Unknown or relative shells fall back to the macOS default shell.
  await loginShellPath({ platform: "darwin", shell: "/usr/local/bin/fish", exec });
  await loginShellPath({ platform: "darwin", shell: "zsh", exec });
  assert.deepEqual(calls.slice(1).map((c) => c.program), ["/bin/zsh", "/bin/zsh"]);
  const failing = (p, a, o, done) => {
    done(new Error("timed out"), "");
    return {};
  };
  assert.equal(await loginShellPath({ platform: "darwin", exec: failing }), "");
  const throwing = () => {
    throw new Error("spawn failed");
  };
  assert.equal(await loginShellPath({ platform: "darwin", exec: throwing }), "");
});

test("resolved PATH puts the login shell first and adds existing tool folders", async () => {
  const exec = (p, a, o, done) => {
    done(null, "__STUDIO_PATH__/shell/bin:/usr/bin__STUDIO_PATH__");
    return {};
  };
  const exists = (dir) => dir === "/home/me/.npm-global/bin";
  assert.equal(commonToolDirectories("/home/me", exists), "/home/me/.npm-global/bin");
  assert.equal(
    await resolveToolPath({
      platform: "darwin",
      shell: "/bin/zsh",
      exec,
      current: "/usr/bin:/bin",
      home: "/home/me",
      exists,
    }),
    "/shell/bin:/usr/bin:/bin:/home/me/.npm-global/bin",
  );
});

test(
  "a real login shell returns its PATH",
  { skip: !existsSync("/bin/bash") && "bash is not installed" },
  async () => {
    const value = await loginShellPath({ platform: "darwin", shell: "/bin/bash" });
    assert.ok(value.split(":").includes("/usr/bin") || value.split(":").includes("/bin"), value);
  },
);

test(
  "a hung shell is killed with everything it started",
  { skip: !existsSync("/bin/sh") && "sh is not installed" },
  async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-shell-"));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const pidFile = path.join(dir, "pid");
    const started = Date.now();
    const result = await new Promise((resolve) =>
      detachedExec(
        "/bin/sh",
        ["-c", `sleep 30 & echo $! > '${pidFile}'; sleep 30`],
        { timeout: 300, env: process.env },
        (error, stdout) => resolve({ error, stdout }),
      ),
    );
    assert.match(result.error.message, /timed out/);
    assert.ok(Date.now() - started < 5000);
    const background = Number(await fs.readFile(pidFile, "utf8"));
    await new Promise((r) => setTimeout(r, 200));
    // A killed process may linger as an unreaped zombie in containers without
    // an init process; that still counts as stopped.
    const running = () => {
      try {
        process.kill(background, 0);
      } catch {
        return false;
      }
      try {
        return readFileSync(`/proc/${background}/stat`, "utf8").split(" ")[2] !== "Z";
      } catch {
        return true;
      }
    };
    assert.equal(running(), false);
  },
);
