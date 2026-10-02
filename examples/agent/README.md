# Agent examples

These apps were produced from the one-line requests below on 2026-10-02. Each folder contains the agent's PLAN.md and RUN_REPORT.md, the generated Xcode project and Swift sources, and screenshots from the iOS Simulator.

## What ran, and what did not

Each example went through two machines.

1. **Plan, project and code.** `ios-agent-mcp build "<request>"` ran with headless Claude Code as the model. This happened in a Linux session that had no Xcode. The agent planned the app, wrote PLAN.md, applied the capability modules and wrote the SwiftUI code. It then stopped at its toolchain check. So RUN_REPORT.md says `failed (toolchain missing)` and lists no builds: that is the true outcome of that run.
2. **Build and run.** The project was written by the agent's built-in Xcode project writer. It was opened in Xcode 27.0 on a Mac and run on the iPhone 18 Pro Simulator (iOS 27.0) with Product > Run. Every example built without errors on the first build, with no code changes. The screenshots were taken from the running simulator, and the screens were reached by tapping.

Not exercised: the agent's own `xcodebuild` build-and-fix loop and its `simctl` launch and screenshot steps. That session could click in Xcode but had no shell on the Mac. Treat the first full `/ios-build` run on a Mac as the remaining acceptance test.

## Examples

| Request | App | Screens | Capabilities applied | Result |
|---|---|---|---|---|
| A habit tracker with a list, a detail screen, and settings with dark mode toggle | [HabitTracker](habit-tracker/PLAN.md) | habit list, habit detail, settings | swiftdata, appearance-settings, accessibility-baseline, haptics, color-assets, app-icon | Built on the first build and ran |
| A notes app with SwiftData persistence, search, and a compose screen | [QuickNotes](notes-app/PLAN.md) | notes list with search, compose, note detail | swiftdata, accessibility-baseline, haptics, share-sheet, app-icon, color-assets | Built on the first build and ran |
| A three-tab app: Home feed of cards, Search, Profile | [TabFeed](three-tab-app/PLAN.md) | home feed, search, profile, card detail | swiftdata, accessibility-baseline, color-assets, appearance-settings, photos-picker, share-sheet, app-icon, launch-screen | Built on the first build and ran; see the runtime issue below |

Each plan also named capabilities that have no module yet (`sf-symbols`, `search`). The agent listed them under "Requested but not built" instead of inventing them.

### Habit tracker

| Habits | New habit | Settings |
|---|---|---|
| ![Habit list](habit-tracker/screenshots/01-habit-list-empty.jpg) | ![New habit form](habit-tracker/screenshots/02-new-habit-form.jpg) | ![Settings with dark mode toggle](habit-tracker/screenshots/03-settings.jpg) |

### Notes

| Notes with search | Compose |
|---|---|
| ![Notes list](notes-app/screenshots/01-notes-list.jpg) | ![Compose screen](notes-app/screenshots/02-compose.jpg) |

### Three tabs

| Home | Search | Profile |
|---|---|---|
| ![Home feed](three-tab-app/screenshots/01-home.jpg) | ![Search tab](three-tab-app/screenshots/02-search.jpg) | ![Profile tab](three-tab-app/screenshots/03-profile.jpg) |

## Found by running

- **TabFeed runtime issue.** Xcode reported repeated SwiftUI runtime warnings: "Accessing Environment's value outside of being installed on a View". The generated views stored `ScaledSpacing` in `@State`. The accessibility-baseline module's own documentation had told the model to do that. A `DynamicProperty` inside `@State` is never installed, so its `@ScaledMetric` values do not scale. The module now says to store it directly on the view (`private let spacing = ScaledSpacing()`). The example is left as generated.
- **Input not tested.** Text typed from the Mac keyboard did not reach the simulator during this session, and the dark mode toggle did not respond to a click. So adding a habit, saving a note and switching appearance were not exercised. Those screenshots show empty states.

## Reproduce

On a Mac with Xcode 16 or later, from a checkout of this repository (the `build` command is not in a published package yet):

```bash
cd mcp-server && npm ci && npm run build && cd ..
node mcp-server/dist/unified.js build "A habit tracker with a list, a detail screen, and settings with dark mode toggle" --out ./habit-tracker
```

The model's output differs from run to run, so a new run will not reproduce these files exactly.
