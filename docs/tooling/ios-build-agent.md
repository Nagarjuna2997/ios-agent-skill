# iOS build agent

**Load this when:** building an app from a plain-language description with `/ios-build` or `ios-agent-mcp build`, adding a capability module, or reading a run's PLAN.md and RUN_REPORT.md.

## Status

The agent's tools, loop, capability system and reports are covered by tests against fake `xcodebuild`, `xcrun simctl` and `xcodegen` executables. On 2026-10-02 the following ran for real:

- The planning and code generation halves ran with headless Claude Code for four example requests, including a food-delivery app with 20 capability modules.
- The resulting projects, written by the built-in project writer, built on the first build with Xcode 27.0 and ran on the iPhone 18 Pro Simulator, including a WidgetKit extension target. See [examples/agent](../../examples/agent/README.md).
- Every capability module's Swift compiled together in one app target. See the [compile check](../../capabilities/README.md#compile-check).

The automated build-and-fix loop has not yet run against a real `xcodebuild`, and neither have the `simctl` launch and screenshot steps. No capability module has passed its own verify run, so every module is `untested`. Treat the first `/ios-build` run on a Mac as the acceptance test.

## What a run does

1. **Preflight** checks Node, Xcode, the iOS Simulator SDK and an available simulator, and prints the install command for anything missing. XcodeGen is optional.
2. **Plan** turns the description into screens, navigation, a data model and a capability list, then writes `PLAN.md` before any code: default choice and alternatives for each capability, cost model, credentials the user must provide, whether it is built fully or with placeholder keys, and a budget from the capability manifests.
3. **Project** creates an XcodeGen `project.yml` from `.ios-agent/spec.json`, `Config/Base.xcconfig`, a gitignored `Config/Secrets.xcconfig` generated from the gitignored `.env`, and starter sources. XcodeGen generates the `.xcodeproj` when it is installed. Otherwise the built-in writer renders the same spec into a folder-synchronized project that needs Xcode 16 or later; that project includes the app target, packages, Info.plist, entitlements, a shared scheme and the WidgetKit extension. Set `IOS_AGENT_PROJECT_GENERATOR=xcodegen` or `builtin` to force one writer.
4. **Capabilities** are applied in dependency order: Info.plist keys, entitlements, Swift packages, build settings, credentials and template files.
5. **Code**: the model writes SwiftUI under `<AppName>/`. The root view honors `-ios-agent-screen <id>` so each top-level screen can be opened for a screenshot.
6. **Build and fix**: `xcodebuild` errors come back as `{file, line, column, message}`; the model fixes them; at most 8 attempts and 25 minutes per run.
7. **Run**: the newest installed iOS runtime's iPhone (or a booted one) is used; the app is installed, launched once per top-level screen and screenshotted.
8. **Report**: `RUN_REPORT.md` lists the result, screenshots, capabilities (applied, status, awaiting credentials), builds, what needs the user's accounts or money, next steps and the progress log.

Every external command is logged to `.ios-agent/tool-log.jsonl` (commands and exit codes, not output). Run state lives in `.ios-agent/state.json`, so runs resume.

## Entry points

In Claude Code, with the MCP server connected:

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp@latest
npx -y ios-agent-mcp@latest install-command --global
```

Then in any session:

```text
/ios-build "A habit tracker with a list, a detail screen, and settings with a dark mode toggle"
/ios-build --resume --out ./ios-agent-apps/habit-tracker
/ios-build --refine "Add a streak badge to each habit" --out ./ios-agent-apps/habit-tracker
```

The command file is `.claude/commands/ios-build.md`; Claude Code itself writes the Swift and calls the tools.

From a terminal, the same loop uses headless Claude Code (`claude -p`, tools disabled; the agent writes every file):

```bash
ios-agent-mcp preflight
ios-agent-mcp build "A notes app with SwiftData persistence, search, and a compose screen" --out ./notes
ios-agent-mcp build --resume --out ./notes
ios-agent-mcp build --refine "Pin notes to the top" --out ./notes
ios-agent-mcp build "A three-tab app: Home feed of cards, Search, Profile" --plan-only
```

## Tools

| Tool | Purpose |
|---|---|
| `ios_preflight` | Toolchain check with install commands |
| `ios_capabilities` | Search capability modules and the catalog; return a recipe |
| `ios_plan` | Validate the plan, resolve capabilities, write PLAN.md |
| `ios_create_project` | Create the project and apply capabilities |
| `ios_add_capabilities` | Apply more capabilities to an existing project |
| `ios_write_files` | Write or delete files under `<AppName>/` |
| `ios_add_package` | Add a Swift package and regenerate |
| `ios_build` | Structured build result, capped attempts |
| `ios_run` | Boot, install, launch (optionally at a screen) |
| `ios_screenshot` | Save a PNG of the simulator |
| `ios_logs` | Recent unified-log lines for the app |
| `ios_progress` | Record a status line for the report |
| `ios_report` | Write RUN_REPORT.md |

## Credentials

Capabilities that need an account declare `credentialsNeeded` with the key, where to get it and whether it is a **client** key (safe to ship in the app, such as a publishable key) or a **server** secret (never embedded). Client keys are read from `.env` into `Config/Secrets.xcconfig` and exposed through Info.plist; missing keys become `REPLACE_ME` placeholders so the app still builds and shows a configuration message. Server secrets are listed in `.env.example` with instructions only.

## Capabilities

See [`capabilities/README.md`](../../capabilities/README.md) for the module contract and [`capabilities/CATALOG.md`](../../capabilities/CATALOG.md) for the landscape and each module's status. Verify modules on a Mac:

```bash
ios-agent-mcp capabilities verify --all --write ./capabilities
```

A module becomes `verified` only when that command builds it into a minimal app and writes `verification.json`.

## Limits

- Simulator only; no signing, device installs, TestFlight or App Store submission.
- Taps and scrolling are not automated; screenshots show each top-level screen at launch.
- A generated plan or app is model output: review it. A successful build and screenshots do not prove the app is correct.
