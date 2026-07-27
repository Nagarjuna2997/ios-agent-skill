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
  <strong>An Agent Skill for production-oriented iOS, Swift, and SwiftUI development.</strong><br>
  Helps AI coding assistants generate safer Swift code, follow modern Apple APIs, and work inside existing Xcode projects.
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/nagarjuna-reddy-97836a193/"><img src="https://img.shields.io/badge/Created%20by-Nagarjuna%20Reddy-0A66C2?style=flat-square&logo=linkedin" alt="Author"></a>
  <a href="https://github.com/Nagarjuna2997"><img src="https://img.shields.io/badge/GitHub-Nagarjuna2997-181717?style=flat-square&logo=github" alt="GitHub"></a>
  <img src="https://img.shields.io/github/license/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/v/release/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="Release">
</p>

---

## Adoption and Community Usage

This repository tracks public adoption evidence in [`ADOPTION.md`](ADOPTION.md), including repository metrics, public mentions, user feedback, and projects built with the skill.

If you use this skill in a public project, tutorial, or workflow, please open an issue or discussion so it can be listed as community evidence.

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

## :gear: Supported Platforms

**Write against:** Swift 6.4 · Xcode 27 · iOS 27 SDK — **deploy to:** iOS 17–27

| | |
|---|---|
| **Swift** | 6.4+ (minimum 5.9) |
| **Xcode** | 27+ |
| **iOS / iPadOS** | 17 – 27 |
| **macOS** | 14 – 27 |
| **watchOS / tvOS** | 10 – 27 |
| **visionOS** | 2+ |

Full per-feature floors, framework minimums, and toolchain support: **[docs/compatibility-matrix.md](docs/compatibility-matrix.md)**.

> **Guard on the version where an API was introduced, not the newest SDK.** Liquid Glass and the Foundation Models baseline are **iOS 26+**; Private Cloud Compute, Dynamic Profiles, and image attachments are **iOS 27+**. Writing `#available(iOS 27, *)` around an iOS 26 API silently drops every iOS 26 device to your fallback.

Everything above the iOS 17 floor is **additive** — a newer-OS feature must degrade to a working path, never disappear.

---

## :sparkles: What's New in 1.4

**Adoption and maintenance.** The repo now proves its own patterns compile.

| | Feature | What it gives you |
|:---:|---------|-------------------|
| :white_check_mark: | **[Compile-checked sample](samples/SkillPatterns/)** | An SPM package implementing the skill's core patterns, built and tested in CI on every push — the patterns are now VERIFIED, not INSPECTED |
| :bookmark_tabs: | **[Compatibility matrix](docs/compatibility-matrix.md)** | One canonical table: deployment targets, SDKs, tested toolchains, per-feature availability floors |
| :arrow_up: | **[Migration guides](docs/migration/)** | Swift 5.9→6→6.4 organized by the compiler errors you actually hit; iOS 17→26→27; Xcode 15→16→27 |
| :mag: | **Expanded CI** | Markdown links, backtick path references, code-fence languages, frontmatter consistency — repo-wide, not just SKILL.md |

---

## :sparkles: What's New in 1.3

**Apple Intelligence and the iOS 27 toolchain.**

| | Feature | What it gives you |
|:---:|---------|-------------------|
| :brain: | **[Foundation Models](docs/frameworks/foundation-models.md)** | On-device + Private Cloud Compute LLMs, `@Generable`/`@Guide` structured output, tool calling, Dynamic Profiles, multimodal prompts, custom `LanguageModel` providers |
| :sparkles: | **[Apple Intelligence](docs/frameworks/apple-intelligence.md)** | Which framework to reach for, the privacy model and what you may claim, App Intents, Image Playground, features that degrade |
| :hammer_and_wrench: | **[Xcode 27 agents](docs/tooling/xcode-27-agents.md)** | Coding agents vs. Claude Code, agent-assisted localization and testing, the Swift Concurrency instrument |
| :iphone: | **[Device Hub](docs/tooling/device-hub.md)** | The device/config test matrix, iOS 27 app resizability, accessibility passes |
| :ocean: | **Swift 6.4** | `weak let`, `~Sendable`, `@diagnose`, async in `defer`, unhandled-task-error warnings, plus an actor isolation review checklist |
| :busts_in_silhouette: | **4 new subagents** | `foundation-models`, `swiftui-modernization`, `accessibility-reviewer`, `performance-reviewer` — 10 total |

---

## :sparkles: What's New in 1.2

**The agent-operations layer.** Earlier versions taught the model *what* to write. This release adds *how it should work* — how to split a job, verify it, and scale it out.

| | Feature | What it gives you |
|:---:|---------|-------------------|
| :busts_in_silhouette: | **6 custom subagents** in [`.claude/agents/`](.claude/agents/) | `ios-explore`, `ios-plan`, `swift-reviewer`, `swift-debugger`, `swift-refactorer`, `ios-docs` — each with its own fresh context and a restricted tool set |
| :receipt: | **The verification evidence rule** | Agents must show command output, test results, or `file:line` citations. Every claim is labelled VERIFIED / INSPECTED / UNVERIFIED — no more "it should work now" |
| :repeat: | **Loop contracts** | Every loop declares GOAL, CHECK, MAX, and ON-STALL. Turn-based, goal-based, time-based, and proactive patterns, with stall detection |
| :chart_with_upwards_trend: | **A scale-up path** | Inline → subagents → loop → `/batch` (worktree per unit) → script-driven dynamic workflows |
| :lock: | **Hooks for deterministic enforcement** | This repo blocks edits to generated files and auto-syncs mirrors. [`templates/hooks/`](templates/hooks/) drops the same idea into your iOS project |
| :compass: | **A main-agent router** | [`docs/orchestration/router.md`](docs/orchestration/router.md) — one table deciding inline vs. delegate vs. loop vs. batch |

Two rules do most of the work:

- **The author does not grade the work.** Verification goes to a cold `swift-reviewer` with no write tools, so it cannot fix what it should report.
- **Subagents report only to the main agent.** They cannot talk to each other — that is the separate, experimental agent-teams feature, and this skill does not assume it.

**Also in 1.1:** design tokens + Liquid Glass, typed routing and deep links, SwiftData/Core Data concurrency, a three-tier mocking strategy, IoC boundary protocols in Clean Architecture, and `@MainActor` isolation rules throughout. See [CHANGELOG.md](CHANGELOG.md).

---

## :brain: What's Inside

### :gear: The Skill Brain

> `CLAUDE.md` / `SKILL.md` / `AGENTS.md` / `GEMINI.md` — all generated from `SKILL.md`

- :white_check_mark: Zero-error Swift code generation rules
- :white_check_mark: Framework selection guide (SwiftUI vs UIKit, SwiftData vs CoreData)
- :white_check_mark: MVVM project structure with naming conventions
- :white_check_mark: Platform-specific guidance (iOS, macOS, watchOS, tvOS, visionOS)
- :white_check_mark: UI design standards (colors, typography, spacing, animations)
- :white_check_mark: 20 pitfalls and how to avoid them
- :white_check_mark: **Operating model — delegation, loops, verification evidence, hooks**

> The 24 agent rule files are **generated** from `SKILL.md` by `./scripts/sync-mirrors.sh`. Edit `SKILL.md`, never a mirror — a hook blocks it, and CI fails a stale one.

---

## :books: Documentation Reference

### :robot: Agent Operations — `docs/orchestration/`

> How Claude should split, verify, and scale work. Start with `router.md`.

| | File | Topics |
|:---:|------|--------|
| :compass: | [router.md](docs/orchestration/router.md) | **Start here.** Inline vs. delegate vs. loop vs. batch; standard sequences; what the main agent stays responsible for |
| :busts_in_silhouette: | [subagents.md](docs/orchestration/subagents.md) | Defining subagents, frontmatter, tool restriction, delegation prompts, parallelism, subagents vs. agent teams |
| :repeat: | [looping.md](docs/orchestration/looping.md) | Turn/goal/time/proactive loops, GOAL–CHECK–MAX–ON-STALL, stall detection, never faking termination |
| :receipt: | [verification.md](docs/orchestration/verification.md) | The evidence contract, VERIFIED/INSPECTED/UNVERIFIED, separation of duties, report format |
| :chart_with_upwards_trend: | [dynamic-workflows.md](docs/orchestration/dynamic-workflows.md) | The scale ladder, `/batch` + worktrees, script-driven orchestration, failure policies |
| :lock: | [hooks.md](docs/orchestration/hooks.md) | Hook vs. CI vs. reviewer, events, the exit-code contract, design rules |

**Ready-to-use specialists** — [`.claude/agents/`](.claude/agents/)

| Subagent | Tools | Use for |
|----------|-------|---------|
| [`ios-explore`](.claude/agents/ios-explore.md) | read-only | "Where is X?" across a Swift codebase — parallel-safe |
| [`ios-plan`](.claude/agents/ios-plan.md) | read-only | Multi-file features, migrations, architecture decisions |
| [`swift-reviewer`](.claude/agents/swift-reviewer.md) | read + Bash | Independent verification — no write tools |
| [`swift-debugger`](.claude/agents/swift-debugger.md) | read + Bash + Edit | Reproduce → isolate → fix → prove |
| [`swift-refactorer`](.claude/agents/swift-refactorer.md) | read + write + Bash | Behavior-preserving cleanups against a green baseline |
| [`ios-docs`](.claude/agents/ios-docs.md) | read + write + Bash | Docs, DocC, README, CHANGELOG |
| [`foundation-models`](.claude/agents/foundation-models.md) | read + write + Bash | On-device / PCC LLM features, availability gating, graceful degradation |
| [`swiftui-modernization`](.claude/agents/swiftui-modernization.md) | read + write + Bash | Legacy → modern API migration, behavior-preserving |
| [`accessibility-reviewer`](.claude/agents/accessibility-reviewer.md) | read-only | VoiceOver, Dynamic Type, contrast, tap targets, motion |
| [`performance-reviewer`](.claude/agents/performance-reviewer.md) | read + Bash | Hitches, memory, main-actor contention — measures before concluding |

**Drop-in hooks for your iOS project** — [`templates/hooks/`](templates/hooks/)

| | File | Event | Effect |
|:---:|------|-------|--------|
| :art: | [swift-format.sh](templates/hooks/swift-format.sh) | PostToolUse | SwiftFormat + SwiftLint autocorrect on the edited file |
| :no_entry: | [forbid-antipatterns.sh](templates/hooks/forbid-antipatterns.sh) | PostToolUse | Blocks `DispatchQueue.main.async`, `Task.detached`, `@Observable` without `@MainActor`, empty `catch`, `try!`, `NavigationView`, `AnyView`, fixed font sizes, `print()`, a type named `Task` |
| :hammer: | [build-check.sh](templates/hooks/build-check.sh) | Stop | Builds and tests before the turn ends; blocks a "done" that does not compile |

### :bookmark_tabs: Versions & Migration

| | File | Topics |
|:---:|------|--------|
| :straight_ruler: | [compatibility-matrix.md](docs/compatibility-matrix.md) | **Canonical.** Deployment targets, SDKs, tested Xcode/Swift, per-feature availability floors |
| :ocean: | [swift-6-migration.md](docs/migration/swift-6-migration.md) | Swift 5.9→6→6.4, organized by the compiler errors you hit and the fix for each |
| :iphone: | [ios-deployment-migration.md](docs/migration/ios-deployment-migration.md) | iOS 17→26→27, separating SDK rebuilds from deployment-target raises |
| :hammer: | [xcode-migration.md](docs/migration/xcode-migration.md) | Xcode 15→16→27, and how to diagnose a post-upgrade failure |

### :hammer_and_wrench: Tooling — `docs/tooling/`

| | File | Topics |
|:---:|------|--------|
| :robot: | [xcode-27-agents.md](docs/tooling/xcode-27-agents.md) | Xcode coding agents, routing vs. Claude Code, agent-assisted localization and testing, Instruments |
| :iphone: | [device-hub.md](docs/tooling/device-hub.md) | Device Hub, the test matrix, iOS 27 app resizability, accessibility passes |

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
| :link: | [deep-linking-and-routing.md](docs/swiftui/deep-linking-and-routing.md) | Typed routes, Router, URL schemes, universal links, state restoration, multi-stack tabs |
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
| :abacus: | [design-tokens.md](docs/design/design-tokens.md) | 3-tier token architecture, theming, dark mode, Dynamic Type, Liquid Glass, contrast tests |
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
| :twisted_rightwards_arrows: | [data-concurrency.md](docs/frameworks/data-concurrency.md) | @ModelActor, background contexts, batch imports, crossing actor boundaries |
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
| :sparkles: | [foundation-models.md](docs/frameworks/foundation-models.md) | On-device + PCC LLMs, `@Generable`, tool calling, Dynamic Profiles, multimodal prompts |
| :star2: | [apple-intelligence.md](docs/frameworks/apple-intelligence.md) | Framework routing, privacy model, App Intents, Image Playground, graceful degradation |
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

## :white_check_mark: Compile-Checked Sample

[`samples/SkillPatterns/`](samples/SkillPatterns/) is an SPM package implementing this skill's core patterns — `@MainActor @Observable` view models, protocol-injected dependencies, typed routes with pure deep-link parsing, actor test doubles. CI builds and tests it on macOS on every push, with strict concurrency enabled.

```bash
cd samples/SkillPatterns && swift build && swift test
```

Several tests exist specifically to fail if a rule is broken — a stale-index revert, a `CancellationError` treated as user-facing, a dropped launch-time deep link. That is what makes the documented patterns verified rather than asserted.

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
| :arrows_counterclockwise: | **MVVM** | [@MainActor @Observable, isolation, DI, testing](patterns/mvvm.md) |
| :bricks: | **Clean Architecture** | [Layers, IoC boundary protocols, composition root](patterns/clean-architecture.md) |
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
| :performing_arts: | [Mocking & Debugging Strategy](docs/testing/mocking-strategy.md) | Tier 1 test doubles, Tier 2 rich debug mocks, Tier 3 environment flags and debug menus |

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
