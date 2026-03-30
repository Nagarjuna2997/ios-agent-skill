# ios-agent-skill

> Created by [**Nagarjuna Reddy**](https://www.linkedin.com/in/nagarjuna-reddy-97836a193/) — iOS Developer & AI Engineer

**Turn Claude into an expert iOS/Swift developer that writes production-ready, error-free code with stunning UIs across all Apple platforms.**

This is a comprehensive Claude AI skill repository — a knowledge base, design system, code template library, and coding standards guide that transforms Claude into a senior-level Apple platform engineer. Every app Claude builds will have beautiful color palettes, polished typography, smooth animations, and pixel-perfect layouts. Just clone, open with Claude Code, and start building apps.

---

## Quick Start

### Option 1: Clone and Use Directly

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git
cd ios-agent-skill
claude
```

Claude will automatically read `CLAUDE.md` and become an expert iOS developer. Ask it to build any app.

### Option 2: Reference from Your Existing Project

Add this to your project's `CLAUDE.md`:

```markdown
You are an expert iOS/Swift developer. Reference the ios-agent-skill knowledge base for all Apple development:

- Coding standards: /path/to/ios-agent-skill/CLAUDE.md
- Documentation: /path/to/ios-agent-skill/docs/
- Code templates: /path/to/ios-agent-skill/templates/
- Architecture patterns: /path/to/ios-agent-skill/patterns/
- Quality checklists: /path/to/ios-agent-skill/checklists/
```

### Option 3: Copy CLAUDE.md into Any Project

Copy `CLAUDE.md` into the root of any Xcode project. Claude Code will pick it up automatically.

---

## What's Inside

### `CLAUDE.md` — The Brain

The master skill file that makes Claude an iOS expert. Contains:

- Zero-error code generation rules
- Swift 5.9+ coding standards (naming, structure, patterns)
- Framework selection guide (when to use SwiftUI vs UIKit, SwiftData vs CoreData, etc.)
- Platform-specific guidance for iOS, macOS, watchOS, tvOS, visionOS
- MVVM project structure template
- Top 10 common pitfalls and how to avoid them

---

## Documentation Reference (`docs/`)

### Swift Language — `docs/swift/`

| File | What You'll Learn |
|------|-------------------|
| [swift-language.md](docs/swift/swift-language.md) | Value vs reference types, protocols, generics, property wrappers, result builders, macros, pattern matching, access control, key paths, extensions |
| [swift-concurrency.md](docs/swift/swift-concurrency.md) | async/await, Task & TaskGroup, async let, actors, @MainActor, Sendable, AsyncSequence, AsyncStream, continuations, migration from GCD |
| [swift-standard-library.md](docs/swift/swift-standard-library.md) | Array, Dictionary, Set, String/Character, Codable, Result, Comparable, Hashable, Sequence/Collection protocols, Regex/RegexBuilder, Clock/Duration |

### SwiftUI — `docs/swiftui/`

| File | What You'll Learn |
|------|-------------------|
| [views-and-controls.md](docs/swiftui/views-and-controls.md) | Text, Image, Button, Toggle, Picker, TextField, List, ScrollView, LazyVStack/HStack/VGrid/HGrid, Form, Menu, ProgressView, custom ViewModifier, view lifecycle (onAppear, task, onChange) |
| [state-and-data-flow.md](docs/swiftui/state-and-data-flow.md) | @State, @Binding, @Observable (iOS 17+), @Environment, @AppStorage, @Query, when to use which property wrapper |
| [navigation.md](docs/swiftui/navigation.md) | NavigationStack, NavigationPath, NavigationSplitView, sheets, alerts, TabView, deep linking, programmatic navigation, type-safe routing |
| [layout.md](docs/swiftui/layout.md) | VStack/HStack/ZStack, Grid, ViewThatFits, GeometryReader, LazyVGrid/HGrid, safe area, custom Layout protocol, ScrollViewReader |
| [animations.md](docs/swiftui/animations.md) | Implicit/explicit animations, spring/bouncy/snappy, transitions, matchedGeometryEffect, PhaseAnimator, KeyframeAnimator, symbol effects, haptics |
| [gestures.md](docs/swiftui/gestures.md) | Tap, long press, drag, magnify, rotate, gesture composition (.simultaneously, .sequenced), @GestureState, custom gesture modifiers |

### UIKit — `docs/uikit/`

| File | What You'll Learn |
|------|-------------------|
| [uikit-essentials.md](docs/uikit/uikit-essentials.md) | UIViewController lifecycle, Auto Layout, UICollectionView diffable data sources & compositional layout, UINavigationController, keyboard handling |
| [uikit-swiftui-interop.md](docs/uikit/uikit-swiftui-interop.md) | UIViewRepresentable, UIViewControllerRepresentable, UIHostingController, Coordinator pattern, data flow between UIKit and SwiftUI |

### UI Design System — `docs/design/`

| File | What You'll Learn |
|------|-------------------|
| [color-system.md](docs/design/color-system.md) | 5 pre-built color palettes (Ocean Blue, Sunset Warm, Midnight Dark, Nature Green, Violet Dream) with full hex codes, Color hex extension, 10 gradient recipes (LinearGradient, RadialGradient, MeshGradient), material effects, dark mode, vibrancy, color accessibility |
| [typography-system.md](docs/design/typography-system.md) | Apple's 11 text styles, font weights & designs (.rounded, .serif, .monospaced), custom fonts, SF Symbols (rendering modes, variable values, effects), Dynamic Type, gradient text, shadow text, outlined text, animated text, AttributedString |
| [stunning-ui-patterns.md](docs/design/stunning-ui-patterns.md) | 20+ production-ready UI patterns with full SwiftUI code: glassmorphism cards, neumorphic design, gradient cards, animated onboarding, parallax headers, bottom sheets, animated tab bars, profile cards, dashboard stats, floating action buttons, card stacks, shimmer loading, toast notifications, expandable cards, animated backgrounds, scroll-blur headers, chip layouts, rating stars |
| [interaction-standards.md](docs/design/interaction-standards.md) | Animation curves & durations (micro/navigation/content/dismissal), haptic feedback rules (when to use which type), SF Symbols guidelines (weights, sizes, rendering modes, effects), 6 button styles (primary/secondary/destructive/ghost/icon/pill), loading/empty/error state patterns with ViewState enum, localization approach (String Catalogs, pluralization, RTL), privacy manifest (PrivacyInfo.xcprivacy), iPad adaptive layout (size classes, Stage Manager), preview standards (#Preview with dark mode, Dynamic Type, devices) |

### Reusable UI Components — `templates/common-patterns/`

| File | Components Included |
|------|-------------------|
| [design-system.swift](templates/common-patterns/design-system.swift) | Color hex extension, 5 theme structs (OceanBlue, SunsetWarm, MidnightDark, NatureGreen, VioletDream), ThemeManager with runtime switching, typography scale, spacing system, corner radius system, shadow styles, ViewModifiers (.cardStyle, .glassCard, .gradientBackground, .shimmer, .pressable, .slideIn) |
| [ui-components.swift](templates/common-patterns/ui-components.swift) | GradientButton, GlassCard, AvatarView, StatCard, TagView, FlowLayout, RatingView, CircularProgress, AnimatedCounter, GradientText, CustomToggle, SkeletonView, ToastView, StepIndicator, EmptyStateView, SearchBar, SegmentedControl |

### Apple Frameworks — `docs/frameworks/`

| File | Framework | What You'll Learn |
|------|-----------|-------------------|
| [foundation.md](docs/frameworks/foundation.md) | Foundation | URLSession async, FileManager, UserDefaults, JSONEncoder/Decoder, Codable patterns, formatters, NotificationCenter, Timer |
| [combine.md](docs/frameworks/combine.md) | Combine | Publishers, subscribers, operators (map, filter, flatMap, debounce, combineLatest), error handling, scheduling, memory management |
| [core-data.md](docs/frameworks/core-data.md) | Core Data | NSManagedObject, contexts, fetch requests, NSFetchedResultsController, relationships, migration, CloudKit integration |
| [swiftdata.md](docs/frameworks/swiftdata.md) | SwiftData | @Model, ModelContainer, @Query, #Predicate, relationships, VersionedSchema migration, CloudKit sync |
| [networking.md](docs/frameworks/networking.md) | Networking | Generic API client (actor-based), auth tokens, retry logic, multipart upload, WebSocket, NWPathMonitor |
| [core-location.md](docs/frameworks/core-location.md) | CoreLocation | CLLocationManager, permissions, geocoding, geofencing, iBeacon, background location |
| [mapkit.md](docs/frameworks/mapkit.md) | MapKit | SwiftUI Map, annotations, overlays, MKLocalSearch, MKDirections, MapCamera, LookAround |
| [avfoundation.md](docs/frameworks/avfoundation.md) | AVFoundation | AVPlayer, audio recording, camera capture (AVCaptureSession), video export, audio session, Now Playing |
| [storekit.md](docs/frameworks/storekit.md) | StoreKit 2 | Products, purchase flow, transaction verification, subscriptions, SubscriptionStoreView, testing |
| [cloudkit.md](docs/frameworks/cloudkit.md) | CloudKit | CKContainer, CKRecord CRUD, CKQuery, subscriptions, sharing (CKShare), SwiftData/CoreData integration |
| [usernotifications.md](docs/frameworks/usernotifications.md) | UserNotifications | Local/remote notifications, triggers (time, calendar, location), actions, categories, service extension |
| [widgetkit.md](docs/frameworks/widgetkit.md) | WidgetKit | TimelineProvider, widget families, Lock Screen widgets, Live Activities, interactive widgets (iOS 17+) |
| [accessibility.md](docs/frameworks/accessibility.md) | Accessibility | VoiceOver, Dynamic Type, color contrast, reduce motion, custom actions, rotors, testing |

### Platform Guides — `docs/platforms/`

| File | Platform | What You'll Learn |
|------|----------|-------------------|
| [ios.md](docs/platforms/ios.md) | iOS | App lifecycle, BGTaskScheduler, deep linking (Universal Links), share extensions, HealthKit, Core Haptics |
| [macos.md](docs/platforms/macos.md) | macOS | Menu bar, NSWindow, toolbar/sidebar, document-based apps, sandboxing, NSViewRepresentable, drag & drop |
| [watchos.md](docs/platforms/watchos.md) | watchOS | Complications (WidgetKit), Watch Connectivity, HealthKit workouts, Digital Crown, always-on display |
| [tvos.md](docs/platforms/tvos.md) | tvOS | Focus engine, TVUIKit, Top Shelf, Siri Remote, media playback, multi-user support |
| [visionos.md](docs/platforms/visionos.md) | visionOS | WindowGroup/ImmersiveSpace/Volume, RealityView, Model3D, hand & eye tracking, spatial audio, ornaments |

---

## Code Templates (`templates/`)

### iOS App Template — `templates/ios-app/`

A complete MVVM SwiftUI app ready to build on:

```
templates/ios-app/
├── App.swift                    # @main entry point with SwiftData
├── ContentView.swift            # TabView with Home, Profile, Settings
├── Models/
│   └── Item.swift               # Sample data model with Identifiable, Hashable
├── Views/
│   ├── HomeView.swift           # NavigationStack, List, pull-to-refresh, empty state
│   ├── ProfileView.swift        # User profile with sections and sign out
│   └── SettingsView.swift       # Form with toggles, pickers, app info
├── ViewModels/
│   ├── HomeViewModel.swift      # @Observable with async loading, error handling
│   └── ProfileViewModel.swift   # @Observable with user state management
└── Info.plist                   # Configured for iOS with scene support
```

### Multiplatform Template — `templates/multiplatform-app/`

SwiftUI app targeting iOS, macOS, and watchOS simultaneously:

```
templates/multiplatform-app/
├── Shared/
│   └── MultiplatformApp.swift   # NavigationSplitView, platform-adaptive
├── iOS/
│   └── iOSApp.swift             # Haptic feedback helper, iOS modifiers
├── macOS/
│   └── macOSApp.swift           # Custom menu commands, window styling
└── watchOS/
    └── watchOSApp.swift         # Vertical page TabView, compact layouts
```

### Common Patterns — `templates/common-patterns/`

Drop-in Swift files for the most common app features:

| File | What It Does |
|------|--------------|
| [networking-layer.swift](templates/common-patterns/networking-layer.swift) | Actor-based generic API client with GET/POST/PUT/DELETE, error handling, status codes, authenticated client with token management |
| [persistence-layer.swift](templates/common-patterns/persistence-layer.swift) | SwiftData setup with @Model, ModelContainer, @Query integration, CRUD operations, preview container with sample data |
| [auth-flow.swift](templates/common-patterns/auth-flow.swift) | Complete auth system — AuthManager (@Observable), Keychain storage, email/password sign in, Sign in with Apple, auth-gated root view, login form |
| [navigation-router.swift](templates/common-patterns/navigation-router.swift) | Type-safe router with NavigationPath, push/pop/popToRoot, sheet/fullScreenCover, deep link handling |
| [dependency-injection.swift](templates/common-patterns/dependency-injection.swift) | Protocol-based DI with SwiftUI Environment, service protocols, concrete + mock implementations, AppDependencies container |

---

## Architecture Patterns (`patterns/`)

| File | Pattern | What You'll Learn |
|------|---------|-------------------|
| [mvvm.md](patterns/mvvm.md) | MVVM | @Observable ViewModel, protocol-based DI, optimistic updates, Equatable views, testing with mocks |
| [clean-architecture.md](patterns/clean-architecture.md) | Clean Architecture | Domain/Data/Presentation layers, use cases, entity vs DTO separation, dependency inversion |
| [coordinator.md](patterns/coordinator.md) | Coordinator | Coordinator protocol with NavigationPath, child coordinators, deep link routing, lifecycle management |
| [repository.md](patterns/repository.md) | Repository | Generic CRUD protocol, remote + local data sources, caching with TTL, offline-first with sync queue |
| [error-handling.md](patterns/error-handling.md) | Error Handling | Custom error types, propagation chains, user-facing alerts, retry with backoff, circuit breaker, logging |

---

## Quality Checklists (`checklists/`)

| File | When to Use |
|------|-------------|
| [app-store-submission.md](checklists/app-store-submission.md) | Before submitting to App Store — metadata, privacy labels, ATS, entitlements, TestFlight, common rejection fixes |
| [performance.md](checklists/performance.md) | Optimizing your app — Instruments profiling, SwiftUI performance, image optimization, launch time, memory management |
| [security.md](checklists/security.md) | Securing your app — Keychain, certificate pinning, biometric auth, data protection, input validation |
| [testing.md](checklists/testing.md) | Testing your app — XCTest, Swift Testing (@Test, #expect), UI testing, network mocking, CI/CD with GitHub Actions |

---

## Supported Platforms & Tech Stack

| Category | Technology | Minimum Version |
|----------|-----------|-----------------|
| Language | Swift 5.9+ | Xcode 15+ |
| UI (primary) | SwiftUI | iOS 15+ / macOS 13+ |
| UI (interop) | UIKit / AppKit | iOS 13+ / macOS 10.15+ |
| Persistence (modern) | SwiftData | iOS 17+ |
| Persistence (legacy) | Core Data | iOS 13+ |
| Concurrency | Swift Concurrency | iOS 15+ |
| State (modern) | Observation (@Observable) | iOS 17+ |
| State (legacy) | Combine | iOS 13+ |
| Architecture | MVVM | All |
| Spatial | RealityKit + ARKit | visionOS 1.0+ |
| Widgets | WidgetKit | iOS 14+ |
| Payments | StoreKit 2 | iOS 15+ |

---

## Example Prompts

Once Claude loads this skill, try these:

| What You Want | What to Ask Claude |
|--------------|-------------------|
| New iOS app | "Create a SwiftUI iOS app for tracking daily habits with SwiftData persistence" |
| Add a feature | "Add push notification support to my app with local and remote notifications" |
| Fix a bug | "My NavigationStack isn't preserving state when I go back. Fix it." |
| Add networking | "Create a REST API client for my app that fetches user data from this endpoint" |
| visionOS app | "Build a visionOS app that displays 3D models in an immersive space" |
| watchOS companion | "Add a watchOS companion app that syncs data with the iPhone app" |
| Widget | "Create a home screen widget that shows today's tasks from my app" |
| In-app purchase | "Add a subscription paywall using StoreKit 2" |
| Architecture help | "Refactor this view to use MVVM with the repository pattern" |
| App Store prep | "Review my app against the App Store submission checklist" |
| Performance | "Profile and optimize my app's scroll performance in this list view" |
| Stunning UI | "Build a beautiful onboarding screen with gradient backgrounds, glass cards, and smooth animations" |
| Design system | "Create a custom theme with Ocean Blue palette and apply it across the entire app" |
| Components | "Add a dashboard with stat cards, circular progress indicators, and animated counters" |

---

## Repository Structure

```
ios-agent-skill/
│
├── CLAUDE.md                              # Master skill — Claude's iOS expert brain
├── README.md                              # This file
├── .gitignore                             # Swift/Xcode gitignore
├── .claude/settings.json                  # Claude Code configuration
│
├── docs/                                  # 32 documentation files
│   ├── swift/                             # 3 files — language, concurrency, stdlib
│   │   ├── swift-language.md
│   │   ├── swift-concurrency.md
│   │   └── swift-standard-library.md
│   │
│   ├── swiftui/                           # 6 files — complete SwiftUI reference
│   │   ├── views-and-controls.md
│   │   ├── state-and-data-flow.md
│   │   ├── navigation.md
│   │   ├── layout.md
│   │   ├── animations.md
│   │   └── gestures.md
│   │
│   ├── design/                            # 4 files — UI design system
│   │   ├── color-system.md               # 5 color palettes, gradients, materials
│   │   ├── typography-system.md          # Text styles, fonts, SF Symbols, effects
│   │   ├── stunning-ui-patterns.md       # 20+ beautiful UI patterns with code
│   │   └── interaction-standards.md      # Animations, haptics, buttons, states, privacy
│   │
│   ├── uikit/                             # 2 files — UIKit + SwiftUI bridging
│   │   ├── uikit-essentials.md
│   │   └── uikit-swiftui-interop.md
│   │
│   ├── frameworks/                        # 13 files — every major Apple framework
│   │   ├── foundation.md
│   │   ├── combine.md
│   │   ├── core-data.md
│   │   ├── swiftdata.md
│   │   ├── networking.md
│   │   ├── core-location.md
│   │   ├── mapkit.md
│   │   ├── avfoundation.md
│   │   ├── storekit.md
│   │   ├── cloudkit.md
│   │   ├── usernotifications.md
│   │   ├── widgetkit.md
│   │   └── accessibility.md
│   │
│   └── platforms/                         # 5 files — every Apple platform
│       ├── ios.md
│       ├── macos.md
│       ├── watchos.md
│       ├── tvos.md
│       └── visionos.md
│
├── templates/                             # 16 Swift source files
│   ├── ios-app/                           # Complete iOS MVVM app
│   │   ├── App.swift
│   │   ├── ContentView.swift
│   │   ├── Info.plist
│   │   ├── Models/Item.swift
│   │   ├── ViewModels/HomeViewModel.swift
│   │   ├── ViewModels/ProfileViewModel.swift
│   │   ├── Views/HomeView.swift
│   │   ├── Views/ProfileView.swift
│   │   └── Views/SettingsView.swift
│   │
│   ├── multiplatform-app/                 # iOS + macOS + watchOS app
│   │   ├── Shared/MultiplatformApp.swift
│   │   ├── iOS/iOSApp.swift
│   │   ├── macOS/macOSApp.swift
│   │   └── watchOS/watchOSApp.swift
│   │
│   └── common-patterns/                   # Drop-in code patterns
│       ├── networking-layer.swift
│       ├── persistence-layer.swift
│       ├── auth-flow.swift
│       ├── navigation-router.swift
│       ├── dependency-injection.swift
│       ├── design-system.swift            # Themes, colors, spacing, shadows, modifiers
│       └── ui-components.swift            # 17 reusable beautiful UI components
│
├── patterns/                              # 5 architecture guides
│   ├── mvvm.md
│   ├── clean-architecture.md
│   ├── coordinator.md
│   ├── repository.md
│   └── error-handling.md
│
└── checklists/                            # 4 quality checklists
    ├── app-store-submission.md
    ├── performance.md
    ├── security.md
    └── testing.md
```

**68 files | 35,000+ lines | Stunning UIs + All Apple platforms covered**

---

## Author

**Nagarjuna Reddy** — iOS Developer & AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nagarjuna%20Reddy-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nagarjuna-reddy-97836a193/)
[![GitHub](https://img.shields.io/badge/GitHub-Nagarjuna2997-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nagarjuna2997)

---

## Contributing

1. Fork this repository
2. Add or update documentation in `docs/`
3. Add new templates or patterns
4. Submit a pull request

---

## License

MIT License

Copyright (c) 2026 Nagarjuna Reddy
