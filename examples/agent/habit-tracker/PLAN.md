# Habit Tracker: build plan

A simple habit tracker that shows your habits in a list, lets you open any habit to see its details and streak, and mark it done each day. A settings screen lets you switch dark mode on or off. Habits are saved on your device so they remain after you close the app.

Target toolchain: Xcode not detected; simulator: none detected.

## Screens

| Screen | Reached from | Purpose |
|---|---|---|
| Habits (`habit-list`) | launch | Shows all habits with today's completion status and lets you add a new habit. |
| Habit Detail (`habit-detail`) | navigation | Shows one habit's name, notes, current streak and completion history, with options to edit or delete it. |
| Settings (`settings`) | navigation | Lets you turn dark mode on or off and control haptic feedback. |

Navigation: stack.

## Data model

- **Habit** (stored on device with SwiftData): id: UUID, name: String, notes: String?, createdAt: Date, completedDates: [Date]

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| SwiftData local persistence | Habits and their completion history must survive app relaunch. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Appearance setting (light, dark, system) | Provides the stored dark mode toggle in Settings, applied at the app root. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Ensures 44 point tap targets, Dynamic Type friendly spacing and Reduce Motion support for checking off habits. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Haptic feedback | Gives tactile feedback when a habit is marked done, with a setting to turn it off. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Brand colors (asset catalog) | Semantic colors with light and dark variants so the app looks right in both appearances. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs an icon for the Home Screen. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| SF Symbols and custom symbols | Icons for checkmarks, streaks and settings use SF Symbols. | Apple-native | none | free: Apple frameworks only | nothing | Not built: no module yet | planned |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

No priced items.

## Assumptions

- Navigation is a single stack: the list is the home screen, detail is pushed on tap, and settings opens from a toolbar button.
- Habits are daily; no custom schedules or weekly goals.
- No reminders, accounts or cloud sync were requested, so none are included.
- Dark mode is a simple on/off toggle that overrides the system setting.
- Streak is calculated from completed dates rather than stored.
