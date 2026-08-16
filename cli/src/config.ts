import fs from "node:fs";
import path from "node:path";

import { LAYOUT_VERSION, ProjectLayout } from "./layout.js";

/**
 * `.ios-agent/config.json` — the one tracked file the tool owns.
 *
 * Tool-managed but hand-editable, the same bargain `.git/config` makes: normal
 * use goes through the CLI, and a human who opens it finds something they can
 * read and change. That is why it is JSON with no computed fields — anything
 * derived lives in `metadata.json`, which is disposable.
 */
export interface ProjectConfig {
  /** On-disk layout version. Lets a future release migrate instead of guessing. */
  layoutVersion: number;
  /** Schema of this file. Separate from layoutVersion so either can move alone. */
  configVersion: number;
  name: string;
  createdAt: string;
  /**
   * Source directories, relative to the project root.
   *
   * A list from day one even though `ios-agent new` writes exactly one. The
   * alternative — a `sourceDir` string widened to an array later — is a
   * breaking change to every consumer, for a feature that was always coming.
   */
  apps: AppEntry[];
  plugins: string[];
}

export interface AppEntry {
  name: string;
  /** POSIX-style relative path. Normalised on read so Windows and macOS agree. */
  path: string;
  platforms: string[];
}

export const CONFIG_VERSION = 1;

export function defaultConfig(name: string, appPath: string, now: Date = new Date()): ProjectConfig {
  return {
    layoutVersion: LAYOUT_VERSION,
    configVersion: CONFIG_VERSION,
    name,
    createdAt: now.toISOString(),
    apps: [{ name, path: toPosix(appPath), platforms: ["iOS"] }],
    plugins: [],
  };
}

export function writeConfig(layout: ProjectLayout, config: ProjectConfig): void {
  fs.mkdirSync(layout.internal, { recursive: true });
  fs.writeFileSync(layout.config, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export class ConfigError extends Error {}

/**
 * Read and validate the config.
 *
 * Throws with the offending file named rather than returning a partial object:
 * a config that is present but malformed is a different problem from one that
 * is missing, and collapsing the two sends people looking in the wrong place.
 */
export function readConfig(layout: ProjectLayout): ProjectConfig {
  let raw: string;
  try {
    raw = fs.readFileSync(layout.config, "utf8");
  } catch {
    throw new ConfigError(`No config at ${layout.config}. Run \`ios-agent init\` in this project.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new ConfigError(`${layout.config} is not valid JSON: ${(error as Error).message}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ConfigError(`${layout.config} must contain a JSON object.`);
  }

  const candidate = parsed as Partial<ProjectConfig>;
  if (typeof candidate.name !== "string" || candidate.name.length === 0) {
    throw new ConfigError(`${layout.config} is missing a "name".`);
  }
  if (!Array.isArray(candidate.apps)) {
    throw new ConfigError(`${layout.config} is missing an "apps" array.`);
  }

  const layoutVersion = typeof candidate.layoutVersion === "number" ? candidate.layoutVersion : 0;
  if (layoutVersion > LAYOUT_VERSION) {
    throw new ConfigError(
      `${layout.config} was written by a newer ios-agent (layout ${layoutVersion}, this build understands ${LAYOUT_VERSION}). Upgrade rather than letting an old build rewrite it.`,
    );
  }

  return {
    layoutVersion,
    configVersion: typeof candidate.configVersion === "number" ? candidate.configVersion : 0,
    name: candidate.name,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : "",
    apps: candidate.apps.filter(isAppEntry).map((app) => ({ ...app, path: toPosix(app.path) })),
    plugins: Array.isArray(candidate.plugins) ? candidate.plugins.filter((p) => typeof p === "string") : [],
  };
}

function isAppEntry(value: unknown): value is AppEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<AppEntry>;
  return typeof entry.name === "string" && typeof entry.path === "string";
}

/**
 * Store paths POSIX-style regardless of the platform that wrote them.
 *
 * A Windows-authored config carrying `App\MyApp` is unreadable on the macOS
 * machine that builds the app — and this file is tracked, so it crosses
 * machines by design.
 */
export function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}
