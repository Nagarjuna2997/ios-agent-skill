import { execFile } from "node:child_process";

export interface CommandResult {
  command: string;
  args: string[];
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface Runner {
  run(command: string, args: string[], options?: { timeoutMs?: number; cwd?: string }): Promise<CommandResult>;
}

export class ExecFileRunner implements Runner {
  async run(command: string, args: string[], options: { timeoutMs?: number; cwd?: string } = {}): Promise<CommandResult> {
    return new Promise((resolve) => {
      execFile(
        command,
        args,
        {
          cwd: options.cwd,
          timeout: options.timeoutMs ?? 60_000,
          maxBuffer: 20 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          const errorCode = (error as NodeJS.ErrnoException | null)?.code;
          const code =
            typeof errorCode === "number"
              ? errorCode
              : error
                ? 1
                : 0;
          resolve({
            command,
            args,
            stdout,
            stderr,
            exitCode: code,
          });
        },
      );
    });
  }
}

export function assertOk(result: CommandResult): CommandResult {
  if (result.exitCode !== 0) {
    throw new Error(
      [
        `Command failed: ${result.command} ${result.args.join(" ")}`,
        `exitCode: ${result.exitCode}`,
        result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
        result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return result;
}
