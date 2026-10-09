# Quick Notes: build plan

A simple notes app that saves your notes on the device so they are still there after you close the app. You can search all notes by title or text and write new notes or edit existing ones on a dedicated compose screen.

## Screens

| Screen | Layout | Reached from | Purpose |
|---|---|---|---|
| Notes (`notes-list`) | list | launch | Browse all notes, newest first, with a search field to filter them. |
| Compose (`compose-note`) | form | navigation | Write a new note or edit an existing one with a title and body. |
| Note (`note-detail`) | detail | navigation | Read a single note and jump to editing or deleting it. |

Navigation: stack.

## Design direction

- Mood: quiet, tactile, and editorial
- Palette: **Ink & Paper** — primary `#355070`, secondary `#6D597A`, accent `#D88C70`
- Typography: serif
- Shapes: soft
- Density: comfortable
- Motion: minimal
- A reusable SwiftUI design system is included by default; the screen layouts and components will follow this direction.

## Data model

- **Note** (stored on device with SwiftData): id: UUID, title: String, body: String, createdAt: Date, updatedAt: Date
  - Synthetic preview records: 3
    - Example 1: {"id":"B0000000-0000-0000-0000-000000000001","title":"A slower Sunday","body":"Make coffee, open the windows, and leave a little space between plans.","createdAt":"2026-10-08T08:15:00Z","updatedAt":"2026-10-08T08:15:00Z"}
    - Example 2: {"id":"B0000000-0000-0000-0000-000000000002","title":"Ideas for the garden","body":"Try rosemary beside the steps and add a small bench near the herbs.","createdAt":"2026-10-07T17:40:00Z","updatedAt":"2026-10-08T07:10:00Z"}
    - Example 3: {"id":"B0000000-0000-0000-0000-000000000003","title":"Book notes","body":"The best ideas are the ones that still feel useful the next morning.","createdAt":"2026-10-06T20:00:00Z","updatedAt":"2026-10-06T20:00:00Z"}

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| Brand colors (asset catalog) | Gives the app consistent light and dark mode colors. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| SwiftUI design system and components | requested | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | verified |
| SwiftData local persistence | Notes must be saved on the device and survive relaunching the app. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Searchable lists | Users need to find notes quickly by searching titles and body text. | Apple-native | spotlight-indexing | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Provides large tap targets, Dynamic Type friendly spacing and Reduce Motion support for the list and compose screens. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Haptic feedback | Gives light feedback when a note is saved or deleted. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Share sheet | Lets users send a note's text to other apps through the system share sheet. | Apple-native | deep-links, universal-links | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs an icon for the Home Screen. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

No priced items.

## Assumptions

- Notes are plain text only, with no images, attachments or formatting.
- Data stays on this device only; there is no iCloud sync or account.
- Navigation is a single stack starting at the notes list, so there are no tabs.
- Deletion is immediate from swipe or the detail screen, with no recently-deleted folder.
- Search is a simple case-insensitive match on title and body.
- The app targets iPhone with iOS 17.0 as the minimum version.
