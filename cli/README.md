# ios-agent

Project scaffolding and layout management for iOS work.

One idea: **the user owns `App/`, the tool owns `.ios-agent/`, and nothing else
appears at the project root.**

```
MyApp/
├── App/                 # your source — the only directory you edit
├── README.md
├── LICENSE
└── .ios-agent/          # caches, logs, state, build artifacts, metadata
```

Or, with `--minimal`:

```
MyApp/
└── App/
```

`.ios-agent/` materialises the first time a command needs it.

## Install

```
npm install -g ios-agent
```

## Create from a description

```sh
ios-agent new TeaLog --brief 'An offline tea journal with tasting notes' --xcodegen
cd TeaLog/App
xcodegen generate --spec project.yml
open TeaLog.xcodeproj
```

`--brief` saves the description and an implementation checklist in
`App/APP_BRIEF.md` for your coding agent. It does not call an AI service or
implement the described features. Both flags are optional and work with
`--minimal`; the visible root remains `App/`, `README.md`, and `LICENSE`
(or only `App/` in minimal mode).

`--xcodegen` writes an editable `App/project.yml`, `App/BUILD.md`, and separate
SVG starters under `App/<Name>/IconLayers/`. The specification includes an iOS
17+ SwiftUI app, a unit-test target, and a shared scheme. The included test is a
placeholder to replace before shipping. Requires macOS, Xcode 15+ with an iOS
simulator runtime, and XcodeGen installed separately. The CLI neither installs
nor invokes them. Use an XcodeGen version compatible with your Xcode.

The layer folder contains background, foreground, and accent SVGs plus a manifest
and import instructions. Import them into [Icon Composer](https://developer.apple.com/icon-composer/)
using a compatible Xcode installation, customize the appearance, save a native
icon, configure the target, and validate it in Xcode. The manifest is our source
layer inventory, not Apple's format; no native `.icon` is generated or validated.
The starter layers are excluded from app resources.

`--force` permits a non-empty destination but refuses existing generated file
paths or symlink destinations before writing. It never overwrites your source,
brief, specification, README, or configuration. Choose a new app directory when
regenerating a starter.

Project configuration follows the [XcodeGen specification](https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md).
The CLI emits no `.xcodeproj`; running XcodeGen creates the real project.

## Commands

```
ios-agent new <Name>          Scaffold a project
  --brief <description>       Save an implementation brief
  --xcodegen                  Write project.yml and SVG icon layer starters
  --minimal                   Only App/
  --into <dir>                Parent directory (default: cwd)
  --no-license                Skip LICENSE
  --force                     Scaffold into a non-empty directory

ios-agent init [dir]          Adopt an existing directory
ios-agent where               Print resolved paths
ios-agent info                Summarise the project
ios-agent clean [--dry-run]   Delete disposable internal files
ios-agent doctor [--fix]      Check the layout, and repair what is safe to repair
ios-agent completions <shell> Print a bash or zsh completion script
```

`--json` works on `where`, `info`, `clean`, and `doctor`. `--project <dir>`
skips discovery on any command that reads a project.

`help` and the completion scripts are generated from the same table the parser
dispatches on, so they cannot describe a flag the CLI does not accept.

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Usage error, or no project found |
| 2 | `doctor` found problems |

`doctor` is 2 rather than 1 so a script can tell "the project is unhealthy" from
"you called it wrong" without parsing stderr.

### What `--fix` will and will not do

It repairs defects with a *derivable* correct value: a stale
`.ios-agent/.gitignore`, a missing internal directory, a config behind the
current layout version.

It will not create a missing `App/`. There is no safe automatic answer — the
tool would be inventing a project structure nobody asked for — so it stays
reported and untouched. A `--fix` that guesses is worse than no `--fix`.

### Shell completions

```
ios-agent completions zsh  > ~/.zfunc/_ios-agent
ios-agent completions bash > /etc/bash_completion.d/ios-agent
```

## What is in `.ios-agent/`

| Entry | Tracked | Purpose |
|---|---|---|
| `config.json` | yes | Project identity and settings |
| `templates/` | yes | Project-local template overrides |
| `plugins/` | yes | Plugin manifests |
| `state.json` | no | Mutable runtime state |
| `metadata.json` | no | Derived facts from scanning |
| `cache/` | no | Project-derived cache |
| `logs/` | no | Command and build logs |
| `build/` | no | Derived build artifacts |
| `screenshots/` | no | Simulator captures |
| `tmp/` | no | Scratch space |

The generated `.ios-agent/.gitignore` ignores everything and unignores exactly
the tracked rows. Both that file and what `ios-agent clean` deletes come from
one declaration in `src/layout.ts`, so they cannot disagree — which is why
`clean` needs no confirmation prompt.

## Interop

Other tools should not hardcode `.ios-agent`. Ask instead:

```
ios-agent where --json
```

`ios-agent-mcp` uses the directory only as a root marker — it reads, and never
writes, so its `filesystem: read` contract is unchanged.

## Environment

| Variable | Effect |
|---|---|
| `IOS_AGENT_HOME` | Override project-root discovery |
| `IOS_AGENT_CACHE_DIR` | Override the user-level cache location |

The user-level cache defaults to `~/Library/Caches/ios-agent` on macOS,
`%LOCALAPPDATA%\ios-agent\Cache` on Windows, and `$XDG_CACHE_HOME/ios-agent`
(or `~/.cache/ios-agent`) elsewhere.

## What this does not do

It does not implement features from the description, invoke an AI model, install
build tools, run XcodeGen, or create a native Icon Composer document. Without
`--xcodegen`, create the project in Xcode and add the generated sources.

## Asset catalogs

New scaffolds include semantic color assets. `--xcodegen` also includes a flattened
1024px AppIcon rendered from the editable SVG layers. Use `ios-agent assets
--tokens tokens.json --output NewAssets.xcassets` to generate a separate catalog.
Optional `--icon-layers IconLayers --icon-background "#2457DB"` renders the ordered
SVG layers. Existing catalogs are never overwritten. See
[the schema and free workflow](../docs/design/asset-generation.md). Native `.icon`
authoring still uses Apple Icon Composer.
