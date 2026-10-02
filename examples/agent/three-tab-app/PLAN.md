# Tab Feed: build plan

A three-tab app with a Home feed of cards, a Search tab for finding cards, and a Profile tab for the user's details and preferences. Cards and profile data are stored on the device so they remain after relaunch.

Target toolchain: Xcode not detected; simulator: none detected.

## Screens

| Screen | Reached from | Purpose |
|---|---|---|
| Home (`home-feed`) | tab bar | Scrollable feed of cards. |
| Search (`search`) | tab bar | Search cards by text and see matching results. |
| Profile (`profile`) | tab bar | Shows the user's name, avatar and app preferences. |
| Card (`card-detail`) | navigation | Full view of a single card opened from Home or Search. |

Navigation: tabs.

## Data model

- **FeedCard** (stored on device with SwiftData): id: UUID, title: String, subtitle: String?, body: String, imageName: String?, createdAt: Date, isFavorite: Bool
- **UserProfile** (stored on device with SwiftData): id: UUID, displayName: String, bio: String?, avatarData: Data?

## Capabilities

| Capability | Why | Choice | Alternatives | Cost | You provide | Tonight | Module status |
|---|---|---|---|---|---|---|---|
| SwiftData local persistence | Keeps cards and the profile on the device across relaunches. | Apple-native | swiftdata-cloudkit-sync, core-data, file-storage, grdb-sqlite | free: Apple frameworks only | nothing | Built with the app | untested |
| Accessibility baseline | Provides 44 point tap targets, Dynamic Type spacing and Reduce Motion support across all tabs. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Brand colors (asset catalog) | Card and background colors need light and dark variants. | Apple-native | appearance-settings | free: No cost | nothing | Built with the app | untested |
| Appearance setting (light, dark, system) | Profile offers a System/Light/Dark choice. | Apple-native | none | free: Apple frameworks only | nothing | Built with the app | untested |
| Photo picker | Lets the user choose a profile photo without library permission. | Apple-native | camera-capture | free: Apple frameworks only | nothing | Built with the app | untested |
| Share sheet | Lets the user share a card from its detail screen. | Apple-native | deep-links, universal-links | free: Apple frameworks only | nothing | Built with the app | untested |
| App icon (rendered from SVG layers, Icon Composer ready) | The app needs a home screen icon. | Apple-native | alternate-app-icons | free: Local rendering with the bundled resvg renderer; Icon Composer ships with Xcode | nothing | Built with the app | untested |
| Launch screen and animated splash | Provides a branded launch screen. | Apple-native | lottie-animation | free: Apple frameworks only | nothing | Built with the app | untested |
| Searchable lists | The Search tab needs a searchable text field with results. | Apple-native | none | free: SwiftUI searchable; written by the agent without a module | nothing | Not built: no module yet | planned |
| SF Symbols and custom symbols | Tab bar and card icons use SF Symbols. | Apple-native | none | free: Apple frameworks only | nothing | Not built: no module yet | planned |

Module status `untested` means the capability's own build check has not passed on a Mac yet; this run's build is the test.

## Budget

Building and running in the iOS Simulator needs no paid account. The amounts below come only from capability manifests; amounts not confirmed on the vendor's page are marked unverified.

No priced items.

## Assumptions

- No sign-in or server is needed, so all content is local with sample cards.
- Search filters the on-device cards only.
- The feed content is placeholder until the user supplies real content.
- Only one profile exists on the device.
