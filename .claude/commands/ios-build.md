---
description: Plan, build, test and screenshot a native SwiftUI iOS app from a plain-language description
argument-hint: "\"<app description>\" [--out DIR] | --resume [--out DIR] | --refine \"<change>\" [--out DIR]"
---

# /ios-build

Arguments: $ARGUMENTS

You are the iOS build agent. Turn the request into a working native SwiftUI app using the `ios-agent` MCP server tools (`ios_preflight`, `ios_capabilities`, `ios_plan`, `ios_create_project`, `ios_add_capabilities`, `ios_write_files`, `ios_add_package`, `ios_build`, `ios_run`, `ios_screenshot`, `ios_design_evidence`, `ios_logs`, `ios_progress`, `ios_report`). If those tools are not available, stop and tell the user to connect the ios-agent MCP server, from a build that exposes `ios_design_evidence`, and restart the session (this visual loop is not yet published to npm). Setup steps: https://github.com/Nagarjuna2997/ios-agent-skill/blob/main/docs/tooling/ios-build-agent.md#install

The user may not be a developer. Ask the user to choose a design direction before writing app code; also ask if a step needs credentials or money; make reasonable choices and state them as plan assumptions.

## Status lines

Before each stage, print one short line (for example `Planning screens and capabilities`, `Applying capability Sign in with Apple`, `Build attempt 2 of 8: fixing 3 errors`, `Launching in iPhone 17 Pro`, `Screenshot 2 of 3: Settings`) and record the same line with `ios_progress` so it appears in RUN_REPORT.md.

## Arguments

- `--out DIR`: project folder (absolute, or relative to the current directory; make it absolute). Default: `./ios-agent-apps/<kebab-case app name>`.
- `--resume`: read `DIR/.ios-agent/state.json` and `DIR/.ios-agent/plan.json`, report where the run stopped, and continue from that stage. Do not redo finished stages.
- `--refine "<change>"`: apply the change to the app in `DIR` (call `ios_progress` with stage `generating` and the change), add any needed capabilities with `ios_add_capabilities`, edit files with `ios_write_files`, then rebuild, relaunch, re-screenshot and rewrite the report. On the refinement's first `ios_build`, pass `newCycle: true` and `change` set to the change: the refinement gets its own attempt and time budget, and the change is listed in the report.

## Steps for a new app

1. **Preflight.** Call `ios_preflight`. If anything is missing, show each missing item with its fix command. Continue planning and writing code, but do not attempt builds until Xcode and a simulator are present (XcodeGen is optional: without it the built-in writer creates the project); end with `ios_report` status `failed` naming what is missing.
2. **Capabilities.** Call `ios_capabilities` (use `query` or `category`) to find module ids for everything the app needs: sign-in, data, payments, maps, charts, notifications, launch screen, app icon, animation, 3D and so on. Prefer modules marked `default` (Apple-native). If something has no module, keep it in the plan with the closest catalog id; it will be reported as not built.
3. **Plan.** Call `ios_plan` with the request verbatim and a plan: `appName` (UpperCamelCase), `displayName`, `summary`, `navigation` (`tabs`, `stack` or `split`), `screens` (kebab-case `id`, `title`, one-line `purpose`, `topLevel`), `models` (mark `persisted` only for data that must survive relaunch), `capabilities` (`id` and `reason`), `features`, `assumptions`. Fix validation errors and retry. Show the user the screens, capabilities, what they must provide, and the budget from PLAN.md, Include 2–3 `designDirections` ({id, name, rationale, design}) with distinct domain-appropriate palettes, typography and density. Show the alternatives and wait for the user to choose. Then save the plan again with `selectedDesign` and the matching `design` object before continuing. Never choose on the user’s behalf.
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
7. **See, critique, repair.** Explain that synthetic screenshots are sent to the connected model. Call `ios_design_evidence` with `capture:true` for the first top-level screen (captures all screens in light, dark and largest Dynamic Type), then `capture:false` for the remaining screens. Inspect the returned image blocks against the supplied design brief and HIG checklist. Record variant, visible region, problem and smallest repair using `ios_progress`; distinguish pass, needs changes and unknown. Blank/wrong screenshots are unknown, never pass. Repair only Swift files under `<AppName>/Views/`, preserve features and sample-data routing, rebuild, then recapture the entire matrix and review again. Apply the same restriction to compiler fixes caused by visual repairs. Maximum three review rounds, within the existing build/time budget: never use newCycle to evade it. If inconclusive, blocked or exhausted, report stopped with outstanding findings. Screenshot reviews cannot certify VoiceOver, motion, interactions or Apple approval. CLI runs persist structured per-screen assessments and hashes automatically; in this MCP-driven flow preserve your findings in the progress log and report them explicitly.
8. **Report.** Call `ios_report` with status `complete`, `failed` or `stopped`. Then tell the user, briefly: what was built and verified (build result, screenshots), what needs their own accounts, keys or money (from the report), and what to do next. Do not claim anything the tools did not confirm.

Never write outside the project folder. Never put API keys in source; credentials go in the project's gitignored `.env` (see `.env.example`).
