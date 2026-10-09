// Command execution for the iOS build agent.
//
// Every external program (xcodebuild, xcrun, xcodegen) goes through a
// CommandRunner so that tests can substitute fake executables and so that each
// call is recorded in the project's tool log. Output is captured in full up to
// a bound, then truncated from the front: build errors are at the end.
import { spawn } from "node:child_process";
import { appendFile, mkdir } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, sep } from "node:path";

export interface CommandResult {
  command: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  /** Set when the program could not be started at all (for example ENOENT). */
  spawnError?: string;
}

export interface RunOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  signal?: AbortSignal;
}

export interface CommandRunner {
  run(command: string, args: string[], options?: RunOptions): Promise<CommandResult>;
}

const MAX_OUTPUT = 8 * 1024 * 1024;

const keepTail = (text: string) => (text.length > MAX_OUTPUT ? text.slice(-MAX_OUTPUT) : text);

export class ProcessRunner implements CommandRunner {
  constructor(private readonly baseEnv: Record<string, string | undefined> = process.env) {}

  run(command: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
    const started = Date.now();
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;
      const env = Object.fromEntries(
        Object.entries({ ...this.baseEnv, ...options.env }).filter((e): e is [string, string] => e[1] !== undefined),
      );
      const child = spawn(command, args, {
        cwd: options.cwd,
        env,
        stdio: ["ignore", "pipe", "pipe"],
        detached: process.platform !== "win32",
      });
      const stop = () => {
        try {
          if (child.pid) process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      };
      const finish = (exitCode: number | null, spawnError?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", onAbort);
        resolve({
          command,
          args,
          exitCode,
          stdout: keepTail(stdout),
          stderr: keepTail(stderr),
          durationMs: Date.now() - started,
          timedOut,
          ...(spawnError ? { spawnError } : {}),
        });
      };
      const onAbort = () => stop();
      const timer = setTimeout(() => {
        timedOut = true;
        stop();
      }, options.timeoutMs ?? 120_000);
      options.signal?.addEventListener("abort", onAbort, { once: true });
      child.stdout.on("data", (chunk) => {
        stdout = keepTail(stdout + chunk);
      });
      child.stderr.on("data", (chunk) => {
        stderr = keepTail(stderr + chunk);
      });
      child.on("error", (error) => finish(null, error.message));
      child.on("close", (code) => finish(code));
    });
  }
}

export interface ToolLogEntry {
  at: string;
  command: string;
  args: string[];
  cwd?: string;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  spawnError?: string;
}

/** Records every command (never its output, which may contain paths or secrets) as JSON lines. */
export class LoggingRunner implements CommandRunner {
  private readonly projectRoot: string;

  constructor(
    private readonly inner: CommandRunner,
    private readonly logFile: string,
  ) {
    this.projectRoot = dirname(dirname(logFile));
  }

  async run(command: string, args: string[], options: RunOptions = {}): Promise<CommandResult> {
    const result = await this.inner.run(command, args, options);
    const entry: ToolLogEntry = {
      at: new Date().toISOString(),
      command,
      args: args.map((arg) => this.portablePath(arg)),
      ...(options.cwd ? { cwd: this.portableCwd(options.cwd) } : {}),
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      timedOut: result.timedOut,
      ...(result.spawnError ? { spawnError: result.spawnError } : {}),
    };
    await mkdir(dirname(this.logFile), { recursive: true });
    await appendFile(this.logFile, JSON.stringify(entry) + "\n");
    return result;
  }

  private portableCwd(cwd: string): string | undefined {
    return this.portablePath(cwd);
  }

  private portablePath(value: string): string {
    if (!isAbsolute(value)) return value;
    const path = relative(this.projectRoot, value);
    if (path === "") return ".";
    if (path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) return `<external-path:${basename(value)}>`;
    return path.split(sep).join("/");
  }
}

export function commandFailed(result: CommandResult): string {
  if (result.spawnError) return `${result.command} could not start: ${result.spawnError}`;
  if (result.timedOut) return `${result.command} timed out after ${result.durationMs} ms`;
  const tail = (result.stderr.trim() || result.stdout.trim()).split("\n").slice(-20).join("\n");
  return `${result.command} ${result.args.join(" ")} exited with ${result.exitCode}${tail ? `:\n${tail}` : ""}`;
}
