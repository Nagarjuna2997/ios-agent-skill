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

## Commands

```
ios-agent new <Name>          Scaffold a project
  --minimal                   Only App/
  --into <dir>                Parent directory (default: cwd)
  --no-license                Skip LICENSE
  --force                     Scaffold into a non-empty directory

ios-agent init [dir]          Adopt an existing directory
ios-agent where [--json]      Print resolved paths
ios-agent info                Summarise the project
ios-agent clean [--dry-run]   Delete disposable internal files
ios-agent doctor              Check the layout
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

It does not create an `.xcodeproj`. That is a build-system artifact Xcode should
own, and a generated one drifts from the project Xcode would have made. The
scaffold writes Swift sources; you make the project in Xcode and add them.
