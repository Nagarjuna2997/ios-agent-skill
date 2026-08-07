import fs from "node:fs";
import path from "node:path";

import {
  APP_DIR,
  INTERNAL_DIR,
  INTERNAL_ENTRIES,
  LAYOUT_VERSION,
  ProjectLayout,
  disposableEntries,
  gitignoreContents,
  globalCacheDir,
  layoutFor,
} from "./layout.js";
import { ConfigError, defaultConfig, readConfig, writeConfig } from "./config.js";
import { ScaffoldError, ensureInternal, scaffoldProject } from "./scaffold.js";
import { discoverProject } from "./discover.js";

export interface IO {
  out(text: string): void;
  err(text: string): void;
  cwd(): string;
  env: NodeJS.ProcessEnv;
}

export const defaultIO: IO = {
  out: (text) => process.stdout.write(`${text}\n`),
  err: (text) => process.stderr.write(`${text}\n`),
  cwd: () => process.cwd(),
  env: process.env,
};

interface ParsedArgs {
  command: string;
  positionals: string[];
  flags: Set<string>;
  values: Map<string, string>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags = new Set<string>();
  const values = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const body = token.slice(2);
    const eq = body.indexOf("=");
    if (eq >= 0) {
      values.set(body.slice(0, eq), body.slice(eq + 1));
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      values.set(body, argv[i + 1]);
      i += 1;
    } else {
      flags.add(body);
    }
  }

  return { command: positionals.shift() ?? "", positionals, flags, values };
}

export function run(argv: string[], io: IO = defaultIO): number {
  const args = parseArgs(argv);

  try {
    switch (args.command) {
      case "":
      case "help":
      case "--help":
        io.out(helpText());
        return 0;
      case "new":
        return commandNew(args, io);
      case "init":
        return commandInit(args, io);
      case "where":
        return commandWhere(args, io);
      case "info":
        return commandInfo(args, io);
      case "clean":
        return commandClean(args, io);
      case "doctor":
        return commandDoctor(args, io);
      default:
        io.err(`Unknown command "${args.command}". Run \`ios-agent help\`.`);
        return 1;
    }
  } catch (error) {
    if (error instanceof ScaffoldError || error instanceof ConfigError) {
      io.err(error.message);
      return 1;
    }
    throw error;
  }
}

// MARK: - new

function commandNew(args: ParsedArgs, io: IO): number {
  const name = args.positionals[0];
  if (!name) {
    io.err("Usage: ios-agent new <Name> [--minimal] [--no-license] [--force]");
    return 1;
  }

  const result = scaffoldProject({
    name,
    parentDir: args.values.get("into") ?? io.cwd(),
    minimal: args.flags.has("minimal"),
    license: args.flags.has("no-license") ? "none" : "MIT",
    force: args.flags.has("force"),
  });

  io.out(`Created ${result.layout.root}`);
  io.out("");
  io.out(renderTree(result.layout, args.flags.has("minimal")));
  io.out("");
  io.out(`Next: open Xcode, create an App project inside App/, and add App/${name}/ to it.`);
  return 0;
}

// MARK: - init

function commandInit(args: ParsedArgs, io: IO): number {
  const root = path.resolve(args.positionals[0] ?? io.cwd());
  const layout = layoutFor(root);

  if (fs.existsSync(layout.config)) {
    io.out(`Already initialised: ${layout.config}`);
    return 0;
  }

  ensureInternal(layout);
  writeConfig(layout, defaultConfig(path.basename(root), APP_DIR));
  io.out(`Initialised ${INTERNAL_DIR}/ in ${root}`);
  return 0;
}

// MARK: - where

/**
 * Print resolved paths — the interop contract.
 *
 * `--json` exists so other tools (the MCP server, an editor plugin, a CI
 * script) ask the CLI where things are instead of hardcoding `.ios-agent`.
 * One process owns the layout; everything else queries it, which is what keeps
 * a future rename from being a coordinated multi-repo change.
 */
function commandWhere(args: ParsedArgs, io: IO): number {
  const discovery = discoverProject(io.cwd(), io.env, args.values.get("project"));
  if (!discovery) {
    io.err(`No ${INTERNAL_DIR}/ found in ${io.cwd()} or any parent. Run \`ios-agent init\`.`);
    return 1;
  }

  const { layout, source } = discovery;
  const payload = {
    project_root: layout.root,
    resolved_from: source,
    layout_version: LAYOUT_VERSION,
    internal_dir: INTERNAL_DIR,
    global_cache: globalCacheDir(io.env),
    paths: {
      app: layout.app,
      internal: layout.internal,
      config: layout.config,
      state: layout.state,
      metadata: layout.metadata,
      cache: layout.cache,
      logs: layout.logs,
      build: layout.build,
      screenshots: layout.screenshots,
      templates: layout.templates,
      plugins: layout.plugins,
      tmp: layout.tmp,
    },
  };

  if (args.flags.has("json")) {
    io.out(JSON.stringify(payload, null, 2));
    return 0;
  }

  io.out(`root          ${payload.project_root}   (${source})`);
  io.out(`app           ${layout.app}`);
  io.out(`internal      ${layout.internal}`);
  io.out(`global cache  ${payload.global_cache}`);
  return 0;
}

// MARK: - info

function commandInfo(args: ParsedArgs, io: IO): number {
  const discovery = discoverProject(io.cwd(), io.env, args.values.get("project"));
  if (!discovery) {
    io.err(`No ${INTERNAL_DIR}/ found in ${io.cwd()} or any parent. Run \`ios-agent init\`.`);
    return 1;
  }

  const config = readConfig(discovery.layout);
  io.out(`${config.name}`);
  io.out(`  root      ${discovery.layout.root}`);
  io.out(`  created   ${config.createdAt || "unknown"}`);
  io.out(`  layout    v${config.layoutVersion}`);
  io.out(`  apps      ${config.apps.map((app) => `${app.name} (${app.path})`).join(", ") || "none"}`);
  io.out(`  plugins   ${config.plugins.join(", ") || "none"}`);
  return 0;
}

// MARK: - clean

/**
 * Delete every disposable internal entry.
 *
 * Non-interactive by construction: the set comes from `disposableEntries()`,
 * which is the complement of what the generated gitignore tracks. There is no
 * path by which this removes something a human wrote, so there is nothing to
 * confirm — the guarantee is structural rather than a promise in the help text.
 */
function commandClean(args: ParsedArgs, io: IO): number {
  const discovery = discoverProject(io.cwd(), io.env, args.values.get("project"));
  if (!discovery) {
    io.err(`No ${INTERNAL_DIR}/ found in ${io.cwd()} or any parent.`);
    return 1;
  }

  const dryRun = args.flags.has("dry-run");
  const removed: string[] = [];

  for (const entry of disposableEntries()) {
    const target = path.join(discovery.layout.internal, entry.name);
    if (!fs.existsSync(target)) continue;
    if (!dryRun) fs.rmSync(target, { recursive: true, force: true });
    removed.push(target);
  }

  if (removed.length === 0) {
    io.out("Nothing to clean.");
    return 0;
  }

  io.out(`${dryRun ? "Would remove" : "Removed"} ${removed.length} entries:`);
  for (const target of removed) io.out(`  ${path.relative(discovery.layout.root, target)}`);
  return 0;
}

// MARK: - doctor

interface Diagnosis {
  readonly ok: boolean;
  readonly message: string;
}

function commandDoctor(args: ParsedArgs, io: IO): number {
  const discovery = discoverProject(io.cwd(), io.env, args.values.get("project"));
  if (!discovery) {
    io.err(`No ${INTERNAL_DIR}/ found in ${io.cwd()} or any parent. Run \`ios-agent init\`.`);
    return 1;
  }

  const results = diagnose(discovery.layout, io.env);
  for (const result of results) {
    io.out(`${result.ok ? "ok  " : "FAIL"}  ${result.message}`);
  }

  const failures = results.filter((r) => !r.ok).length;
  io.out("");
  io.out(failures === 0 ? `All ${results.length} checks passed.` : `${failures} of ${results.length} checks failed.`);
  return failures === 0 ? 0 : 1;
}

export function diagnose(layout: ProjectLayout, env: NodeJS.ProcessEnv = process.env): Diagnosis[] {
  const results: Diagnosis[] = [];

  results.push({
    ok: fs.existsSync(layout.app),
    message: `${APP_DIR}/ exists — the directory the user actually works in`,
  });

  const configExists = fs.existsSync(layout.config);
  results.push({ ok: configExists, message: `${INTERNAL_DIR}/config.json exists` });

  if (configExists) {
    try {
      const config = readConfig(layout);
      results.push({ ok: true, message: `config parses (layout v${config.layoutVersion})` });
    } catch (error) {
      results.push({ ok: false, message: `config unreadable: ${(error as Error).message}` });
    }
  }

  // A stale gitignore is the failure that silently commits a cache directory,
  // so it is checked against the generated contents rather than for existence.
  const expected = gitignoreContents();
  const actual = fs.existsSync(layout.gitignore) ? fs.readFileSync(layout.gitignore, "utf8") : "";
  results.push({
    ok: actual === expected,
    message:
      actual === expected
        ? `${INTERNAL_DIR}/.gitignore matches the current layout`
        : `${INTERNAL_DIR}/.gitignore is stale — run any ios-agent command to regenerate it`,
  });

  // Nothing tool-owned may sit at the project root: that is the whole point of
  // the design, and a stray directory is how it erodes one release at a time.
  const strays = INTERNAL_ENTRIES.filter((entry) => fs.existsSync(path.join(layout.root, entry.name)));
  results.push({
    ok: strays.length === 0,
    message:
      strays.length === 0
        ? "no tool-owned files at the project root"
        : `tool-owned entries leaked to the project root: ${strays.map((e) => e.name).join(", ")}`,
  });

  if (process.platform === "win32") {
    results.push({
      ok: true,
      message: `note: a leading dot does not hide ${INTERNAL_DIR} on Windows — run \`attrib +h ${INTERNAL_DIR}\` if you want it hidden in Explorer`,
    });
  }

  results.push({ ok: true, message: `global cache: ${globalCacheDir(env)}` });

  return results;
}

// MARK: - Rendering

function renderTree(layout: ProjectLayout, minimal: boolean): string {
  const name = path.basename(layout.root);
  if (minimal) {
    return [`${name}/`, `└── ${APP_DIR}/`].join("\n");
  }
  return [
    `${name}/`,
    `├── ${APP_DIR}/`,
    "├── README.md",
    "├── LICENSE",
    "└── .ios-agent/          # tool-managed, safe to delete",
  ].join("\n");
}

function helpText(): string {
  return `ios-agent — scaffolding and project management for iOS work

USAGE
  ios-agent new <Name>       Scaffold a project
    --minimal                Only App/; .ios-agent/ appears when first needed
    --into <dir>             Parent directory (default: cwd)
    --no-license             Skip LICENSE
    --force                  Scaffold into a non-empty directory

  ios-agent init [dir]       Adopt an existing directory
  ios-agent where [--json]   Print resolved paths; --json is the tooling contract
  ios-agent info             Summarise the project
  ios-agent clean [--dry-run]  Delete disposable internal files
  ios-agent doctor           Check the layout

LAYOUT
  App/          your source — the only directory you edit
  .ios-agent/   caches, logs, state, build artifacts, metadata
                only config.json is tracked; the rest regenerates

ENVIRONMENT
  IOS_AGENT_HOME        Override project root discovery
  IOS_AGENT_CACHE_DIR   Override the user-level cache location`;
}
