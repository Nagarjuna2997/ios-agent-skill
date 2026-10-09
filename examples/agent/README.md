# `/ios-build` examples

These four synthetic apps exercise the design layer in the 3.9.1 GitHub branch. Each plan records its own mood, palette, typography, shape, density and motion; the generated screens use shared `AppTheme` components and populated sample data. Their run reports include build records, generated-palette contrast checks and light, dark and XXL Dynamic Type captures for every top-level screen.

## What was verified

All four Xcode projects built unsigned for the iPhone 18 Pro Simulator with Xcode 27.0. The agent's build, launch and screenshot loop ran on the Mac; it captured 10 top-level screens in three variants each (30 screenshots total). TabFeed needed one compile repair before the second build passed. FoodDash's design refinement could not be generated because Claude Code returned a session-limit HTTP 429, so its sample-data/design changes were completed locally and then built and captured through the same simulator loop. Its build has one non-blocking App Intents metadata warning.

These are build and rendering checks, not full acceptance tests. Taps, scrolling, authentication, real network services, StoreKit purchases, remote updates and physical-device signing were not exercised. The `-ios-agent-sample-data YES` launch argument seeds synthetic data in an in-memory store and selects local demo services; it does not use credentials or alter the app's normal persistent data path. Palette contrast checks cover generated semantic asset pairs, not every runtime text/background combination.

## Apps and evidence

| Example | Screens captured | Build result | Notes |
|---|---|---|---|
| [HabitTracker](habit-tracker/PLAN.md) | Habit list | 1 build, 0 warnings | SwiftData-backed production path; isolated sample store for captures. |
| [QuickNotes](notes-app/PLAN.md) | Notes list | 1 build, 0 warnings | Populated preview and simulator sample state. |
| [TabFeed](three-tab-app/PLAN.md) | Home feed, Search, Profile | 2 builds; first required a compile repair | All three top-level screens captured. |
| [FoodDash](food-delivery/PLAN.md) | Restaurants, Cart, Order Status, Past Orders, Account | 1 build, 1 warning | Locally completed after Claude's rate limit; synthetic restaurants, cart and orders. |

Each app folder contains its `PLAN.md`, source project, `.ios-agent/screenshots/` matrix and `RUN_REPORT.md`. The reports distinguish generated capability status from build evidence and list unverified integrations and required credentials.

## Selected simulator captures

| HabitTracker | QuickNotes | TabFeed | FoodDash |
|---|---|---|---|
| ![Populated habit tracker in light appearance](habit-tracker/.ios-agent/screenshots/habit-list-light.png) | ![Populated notes list in light appearance](notes-app/.ios-agent/screenshots/notes-list-light.png) | ![Populated TabFeed home in light appearance](three-tab-app/.ios-agent/screenshots/home-feed-light.png) | ![Restaurant list in light appearance](food-delivery/.ios-agent/screenshots/restaurants-light.png) |

Open each `RUN_REPORT.md` for its full light/dark/XXL image table and build details.

## Limits seen during review

- XXL Dynamic Type is captured as design evidence and can reveal layout pressure; the report does not automatically diagnose clipping or certify accessibility.
- Screenshots open each top-level route directly. They do not imply that every control or navigation path was tapped.
- Generated brand marks are editable placeholders. Replace them with product artwork before release.
- FoodDash includes placeholder backend keys and a StoreKit sample. Configure a real backend and payment method only for a separate, authorized integration task.
