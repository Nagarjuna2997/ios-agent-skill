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
2. **Plan** turns the description into screens, navigation, a data model, synthetic example records and a design direction (mood, named palette, typography, shape, density and motion), then writes `PLAN.md` before any code. The person can review the visual direction before files are created. A design-focused `--refine` updates the saved brief and regenerates its color assets along with the SwiftUI changes. New models need at least two synthetic sample records; old saved plans remain readable.
3. **Project** creates an XcodeGen `project.yml` from `.ios-agent/spec.json`, `Config/Base.xcconfig`, a gitignored `Config/Secrets.xcconfig` generated from the gitignored `.env`, and starter sources. XcodeGen generates the `.xcodeproj` when it is installed. Otherwise the built-in writer renders the same spec into a folder-synchronized project that needs Xcode 16 or later; that project includes the app target, packages, Info.plist, entitlements, a shared scheme and the WidgetKit extension. Set `IOS_AGENT_PROJECT_GENERATOR=xcodegen` or `builtin` to force one writer.
4. **Capabilities** are applied in dependency order: Info.plist keys, entitlements, Swift packages, build settings, credentials and template files. A reusable SwiftUI design system is included by default; its spacing, corner radii, typography and motion settings are configured from the approved brief. Color assets adjust foreground pairs to meet WCAG AA, and app-icon/launch-screen assets use that same plan palette rather than a bundle-ID hash.
5. **Code**: the model writes SwiftUI under `<AppName>/`, composes feature screens from the included design components, selects a screen layout archetype (list, detail, dashboard, feed, form, settings, map, cart, checkout, onboarding, paywall, auth, profile or search), and defines `SampleData` for every model. Previews and agent demo launches reuse the plan's synthetic examples. `-ios-agent-screen <id>` selects a screen; `-ios-agent-sample-data YES` enables demo records only in that process, leaving the ordinary app state and persistent store untouched.
6. **Build and fix**: `xcodebuild` errors come back as `{file, line, column, message}`; the model fixes them; at most 8 attempts and 25 minutes per cycle, with the clock starting at the cycle's first build. Each refinement starts a new cycle (`ios_build` with `newCycle: true`), and earlier builds stay in the history.
7. **Run**: the newest installed iOS runtime's iPhone (or a booted one) is used; SpringBoard is foregrounded before capture so screenshots do not show a return link to a previously captured app. Each top-level screen is launched with sample data and captured in light, dark and XXL Dynamic Type. The simulator's original appearance and text-size settings are restored afterward.
8. **Report**: `RUN_REPORT.md` lists the result, a per-screen appearance/text-size image matrix, measured contrast for generated semantic asset pairs, capabilities (applied, status, awaiting credentials), builds, what needs the user's accounts or money, next steps and the progress log. The contrast check covers generated palette assets, not every custom text/background pairing in app code.

Every external command is logged to `.ios-agent/tool-log.jsonl` (commands and exit codes, not output). Run state lives in `.ios-agent/state.json`, so runs resume.

## Install

The agent tools ship in `ios-agent-mcp` 2.10.0. That version is published on npm (verified October 3, 2026). On a Mac with Node 20 or later and Xcode 16 or later:

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp@latest
npx -y ios-agent-mcp@latest install-command --global
```

`install-command` copies `/ios-build` into `~/.claude/commands/` and prints the `claude mcp add` line for the server you ran it from. XcodeGen is optional.

## Entry points

In any Claude Code session with the server connected:

```text
/ios-build "A habit tracker with a list, a detail screen, and settings with a dark mode toggle"
/ios-build --resume --out ./ios-agent-apps/habit-tracker
/ios-build --refine "Add a streak badge to each habit" --out ./ios-agent-apps/habit-tracker
```

The command file is `.claude/commands/ios-build.md`; Claude Code itself writes the Swift and calls the tools.

From a terminal, the same loop uses headless Claude Code (`claude -p`, tools disabled; the agent writes every file). From the checkout, `ios-agent-mcp` below is `node mcp-server/dist/unified.js`:

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
| `ios_run` | Boot, install and launch with synthetic demo data by default; `sampleData: false` shows normal app state |
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
- Taps and scrolling are not automated; screenshots show each top-level screen at launch. XXL captures may expose clipping and layout pressure, but do not automatically diagnose or repair it.
- A generated plan or app is model output: review it. A successful build and screenshots do not prove the app is correct.

## Remote macOS builds

Use `build --remote` to send generated source to an explicitly chosen GitHub repository and run unsigned simulator verification on Actions. Planning and compiler repairs remain on the client. See [remote macOS setup, evidence, privacy and billing](remote-macos-build.md). This is GitHub source support; npm publication is deferred.

## Visual design review loop

New CLI plans offer two or three design directions. Read `PLAN.md`, then choose explicitly:

```sh
ios-agent-mcp build --out ./MyApp --resume --design calm
```

Use an ID from your own plan. The plan records mood, semantic palette, typography,
shape, density and motion. Code generation waits for that choice. Existing plans
without alternatives keep their approved design; use `--refine` to change it.

After a successful build the CLI captures each top-level screen in light, dark
and accessibility-extra-extra-extra-large text. It sends the actual PNG image
blocks, screen purpose and approved brief to Claude Code for a structured critique
of layout, hierarchy, visible readability, states and appearance. This uses your
configured model/provider and may consume its quota. Synthetic launch data avoids
populating captures with personal records; inspect your app's data before running
this on an existing project. Each PNG is limited to 2 MB.

Observed findings drive view-only repairs, then a fresh build and capture. There
are at most three review rounds within the existing build/time budget. Unknown
captures, provider errors, no-op repairs and exhausted budgets stay unresolved.
No score or quality improvement is claimed from the presence of this loop.

`.ios-agent/design-reviews/<hash>/` preserves screenshots and per-screen assessments.
Completed screen reviews survive interruptions; changed source, plan, build or
pixels invalidate reuse. `RUN_REPORT.md` separates model opinions from compilation
and deterministic palette checks. A screenshot cannot establish VoiceOver behavior,
actual touch targets, motion, offscreen states or HIG compliance. Human review and
accessibility tests remain necessary.

In a connected MCP client, `ios_design_evidence` returns real image blocks and the
same checklist. `capture:true` refreshes the full matrix; request each screen by ID.
The `/ios-build` instructions drive that client's bounded repair cycle and record
its findings with `ios_progress`; the headless CLI additionally persists structured
review records. Builds can use the local simulator or the opt-in remote macOS lane.
