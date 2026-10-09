# Tab Feed: build plan

A three-tab app with a Home feed of cards, a Search tab for finding cards, and a Profile tab for the user's details and preferences. Cards and profile data are stored on the device so they remain after relaunch.

## Screens

| Screen | Layout | Reached from | Purpose |
|---|---|---|---|
| Home (`home-feed`) | feed | tab bar | Scrollable feed of cards. |
| Search (`search`) | search | tab bar | Search cards by text and see matching results. |
| Profile (`profile`) | profile | tab bar | Shows the user's name, avatar and app preferences. |
| Card (`card-detail`) | detail | navigation | Full view of a single card opened from Home or Search. |

Navigation: tabs.

## Design direction

- Mood: curious, bright, and thoughtfully crafted
- Palette: **Blue Hour** — primary `#315B78`, secondary `#6B8E74`, accent `#D28C55`
- Typography: system
- Shapes: rounded
- Density: spacious
- Motion: subtle
- A reusable SwiftUI design system is included by default; the screen layouts and components will follow this direction.

## Data model

- **FeedCard** (stored on device with SwiftData): id: UUID, title: String, subtitle: String?, body: String, imageName: String?, createdAt: Date, isFavorite: Bool
  - Synthetic preview records: 3
    - Example 1: {"id":"C0000000-0000-0000-0000-000000000001","title":"Make room for focus","subtitle":"A small practice","body":"Choose one thing to finish before opening another tab.","createdAt":"2026-10-09T09:00:00Z","isFavorite":true}
    - Example 2: {"id":"C0000000-0000-0000-0000-000000000002","title":"Notice the details","subtitle":"Field notes","body":"A walk can change the shape of an idea. Take the long way home.","createdAt":"2026-10-08T16:30:00Z","isFavorite":false}
    - Example 3: {"id":"C0000000-0000-0000-0000-000000000003","title":"Start with a sketch","subtitle":"Creative work","body":"A rough outline makes the first real decision easier.","createdAt":"2026-10-07T13:15:00Z","isFavorite":false}
- **UserProfile** (stored on device with SwiftData): id: UUID, displayName: String, bio: String?, avatarData: Data?
  - Synthetic preview records: 2
    - Example 1: {"id":"D0000000-0000-0000-0000-000000000001","displayName":"Alex Morgan","bio":"Collecting good ideas and quiet moments."}
    - Example 2: {"id":"D0000000-0000-0000-0000-000000000002","displayName":"Sam Rivera","bio":"Learning one small thing every day."}

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| Brand colors (asset catalog) | Card and background colors need light and dark variants. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| SwiftUI design system and components | requested | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | verified |
| SwiftData local persistence | Keeps cards and the profile on the device across relaunches. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Searchable lists | The Search tab needs a searchable text field with results. | Apple-native | spotlight-indexing | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Provides 44 point tap targets, Dynamic Type spacing and Reduce Motion support across all tabs. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| SF Symbols | Tab bar and card icons use SF Symbols. | Apple-native | app-icon | free: Apple frameworks only; check the SF Symbols license for use outside Apple platforms | nothing | Built with the app | untested |
| Appearance setting (light, dark, system) | Profile offers a System/Light/Dark choice. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Photo picker | Lets the user choose a profile photo without library permission. | Apple-native | camera-capture | free: Apple frameworks only | nothing | Built with the app | untested |
| Share sheet | Lets the user share a card from its detail screen. | Apple-native | deep-links, universal-links | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs a home screen icon. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| Launch screen and animated splash | Provides a branded launch screen. | Apple-native | lottie-animation | free: Apple frameworks only | nothing | Built with the app | untested |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

No priced items.

## Assumptions

- No sign-in or server is needed, so all content is local with sample cards.
- Search filters the on-device cards only.
- The feed content is placeholder until the user supplies real content.
- Only one profile exists on the device.
