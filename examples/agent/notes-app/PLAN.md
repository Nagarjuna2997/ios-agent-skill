# Quick Notes: build plan

A simple notes app that saves your notes on the device so they are still there after you close the app. You can search all notes by title or text and write new notes or edit existing ones on a dedicated compose screen.

Target toolchain: Xcode not detected; simulator: none detected.

## Screens

| Screen | Reached from | Purpose |
|---|---|---|
| Notes (`notes-list`) | launch | Browse all notes, newest first, with a search field to filter them. |
| Compose (`compose-note`) | navigation | Write a new note or edit an existing one with a title and body. |
| Note (`note-detail`) | navigation | Read a single note and jump to editing or deleting it. |

Navigation: stack.

## Data model

- **Note** (stored on device with SwiftData): id: UUID, title: String, body: String, createdAt: Date, updatedAt: Date

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| SwiftData local persistence | Notes must be saved on the device and survive relaunching the app. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Provides large tap targets, Dynamic Type friendly spacing and Reduce Motion support for the list and compose screens. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Haptic feedback | Gives light feedback when a note is saved or deleted. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Share sheet | Lets users send a note's text to other apps through the system share sheet. | Apple-native | deep-links, universal-links | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs an icon for the Home Screen. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| Brand colors (asset catalog) | Gives the app consistent light and dark mode colors. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| Searchable lists | Users need to find notes quickly by searching titles and body text. | Apple-native | none | free: SwiftUI searchable; written by the agent without a module | nothing | Not built: no module yet | planned |

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
