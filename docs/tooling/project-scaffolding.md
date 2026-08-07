# Project Scaffolding and Layout

**Load this when:** designing what a tool writes into a user's project, deciding
where caches and state belong, or reviewing a scaffold that puts more than a
handful of entries at the project root.

Covers the layout `ios-agent` generates, the rule that decides where any new
file goes, why hiding internals is not cosmetic, and how the CLI and the MCP
server agree on a project root without configuring each other.

Implementation: `cli/` (the `ios-agent` package). Every claim here is enforced
by a test in `cli/test/`.

---

## 1. The layout

```
MyApp/
├── App/                    # the user's source — the only directory they edit
│   ├── MyApp/
│   └── MyAppTests/
├── README.md
├── LICENSE
├── .gitignore
└── .ios-agent/             # tool-owned; deleting it loses nothing
    ├── .gitignore          # generated
    ├── config.json         # tracked
    ├── state.json
    ├── metadata.json
    ├── cache/
    ├── logs/
    ├── build/
    ├── screenshots/
    ├── templates/          # tracked
    ├── plugins/            # tracked
    └── tmp/
```

With `--minimal`, the whole project is `MyApp/App/`, and `.ios-agent/`
materialises the first time a command needs it.

---

## 2. The rule that decides where anything goes

**Split by authorship, not by importance.**

> If a **human** writes it, it is visible. If the **tool** writes it, it is
> hidden.

Importance is the tempting axis and it is the wrong one, because it has no
edge. Everything feels important to whoever added it, so a layout sorted by
importance grows a new root directory per release until the project root is a
list of implementation details. Authorship has a sharp edge: either a person
typed it or a program emitted it, and nobody argues about which.

Two consequences fall out immediately, and both are worth more than the tidiness:

**`clean` needs no confirmation prompt.** Nothing in `.ios-agent/` was authored,
so there is nothing to lose. A prompt would be theatre.

**Deleting `.ios-agent/` is a supported recovery step.** "Delete it and re-run"
is only safe advice if it is structurally true, and here it is — which turns the
most common support answer in this class of tool from a risk into a fix.

### The one exception, and why it is not a violation

`config.json` is tracked, and a human may edit it. That is the same bargain
`.git/config` makes: tool-managed by default, legible and editable by anyone who
opens it. It stays inside `.ios-agent/` because it is *maintained* by the tool —
`ios-agent init` writes it, and future commands will update it.

If it ever becomes a file people are expected to hand-edit as the primary
workflow, it should move to the root and become visible, the way `pubspec.yaml`,
`app.json`, `firebase.json`, and `Cargo.toml` all are. **No professional tool
hides configuration its users are expected to author** — a hidden file is one
they cannot discover, and one that reads as noise in a pull request.

---

## 3. Why hiding internals is not cosmetic

Four concrete costs, none of them aesthetic:

**A root directory is an API.** Anything visible gets referenced — in a script,
a CI job, a README someone wrote. `cache/` at the root will be depended on
within a release, and then it cannot be renamed. Inside `.ios-agent/`, the whole
tree stays private and refactorable.

**Every root entry is a question the user has to answer.** Nine directories at
the root is nine decisions about whether to touch each one, made by someone who
wanted to write a view. One `App/` is no decision at all.

**Review noise trains people to skim.** A generated `metadata/` that changes on
every build turns pull requests into scroll-past exercises, and reviewers who
learn to skim generated files skim the real ones too.

**`.gitignore` drift is a silent failure.** With internals at the root, every new
tool directory needs a matching root `.gitignore` line that someone must
remember. They forget, a cache lands in the repository, and nobody notices until
a clone is slow. The generated `.ios-agent/.gitignore` uses ignore-everything
then unignore, so a directory added tomorrow is ignored the moment it is
declared.

### What the reference tools actually do

| Tool | Visible, human-authored | Hidden, tool-authored |
|---|---|---|
| Flutter | `pubspec.yaml`, `lib/` | `.dart_tool/` |
| Expo | `app.json`, `app/` | `.expo/` |
| Firebase CLI | `firebase.json` | `.firebase/` |
| Cargo | `Cargo.toml`, `src/` | `target/` |
| npm | `package.json`, `src/` | `node_modules/` |
| Xcode | `project.pbxproj` | `xcuserdata/`, DerivedData |
| git | — | `.git/` |

The pattern is unanimous, and the split is authorship every time. Note also that
every one of them keeps its **hand-edited config visible at the root** — which
is the point in §2 about where `config.json` would have to move.

---

## 4. One declaration, four behaviours

The design's leverage is not the directory name; it is that everything derives
from a single table (`cli/src/layout.ts`):

```ts
export const INTERNAL_ENTRIES: readonly InternalEntry[] = [
  { name: "config.json", kind: "file",      tracked: true,  eager: true,  purpose: "…" },
  { name: "cache",       kind: "directory", tracked: false, eager: false, purpose: "…" },
  // …
];
```

Adding a future feature — simulator state, plugin cache, build artifacts — is
one row. That row then automatically produces:

1. its entry in the generated `.ios-agent/.gitignore`
2. inclusion in, or exclusion from, `ios-agent clean`
3. a path in `ios-agent where --json`
4. a `doctor` check that it has not leaked to the project root

The alternative — a constant here, a gitignore line there, a `clean` list
somewhere else — is three places that must be edited together and eventually are
not. The failure mode is specific and quiet: a new cache directory that `clean`
skips and git happily commits.

This is also why the tests assert the *relationship* rather than the contents:

```js
test("clean never targets a tracked entry", () => {
  const disposable = new Set(disposableEntries().map((e) => e.name));
  for (const name of INTERNAL_ENTRIES.filter((e) => e.tracked).map((e) => e.name)) {
    assert.ok(!disposable.has(name), `${name} is both tracked and disposable`);
  }
});
```

That test does not care what the entries are. It fails the day someone adds a
row that is both tracked and deletable, which is the bug that would cost a user
their template overrides.

---

## 5. Root discovery — how two processes agree

`.ios-agent/` doubles as a **root marker**, exactly as `.git/` does. Both the
CLI and the MCP server walk up from the working directory until they find one:

```
1. an explicit --project / argument
2. IOS_AGENT_HOME (CLI) or IOS_AGENT_PROJECT (server)
3. the nearest ancestor containing .ios-agent/
4. cwd  (server only — the CLI reports failure instead)
```

This is why `ios-agent where` works from `App/MyApp/Views/`, and it is why the
MCP server no longer analyses whatever subtree a client happened to spawn it in.

**Both report how the root was resolved**, not just what it is:

```json
{ "project_root": "/Users/you/MyApp", "resolved_from": "marker" }
```

An implicit root is unfalsifiable. Without `resolved_from`, "0 Swift files" is
identical whether the project is empty or the tool is pointed at the wrong
directory — and that ambiguity is the most expensive minute in using a tool like
this.

**The server reads the marker; it never creates it.** That keeps
`ios-agent-mcp`'s declared `filesystem: read, network: none` contract intact.
Scaffolding writes, so it lives in a separate package rather than quietly
turning the analyzer into something that mutates your project.

### Interop

Other tools should ask rather than hardcode:

```
ios-agent where --json
```

One process owns the layout; everything else queries it. A rename then stays a
change in one package instead of a coordinated release across several.

---

## 6. Cross-platform

**Per-project vs. user-level caches are different things.** Anything shared
across projects — downloaded templates, SDK metadata, plugin code — belongs in
the user-level cache, or every project duplicates it and every fresh clone
re-downloads it. `.ios-agent/cache/` is only for data derived from *this*
project.

| Platform | User-level cache |
|---|---|
| macOS | `~/Library/Caches/ios-agent` |
| Windows | `%LOCALAPPDATA%\ios-agent\Cache` |
| Linux/other | `$XDG_CACHE_HOME/ios-agent`, else `~/.cache/ios-agent` |

`~/.ios-agent` is not on that list deliberately: a dotfile in `$HOME` is the
convention every platform has since moved away from, and on macOS and Windows it
is excluded from the OS's own cache-eviction handling.

**Windows specifics:**

- A leading dot does not hide a directory in Explorer. `doctor` says so and
  suggests `attrib +h`, rather than pretending the name is enough.
- `CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, `LPT1`–`LPT9` are reserved
  regardless of extension. `validateProjectName` rejects them on every platform,
  so a project created on macOS still checks out on Windows.
- Tracked paths in `config.json` are stored POSIX-style. That file crosses
  machines by design, and `App\MyApp` is unreadable on the Mac that builds it.

**macOS specifics:** the default filesystem is case-insensitive but
case-*preserving*, so `App/` and `app/` collide on a Mac and not on Linux CI.
Never generate two paths differing only in case.

---

## Anti-Patterns

```text
# WRONG — internals at the project root.
MyApp/
├── cache/          # depended on by a script within a release, now frozen
├── logs/           # in every pull request
├── metadata/       # regenerated on build, diffed by humans forever
├── config/
├── generated/
└── App/            # the one directory the user wanted, 1 of 6

# RIGHT — one hidden directory.
MyApp/
├── App/
└── .ios-agent/
```

```ts
// WRONG — the internal directory name written out at a call site.
const cache = path.join(root, ".ios-agent", "cache");

// A rename half-lands: the CLI writes to the new directory while the MCP
// server still reads the old one, and the symptom is an empty result with no
// error anywhere.

// RIGHT — derive from the layout.
const { cache } = layoutFor(root);
```

```ts
// WRONG — clean deletes a hand-maintained list.
const REMOVE = ["cache", "logs", "tmp"];

// It drifts from the gitignore the first time someone adds a directory to one
// and not the other. Then either a cache gets committed, or clean deletes a
// tracked template override.

// RIGHT — derive both from one declaration.
for (const entry of disposableEntries()) { … }
```

```ts
// WRONG — the tool falls back to cwd and says nothing.
const root = process.cwd();

// "0 Swift files" now means either an empty project or a wrong directory, and
// nothing in the output distinguishes them.

// RIGHT — resolve, and report how.
const { root, source } = resolveRootFrom(argv, env);   // "flag" | "marker" | "cwd"
```

```ts
// WRONG — a per-project cache for data that is not project-specific.
const templates = path.join(root, ".ios-agent", "cache", "templates");

// Ten projects, ten copies, ten downloads.

// RIGHT — user-level, per platform.
const templates = path.join(globalCacheDir(), "templates");
```

```ts
// WRONG — ~/.ios-agent as the user-level location.
const home = path.join(os.homedir(), ".ios-agent");

// Ignored by macOS cache eviction and by Windows roaming rules, and wrong on
// every platform's own convention.

// RIGHT — the documented per-platform directory, overridable.
globalCacheDir(process.env, process.platform);
```

```ts
// WRONG — the project name accepted as given.
fs.mkdirSync(path.join(parent, name));

// "../evil" escapes the parent, "my-app" is not a Swift type name, and "CON"
// produces a directory Windows cannot open.

// RIGHT — validate before anything exists on disk.
validateProjectName(name);
```

```ts
// WRONG — scaffolding into a directory with contents already in it.
fs.mkdirSync(root, { recursive: true });
write(readme);

// Silently overwrites a README someone spent an afternoon on.

// RIGHT — refuse, and make --force explicit and non-destructive.
if (existing.length > 0 && !force) throw new ScaffoldError(…);
```

```json
// WRONG — a single source directory, to be widened later.
{ "sourceDir": "App/MyApp" }

// Multiple apps were always coming, and the widening is a breaking change to
// every consumer of a tracked file.

// RIGHT — a list from day one, even with one entry.
{ "apps": [{ "name": "MyApp", "path": "App/MyApp", "platforms": ["iOS"] }] }
```

```
# WRONG — generating an .xcodeproj.
# It is a build-system artifact with a format Xcode owns. A generated one drifts
# from what Xcode would have produced, and the drift surfaces as a build failure
# nobody can attribute.

# RIGHT — generate Swift sources; let Xcode own the project.
```

---

## Checklist

- [ ] Exactly one tool-owned directory, and it is hidden
- [ ] Nothing the tool writes appears at the project root — asserted by a test
- [ ] Every internal path derives from one declaration, not a string literal
- [ ] The gitignore is generated from that declaration, not hand-maintained
- [ ] What `clean` deletes is the complement of what is tracked, provably
- [ ] Deleting the internal directory loses nothing a human authored
- [ ] The internal directory is created lazily, not as an empty promise
- [ ] Root discovery walks up from cwd, like git
- [ ] Every path-reporting output states how the root was resolved
- [ ] A machine-readable `where --json` exists, so nothing else hardcodes the name
- [ ] Read-only consumers stay read-only — scaffolding lives in its own package
- [ ] Cross-project caches are user-level, per each platform's own convention
- [ ] Windows reserved names rejected on every platform
- [ ] Tracked config stores POSIX-style paths
- [ ] Project names validated before anything is written
- [ ] A non-empty target directory is refused unless explicitly forced
- [ ] Config carries a layout version, and a newer one is refused rather than rewritten
- [ ] Lists are lists from day one where more than one is coming
- [ ] `doctor` fails when the layout is broken — proven by mutation tests
