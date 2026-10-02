import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Apps opened from Finder (and the bundled launcher) inherit a minimal PATH, so
// CLIs installed through nvm, Homebrew or npm prefixes can look "missing" even
// though they work in Terminal. Studio asks the user's own login shell for its
// PATH once at startup and merges it with what the process already has.
const marker = "__STUDIO_PATH__";
const supportedShells = new Set(["zsh", "bash", "sh", "ksh"]);

export function mergePath(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists)
    for (const entry of (list ?? "").split(":"))
      // Relative entries (including "" and ".") would resolve against Studio's
      // working directory, so they are never added.
      if (path.isAbsolute(entry) && !seen.has(entry)) {
        seen.add(entry);
        out.push(entry);
      }
  return out.join(":");
}

export function parseShellPath(output) {
  const start = output.indexOf(marker);
  if (start < 0) return "";
  const rest = output.slice(start + marker.length);
  const end = rest.indexOf(marker);
  return end < 0 ? "" : rest.slice(0, end).trim();
}

// Runs the shell in its own process group with no stdin, so an interactive
// shell cannot take over Studio's terminal, and a timeout kills the shell and
// anything its startup files launched.
export function detachedExec(program, args, { timeout, env }, done) {
  const child = spawn(program, args, {
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "",
    finished = false;
  const finish = (error) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {}
    done(error, stdout);
  };
  const timer = setTimeout(() => finish(new Error("Shell PATH lookup timed out")), timeout);
  child.stdout.on("data", (chunk) => {
    stdout = (stdout + chunk).slice(-1024 * 1024);
  });
  child.stderr.resume();
  child.on("error", finish);
  child.on("close", (code) => finish(code === 0 ? null : new Error("Shell exited with " + code)));
  return child;
}

export function loginShellPath({
  shell = process.env.SHELL,
  platform = process.platform,
  timeout = 5000,
  exec = detachedExec,
} = {}) {
  if (platform !== "darwin") return Promise.resolve("");
  const program =
    shell && path.isAbsolute(shell) && supportedShells.has(path.basename(shell))
      ? shell
      : "/bin/zsh";
  return new Promise((resolve) => {
    try {
      exec(
        program,
        ["-ilc", `printf '%s%s%s' '${marker}' "$PATH" '${marker}'`],
        { timeout, env: { ...process.env, TERM: "dumb" } },
        (error, stdout) => resolve(error ? "" : parseShellPath(String(stdout))),
      );
    } catch {
      resolve("");
    }
  });
}

export function commonToolDirectories(home = os.homedir(), exists = existsSync) {
  return [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    path.join(home, ".local/bin"),
    path.join(home, ".npm-global/bin"),
    path.join(home, ".bun/bin"),
  ]
    .filter((dir) => exists(dir))
    .join(":");
}

export async function resolveToolPath(options = {}) {
  const shellPath = await loginShellPath(options);
  return mergePath(
    shellPath,
    options.current ?? process.env.PATH,
    commonToolDirectories(options.home, options.exists),
  );
}
