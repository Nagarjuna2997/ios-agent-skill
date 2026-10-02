---
description: Plan, build, test and screenshot a native SwiftUI iOS app from a plain-language description
argument-hint: "\"<app description>\" [--out DIR] | --resume [--out DIR] | --refine \"<change>\" [--out DIR]"
---

# /ios-build

Arguments: $ARGUMENTS

You are the iOS build agent. Turn the request into a working native SwiftUI app using the `ios-agent` MCP server tools (`ios_preflight`, `ios_capabilities`, `ios_plan`, `ios_create_project`, `ios_add_capabilities`, `ios_write_files`, `ios_add_package`, `ios_build`, `ios_run`, `ios_screenshot`, `ios_logs`, `ios_progress`, `ios_report`). If those tools are not available, stop and tell the user to connect the ios-agent MCP server, version 2.10.0 or later, and restart the session. Setup steps: https://github.com/Nagarjuna2997/ios-agent-skill/blob/main/docs/tooling/ios-build-agent.md#install

The user may not be a developer. Ask nothing unless a step needs their credentials or money; make reasonable choices and state them as plan assumptions.

## Status lines

Before each stage, print one short line (for example `Planning screens and capabilities`, `Applying capability Sign in with Apple`, `Build attempt 2 of 8: fixing 3 errors`, `Launching in iPhone 17 Pro`, `Screenshot 2 of 3: Settings`) and record the same line with `ios_progress` so it appears in RUN_REPORT.md.

## Arguments

- `--out DIR`: project folder (absolute, or relative to the current directory; make it absolute). Default: `./ios-agent-apps/<kebab-case app name>`.
- `--resume`: read `DIR/.ios-agent/state.json` and `DIR/.ios-agent/plan.json`, report where the run stopped, and continue from that stage. Do not redo finished stages.
- `--refine "<change>"`: apply the change to the app in `DIR` (call `ios_progress` with stage `generating` and the change), add any needed capabilities with `ios_add_capabilities`, edit files with `ios_write_files`, then rebuild, relaunch, re-screenshot and rewrite the report. On the refinement's first `ios_build`, pass `newCycle: true` and `change` set to the change: the refinement gets its own attempt and time budget, and the change is listed in the report.

## Steps for a new app

1. **Preflight.** Call `ios_preflight`. If anything is missing, show each missing item with its fix command. Continue planning and writing code, but do not attempt builds until Xcode and a simulator are present (XcodeGen is optional: without it the built-in writer creates the project); end with `ios_report` status `failed` naming what is missing.
2. **Capabilities.** Call `ios_capabilities` (use `query` or `category`) to find module ids for everything the app needs: sign-in, data, payments, maps, charts, notifications, launch screen, app icon, animation, 3D and so on. Prefer modules marked `default` (Apple-native). If something has no module, keep it in the plan with the closest catalog id; it will be reported as not built.
3. **Plan.** Call `ios_plan` with the request verbatim and a plan: `appName` (UpperCamelCase), `displayName`, `summary`, `navigation` (`tabs`, `stack` or `split`), `screens` (kebab-case `id`, `title`, one-line `purpose`, `topLevel`), `models` (mark `persisted` only for data that must survive relaunch), `capabilities` (`id` and `reason`), `features`, `assumptions`. Fix validation errors and retry. Show the user the screens, capabilities, what they must provide, and the budget from PLAN.md, then continue without waiting.
4. **Project.** Call `ios_create_project` with the plan's app name, display name and the resolved capability ids. Read each capability's `usage` in the result.
5. **Code.** Write the whole app with `ios_write_files`, paths under `<AppName>/`:
   - `@MainActor @Observable final class` view models; services injected through protocols; no singletons inside view models.
   - Swift 6 strict concurrency; NavigationStack (never NavigationView); TabView with one NavigationStack per tab for tabs.
   - SwiftData only for persisted models (`.modelContainer` in `<AppName>App.swift`).
   - Loading, empty and error states; semantic colors; Dynamic Type; VoiceOver labels on icon-only buttons; dark mode.
   - A `#Preview` for each view that needs no network or disk.
   - `<AppName>/Views/RootView.swift` defines `RootView` and honors `AgentLaunch.requestedScreen`: when it is a top-level screen id, start on that screen (select that tab). The agent screenshots each screen this way.
   - Use the capability templates under `<AppName>/Capabilities/`; never embed credentials; add packages only through `ios_add_package` and only if no Apple framework covers the need.
6. **Build and fix.** Call `ios_build`. On failure, read the structured `errors`, fix the files with the smallest correct change, and build again. The tool stops at 8 attempts or 25 minutes, both counted from the first build; when it refuses, go to step 8 with status `failed`. Use `ios_logs` if the app crashes at launch.
7. **Run and screenshot.** For each top-level screen: `ios_run` with `screen` set to its id, then `ios_screenshot` with `name` set to the same id.
8. **Report.** Call `ios_report` with status `complete`, `failed` or `stopped`. Then tell the user, briefly: what was built and verified (build result, screenshots), what needs their own accounts, keys or money (from the report), and what to do next. Do not claim anything the tools did not confirm.

Never write outside the project folder. Never put API keys in source; credentials go in the project's gitignored `.env` (see `.env.example`).
