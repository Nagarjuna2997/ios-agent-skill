# Pocket Notes: build plan

Keep plain-text notes on your iPhone and browse, add, or delete them without an internet connection. Three fictional notes are ready to read on first launch, and your changes are saved on the device.

## Screens

| Screen | Layout | Reached from | Purpose |
|---|---|---|---|
| Notes (`notes`) | list | launch | Browse notes newest first, open a note, add a note, or delete one. |
| Note (`note-detail`) | detail | navigation | Read the full title and body of a saved note. |
| New Note (`new-note`) | form | navigation | Enter a title and body, then save the note or cancel. |

Navigation: stack.

## Choose a design

- **Paper Notebook** (`paper-notebook`): Warm paper tones and comfortably spaced title-and-preview rows suit everyday lists and quick reminders. — A quiet paper notebook with warm surfaces and crisp ink; Paper and Ink, system, comfortable.
- **Index Drawer** (`index-drawer`): Compact rows with thin separators and short previews keep more notes visible while preserving generous touch targets. — A tidy card index with cool gray surfaces and precise dividers; Slate Index, rounded, compact.
- **Reading Journal** (`reading-journal`): Spacious note cards and larger serif headings give longer entries room to breathe and make the detail screen comfortable to read. — An editorial journal with blush paper, plum ink, and generous margins; Rose Paper, serif, spacious.

Selected: paper-notebook

## Design direction

- Mood: A quiet paper notebook with warm surfaces and crisp ink
- Palette: **Paper and Ink** — primary `#25221E`, secondary `#FAF5EA`, accent `#345843`
- Typography: system
- Shapes: soft
- Density: comfortable
- Motion: minimal
- A reusable SwiftUI design system is included by default; the screen layouts and components will follow this direction.

## Data model

- **Note** (stored on device with SwiftData): id: UUID, title: String, body: String, createdAt: Date
  - Synthetic preview records: 3
    - Example 1: {"id":"7CF5D978-6C5A-4C4F-AE29-5B4D6FB4D03A","title":"Pantry restock","body":"Rolled oats\nCanned tomatoes\nBrown rice","createdAt":"2026-01-12T15:30:00Z"}
    - Example 2: {"id":"9DE11C99-2A5C-482F-8565-0B1A7159BB10","title":"Balcony garden ideas","body":"Try basil near the railing where it gets morning sun. Check that the pots drain before planting.","createdAt":"2026-01-10T19:45:00Z"}
    - Example 3: {"id":"CF195E62-606A-4020-9E3F-733560847D48","title":"Sketch prompt","body":"Draw the same coffee mug from three angles.","createdAt":"2026-01-08T17:00:00Z"}

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| Brand colors (asset catalog) | Provide semantic colors with accessible contrast in light and dark appearances. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| SwiftUI design system and components | Apply the chosen typography, spacing, and component styles across the list, detail, and form. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | verified |
| SwiftData local persistence | Store notes on the device so adding, reading, and deleting work offline and changes survive relaunch. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Support Dynamic Type, Reduce Motion, and accessible touch targets for note actions. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| SF Symbols | Use familiar system imagery for add and delete actions with descriptive accessibility labels. | Apple-native | app-icon | free: Apple frameworks only; check the SF Symbols license for use outside Apple platforms | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | Give the app a recognizable notes icon on the Home Screen. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

No priced items.

## Assumptions

- The deployment floor is iOS 17.0.
- Notes are plain text and live on the current device.
- The requested actions are add and delete, so saved notes open in a read-only detail screen.
- The sample records use fixed UUIDs and ISO 8601 timestamps that are decoded into Swift values during seeding.
