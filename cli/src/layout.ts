import path from "node:path";
import os from "node:os";

/**
 * The one place the internal directory is named.
 *
 * Every other module derives from this table. A string literal ".ios-agent"
 * anywhere else in the codebase is a bug: it is how a rename half-lands and the
 * CLI starts writing to one directory while the MCP server reads another.
 */
export const INTERNAL_DIR = ".ios-agent";

/** The user-facing source directory. The only thing they should need to open. */
export const APP_DIR = "App";

/** Bumped when the on-disk shape changes incompatibly. Stored in config.json. */
export const LAYOUT_VERSION = 1;

export type EntryKind = "file" | "directory";

export interface InternalEntry {
  readonly name: string;
  readonly kind: EntryKind;
  /**
   * Whether the entry belongs in version control.
   *
   * This single flag drives two things that must never disagree: the generated
   * `.ios-agent/.gitignore`, and what `ios-agent clean` is allowed to delete.
   * Deriving both from one declaration is why `clean` can be non-interactive —
   * it provably cannot remove something a human authored.
   */
  readonly tracked: boolean;
  readonly purpose: string;
  /** Created eagerly on scaffold, or lazily on first use. */
  readonly eager: boolean;
}

/**
 * Everything the tool owns, and nothing the user does.
 *
 * Adding a future feature — plugins, simulator state, build artifacts — is one
 * row here. It then appears in the gitignore, in `clean`, in `doctor`, and in
 * `where --json` with no further edits. That is the scalability requirement
 * expressed as code rather than as a convention people have to remember.
 */
export const INTERNAL_ENTRIES: readonly InternalEntry[] = [
  {
    name: "config.json",
    kind: "file",
    tracked: true,
    eager: true,
    purpose: "Project identity and settings. The only tracked file here — it describes the project, so it belongs in review.",
  },
  {
    name: "state.json",
    kind: "file",
    tracked: false,
    eager: false,
    purpose: "Mutable runtime state: last simulator, last build, session scratch. Machine-local by definition.",
  },
  {
    name: "metadata.json",
    kind: "file",
    tracked: false,
    eager: false,
    purpose: "Facts derived by scanning the project. Always reproducible, never authored.",
  },
  {
    name: "cache",
    kind: "directory",
    tracked: false,
    eager: false,
    purpose: "Project-derived cache. Anything shared across projects belongs in the global cache instead.",
  },
  {
    name: "logs",
    kind: "directory",
    tracked: false,
    eager: false,
    purpose: "Command and build logs, newest last.",
  },
  {
    name: "build",
    kind: "directory",
    tracked: false,
    eager: false,
    purpose: "Derived build artifacts. Deleting this must never lose work.",
  },
  {
    name: "screenshots",
    kind: "directory",
    tracked: false,
    eager: false,
    purpose: "Simulator captures from automated runs.",
  },
  {
    name: "templates",
    kind: "directory",
    tracked: true,
    eager: false,
    purpose: "Project-local template overrides. Tracked, because an override is a decision the team made.",
  },
  {
    name: "plugins",
    kind: "directory",
    tracked: true,
    eager: false,
    purpose: "Plugin manifests. Tracked so a checkout reproduces the toolchain; downloaded plugin code lives in the global cache.",
  },
  {
    name: "tmp",
    kind: "directory",
    tracked: false,
    eager: false,
    purpose: "Scratch space for in-flight commands. Safe to delete at any moment.",
  },
];

export interface ProjectLayout {
  /** Directory containing `App/` and `.ios-agent/`. */
  readonly root: string;
  readonly app: string;
  readonly internal: string;
  readonly config: string;
  readonly state: string;
  readonly metadata: string;
  readonly cache: string;
  readonly logs: string;
  readonly build: string;
  readonly screenshots: string;
  readonly templates: string;
  readonly plugins: string;
  readonly tmp: string;
  readonly gitignore: string;
}

/**
 * Absolute paths for one project root.
 *
 * Pure — it touches no filesystem, so it is the same on every platform and
 * trivially testable. Creation is a separate, explicit step.
 */
export function layoutFor(root: string): ProjectLayout {
  const absoluteRoot = path.resolve(root);
  const internal = path.join(absoluteRoot, INTERNAL_DIR);
  const inside = (name: string) => path.join(internal, name);

  return {
    root: absoluteRoot,
    app: path.join(absoluteRoot, APP_DIR),
    internal,
    config: inside("config.json"),
    state: inside("state.json"),
    metadata: inside("metadata.json"),
    cache: inside("cache"),
    logs: inside("logs"),
    build: inside("build"),
    screenshots: inside("screenshots"),
    templates: inside("templates"),
    plugins: inside("plugins"),
    tmp: inside("tmp"),
    gitignore: inside(".gitignore"),
  };
}

/**
 * The contents of `.ios-agent/.gitignore`, generated from `INTERNAL_ENTRIES`.
 *
 * Ignore-everything-then-unignore keeps the rules inside the directory they
 * govern, so the project's root `.gitignore` stays about the project. It also
 * means a future disposable directory is ignored the moment it is declared —
 * the common failure being a new cache directory that nobody remembers to add,
 * and which then shows up in someone's pull request.
 */
export function gitignoreContents(): string {
  const tracked = INTERNAL_ENTRIES.filter((entry) => entry.tracked);
  const lines = [
    "# Generated by ios-agent. Edits are overwritten.",
    "#",
    "# Everything the tool writes is disposable and machine-local; the few",
    "# entries below describe the project itself and belong in review.",
    "*",
    "!.gitignore",
    ...tracked.map((entry) => (entry.kind === "directory" ? `!${entry.name}/` : `!${entry.name}`)),
    "",
  ];
  return lines.join("\n");
}

/** Entries `clean` may delete: exactly those not under version control. */
export function disposableEntries(): readonly InternalEntry[] {
  return INTERNAL_ENTRIES.filter((entry) => !entry.tracked);
}

/**
 * Where caches shared across every project go.
 *
 * Per-project caches that hold downloaded templates or SDK metadata make a
 * fresh clone slow and duplicate hundreds of megabytes per project — the reason
 * npm, Cargo, and pub all keep one user-level store. Each platform has its own
 * documented location and none of them is `~/.ios-agent`.
 */
/**
 * `platform` and `home` are parameters so tests can exercise all three branches
 * on one machine. They do NOT make the result platform-independent: `path` uses
 * the **host's** rules throughout, so asking for the linux branch on Windows
 * returns a Windows-shaped string. Production never does that — the defaults
 * are the host — but a test that hardcodes an expected string will pass on
 * Linux and fail on Windows.
 *
 * Concretely: `path.resolve("/xdg")` yields `/xdg` on Linux and `D:\xdg` on a
 * Windows runner, because resolve anchors a drive-less path to the current
 * drive. Expectations must therefore be built with the same call this function
 * makes, not with a literal.
 */
export function globalCacheDir(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  home: string = os.homedir(),
): string {
  const override = env.IOS_AGENT_CACHE_DIR?.trim();
  if (override) return path.resolve(override);

  if (platform === "win32") {
    const base = env.LOCALAPPDATA?.trim() || path.join(home, "AppData", "Local");
    return path.join(base, "ios-agent", "Cache");
  }

  if (platform === "darwin") {
    return path.join(home, "Library", "Caches", "ios-agent");
  }

  const xdg = env.XDG_CACHE_HOME?.trim();
  return path.join(xdg ? path.resolve(xdg) : path.join(home, ".cache"), "ios-agent");
}
