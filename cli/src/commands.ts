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

/**
 * Exit codes, stable across releases.
 *
 * Separated so a script can tell "you called it wrong" from "the project is
 * unhealthy". Collapsing both into 1 forces callers to parse stderr, which is
 * the thing `--json` exists to avoid.
 */
export const EXIT_OK = 0;
export const EXIT_USAGE = 1;
export const EXIT_UNHEALTHY = 2;

// MARK: - Argument parsing

interface ParsedArgs {
  command: string;
  positionals: string[];
  flags: Set<string>;
  values: Map<string, string>;
}

/** Flags that take a value. Everything else is boolean, so `--json doctor` parses. */
const VALUE_FLAGS = new Set(["into", "project"]);

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
    } else if (VALUE_FLAGS.has(body) && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      values.set(body, argv[i + 1]);
      i += 1;
    } else {
      flags.add(body);
    }
  }

  return { command: positionals.shift() ?? "", positionals, flags, values };
}

// MARK: - The command table

interface FlagSpec {
  readonly name: string;
  readonly takesValue: boolean;
  readonly summary: string;
}

interface CommandSpec {
  readonly name: string;
  readonly usage: string;
  readonly summary: string;
  readonly flags: readonly FlagSpec[];
  readonly run: (args: ParsedArgs, io: IO) => number;
}

/**
 * Every command, declared once.
 *
 * Dispatch, `help`, and shell completions all read this table — the same
 * arrangement as `INTERNAL_ENTRIES` in layout.ts, for the same reason. Help
 * text maintained separately from the parser drifts, and the drift is invisible
 * until someone follows the documentation and gets an error.
 */
const COMMANDS: readonly CommandSpec[] = [
  {
    name: "new",
    usage: "ios-agent new <Name>",
    summary: "Scaffold a project",
    flags: [
      { name: "minimal", takesValue: false, summary: "Only App/; .ios-agent/ appears when first needed" },
      { name: "into", takesValue: true, summary: "Parent directory (default: cwd)" },
      { name: "no-license", takesValue: false, summary: "Skip LICENSE" },
      { name: "force", takesValue: false, summary: "Scaffold into a non-empty directory" },
    ],
    run: commandNew,
  },
  {
    name: "init",
    usage: "ios-agent init [dir]",
    summary: "Adopt an existing directory",
    flags: [],
    run: commandInit,
  },
  {
    name: "where",
    usage: "ios-agent where",
    summary: "Print resolved paths",
    flags: [
      { name: "json", takesValue: false, summary: "Machine-readable output" },
      { name: "project", takesValue: true, summary: "Use this root instead of discovering one" },
    ],
    run: commandWhere,
  },
  {
    name: "info",
    usage: "ios-agent info",
    summary: "Summarise the project",
    flags: [
      { name: "json", takesValue: false, summary: "Machine-readable output" },
      { name: "project", takesValue: true, summary: "Use this root instead of discovering one" },
    ],
    run: commandInfo,
  },
  {
    name: "clean",
    usage: "ios-agent clean",
    summary: "Delete disposable internal files",
    flags: [
      { name: "dry-run", takesValue: false, summary: "Report without deleting" },
      { name: "json", takesValue: false, summary: "Machine-readable output" },
      { name: "project", takesValue: true, summary: "Use this root instead of discovering one" },
    ],
    run: commandClean,
  },
  {
    name: "doctor",
    usage: "ios-agent doctor",
    summary: "Check the layout",
    flags: [
      { name: "fix", takesValue: false, summary: "Repair what can be repaired safely" },
      { name: "json", takesValue: false, summary: "Machine-readable output" },
      { name: "project", takesValue: true, summary: "Use this root instead of discovering one" },
    ],
    run: commandDoctor,
  },
  {
    name: "completions",
    usage: "ios-agent completions <bash|zsh>",
    summary: "Print a shell completion script",
    flags: [],
    run: commandCompletions,
  },
];

export function run(argv: string[], io: IO = defaultIO): number {
  const args = parseArgs(argv);

  if (args.command === "" || args.command === "help" || args.command === "--help") {
    io.out(helpText());
    return EXIT_OK;
  }

  const spec = COMMANDS.find((command) => command.name === args.command);
  if (!spec) {
    io.err(`Unknown command "${args.command}". Run \`ios-agent help\`.`);
    return EXIT_USAGE;
  }

  try {
    return spec.run(args, io);
  } catch (error) {
    if (error instanceof ScaffoldError || error instanceof ConfigError) {
      io.err(error.message);
      return EXIT_USAGE;
    }
    throw error;
  }
}

// MARK: - Shared

/** Resolve the project, or explain precisely why not. */
function requireProject(args: ParsedArgs, io: IO) {
  const discovery = discoverProject(io.cwd(), io.env, args.values.get("project"));
  if (!discovery) {
    io.err(
      `No ${INTERNAL_DIR}/ found in ${io.cwd()} or any parent. Run \`ios-agent init\` here, or pass --project.`,
    );
    return undefined;
  }
  return discovery;
}

function emit(args: ParsedArgs, io: IO, body: unknown, lines: string[]): void {
  if (args.flags.has("json")) {
    io.out(JSON.stringify(body, null, 2));
    return;
  }
  for (const line of lines) io.out(line);
}

// MARK: - new

function commandNew(args: ParsedArgs, io: IO): number {
  const name = args.positionals[0];
  if (!name) {
    io.err("Usage: ios-agent new <Name> [--minimal] [--no-license] [--force]");
    return EXIT_USAGE;
  }

  const minimal = args.flags.has("minimal");
  const result = scaffoldProject({
    name,
    parentDir: args.values.get("into") ?? io.cwd(),
    minimal,
    license: args.flags.has("no-license") ? "none" : "MIT",
    force: args.flags.has("force"),
  });

  emit(
    args,
    io,
    { project_root: result.layout.root, created: result.created },
    [
      `Created ${result.layout.root}`,
      "",
      renderTree(result.layout, minimal),
      "",
      `Next: open Xcode, create an App project inside App/, and add App/${name}/ to it.`,
    ],
  );
  return EXIT_OK;
}

// MARK: - init

function commandInit(args: ParsedArgs, io: IO): number {
  const root = path.resolve(args.positionals[0] ?? io.cwd());
  const layout = layoutFor(root);

  if (fs.existsSync(layout.config)) {
    emit(args, io, { project_root: root, already_initialised: true }, [`Already initialised: ${layout.config}`]);
    return EXIT_OK;
  }

  ensureInternal(layout);
  writeConfig(layout, defaultConfig(path.basename(root), APP_DIR));
  emit(args, io, { project_root: root, already_initialised: false }, [`Initialised ${INTERNAL_DIR}/ in ${root}`]);
  return EXIT_OK;
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
  const discovery = requireProject(args, io);
  if (!discovery) return EXIT_USAGE;

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

  emit(args, io, payload, [
    `root          ${payload.project_root}   (${source})`,
    `app           ${layout.app}`,
    `internal      ${layout.internal}`,
    `global cache  ${payload.global_cache}`,
  ]);
  return EXIT_OK;
}

// MARK: - info

function commandInfo(args: ParsedArgs, io: IO): number {
  const discovery = requireProject(args, io);
  if (!discovery) return EXIT_USAGE;

  const config = readConfig(discovery.layout);
  emit(
    args,
    io,
    {
      project_root: discovery.layout.root,
      resolved_from: discovery.source,
      name: config.name,
      created_at: config.createdAt,
      layout_version: config.layoutVersion,
      current_layout_version: LAYOUT_VERSION,
      apps: config.apps,
      plugins: config.plugins,
    },
    [
      `${config.name}`,
      `  root      ${discovery.layout.root}`,
      `  created   ${config.createdAt || "unknown"}`,
      `  layout    v${config.layoutVersion}${config.layoutVersion < LAYOUT_VERSION ? ` (current is v${LAYOUT_VERSION} — run \`ios-agent doctor --fix\`)` : ""}`,
      `  apps      ${config.apps.map((app) => `${app.name} (${app.path})`).join(", ") || "none"}`,
      `  plugins   ${config.plugins.join(", ") || "none"}`,
    ],
  );
  return EXIT_OK;
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
  const discovery = requireProject(args, io);
  if (!discovery) return EXIT_USAGE;

  const dryRun = args.flags.has("dry-run");
  const removed: string[] = [];

  for (const entry of disposableEntries()) {
    const target = path.join(discovery.layout.internal, entry.name);
    if (!fs.existsSync(target)) continue;
    if (!dryRun) fs.rmSync(target, { recursive: true, force: true });
    removed.push(target);
  }

  const relative = removed.map((target) => path.relative(discovery.layout.root, target));
  emit(
    args,
    io,
    { project_root: discovery.layout.root, dry_run: dryRun, removed: relative },
    removed.length === 0
      ? ["Nothing to clean."]
      : [`${dryRun ? "Would remove" : "Removed"} ${removed.length} entries:`, ...relative.map((r) => `  ${r}`)],
  );
  return EXIT_OK;
}

// MARK: - doctor

export type Remedy = "regenerate-internal" | "migrate-config" | null;

export interface Diagnosis {
  readonly ok: boolean;
  readonly check: string;
  readonly message: string;
  /**
   * How `--fix` repairs this, or null.
   *
   * Only defects with a *derivable* correct value are fixable. A missing `App/`
   * has no safe automatic answer — creating it invents a project structure the
   * user never asked for — so it is reported and left alone. A fix flag that
   * guesses is worse than no fix flag.
   */
  readonly remedy: Remedy;
}

function commandDoctor(args: ParsedArgs, io: IO): number {
  const discovery = requireProject(args, io);
  if (!discovery) return EXIT_USAGE;

  const layout = discovery.layout;
  let results = diagnose(layout, io.env);
  const applied: string[] = [];

  if (args.flags.has("fix")) {
    for (const remedy of new Set(results.filter((r) => !r.ok && r.remedy).map((r) => r.remedy as Remedy))) {
      if (applyRemedy(layout, remedy)) applied.push(remedy as string);
    }
    results = diagnose(layout, io.env);
  }

  const failures = results.filter((r) => !r.ok);
  emit(
    args,
    io,
    {
      project_root: layout.root,
      healthy: failures.length === 0,
      applied_fixes: applied,
      checks: results.map((r) => ({ check: r.check, ok: r.ok, message: r.message, fixable: r.remedy !== null })),
    },
    [
      ...applied.map((remedy) => `fix   applied ${remedy}`),
      ...results.map((r) => `${r.ok ? "ok  " : "FAIL"}  ${r.message}${!r.ok && r.remedy ? "  (fixable: --fix)" : ""}`),
      "",
      failures.length === 0
        ? `All ${results.length} checks passed.`
        : `${failures.length} of ${results.length} checks failed.`,
    ],
  );
  return failures.length === 0 ? EXIT_OK : EXIT_UNHEALTHY;
}

function applyRemedy(layout: ProjectLayout, remedy: Remedy): boolean {
  switch (remedy) {
    case "regenerate-internal":
      ensureInternal(layout);
      return true;
    case "migrate-config": {
      // Only forward, and only field-by-field. There is nothing to migrate at
      // layout v1; the branch exists so the first real migration has a place to
      // go that is already wired into doctor, info, and the tests.
      const config = readConfig(layout);
      writeConfig(layout, { ...config, layoutVersion: LAYOUT_VERSION });
      return true;
    }
    default:
      return false;
  }
}

export function diagnose(layout: ProjectLayout, env: NodeJS.ProcessEnv = process.env): Diagnosis[] {
  const results: Diagnosis[] = [];

  results.push({
    check: "app-dir",
    ok: fs.existsSync(layout.app),
    message: `${APP_DIR}/ exists — the directory the user actually works in`,
    remedy: null,
  });

  const configExists = fs.existsSync(layout.config);
  results.push({
    check: "config-exists",
    ok: configExists,
    message: `${INTERNAL_DIR}/config.json exists`,
    remedy: null,
  });

  if (configExists) {
    try {
      const config = readConfig(layout);
      const current = config.layoutVersion === LAYOUT_VERSION;
      results.push({
        check: "config-parses",
        ok: true,
        message: `config parses (layout v${config.layoutVersion})`,
        remedy: null,
      });
      results.push({
        check: "layout-version",
        ok: current,
        message: current
          ? `layout is current (v${LAYOUT_VERSION})`
          : `layout is v${config.layoutVersion}, current is v${LAYOUT_VERSION}`,
        remedy: current ? null : "migrate-config",
      });
    } catch (error) {
      results.push({
        check: "config-parses",
        ok: false,
        message: `config unreadable: ${(error as Error).message}`,
        remedy: null,
      });
    }
  }

  // A stale gitignore is the failure that silently commits a cache directory,
  // so it is checked against the generated contents rather than for existence.
  const expected = gitignoreContents();
  const actual = fs.existsSync(layout.gitignore) ? fs.readFileSync(layout.gitignore, "utf8") : "";
  results.push({
    check: "gitignore",
    ok: actual === expected,
    message:
      actual === expected
        ? `${INTERNAL_DIR}/.gitignore matches the current layout`
        : `${INTERNAL_DIR}/.gitignore does not match the current layout`,
    remedy: actual === expected ? null : "regenerate-internal",
  });

  // Nothing tool-owned may sit at the project root: that is the whole point of
  // the design, and a stray directory is how it erodes one release at a time.
  const strays = INTERNAL_ENTRIES.filter((entry) => fs.existsSync(path.join(layout.root, entry.name)));
  results.push({
    check: "no-root-leak",
    ok: strays.length === 0,
    message:
      strays.length === 0
        ? "no tool-owned files at the project root"
        : `tool-owned entries leaked to the project root: ${strays.map((e) => e.name).join(", ")}`,
    // Moving or deleting a root directory the user may have created themselves
    // is exactly the guess a --fix flag must not make.
    remedy: null,
  });

  if (process.platform === "win32") {
    results.push({
      check: "windows-hidden",
      ok: true,
      message: `note: a leading dot does not hide ${INTERNAL_DIR} on Windows — run \`attrib +h ${INTERNAL_DIR}\` if you want it hidden in Explorer`,
      remedy: null,
    });
  }

  results.push({
    check: "global-cache",
    ok: true,
    message: `global cache: ${globalCacheDir(env)}`,
    remedy: null,
  });

  return results;
}

// MARK: - completions

function commandCompletions(args: ParsedArgs, io: IO): number {
  const shell = args.positionals[0];
  if (shell !== "bash" && shell !== "zsh") {
    io.err("Usage: ios-agent completions <bash|zsh>");
    return EXIT_USAGE;
  }
  io.out(shell === "bash" ? bashCompletions() : zshCompletions());
  return EXIT_OK;
}

function allFlagTokens(command: CommandSpec): string[] {
  return command.flags.map((flag) => `--${flag.name}`);
}

function bashCompletions(): string {
  const names = COMMANDS.map((c) => c.name).join(" ");
  const cases = COMMANDS.map(
    (command) => `    ${command.name}) opts="${allFlagTokens(command).join(" ")}" ;;`,
  ).join("\n");

  return `# ios-agent bash completion — generated by \`ios-agent completions bash\`
_ios_agent() {
  local cur prev opts
  cur="\${COMP_WORDS[COMP_CWORD]}"
  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=( $(compgen -W "${names} help" -- "$cur") )
    return
  fi
  case "\${COMP_WORDS[1]}" in
${cases}
    *) opts="" ;;
  esac
  COMPREPLY=( $(compgen -W "$opts" -- "$cur") )
}
complete -F _ios_agent ios-agent`;
}

function zshCompletions(): string {
  const commandLines = COMMANDS.map((c) => `    '${c.name}:${c.summary}'`).join("\n");
  const flagCases = COMMANDS.map((command) => {
    const flags = command.flags.map((flag) => `'--${flag.name}[${flag.summary}]'`).join(" ");
    return `      ${command.name}) _arguments ${flags || "'*:'"} ;;`;
  }).join("\n");

  return `#compdef ios-agent
# generated by \`ios-agent completions zsh\`
_ios_agent() {
  local -a commands
  commands=(
${commandLines}
  )
  if (( CURRENT == 2 )); then
    _describe 'command' commands
    return
  fi
  case "\${words[2]}" in
${flagCases}
  esac
}
_ios_agent "$@"`;
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

/** Generated from COMMANDS, so it cannot drift from what the parser accepts. */
function helpText(): string {
  const width = Math.max(...COMMANDS.map((c) => c.usage.length));
  const blocks = COMMANDS.map((command) => {
    const head = `  ${command.usage.padEnd(width)}  ${command.summary}`;
    const flags = command.flags.map(
      (flag) => `      --${flag.name.padEnd(width - 4)}  ${flag.summary}`,
    );
    return [head, ...flags].join("\n");
  });

  return `ios-agent — scaffolding and project management for iOS work

USAGE
${blocks.join("\n\n")}

LAYOUT
  App/          your source — the only directory you edit
  .ios-agent/   caches, logs, state, build artifacts, metadata
                only config.json is tracked; the rest regenerates

EXIT CODES
  ${EXIT_OK}   success
  ${EXIT_USAGE}   usage error, or no project found
  ${EXIT_UNHEALTHY}   doctor found problems

ENVIRONMENT
  IOS_AGENT_HOME        Override project root discovery
  IOS_AGENT_CACHE_DIR   Override the user-level cache location`;
}

/** Exposed for tests: help and completions must cover every dispatchable command. */
export function commandNames(): string[] {
  return COMMANDS.map((command) => command.name);
}
