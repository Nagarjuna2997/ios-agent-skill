<p align="center">
  <img src="https://img.shields.io/badge/Swift-5.9+-F05138?style=for-the-badge&logo=swift&logoColor=white" alt="Swift">
  <img src="https://img.shields.io/badge/SwiftUI-blue?style=for-the-badge&logo=swift&logoColor=white" alt="SwiftUI">
  <img src="https://img.shields.io/badge/iOS%2017+-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS">
  <img src="https://img.shields.io/badge/visionOS-8B5CF6?style=for-the-badge&logo=apple&logoColor=white" alt="visionOS">
  <img src="https://img.shields.io/badge/AI%20Agents-25+-00D084?style=for-the-badge" alt="AI Agents">
  <img src="https://img.shields.io/badge/Lines-50K+-FF6B6B?style=for-the-badge" alt="Lines">
</p>

<h1 align="center">ios-agent-skill</h1>

<p align="center">
  <strong>The ultimate AI skill that turns any coding agent into a senior iOS/Swift developer.</strong><br>
  Production-ready code. Stunning UIs. Zero errors. All Apple platforms.
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/nagarjuna-reddy-97836a193/"><img src="https://img.shields.io/badge/Created%20by-Nagarjuna%20Reddy-0A66C2?style=flat-square&logo=linkedin" alt="Author"></a>
  <a href="https://github.com/Nagarjuna2997"><img src="https://img.shields.io/badge/GitHub-Nagarjuna2997-181717?style=flat-square&logo=github" alt="GitHub"></a>
  <img src="https://img.shields.io/github/license/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="Stars">
</p>

---

## :book: [Complete AI Setup Guide (Mac + Windows) for ALL 28 Tools](docs/ai-setup-guide.md)

---

## :warning: Important: Create Your Xcode Project FIRST

> **This skill generates Swift files, not a full Xcode project.** You must create the Xcode project first, then use your AI agent to build features inside it.

### Step 1: Create the Xcode Project

1. Open **Xcode** (macOS only — required for iOS development)
2. Click **File → New → Project** (or press `Cmd + Shift + N`)
3. Select **App** under iOS (or Multiplatform for cross-platform)
4. Fill in the project details:
   - **Product Name:** `YourAppName`
   - **Team:** Select your Apple Developer account (or Personal Team)
   - **Organization Identifier:** `com.yourname` (e.g., `com.nagarjuna`)
   - **Interface:** **SwiftUI**
   - **Language:** **Swift**
   - **Storage:** **SwiftData** (or None if you don't need persistence)
5. Click **Next** → Choose a folder → Click **Create**
6. Xcode creates the full project structure:
   ```
   YourAppName/
   ├── YourAppName.xcodeproj     ← Xcode project file
   ├── YourAppName/
   │   ├── YourAppNameApp.swift  ← App entry point
   │   ├── ContentView.swift     ← Main view
   │   ├── Assets.xcassets       ← App icons, colors, images
   │   ├── Preview Content/      ← Preview assets
   │   └── Info.plist            ← (if visible)
   └── YourAppNameTests/
       └── ...
   ```

### Step 2: Clone This Skill Into Your Project

```bash
cd /path/to/YourAppName
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git .ios-skill
```

### Step 3: Open Your AI Agent and Start Building

Now open your project folder in your preferred AI coding tool:

```bash
# Claude Code
cd /path/to/YourAppName && claude

# Codex
cd /path/to/YourAppName && codex

# Cursor — just open the folder in Cursor

# Any other tool — open the folder in your IDE
```

### Step 4: Ask the AI to Build Features

The AI will create/modify `.swift` files inside your Xcode project:

```
"Add a login screen with email and password fields"
"Create a settings page with dark mode toggle"
"Add a tab bar with Home, Search, and Profile tabs"
"Implement a networking layer to fetch data from my API"
```

### Step 5: Run in Xcode

Go back to Xcode → Press `Cmd + R` (or click the Play button) to build and run on the simulator.

> **Why this workflow?** AI agents generate Swift source files (`.swift`), but iOS apps need a proper Xcode project (`.xcodeproj`) with build settings, signing, asset catalogs, and simulator configuration. Xcode is the only tool that can compile, sign, and run iOS apps. Your AI agent writes the code — Xcode builds and runs it.

### Alternative: Use the Template

If you want to skip Xcode project creation, copy our ready-made template files into a new Xcode project:

```bash
# After creating Xcode project, copy template files
cp ios-agent-skill/templates/ios-app/*.swift /path/to/YourAppName/YourAppName/
cp -r ios-agent-skill/templates/ios-app/Views/ /path/to/YourAppName/YourAppName/Views/
cp -r ios-agent-skill/templates/ios-app/ViewModels/ /path/to/YourAppName/YourAppName/ViewModels/
cp -r ios-agent-skill/templates/ios-app/Models/ /path/to/YourAppName/YourAppName/Models/
```

Then open Xcode → Right-click the project → **Add Files to "YourAppName"** → Select the new folders.

---

## :zap: One-Line Install

```bash
curl -sL https://raw.githubusercontent.com/Nagarjuna2997/ios-agent-skill/main/install.sh | bash
```

---

## :robot: Works With Every AI Coding Agent

<details>
<summary><strong>:large_blue_diamond: Claude Code</strong></summary>

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git && cd ios-agent-skill && claude
```
Auto-reads `CLAUDE.md`
</details>

<details>
<summary><strong>:green_circle: OpenAI Codex CLI</strong></summary>

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git ~/.codex/skills/ios-agent-skill
```
Auto-reads `AGENTS.md`
</details>

<details>
<summary><strong>:large_blue_circle: Gemini CLI / Antigravity</strong></summary>

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git && cd ios-agent-skill
```
Auto-reads `GEMINI.md` and `AGENTS.md`
</details>

<details>
<summary><strong>:purple_circle: Cursor</strong></summary>

```bash
cp ios-agent-skill/.cursorrules /path/to/your/project/
# Or use modern format:
cp -r ios-agent-skill/.cursor /path/to/your/project/
```
Auto-reads `.cursor/rules/ios-skill.md` or `.cursorrules`
</details>

<details>
<summary><strong>:octocat: GitHub Copilot</strong></summary>

Auto-reads `.github/copilot-instructions.md` when repo is cloned.
</details>

<details>
<summary><strong>:ocean: Windsurf (Codeium)</strong></summary>

Auto-reads `.windsurf/rules/ios-skill.md` or `.windsurfrules`
</details>

<details>
<summary><strong>:brain: JetBrains AI / Junie</strong></summary>

Auto-reads `.aiassistant/rules/ios-skill.md` or `.junie/guidelines.md`
</details>

<details>
<summary><strong>:globe_with_meridians: 15+ More Platforms</strong></summary>

| Platform | File | Auto-detected |
|----------|------|:---:|
| Zed AI | `.rules` | :white_check_mark: |
| Trae (ByteDance) | `.trae/rules/ios-skill.md` | :white_check_mark: |
| Amazon Q Developer | `.amazonq/rules/ios-skill.md` | :white_check_mark: |
| Cline | `.clinerules` | :white_check_mark: |
| Roo Code | `.roo/rules/ios-skill.md` | :white_check_mark: |
| KiloCode | `.kilocode/rules/ios-skill.md` | :white_check_mark: |
| Continue.dev / PearAI | `.continue/rules/ios-skill.md` | :white_check_mark: |
| Augment Code | `.augment/rules/ios-skill.md` | :white_check_mark: |
| Tabnine | `.tabnine/guidelines/ios-skill.md` | :white_check_mark: |
| Aider | `CONVENTIONS.md` | :white_check_mark: |
| Sourcegraph Amp | `AGENTS.md` | :white_check_mark: |
| Replit Agent | `replit.md` | :white_check_mark: |
| Lovable | `AGENTS.md` | :white_check_mark: |
| OpenCode / OpenHands | `AGENTS.md` | :white_check_mark: |
| Bolt.new | `CLAUDE.md` | :white_check_mark: |

</details>

---

## :brain: What's Inside

### :gear: The Skill Brain

> `CLAUDE.md` / `SKILL.md` / `AGENTS.md` / `GEMINI.md` — all identical

- :white_check_mark: Zero-error Swift code generation rules
- :white_check_mark: Framework selection guide (SwiftUI vs UIKit, SwiftData vs CoreData)
- :white_check_mark: MVVM project structure with naming conventions
- :white_check_mark: Platform-specific guidance (iOS, macOS, watchOS, tvOS, visionOS)
- :white_check_mark: UI design standards (colors, typography, spacing, animations)
- :white_check_mark: Top 10 pitfalls and how to avoid them

---

## :books: Documentation Reference

### :orange_book: Swift Language — `docs/swift/`

| | File | Topics |
|:---:|------|--------|
| :abc: | [swift-language.md](docs/swift/swift-language.md) | Types, protocols, generics, property wrappers, result builders, macros, pattern matching |
| :arrows_counterclockwise: | [swift-concurrency.md](docs/swift/swift-concurrency.md) | async/await, Task, actors, @MainActor, Sendable, AsyncSequence, continuations |
| :package: | [swift-standard-library.md](docs/swift/swift-standard-library.md) | Collections, String, Codable, Result, Regex, Clock/Duration |

### :art: SwiftUI — `docs/swiftui/`

| | File | Topics |
|:---:|------|--------|
| :jigsaw: | [views-and-controls.md](docs/swiftui/views-and-controls.md) | Text, Image, Button, List, ScrollView, Form, Menu, ViewModifier, lifecycle |
| :floppy_disk: | [state-and-data-flow.md](docs/swiftui/state-and-data-flow.md) | @State, @Binding, @Observable, @Environment, @Query |
| :compass: | [navigation.md](docs/swiftui/navigation.md) | NavigationStack, sheets, TabView, deep linking, iOS 18 zoom transitions |
| :triangular_ruler: | [layout.md](docs/swiftui/layout.md) | Stacks, Grid, GeometryReader, LazyVGrid, custom Layout protocol |
| :sparkles: | [animations.md](docs/swiftui/animations.md) | Spring, transitions, matchedGeometry, PhaseAnimator, MeshGradient, TextRenderer |
| :point_up_2: | [gestures.md](docs/swiftui/gestures.md) | Tap, drag, magnify, rotate, gesture composition |

### :iphone: UIKit — `docs/uikit/`

| | File | Topics |
|:---:|------|--------|
| :building_construction: | [uikit-essentials.md](docs/uikit/uikit-essentials.md) | UIViewController, Auto Layout, diffable data sources, compositional layout |
| :bridge_at_night: | [uikit-swiftui-interop.md](docs/uikit/uikit-swiftui-interop.md) | UIViewRepresentable, UIHostingController, Coordinator pattern |
| :movie_camera: | [animations.md](docs/uikit/animations.md) | UIViewPropertyAnimator, custom VC transitions, Core Animation, CAShapeLayer |

### :rainbow: Design System — `docs/design/`

| | File | Topics |
|:---:|------|--------|
| :art: | [color-system.md](docs/design/color-system.md) | 5 color palettes, hex codes, 10 gradient recipes, materials, dark mode |
| :capital_abcd: | [typography-system.md](docs/design/typography-system.md) | Text styles, SF Symbols, Dynamic Type, gradient/animated text effects |
| :star2: | [stunning-ui-patterns.md](docs/design/stunning-ui-patterns.md) | 20+ UI patterns: glassmorphism, neumorphism, parallax, shimmer, card stacks |
| :joystick: | [interaction-standards.md](docs/design/interaction-standards.md) | Animation curves, haptics, button styles, states, localization, privacy manifest |
| :pencil2: | [fonts-catalog.md](docs/design/fonts-catalog.md) | Every iOS font, 100+ Google Fonts, 15 pairings, variable fonts, international |
| :clapper: | [third-party-animations.md](docs/design/third-party-animations.md) | Lottie integration, Rive state machines, decision table |

### :wrench: Drop-In Components — `templates/common-patterns/`

| | File | Includes |
|:---:|------|---------|
| :paintbrush: | [design-system.swift](templates/common-patterns/design-system.swift) | 5 themes, spacing/radius/shadow tokens, 6 ButtonStyles, ViewState, AnimationStandard |
| :bricks: | [ui-components.swift](templates/common-patterns/ui-components.swift) | GradientButton, GlassCard, AvatarView, StatCard, RatingView, CircularProgress, ToastView, SearchBar + 9 more |

### :gear: Apple Frameworks — `docs/frameworks/`

| | File | Framework |
|:---:|------|-----------|
| :globe_with_meridians: | [foundation.md](docs/frameworks/foundation.md) | URLSession, FileManager, Codable, NotificationCenter |
| :ocean: | [combine.md](docs/frameworks/combine.md) | Publishers, operators, error handling |
| :floppy_disk: | [core-data.md](docs/frameworks/core-data.md) | NSManagedObject, fetch requests, migration |
| :sparkle: | [swiftdata.md](docs/frameworks/swiftdata.md) | @Model, @Query, #Predicate, History API, custom DataStore |
| :satellite: | [networking.md](docs/frameworks/networking.md) | API client, auth tokens, WebSocket |
| :round_pushpin: | [core-location.md](docs/frameworks/core-location.md) | GPS, geofencing, iBeacon |
| :world_map: | [mapkit.md](docs/frameworks/mapkit.md) | Map views, annotations, directions, LookAround |
| :film_projector: | [avfoundation.md](docs/frameworks/avfoundation.md) | Audio/video playback, camera capture |
| :credit_card: | [storekit.md](docs/frameworks/storekit.md) | In-app purchases, subscriptions, EU marketplace |
| :cloud: | [cloudkit.md](docs/frameworks/cloudkit.md) | iCloud sync, CKSyncEngine, sharing |
| :bell: | [usernotifications.md](docs/frameworks/usernotifications.md) | Local/remote notifications, actions |
| :card_index_dividers: | [widgetkit.md](docs/frameworks/widgetkit.md) | Widgets, Live Activities, Control Center |
| :wheelchair: | [accessibility.md](docs/frameworks/accessibility.md) | VoiceOver, Dynamic Type, contrast |
| :iphone: | [arkit.md](docs/frameworks/arkit.md) | World/face/body/image/object/geo tracking, mesh, anchors |
| :eyeglasses: | [realitykit.md](docs/frameworks/realitykit.md) | ECS, RealityView, ARView, PBR materials, physics, USDZ |

### :robot: AI & Machine Learning — `docs/frameworks/ml/`

| | File | Framework |
|:---:|------|-----------|
| :brain: | [coreml.md](docs/frameworks/ml/coreml.md) | Model loading, prediction, Neural Engine |
| :eye: | [vision.md](docs/frameworks/ml/vision.md) | OCR, face detection, barcode, segmentation |
| :speech_balloon: | [natural-language.md](docs/frameworks/ml/natural-language.md) | Tokenization, sentiment, embeddings |
| :microphone: | [speech.md](docs/frameworks/ml/speech.md) | Speech-to-text, live transcription |
| :crystal_ball: | [on-device-ai.md](docs/frameworks/ml/on-device-ai.md) | Foundation Models, MLX Swift, on-device LLM |

### :rocket: Advanced App Experience

| | File | Framework |
|:---:|------|-----------|
| :green_circle: | [activitykit.md](docs/frameworks/activitykit.md) | Live Activities, Dynamic Island |
| :raised_hands: | [app-intents.md](docs/frameworks/app-intents.md) | Siri, Shortcuts, Spotlight, Apple Intelligence |
| :bulb: | [tipkit.md](docs/frameworks/tipkit.md) | Feature discovery tooltips |
| :scissors: | [app-clips.md](docs/frameworks/app-clips.md) | App Clips, NFC/QR triggers |
| :camera: | [photosui.md](docs/frameworks/photosui.md) | PhotosPicker, custom camera, PiP |

### :electric_plug: Hardware — `docs/frameworks/hardware/`

| | File | Framework |
|:---:|------|-----------|
| :signal_strength: | [core-bluetooth.md](docs/frameworks/hardware/core-bluetooth.md) | BLE scanning, connecting |
| :heart: | [healthkit.md](docs/frameworks/hardware/healthkit.md) | Health data, workouts |
| :running: | [core-motion.md](docs/frameworks/hardware/core-motion.md) | Accelerometer, pedometer |
| :vibration_mode: | [core-nfc.md](docs/frameworks/hardware/core-nfc.md) | NFC tag reading/writing |
| :house: | [homekit.md](docs/frameworks/hardware/homekit.md) | Home automation, Matter |

### :briefcase: Services — `docs/frameworks/services/`

| | File | Framework |
|:---:|------|-----------|
| :moneybag: | [passkit.md](docs/frameworks/services/passkit.md) | Apple Pay, Wallet passes |
| :partly_sunny: | [weatherkit.md](docs/frameworks/services/weatherkit.md) | Weather forecasts, alerts |
| :calendar: | [eventkit.md](docs/frameworks/services/eventkit.md) | Calendar, reminders |
| :busts_in_silhouette: | [contacts.md](docs/frameworks/services/contacts.md) | Contact access, picker |

### :shield: Security & Engineering

| | File | Framework |
|:---:|------|-----------|
| :lock: | [cryptokit.md](docs/frameworks/cryptokit.md) | SHA256, AES-GCM, Secure Enclave |
| :mag: | [oslog.md](docs/frameworks/oslog.md) | Logger, MetricKit diagnostics |
| :hourglass_flowing_sand: | [background-tasks.md](docs/frameworks/background-tasks.md) | BGTaskScheduler |
| :white_check_mark: | [device-integrity.md](docs/frameworks/device-integrity.md) | DeviceCheck, AppAttest |

### :earth_americas: Platform Guides — `docs/platforms/`

| | File | Platform |
|:---:|------|----------|
| :iphone: | [ios.md](docs/platforms/ios.md) | iOS — lifecycle, deep linking, extensions |
| :computer: | [macos.md](docs/platforms/macos.md) | macOS — menu bar, toolbar, sandboxing |
| :watch: | [watchos.md](docs/platforms/watchos.md) | watchOS — complications, workouts |
| :tv: | [tvos.md](docs/platforms/tvos.md) | tvOS — focus engine, Siri Remote |
| :eyeglasses: | [visionos.md](docs/platforms/visionos.md) | visionOS — spatial computing, RealityKit |

---

## :building_construction: Code Templates

### :iphone: iOS App Template

```
templates/ios-app/
 |- App.swift              # @main with SwiftData
 |- ContentView.swift      # TabView (Home, Profile, Settings)
 |- Models/Item.swift      # Data model
 |- Views/                 # HomeView, ProfileView, SettingsView
 |- ViewModels/            # @Observable view models
 |- Tests/                 # Swift Testing + XCTest examples
 |- Info.plist
```

### :globe_with_meridians: Multiplatform Template

```
templates/multiplatform-app/
 |- Shared/                # NavigationSplitView, shared logic
 |- iOS/                   # iOS-specific (haptics, etc.)
 |- macOS/                 # Menu commands, window styling
 |- watchOS/               # Compact layouts
```

### :toolbox: Common Patterns

| | File | What It Does |
|:---:|------|--------------|
| :satellite: | [networking-layer.swift](templates/common-patterns/networking-layer.swift) | Actor-based API client, auth tokens |
| :floppy_disk: | [persistence-layer.swift](templates/common-patterns/persistence-layer.swift) | SwiftData setup, @Query, previews |
| :key: | [auth-flow.swift](templates/common-patterns/auth-flow.swift) | AuthManager, Keychain, Sign in with Apple |
| :compass: | [navigation-router.swift](templates/common-patterns/navigation-router.swift) | Type-safe router, deep linking |
| :syringe: | [dependency-injection.swift](templates/common-patterns/dependency-injection.swift) | Protocol-based DI, Environment |

---

## :classical_building: Architecture Patterns

| | Pattern | Guide |
|:---:|---------|-------|
| :arrows_counterclockwise: | **MVVM** | [@Observable, DI, testing](patterns/mvvm.md) |
| :bricks: | **Clean Architecture** | [Domain/Data/Presentation layers](patterns/clean-architecture.md) |
| :compass: | **Coordinator** | [NavigationPath, deep linking](patterns/coordinator.md) |
| :file_cabinet: | **Repository** | [Offline-first, caching](patterns/repository.md) |
| :warning: | **Error Handling** | [Custom errors, retry, circuit breaker](patterns/error-handling.md) |
| :atom_symbol: | **TCA** | [Composable Architecture, TestStore](patterns/tca.md) |

---

## :rocket: CI/CD Templates

| | File | What It Does |
|:---:|------|--------------|
| :octocat: | [github-actions.yml](templates/ci-cd/github-actions.yml) | Build, test, TestFlight deploy, SPM cache |
| :gem: | [Fastfile](templates/ci-cd/Fastfile) | Test, beta, release lanes, match signing |

---

## :clipboard: Quality Checklists

| | Checklist | When to Use |
|:---:|-----------|-------------|
| :apple: | [App Store Submission](checklists/app-store-submission.md) | Before submitting — metadata, privacy, entitlements |
| :racing_car: | [Performance](checklists/performance.md) | Instruments, SwiftUI perf, image optimization |
| :shield: | [Security](checklists/security.md) | Keychain, pinning, biometrics, encryption |
| :test_tube: | [Testing](checklists/testing.md) | XCTest, Swift Testing, UI tests, CI/CD |

---

## :bar_chart: Tech Stack

| | Category | Technology | Version |
|:---:|----------|-----------|---------|
| :abc: | Language | Swift 5.9+ | Xcode 15+ |
| :art: | UI (primary) | SwiftUI | iOS 15+ |
| :iphone: | UI (interop) | UIKit / AppKit | iOS 13+ |
| :floppy_disk: | Persistence | SwiftData | iOS 17+ |
| :arrows_counterclockwise: | Concurrency | async/await, actors | iOS 15+ |
| :eyes: | State | @Observable | iOS 17+ |
| :building_construction: | Architecture | MVVM / TCA | All |
| :eyeglasses: | Spatial | RealityKit + ARKit | visionOS 1.0+ |
| :brain: | AI/ML | CoreML + Vision | iOS 15+ |

---

## :speech_balloon: Example Prompts

| | What You Want | What to Ask |
|:---:|--------------|-------------|
| :iphone: | New app | *"Create a SwiftUI habit tracker with SwiftData persistence"* |
| :bell: | Push notifications | *"Add local and remote notification support"* |
| :bug: | Fix a bug | *"My NavigationStack isn't preserving state on back"* |
| :satellite: | Networking | *"Create a REST API client that fetches user data"* |
| :eyeglasses: | visionOS | *"Build a visionOS app with 3D models in immersive space"* |
| :watch: | watchOS | *"Add a watchOS companion that syncs with iPhone"* |
| :card_index_dividers: | Widget | *"Create a home screen widget showing today's tasks"* |
| :credit_card: | In-app purchase | *"Add a subscription paywall with StoreKit 2"* |
| :star2: | Stunning UI | *"Build onboarding with gradient glass cards and animations"* |
| :art: | Design system | *"Apply Ocean Blue theme across the entire app"* |
| :bar_chart: | Dashboard | *"Add stat cards with circular progress and animated counters"* |
| :brain: | ML feature | *"Add on-device text recognition with Vision framework"* |
| :heart: | Health app | *"Read step count data from HealthKit and display weekly chart"* |

---

## :handshake: Contributing

1. :fork_and_knife: Fork this repository
2. :pencil2: Add or update documentation in `docs/`
3. :hammer_and_wrench: Add new templates or patterns
4. :arrow_heading_up: Submit a pull request

---

## :scroll: License

MIT License | Copyright (c) 2026 **Nagarjuna Reddy**

---

<p align="center">
  <strong>95+ files | 50,000+ lines | 25+ AI platforms | All Apple frameworks</strong><br><br>
  <a href="https://www.linkedin.com/in/nagarjuna-reddy-97836a193/"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://github.com/Nagarjuna2997/ios-agent-skill"><img src="https://img.shields.io/badge/GitHub-Star%20this%20repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
</p>
