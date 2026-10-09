# Habit Tracker: build plan

A simple habit tracker that shows your habits in a list, lets you open any habit to see its details and streak, and mark it done each day. A settings screen lets you switch dark mode on or off. Habits are saved on your device so they remain after you close the app.

## Screens

| Screen | Layout | Reached from | Purpose |
|---|---|---|---|
| Habits (`habit-list`) | dashboard | launch | Shows all habits with today's completion status and lets you add a new habit. |
| Habit Detail (`habit-detail`) | detail | navigation | Shows one habit's name, notes, current streak and completion history, with options to edit or delete it. |
| Settings (`settings`) | settings | navigation | Lets you turn dark mode on or off and control haptic feedback. |

Navigation: stack.

## Design direction

- Mood: optimistic, steady, and restorative
- Palette: **Garden Morning** — primary `#476A4C`, secondary `#D18B52`, accent `#B54B5C`
- Typography: rounded
- Shapes: soft
- Density: comfortable
- Motion: subtle
- A reusable SwiftUI design system is included by default; the screen layouts and components will follow this direction.

## Data model

- **Habit** (stored on device with SwiftData): id: UUID, name: String, notes: String?, createdAt: Date, completedDates: [Date]
  - Synthetic preview records: 3
    - Example 1: {"id":"A0000000-0000-0000-0000-000000000001","name":"Read 20 minutes","notes":"Any book counts.","createdAt":"2026-10-01T09:00:00Z","completedDates":["2026-10-09T00:00:00Z","2026-10-08T00:00:00Z","2026-10-07T00:00:00Z"]}
    - Example 2: {"id":"A0000000-0000-0000-0000-000000000002","name":"Walk outside","notes":"A short loop after lunch.","createdAt":"2026-10-02T12:00:00Z","completedDates":["2026-10-09T00:00:00Z","2026-10-08T00:00:00Z"]}
    - Example 3: {"id":"A0000000-0000-0000-0000-000000000003","name":"Stretch","notes":"Five quiet minutes.","createdAt":"2026-10-03T07:30:00Z","completedDates":["2026-10-08T00:00:00Z"]}

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| Brand colors (asset catalog) | Semantic colors with light and dark variants so the app looks right in both appearances. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| SwiftUI design system and components | requested | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | verified |
| SwiftData local persistence | Habits and their completion history must survive app relaunch. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Appearance setting (light, dark, system) | Provides the stored dark mode toggle in Settings, applied at the app root. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Ensures 44 point tap targets, Dynamic Type friendly spacing and Reduce Motion support for checking off habits. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Haptic feedback | Gives tactile feedback when a habit is marked done, with a setting to turn it off. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs an icon for the Home Screen. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| SF Symbols | Icons for checkmarks, streaks and settings use SF Symbols. | Apple-native | app-icon | free: Apple frameworks only; check the SF Symbols license for use outside Apple platforms | nothing | Built with the app | untested |

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
