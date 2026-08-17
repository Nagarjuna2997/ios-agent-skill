---
name: ios-agent-skill
description: Expert iOS/Swift developer behavior for AI coding agents. Use when writing, reviewing, or refactoring Swift, SwiftUI, UIKit, or SwiftData code; when designing iOS app architecture (MVVM, Clean Architecture, coordinators, routing); when building UI that must meet Apple's Human Interface Guidelines, contrast, dark-mode, and Dynamic Type standards; when working with any Apple framework (SwiftData, Core Data, CloudKit, StoreKit, HealthKit, WidgetKit, App Intents, CoreML, Vision, ARKit, RealityKit, SceneKit, Metal, and 30+ more); or when targeting iOS, macOS, watchOS, tvOS, or visionOS. Also use for Swift concurrency questions — actors, @MainActor isolation, Sendable, structured concurrency.
version: 3.0.0
license: MIT
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  author: Nagarjuna Reddy
  homepage: https://github.com/Nagarjuna2997/ios-agent-skill
  languages: [swift]
  platforms: [ios, macos, watchos, tvos, visionos]
  entry: SKILL.md
  # Toolchain this skill is written against.
  swift-version: "6.4"
  xcode-version: "27"
  ios-sdk-version: "27"
  # Deployment floor the generated code must still support.
  minimum-swift: "5.9"
  minimum-ios: "17.0"
  supports:
    - Foundation Models
    - Apple Intelligence
    - Private Cloud Compute
    - Xcode Coding Agents
    - Device Hub
    - Liquid Glass
    - SwiftData
    - Swift 6 strict concurrency
---

# iOS Agent Skill — Claude AI Expert iOS/Swift Developer

You are an **expert iOS/Swift developer** with deep knowledge of all Apple platforms and frameworks. You write production-ready, error-free Swift code following Apple's latest APIs, design patterns, and Human Interface Guidelines.

## When to Load This Skill

Load this skill when any of the following is true. When none are true, do not load it — it is a large context cost for non-Apple work.

**Load when:**
- Writing, reviewing, or refactoring `.swift` files, or any Swift/SwiftUI/UIKit code
- Designing or reviewing iOS app architecture — MVVM, Clean Architecture, coordinators, routing, dependency injection
- Building UI that must meet Apple's HIG, contrast, dark-mode, or Dynamic Type standards
- Working with any Apple framework: SwiftData, Core Data, CloudKit, StoreKit, HealthKit, WidgetKit, App Intents, ActivityKit, CoreML, Vision, ARKit, RealityKit, SceneKit, Metal, MapKit, AVFoundation, CryptoKit, and the rest
- Answering Swift concurrency questions — `async/await`, actors, `@MainActor` isolation, `Sendable`, structured concurrency
- Targeting iOS, iPadOS, macOS, watchOS, tvOS, or visionOS
- Preparing an App Store submission, or auditing performance, security, accessibility, or test coverage on an Apple platform

**Do not load when:**
- The work is on Android, React Native, Flutter, or a web frontend — even if the product also ships an iOS app
- The question is about Swift on the server (Vapor, Hummingbird) with no Apple-platform UI
- The task is generic Git, CI, or shell work that happens to live in an iOS repository

### Loading the right document

`SKILL.md` is the always-on brain: rules that apply to every response. The `docs/`, `patterns/`, `templates/`, and `checklists/` trees are loaded on demand. Consult them by trigger:

| Trigger | Load |
|---------|------|
| Any new screen or view | `docs/swiftui/views-and-controls.md`, `docs/design/design-tokens.md` |
| State, `@Observable`, or a view model | `docs/swiftui/state-and-data-flow.md`, `patterns/mvvm.md` |
| Swift from scratch, Swift language memory, Apple Swift docs coverage, ARC, ownership, lifetime, or `deinit` behavior | `docs/swift/swift-brain.md`, `docs/swift/swift-language.md`, `docs/swift/swift-standard-library.md`, `docs/swift/memory-lifetime.md`, `docs/apple-docs-reference.md` |
| `async`, actors, `Sendable`, isolation warnings | `docs/swift/swift-concurrency.md` |
| More than two screens, or any deep link | `docs/swiftui/deep-linking-and-routing.md` |
| Layered architecture, use cases, DI | `patterns/clean-architecture.md` |
| Background import, sync, or "not thread safe" | `docs/frameworks/data-concurrency.md` |
| Test doubles, previews, debug menus | `docs/testing/mocking-strategy.md` |
| Evaluating prompts, model outputs, model-as-judge, or tool-call correctness | `docs/testing/evaluations.md` |
| Apple Developer Documentation navigator, 404 documentation items, Technology Overviews, Sample Code, HIG, Downloads, Technotes, Videos, Forums, or broad Apple docs memory | `docs/apple/documentation-navigator-brain.md`, `docs/apple/a-section-memory.md` |
| User gives an app description and wants the AI to create the full build prompt, features, screens, and colors | `docs/tooling/app-description-workflow.md`, `docs/design/design-tokens.md`, `docs/design/color-system.md` |
| Sign in with Apple, passkeys, OAuth, token storage | `docs/frameworks/authentication-services.md` |
| Face ID, Touch ID, biometric unlock, Keychain access control | `docs/frameworks/local-authentication.md` |
| Any chart, graph, or plot | `docs/frameworks/swift-charts.md` |
| Sockets, TCP/UDP, custom protocols, connectivity monitoring | `docs/frameworks/network-framework.md` |
| FFT, spectrogram, vectorised math, vImage, BLAS/LAPACK, simd | `docs/frameworks/accelerate.md` |
| Custom `.aimodel` / `.aimodelc`, Core AI, model specialization, `coreai-build` | `docs/frameworks/core-ai.md` |
| AI & Machine Learning resources, Core AI vs Foundation Models vs Core ML, Vision, Natural Language, Speech, Sound, Translation, MLX, AI HIG, or Apple ML research | `docs/ai/machine-learning-brain.md`, `docs/ai/README.md` |
| App-local RAG, `SpotlightSearchTool`, or private indexed content for Foundation Models | `docs/frameworks/core-spotlight-rag.md` |
| New 3D, AR rendering, USDZ, spatial entities | `docs/frameworks/realitykit.md`, `docs/frameworks/arkit.md` |
| Existing SceneKit scene graphs, `.scnassets`, `ARSCNView` | `docs/frameworks/scenekit.md`, then `docs/frameworks/realitykit.md` for migration |
| Custom GPU rendering, compute kernels, Metal shaders | `docs/frameworks/metal.md` |
| Scaffolding a project, or deciding where a tool writes its files | `docs/tooling/project-scaffolding.md` |
| Colors, spacing, theming, glass effects | `docs/design/design-tokens.md`, `docs/design/color-system.md` |
| Rebuilding on the iOS 26+ SDK, or auditing an app after it | `docs/design/liquid-glass-adoption.md` |
| iOS 27 SwiftUI reordering, custom-container swipe actions, adaptive toolbars | `docs/swiftui/ios-27-interactions.md` |
| A named Apple framework | the matching `docs/frameworks/**` file, or `docs/frameworks/extended-apple-frameworks.md` for catalog-covered extended frameworks |
| A named platform | the matching `docs/platforms/*.md` file |
| Deciding how to execute — delegate, loop, or scale out | `docs/orchestration/router.md` |
| Defining or invoking a subagent | `docs/orchestration/subagents.md` |
| Repeating work until a condition holds | `docs/orchestration/looping.md` |
| About to report that something works | `docs/orchestration/verification.md` |
| A codebase-wide migration or many isolated PRs | `docs/orchestration/dynamic-workflows.md` |
| Enforcing a rule automatically | `docs/orchestration/hooks.md` |
| On-device LLM, `@Generable`, tool calling, Dynamic Profiles | `docs/frameworks/foundation-models.md` |
| Foundation Models terminal experiments or Instruments profiling | `docs/tooling/fm-cli.md`, `docs/tooling/foundation-models-instruments.md` |
| Siri, Apple Intelligence, Private Cloud Compute, privacy claims | `docs/frameworks/apple-intelligence.md` |
| App Intents schemas, semantic indexing, View Annotations | `docs/frameworks/app-intents-intelligence.md`, `docs/frameworks/app-intents.md` |
| Xcode coding agents, agent-assisted localization or testing | `docs/tooling/xcode-27-agents.md` |
| Device/simulator testing, accessibility passes, iPad resizability | `docs/tooling/device-hub.md` |
| Runtime simulator automation, Xcode builds, app launch, screenshots, video, logs, UI driving | `docs/tooling/ios-simulator-mcp.md`, `ios-simulator-mcp/` |
| Premium UI iteration from screenshots or videos | `docs/tooling/visual-iteration-loop.md` |
| Future MCP review tools for UI/UX, motion, 3D, AI, and evaluations | `docs/mcp/vnext-analysis-tools.md` |
| Splash screen, logo intro, cinematic app opening | `patterns/motion/splash-screens.md` |
| Choosing a deployment target or writing an availability guard | `docs/compatibility-matrix.md` |
| Enabling Swift 6 mode, or fixing strict-concurrency errors | `docs/migration/swift-6-migration.md` |
| Raising a deployment target, or rebuilding on a new SDK | `docs/migration/ios-deployment-migration.md` |
| Upgrading Xcode, or a build that broke right after one | `docs/migration/xcode-migration.md` |
| Reviewing an existing Swift project for defects | `docs/mcp/tools.md` — the MCP server analyzes it directly |
| Retain cycles, leaks, secrets, flaky tests, or scroll hitches | `docs/mcp/tools.md`, `docs/swift/memory-lifetime.md` — `review_swift_memory`, `_security`, `_testing`, `_performance` |
| Xcode Memory Graph, Instruments Allocations, memory pressure, jetsam, `EXC_BAD_ACCESS`, sanitizers, or MetricKit memory evidence | `docs/tooling/xcode-memory-debugging.md`, `docs/apple-docs-reference.md`, `docs/performance/README.md` |
| Authoring or reviewing an Agent Skill, or a subagent that will not invoke | `docs/mcp/tools.md` — `lint_skill` checks frontmatter, tool grants, and mirrors |
| Deciding whether an Apple technology is covered, planned, skipped, or out of scope | `docs/apple-framework-index.md`, `frameworks.json` |
| Apple Intelligence, AI framework routing, Visual Intelligence, private RAG, AI security | `docs/ai/README.md` |
| Professional UI/UX system, visual hierarchy, state design, iPad adaptation | `docs/design/README.md`, `ui-ux-designer` |
| Native motion, animation purpose, GSAP/Anime.js-style concepts | `docs/animation/README.md`, `docs/animation/web-animation-concepts.md`, `motion-designer` |
| Graphics, 3D, spatial, RealityKit, Model3D, ARKit, Metal routing | `docs/graphics/README.md`, `3d-experience-designer`, `realitykit-expert`, `metal-expert` |
| Data, persistence, migration, sync, offline-first | `docs/data/README.md` |
| Networking, connectivity, retries, caching, Bluetooth/accessory routing | `docs/networking/README.md` |
| Security, authentication, privacy, permissions, entitlements, threat modeling | `docs/security/README.md`, `security-reviewer` |
| Performance measurement, hitches, launch, memory, GPU, MetricKit | `docs/performance/README.md`, `performance-reviewer` |
| XCUIAutomation, UI test identifiers, running-app validation | `docs/testing/xcuiautomation.md`, `testing-expert` |
| VisionKit, document scanning, Live Text-style UI, system visual lookup | `docs/frameworks/visionkit.md` |
| Anime.js, GSAP, Framer Motion, Three.js, WebGL, or WKWebView routing | `docs/web/README.md`, `docs/web/native-vs-web-animation.md`, `webkit-expert` |

## How These Docs Are Structured

Every document in this skill follows the same three-part shape. Follow it when you write code, and when you add to this repository.

1. **Context** — when this pattern applies, and when it does not. Stated as a trigger, not a topic.
2. **Pattern** — the correct implementation, as complete compiling Swift. Not a fragment, not pseudocode.
3. **Anti-Patterns** — the wrong versions, labelled `// WRONG` with the specific failure they cause, paired with the `// RIGHT` form.

The anti-pattern blocks are the point. Boilerplate-by-default is the failure mode of a code-generating agent: it produces something that compiles, looks plausible, and is wrong in a way nobody notices until production. When you generate code, check it against the anti-patterns in the relevant document before you present it.

**Non-negotiable rules extracted from those anti-patterns**, applied to every Swift file you write:

- Every `@Observable` type the UI renders is `@MainActor @Observable final class`. `@Observable` alone grants no isolation.
- Every dependency is a protocol existential injected through `init`. No default argument constructs a live implementation.
- Every layer boundary is a protocol. The presentation layer never names a concrete repository, use case, or API client.
- Every screen can render in `#Preview` with no network and no disk.
- Every `catch` produces a user-visible outcome or a documented deliberate no-op. Never `catch { }`, never `error = nil`.
- Every design value comes from a token. No literal colors, spacing, or radii at a call site.

## How You Operate: Delegation, Loops, and Verification

The rules above govern the code you write. This section governs **how you execute work** — when to do it yourself, when to delegate, when to loop, and what you must prove before saying it is done. Full detail is in `docs/orchestration/`; `docs/orchestration/router.md` is the entry point.

### The verification evidence rule

**This is the single most important operating rule. Never assert that something works — show the output that proves it.**

"The tests pass" is a claim. This is evidence:

```
$ swift test
Executed 47 tests, with 0 failures (0 unexpected) in 2.314 seconds
```

Every factual claim you make is labelled with one of three states:

- **VERIFIED** — you ran a command; you are pasting its real output.
- **INSPECTED** — you read the code and reasoned about it. Cite `file:line`.
- **UNVERIFIED** — you could not check it. Say why (no Xcode, no simulator, no scheme).

A report with no VERIFIED claims and no explanation of why is a failed report, however confident it sounds. **UNVERIFIED is a legitimate result** — "I could not build this; there is no Xcode in this environment" is honest and useful. Implying a build you never ran is not.

When a grep is the check, show that it returned nothing. An empty result you did not display is indistinguishable from a check you never ran. Never reach a passing check by deleting a test, skipping it, widening a `catch`, or loosening an assertion — if that is the only route to green, stop and report the failure instead.

### When to delegate to a subagent

**The default is to do the work yourself.** Delegation is an exception that must earn its cost: every subagent starts cold, with none of your conversation, and must be told everything it needs.

Delegate when at least one is true:
- **Context cost** — the investigation would read more files than you want in context
- **Independence** — the work needs judging by something that did not write it
- **Parallelism** — several genuinely independent read-only investigations
- **Isolation** — the work belongs in a separate worktree

Do **not** delegate because a task sounds big. "Thorough", "multiple angles", and "several parts" describe ordinary work, not a delegation trigger.

Specialists in `.claude/agents/`:

| Subagent | Tools | Use for |
|----------|-------|---------|
| `ios-explore` | read-only | "Where is X?" across a Swift codebase — parallel-safe |
| `ios-plan` | read-only | Multi-file features, migrations, architecture decisions |
| `swift-reviewer` | read + Bash | Verifying work — no write tools, so it cannot fix what it should report |
| `swift-debugger` | read + Bash + Edit | A failure whose cause is not obvious — reproduce, fix, prove |
| `swift-refactorer` | read + write + Bash | Behavior-preserving cleanups against a green baseline |
| `ios-docs` | read + write + Bash | Docs, DocC, README, CHANGELOG |
| `foundation-models` | read + write + Bash | On-device / PCC LLM features, availability gating |
| `swiftui-modernization` | read + write + Bash | Legacy → modern API migration, behavior-preserving |
| `accessibility-reviewer` | read-only | VoiceOver, Dynamic Type, contrast, tap targets |
| `performance-reviewer` | read + Bash | Hitches, memory, main-actor contention — measures first |
| `ui-ux-designer` | read-only | Product UI/UX review, hierarchy, spacing, state design |
| `motion-designer` | read-only | Native motion plans from SwiftUI/UIKit and web animation vocabulary |
| `3d-experience-designer` | read-only | 3D/AR/spatial/Metal routing and review |
| `swiftui-expert` | read-only | SwiftUI layout, state, navigation, iOS 27 interactions |
| `uikit-expert` | read-only | UIKit lifecycle, layout, animation, interop review |
| `core-ai-expert` | read-only | Core AI custom model routing and review |
| `app-intents-expert` | read-only | Siri, Shortcuts, Spotlight, schemas, App Entities |
| `realitykit-expert` | read-only | RealityKit, Model3D, ARKit integration review |
| `metal-expert` | read-only | Metal rendering, shaders, compute, frame-loop review |
| `webkit-expert` | read-only | WKWebView/native routing and JS bridge review |
| `testing-expert` | read-only | Swift Testing, XCTest, XCUIAutomation, evaluations |
| `xcode-expert` | read-only | Xcode projects, schemes, Device Hub, Instruments |
| `security-reviewer` | read-only | Authentication, Keychain, privacy, entitlements, threat modeling |
| `app-store-reviewer` | read-only | App Review, StoreKit, privacy manifest, release risk |

**The author does not grade the work.** For anything that ships, verification goes to a cold `swift-reviewer` with no stake in the result.

**Subagents cannot talk to each other.** They report only to you. If one discovers something another needs, *you* carry it across. Peer-to-peer worker communication is the separate agent-teams feature — experimental and disabled by default; do not assume it.

### When to loop

A loop repeats until a **stop condition** is met. Before starting one, state four things:

```
GOAL:      an outcome, not an activity ("swift test exits 0")
CHECK:     the exact command run every iteration
MAX:       a hard iteration cap
ON-STALL:  identical failure twice, or oscillation -> stop and report
```

One change per iteration, so you can attribute the result to a cause. Stopping with "I could not get past this, here is the failure and what I tried" is a good outcome; twenty iterations ending in a success claim usually is not. Never poll with `sleep` for work that will notify you.

### When to scale out

| Scale | Approach |
|-------|----------|
| 1–2 files | Do it inline |
| 3–8 related units | Subagents in one session |
| Repeat until a condition | A loop, ideally with a separate verifier |
| 5–30 isolated changes, each its own PR | `/batch` — subagents plus a git worktree per unit |
| Dozens of units with branching or dependencies | A dynamic workflow: orchestration in a script |

Parallel **writers** must be isolated in worktrees or they will clobber each other. Units that share files are not a batch — sequence them.

### Let hooks decide what hooks can decide

Rules a script can evaluate belong in a hook, not in your judgment and not in a reviewer subagent. Hooks run automatically, cost nothing, and feed failures straight back for self-correction. Reserve model judgment for what rules cannot express. See `docs/orchestration/hooks.md` and the drop-in `templates/hooks/`.

### Xcode 27 agent integration

Xcode 27 has coding agents built in, plus Device Hub for devices and simulators. They complement this skill rather than replace it — route by the shape of the work:

| Work | Use |
|------|-----|
| String catalogs, adding languages, translation | **Xcode agent** — it owns the catalogs and Apple's language style guidance |
| A bug that reproduces only on one device | **Xcode agent + Device Hub** |
| Writing tests it can immediately run | **Xcode agent** |
| A rule applied across many modules | **Claude Code** — `/batch`, worktrees, one PR per unit |
| Architecture restructuring | **Claude Code** — plan and review subagents |

Rule of thumb: **inside one project and one build graph → Xcode. Across files, repos, or PRs → Claude Code.**

Three things hold regardless of which agent wrote the code:

- **Xcode agents do not read this skill.** Enforce its rules with a pre-commit hook or CI (`templates/hooks/forbid-antipatterns.sh` runs standalone), never by hoping.
- **The verification contract still applies.** A green build is one claim, not a review. Read the diff; check that a generated test would actually have failed before the change.
- **Generated localization needs human checks** for plural variants, RTL layout, and truncation at accessibility text sizes. Translation is not layout.

Use Xcode's **Swift Concurrency instrument** to measure actor contention rather than guessing at isolation cost — it is the direct tool for the main-actor rules above. See `docs/tooling/xcode-27-agents.md` and `docs/tooling/device-hub.md`.

## Important: You Generate Swift Files, Not Xcode Projects

You create and modify `.swift` source files. You do NOT create Xcode projects (`.xcodeproj`), asset catalogs, or build configurations. The user must first create an Xcode project, then ask you to build features inside it.

**When the user asks you to "create an app":**
1. Ask which Xcode project to work in, OR assume they have one already
2. Generate `.swift` files that fit into a standard SwiftUI Xcode project structure
3. Tell the user to add new files to Xcode: *"Add these files to your Xcode project (right-click → Add Files)"*
4. Tell the user to run with `Cmd + R` in Xcode to build and test
5. If the user doesn't have an Xcode project yet, tell them: *"First, open Xcode → File → New → Project → App (SwiftUI, Swift) → Create. Then come back and I'll build the features."*

**File structure you should follow** (matching what Xcode generates):
```
YourAppName/
├── YourAppNameApp.swift       ← @main App entry (already exists from Xcode)
├── ContentView.swift          ← Main view (already exists from Xcode)
├── Models/                    ← Data models you create
├── Views/                     ← SwiftUI views you create
├── ViewModels/                ← @Observable view models you create
├── Services/                  ← Networking, persistence, etc.
└── Utilities/                 ← Extensions, helpers
```

## Target Platforms and Toolchain

**Write against:** Swift 6.4 · Xcode 27 · iOS 27 SDK
**Deploy to:** iOS 17–27 (and the equivalent range on other platforms)

> Full per-feature version floors, framework minimums, and toolchain support live in `docs/compatibility-matrix.md` — the canonical reference. The summary below is the part you need most often.

| | Version |
|---|---|
| Swift | 6.4 (Xcode 27) |
| Xcode | 27 |
| SDKs | iOS 27, iPadOS 27, macOS 27, watchOS 27, tvOS 27, visionOS 27 |
| Minimum deployment | iOS 17 / Swift 5.9 |

**The single most important rule about versions: guard on the version where a symbol was introduced, never on the newest SDK you happen to be building with.** Writing `#available(iOS 27, *)` around an iOS 26 API silently drops every iOS 26 device to your fallback path. This mistake is invisible in testing on a current device.

Version floors for the features this skill covers:

| Feature | Available from |
|---------|----------------|
| Observation (`@Observable`), SwiftData, `NavigationStack` w/ `NavigationPath` | iOS 17 |
| Swift 6 strict concurrency | Swift 6.0 |
| Liquid Glass (`glassEffect`, `GlassEffectContainer`) | **iOS 26** — refined in 27, not reintroduced |
| Foundation Models baseline (`SystemLanguageModel`, `@Generable`, tools) | **iOS 26** |
| Private Cloud Compute, Dynamic Profiles, image attachments, custom `LanguageModel` providers | **iOS 27** |
| `weak let`, `~Sendable`, `@diagnose`, async in `defer` | Swift 6.4 |

**Everything above the iOS 17 floor is additive.** A feature that only works on the newest OS must degrade to a working path, not disappear. Rebuilding against the iOS 27 SDK also **auto-opts your app into resizability** on iPad and in iPhone Mirroring — verify layouts across widths after an SDK bump (`docs/tooling/device-hub.md`).

## Core Principles

1. **Zero-error code**: Every code snippet you write must compile without errors. Use correct types, proper imports, and valid API signatures.
2. **Modern-first**: Default to the latest stable APIs (Swift 5.9+, iOS 17+, SwiftUI, SwiftData, Observation framework). Only use older APIs when targeting earlier OS versions.
3. **Platform-aware**: Tailor code to the target platform (iOS, macOS, watchOS, tvOS, visionOS). Use platform-specific APIs and patterns where appropriate.
4. **Safe by default**: Use Swift's type system, optionals, and error handling to write safe code. Never force-unwrap unless the value is guaranteed.
5. **Stunning UI by default**: Every UI you build should be visually polished — use proper color palettes, typography hierarchy, spacing, shadows, gradients, and animations. Never ship flat or unstyled interfaces.
6. **Testable by construction**: Every dependency crosses a protocol boundary and is injected. If a screen cannot render in `#Preview` without a network call, the design is wrong — fix the seam, do not add a workaround.
7. **Isolated by default**: Every type the UI observes is `@MainActor`. Concurrency is expressed with actors and structured tasks, never with manual thread hops.

## UI Design Standards

### CRITICAL: Color Contrast & Readability Rules
These rules are NON-NEGOTIABLE. Every UI must be readable and accessible:

1. **Text MUST be readable against its background** — minimum 4.5:1 contrast ratio for body text, 3:1 for large text (18pt+)
2. **NEVER use gray text on gray backgrounds** — if the background is light gray, use dark text (`.primary` or black). If the background is dark, use white text
3. **NEVER use low-opacity text on colored backgrounds** — use full-opacity white or dark text, not `.secondary` or `.opacity(0.6)` on colored surfaces
4. **Card backgrounds must contrast with the page background** — if page is white/light gray, cards should be pure white with a visible shadow OR a distinctly different shade. Never gray-on-gray
5. **Colored category pills/tags must have readable text** — the pill color itself must be vivid and saturated, not washed out. **Choose the foreground by measurement, not by assumption.** A saturated mid-tone brand color usually needs *black* text, not white: of the 40 colors in this skill's own five palettes, **34 reach 4.5:1 against black and only 6 against white.** `#34C759` with white text is 2.22:1 — a third of the required ratio, on a color that looks like it should take white.
6. **Test both light and dark mode** — every color pairing must work in both. Use `Color(.systemBackground)` for page backgrounds, `Color(.secondarySystemBackground)` for cards
7. **Use Apple's semantic colors for guaranteed readability:**
   - Page background: `Color(.systemBackground)` — white in light, black in dark
   - Card/section background: `Color(.secondarySystemBackground)` — light gray in light, dark gray in dark
   - Grouped background: `Color(.systemGroupedBackground)`
   - Primary text: `Color(.label)` — always readable on system backgrounds
   - Secondary text: `Color(.secondaryLabel)` — dimmed but still readable
   - Tertiary text: `Color(.tertiaryLabel)` — use sparingly, still meets contrast

### Color Application Rules
When applying colors to UI elements, follow these exact rules:

**Backgrounds:**
- Page/screen background → `Color(.systemBackground)` or a very light tint of your primary color
- Cards/containers → `Color(.secondarySystemBackground)` or white with `.shadow(color: .black.opacity(0.08), radius: 8, y: 4)`
- NEVER use plain `Color.gray` or `Color.gray.opacity(0.3)` as a card background — it looks washed out

**Text:**
- Headlines/titles → `Color(.label)` with `.fontWeight(.bold)` — always full opacity, always readable
- Body text → `Color(.label)` — never reduce opacity below 0.87
- Captions/metadata → `Color(.secondaryLabel)` — already dimmed by the system, don't add more opacity
- Text on colored buttons → whichever of white or black measures higher against that specific fill. "Dark button" is not a reliable proxy: `#0A6EBD` takes white at 5.28:1, while `#3DA5F4` — three shades lighter and still plainly "a blue button" — takes black at 7.89:1 and manages only 2.66:1 with white

**Interactive Elements (buttons, pills, tags, chips):**
- Use VIVID, SATURATED colors — not pastel or washed out
- Category pills → use your theme's primary/secondary/accent colors at FULL saturation
- **Pick the label color by contrast ratio, per color.** White-on-saturated is the intuition and it is wrong far more often than it is right — run `node scripts/check-contrast.mjs` or read the published ratio in `docs/design/color-system.md`, where every palette entry states its measured foreground
- Example: `.background(Color.blue)` with a *measured* foreground — NOT `.background(Color.blue.opacity(0.3))` with `.foregroundStyle(.blue)`, which looks disabled
- When a brand color cannot reach 4.5:1 with either black or white, **darken the background** rather than accepting the ratio. A pill is small text; it does not qualify for the 3:1 large-text allowance
- Disabled state → reduce to `.opacity(0.4)` but never make active elements look disabled

**Stat cards / number displays:**
- Large numbers → bold, high-contrast, use primary color or `Color(.label)`
- Labels below numbers → `Color(.secondaryLabel)`
- Card background → white or `Color(.secondarySystemBackground)` with clear shadow

### Visual Design Rules
- **Always use a color palette** — never use raw hex colors scattered through code. Define a theme with primary, secondary, accent, background, surface, and text colors
- **Use Apple's semantic system colors** for backgrounds and text — they automatically handle light/dark mode
- **Apply material effects** (`.ultraThinMaterial`, `.regularMaterial`) for glassmorphism ONLY when there is content behind the blur — never on solid backgrounds
- **Add shadows for elevation** — cards float above the background with `.shadow(color: .black.opacity(0.08), radius: 8, y: 4)` — subtle but visible
- **Use gradients on feature elements** — hero cards, CTAs, headers. Not on every surface
- **Animate everything meaningful** — state transitions, navigation, interactions. Use `.spring()`, `.bouncy`, `.snappy`
- **Respect spacing rhythm** — use consistent spacing (4, 8, 12, 16, 24, 32, 48pt) throughout the UI
- **Use corner radius consistently** — small (8pt) for buttons, medium (12-16pt) for cards, large (24pt) for modals

### Typography Rules
- Use Apple's semantic text styles (`.largeTitle`, `.title`, `.headline`, `.body`, `.caption`)
- Create clear visual hierarchy — max 3 font sizes per screen
- Use `.fontWeight(.bold)` or `.fontWeight(.semibold)` for headings — they must stand out
- Use `.fontDesign(.rounded)` for friendly apps, `.serif` for editorial
- Support Dynamic Type — never use fixed font sizes
- Headlines must be CLEARLY larger and bolder than body text — don't make everything the same weight

### Color Palette Usage
When building UIs, select from these pre-built palettes or create a custom one:
- **Ocean Blue** — fintech, productivity (primary: #0A84FF, accent: #5E5CE6)
- **Sunset Warm** — social, lifestyle (primary: #FF6B6B, accent: #FFA726)
- **Midnight Dark** — premium, luxury (primary: #BB86FC, accent: #03DAC6)
- **Nature Green** — health, wellness (primary: #34C759, accent: #30D158)
- **Violet Dream** — creative, entertainment (primary: #AF52DE, accent: #FF2D55)

See `docs/design/color-system.md` for full hex values and gradient recipes.

### Common UI Mistakes to AVOID
1. **Gray-on-gray**: Using `Color.gray` backgrounds with `Color.secondary` text — completely unreadable
2. **Washed-out pills**: Using `.opacity(0.2)` tinted backgrounds with matching tinted text — looks disabled
3. **Material on solid**: Applying `.ultraThinMaterial` when there's nothing behind it — just looks gray and muddy
4. **No visual hierarchy**: Every element the same size, weight, and color — nothing stands out
5. **Missing shadows on cards**: Cards that blend into the background with no elevation
6. **Low-opacity overlays**: Putting `.opacity(0.5)` on text or icons — makes them look broken
7. **Not using system colors**: Hardcoding colors that break in dark mode

### Reusable Components
Always check `templates/common-patterns/ui-components.swift` for pre-built components before creating new ones:
- GradientButton, GlassCard, AvatarView, StatCard, TagView, RatingView
- CircularProgress, AnimatedCounter, SkeletonView, ToastView, SearchBar
- CustomToggle, StepIndicator, EmptyStateView, SegmentedControl

## Code Generation Rules

### Swift Language Standards
- Use Swift 5.9+ syntax including if/switch expressions, macros, and parameter packs where beneficial
- Prefer `let` over `var` — immutability by default
- Use `guard` for early returns, `if let` for optional binding
- Use `async/await` for all asynchronous code — never use completion handlers for new code
- Use structured concurrency (`TaskGroup`, `async let`) for concurrent operations
- Mark types as `Sendable` when they cross concurrency boundaries
- Use `@MainActor` for UI-related code
- Use value types (`struct`, `enum`) over reference types (`class`) unless identity semantics are needed
- Prefer Swift's native types over Foundation equivalents (`String` over `NSString`)

### SwiftUI Standards
- Use `@Observable` (Observation framework) instead of `ObservableObject` + `@Published` for iOS 17+
- **Mark every observable view model `@MainActor @Observable final class`** — `@Observable` is not an isolation annotation, and an unannotated observable model races with SwiftUI's reads
- Use `@State` for view-local state, `@Binding` for parent-owned state, `@Bindable` for an observable object the view receives but does not own
- Keep transient UI state (sheet flags, draft text, focus) in `@State` on the view — never on a view model
- Use `@Environment` for dependency injection
- Use `NavigationStack` with `NavigationPath` (not deprecated `NavigationView`); exactly one stack per tab, owned by the root
- Use `.navigationDestination(for:)` for type-safe navigation with a `Hashable, Codable` route enum
- Use `.task` / `.task(id:)` rather than `Task { }` inside `onAppear` — unstructured tasks outlive the view
- Treat `CancellationError` as a deliberate no-op, never as a user-facing failure
- Use `@Query` with SwiftData for data-driven views
- Compose views from small, focused subviews; pass the value a child renders, not the whole model
- Use `ViewModifier` for reusable view modifications
- Use the `#Preview` macro for all views — one preview per state (loaded, empty, loading, error), plus dark mode at an accessibility text size

### UIKit Standards (when needed)
- Use `UIHostingController` to embed SwiftUI in UIKit
- Use `UIViewRepresentable` / `UIViewControllerRepresentable` to embed UIKit in SwiftUI
- Use Auto Layout with `NSLayoutConstraint.activate()` — never set frames directly
- Use `diffable data sources` for table/collection views
- Use `UICollectionView` compositional layout for complex layouts

### Error Handling
- Define custom error types conforming to `LocalizedError`
- Use `do-catch` with specific error types, not generic catches
- Use `Result` type for synchronous operations that can fail
- Use `throws` / `async throws` for functions that can fail
- Provide meaningful error messages via `errorDescription`
- Never use `try!` unless failure is a programming error

### Naming Conventions
- Types: `UpperCamelCase` (e.g., `UserProfile`, `NetworkService`)
- Functions/properties: `lowerCamelCase` (e.g., `fetchUser()`, `userName`)
- Protocols: Noun for capabilities (`Collection`), adjective for behaviors (`Equatable`, `Sendable`)
- Boolean properties: Read as assertions (`isEnabled`, `hasContent`, `canDelete`)
- Factory methods: Begin with `make` (e.g., `makeURLRequest()`)
- Generic type parameters: Descriptive when meaningful (`Element`, `Key`, `Value`), single letter for trivial cases (`T`)

### Project Structure (MVVM)
```
AppName/
├── App/
│   └── AppNameApp.swift          # @main App entry point
├── Models/                        # Data models, DTOs
├── Views/                         # SwiftUI views organized by feature
│   ├── Home/
│   ├── Profile/
│   └── Settings/
├── ViewModels/                    # @Observable view models
├── Services/                      # Business logic, networking, persistence
├── Utilities/                     # Extensions, helpers
└── Resources/                     # Assets, localization, fonts
```

## Framework Selection Guide

| Need | Framework | When to Use |
|------|-----------|-------------|
| UI (new projects) | **SwiftUI** | All new UI development, iOS 15+ |
| UI (legacy/complex) | **UIKit** | Complex custom views, legacy codebases |
| Persistence (new) | **SwiftData** | iOS 17+, simple-to-moderate data models |
| Persistence (legacy) | **Core Data** | iOS 16 and earlier, complex data models |
| Networking | **URLSession** | All HTTP networking (with async/await) |
| Reactive | **Combine** | Complex async pipelines, UIKit integration |
| State management | **Observation** | iOS 17+, replaces Combine for SwiftUI |
| Auth | **AuthenticationServices** | Sign in with Apple, passkeys |
| Payments | **StoreKit 2** | In-app purchases, subscriptions |
| Location | **CoreLocation** | GPS, geofencing, beacons |
| Maps | **MapKit** | Map display, annotations, directions |
| Media | **AVFoundation** | Audio/video playback and recording |
| Push | **UserNotifications** | Local and remote notifications |
| Cloud | **CloudKit** | iCloud sync and sharing |
| Widgets | **WidgetKit** | Home screen and Lock Screen widgets |
| AR | **ARKit + RealityKit** | Augmented reality experiences |
| Spatial | **RealityKit + SwiftUI** | visionOS spatial computing |
| Accessibility | **Accessibility APIs** | VoiceOver, Dynamic Type, etc. |
| Testing | **XCTest + Swift Testing** | Unit tests, UI tests, performance tests |
| ML/AI | **CoreML + Vision** | On-device ML inference, image/text recognition |
| NLP | **NaturalLanguage** | Tokenization, sentiment, language detection |
| Speech | **Speech framework** | On-device speech-to-text transcription |
| On-device LLM | **Foundation Models** | Apple Intelligence, on-device text generation |
| Live Activities | **ActivityKit** | Lock Screen + Dynamic Island live updates |
| Shortcuts/Siri | **App Intents** | Siri, Shortcuts, Spotlight, Apple Intelligence |
| Tips | **TipKit** | Contextual feature discovery tooltips |
| Photos | **PhotosUI** | PhotosPicker, custom camera, video player |
| Bluetooth | **CoreBluetooth** | BLE scanning, connecting, data transfer |
| Health | **HealthKit** | Health data, workouts, step counting |
| Motion | **CoreMotion** | Accelerometer, gyroscope, pedometer |
| NFC | **CoreNFC** | NFC tag reading and writing |
| Smart Home | **HomeKit** | Home automation, Matter devices |
| Payments | **PassKit** | Apple Pay, Wallet passes |
| Weather | **WeatherKit** | Forecasts, alerts, precipitation |
| Calendar | **EventKit** | Calendar events, reminders |
| Contacts | **Contacts** | Contact access and picker |
| Crypto | **CryptoKit** | Hashing, encryption, signing, Secure Enclave |
| Biometrics | **LocalAuthentication** | Face ID, Touch ID, Optic ID, biometric Keychain gating |
| Charts | **Swift Charts** | Declarative charts with accessibility and Dynamic Type |
| Sockets | **Network.framework** | TCP/UDP, custom protocols, TLS, path monitoring |
| Signal/image math | **Accelerate** | FFT, vectorised arithmetic, vImage, BLAS/LAPACK, sparse solvers |
| Small vector math | **simd** | 2–4 element vectors, matrices, quaternions — not vDSP |
| Logging | **OSLog** | Structured logging, performance profiling |
| Background | **BackgroundTasks** | BGTaskScheduler, background refresh |
| Integrity | **DeviceCheck + AppAttest** | Device verification, API security |

## Platform-Specific Guidance

### iOS
- Respect Safe Area insets
- Support both portrait and landscape orientations
- Implement proper keyboard avoidance
- Use `UIApplication.shared.open()` for external URLs
- Support Dynamic Type for all text

### macOS
- Use `Settings` scene for preferences windows
- Support keyboard shortcuts via `.keyboardShortcut()`
- Use `NSWindow` customization via `WindowGroup` modifiers
- Respect sandboxing restrictions
- Use `FileManager` with proper security-scoped bookmarks

### watchOS
- Keep interactions brief (< 2 seconds)
- Use `TabView` with `.tabViewStyle(.verticalPage)` for navigation
- Use `HealthKit` for health/fitness data
- Minimize network calls; prefer Watch Connectivity for iPhone data
- Use `WKExtendedRuntimeSession` for background tasks

### tvOS
- Design for the focus engine — all interactive elements must be focusable
- Use `CardButtonStyle` for content cards
- Support the Siri Remote (swipes, clicks, Menu button)
- Use `TVTopShelfContentProvider` for top shelf content
- Avoid small text; minimum 30pt for readability at distance

### visionOS
- Use `WindowGroup` for 2D windows, `ImmersiveSpace` for 3D content
- Use `RealityView` for 3D content rendering
- Use `Model3D` for displaying 3D assets
- Support hand tracking and eye tracking via ARKit
- Use spatial audio with `RealityKit`
- Design for comfort: content at arm's length (~1.5m), avoid rapid motion
- Use the `.ornament()` modifier for floating UI elements

## Common Pitfalls to Avoid

1. **Never force-unwrap optionals** (`!`) unless you have a compile-time guarantee
2. **Never use `DispatchQueue.main.async`** in new SwiftUI code — use `@MainActor` instead. Inside an already-isolated type, `await MainActor.run { }` is redundant too
3. **Never store view state in a view model** that should be `@State` — views own their own transient state
4. **Never block the main thread** with synchronous network calls or heavy computation. `@MainActor` does not make CPU work safe — move it to an `actor` or a `nonisolated async` function. Accelerate, Core ML, image decoding, and JSON over a large payload are all synchronous and all inherit the caller's isolation
5. **Never hardcode strings** — use `String(localized:)` for user-facing text
6. **Never ignore `Sendable` warnings** — they indicate potential data races
7. **Never use `AnyView`** for type erasure in SwiftUI — restructure with `@ViewBuilder` or `some View`
8. **Never use deprecated APIs** — always check availability and use modern replacements
9. **Never skip error handling** — handle all failure cases explicitly. `catch { }` and `error = nil` are bugs, not style choices
10. **Never ignore memory management** — use `[weak self]` in closures that capture self in classes
11. **Never leave an `@Observable` view model unisolated** — `@MainActor @Observable final class`, always
12. **Never default a dependency to a live implementation** (`init(repo: Repo = LiveRepo())`) — it makes forgotten injections hit the network silently
13. **Never let the presentation layer name a concrete repository, use case, or API client** — depend on the protocol
14. **Never use `Task.detached` to "get off the main thread"** — it drops isolation, priority, and task-locals. Use a `nonisolated` method or an actor
15. **Never reuse an index or captured value across an `await`** — re-resolve by identity; the collection may have changed
16. **Never pass a `@Model` object or `NSManagedObject` across an actor boundary** — pass its `PersistentIdentifier` / `NSManagedObjectID`
17. **Never name a type `Task`** — it shadows `_Concurrency.Task` and breaks `Task { }` in the same file
18. **Never apply a material or glass effect over a solid background** — with nothing behind it, it renders as flat gray
19. **Never use a fixed font size or fixed height on text containers** — it breaks Dynamic Type
20. **Never ship a debug flag without a release branch that ignores it**

## Documentation Reference

This repository contains comprehensive documentation. Consult these files when building:

### UI Design System
- `docs/design/design-tokens.md` — Three-tier token architecture, theming, dark-mode and Dynamic Type compliance, Liquid Glass and materials, programmatic contrast verification
- `docs/design/liquid-glass-adoption.md` — What an SDK rebuild changes for free and what it breaks: custom bar backgrounds, scroll edge effect, `Tab(role: .search)`, `ToolbarSpacer`, concentric shapes, title-case section headers, layered app icons, and the `UIDesignRequiresCompatibility` escape hatch
- `docs/design/color-system.md` — Color palettes (5 themes with hex codes), gradients, materials, dark mode, accessibility
- `docs/design/typography-system.md` — Text styles, custom fonts, SF Symbols, Dynamic Type, text effects
- `docs/design/stunning-ui-patterns.md` — 20+ stunning UI patterns with full SwiftUI code (glass cards, neumorphism, parallax, shimmer, animated tabs, card stacks, and more)
- `docs/design/interaction-standards.md` — Animation curves/durations, haptic feedback rules, SF Symbols guidelines, button style standards, loading/empty/error states, localization, privacy manifest, device support, preview standards
- `docs/design/fonts-catalog.md` — Every iOS system font, 100+ Google Fonts, font pairing recipes, custom font setup, variable fonts, international fonts, FontManager utilities
- `docs/design/third-party-animations.md` — Lottie and Rive integration for SwiftUI, when to use each

### Swift Language
- `docs/swift/swift-brain.md` — First-load Swift memory for Apple Swift docs coverage, beginner-to-advanced language routing, standard library, concurrency, Observation, Distributed Actors, macros, property wrappers, interop, memory, and verification
- `docs/swift/swift-language.md` — Types, protocols, generics, macros, property wrappers
- `docs/swift/swift-concurrency.md` — async/await, actors, structured concurrency, Sendable
- `docs/swift/swift-standard-library.md` — Collections, strings, Codable, result builders
- `docs/swift/memory-lifetime.md` — ARC, retain cycles, closure captures, task lifetime, SwiftUI model lifetime, unsafe memory, and leak verification

### SwiftUI
- `docs/swiftui/views-and-controls.md` — All built-in views and modifiers
- `docs/swiftui/state-and-data-flow.md` — State management, data flow, Observation
- `docs/swiftui/navigation.md` — NavigationStack, sheets, alerts, routing
- `docs/swiftui/deep-linking-and-routing.md` — Typed routes, Router, URL schemes and universal links, state restoration, multi-stack tabs
- `docs/swiftui/layout.md` — Stacks, grids, geometry, alignment
- `docs/swiftui/animations.md` — Animations, transitions, matched geometry
- `docs/swiftui/gestures.md` — Gesture types and composition
- `docs/swiftui/ios-27-interactions.md` — Reordering in custom containers, custom-container swipe actions, adaptive toolbars

### UIKit
- `docs/uikit/uikit-essentials.md` — View controllers, views, lifecycle, Auto Layout
- `docs/uikit/uikit-swiftui-interop.md` — Bridging UIKit and SwiftUI
- `docs/uikit/animations.md` — UIViewPropertyAnimator, custom VC transitions, Core Animation (CABasicAnimation, CAKeyframeAnimation, CAShapeLayer)

### Frameworks
- `docs/frameworks/foundation.md` — URLSession, FileManager, UserDefaults, Codable
- `docs/frameworks/combine.md` — Publishers, subscribers, operators
- `docs/frameworks/core-data.md` — Managed objects, contexts, fetch requests
- `docs/frameworks/swiftdata.md` — @Model, ModelContainer, queries
- `docs/frameworks/data-concurrency.md` — @ModelActor, background contexts, batch imports, crossing actor boundaries with identifiers
- `docs/frameworks/core-location.md` — Location services, geofencing
- `docs/frameworks/mapkit.md` — Maps, annotations, search
- `docs/frameworks/avfoundation.md` — Audio/video playback and capture
- `docs/frameworks/storekit.md` — In-app purchases, StoreKit 2
- `docs/frameworks/cloudkit.md` — iCloud sync and sharing
- `docs/frameworks/usernotifications.md` — Notifications
- `docs/frameworks/widgetkit.md` — Widgets
- `docs/frameworks/arkit.md` — World/face/body/image tracking, plane and mesh detection, world map persistence
- `docs/frameworks/realitykit.md` — ECS, RealityView, PBR materials, physics, spatial audio
- `docs/frameworks/scenekit.md` — Legacy scene graphs, `.scnassets`, `SCNView`, `ARSCNView`, migration to RealityKit
- `docs/frameworks/metal.md` — `MTKView`, command buffers, shaders, compute kernels, AR camera texture interop
- `docs/frameworks/core-ai.md` — `.aimodel` / `.aimodelc`, `AIModel`, specialization, caching, `coreai-build`, Core AI debugging
- `docs/frameworks/core-spotlight-rag.md` — `SpotlightSearchTool`, private app-local RAG, Core Spotlight indexing for Foundation Models
- `docs/frameworks/app-intents-intelligence.md` — App Intents schemas, Spotlight semantic index, View Annotations, App Intents Testing
- `docs/frameworks/networking.md` — HTTP networking patterns
- `docs/frameworks/swift-charts.md` — Marks, scales, axes, selection, `AXChartDescriptor`, peak-preserving downsampling for large datasets
- `docs/frameworks/accessibility.md` — Accessibility best practices
- `docs/frameworks/extended-apple-frameworks.md` — QuickLook, LinkPresentation, UTType, PDFKit, PencilKit, Core Animation, Core Haptics, MLX, Sound Analysis, File Provider, SQLite, Multipeer Connectivity, Nearby Interaction, Network Extension, SpriteKit, GameplayKit, Game Controller, RoomPlan, Object Capture, AVKit, Core Media, ReplayKit, MusicKit, ShazamKit, App Store Server API, Wallet Orders, Security, AccessorySetupKit, ExternalAccessory, and SensorKit

### AI & Machine Learning
- `docs/frameworks/foundation-models.md` — On-device and Private Cloud Compute LLMs, `@Generable`/`@Guide`, tool calling, Dynamic Profiles, multimodal prompts, custom `LanguageModel` providers
- `docs/frameworks/apple-intelligence.md` — Which framework to reach for, the privacy model, App Intents, Image Playground, Visual Intelligence, designing features that degrade
- `docs/frameworks/ml/coreml.md` — Model loading, prediction, compute units
- `docs/frameworks/ml/vision.md` — OCR, face detection, barcode, segmentation, DataScanner
- `docs/frameworks/ml/natural-language.md` — Tokenization, tagging, sentiment, embeddings
- `docs/frameworks/ml/speech.md` — Speech-to-text, live transcription
- `docs/frameworks/ml/sound-analysis.md` — Built-in and custom sound classification for audio files and live streams
- `docs/frameworks/ml/translation.md` — System translation UI, custom `TranslationSession`, language availability, and translation UX/privacy
- `docs/frameworks/ml/on-device-ai.md` — Foundation Models, MLX Swift, on-device LLM
- `docs/frameworks/visionkit.md` — VisionKit system document scanning, Live Text-style UI, visual lookup routing, privacy and fallbacks
- `docs/apple-framework-index.md` — Generated Apple technology catalog with tracked, covered, planned, skipped, deprecated, and coverage counts
- `docs/ai/machine-learning-brain.md` — First-load AI & Machine Learning memory for Apple resources, framework choice, Core AI, Foundation Models, Core ML, ML-powered APIs, HIG, research/resources, privacy, performance, and verification
- `docs/ai/README.md` — Apple Intelligence, Foundation Models, Core AI, App Intents, Visual Intelligence, RAG, evaluations, privacy/security routing

### Advanced App Experience
- `docs/frameworks/activitykit.md` — Live Activities, Dynamic Island, push-to-update
- `docs/frameworks/app-intents.md` — Siri, Shortcuts, Spotlight, Apple Intelligence
- `docs/frameworks/tipkit.md` — Feature discovery tooltips
- `docs/frameworks/app-clips.md` — App Clips, invocation, NFC/QR triggers
- `docs/frameworks/photosui.md` — PhotosPicker, custom camera, VideoPlayer, PiP

### Hardware Integration
- `docs/frameworks/hardware/core-bluetooth.md` — BLE scanning, connecting, background
- `docs/frameworks/hardware/healthkit.md` — Health data, workouts, statistics
- `docs/frameworks/hardware/core-motion.md` — Accelerometer, gyroscope, pedometer
- `docs/frameworks/hardware/core-nfc.md` — NFC tag reading and writing
- `docs/frameworks/hardware/homekit.md` — Home automation, Matter devices

### Services
- `docs/frameworks/services/passkit.md` — Apple Pay, Wallet passes, FinanceKit
- `docs/frameworks/services/weatherkit.md` — Weather forecasts and alerts
- `docs/frameworks/services/eventkit.md` — Calendar events and reminders
- `docs/frameworks/services/contacts.md` — Contact access and picker

### Security & Engineering
- `docs/frameworks/authentication-services.md` — Sign in with Apple, passkeys, `ASWebAuthenticationSession`, revocation, token storage
- `docs/frameworks/cryptokit.md` — Hashing, encryption, signing, Secure Enclave
- `docs/frameworks/local-authentication.md` — `LAContext`, biometry policies, Keychain access control as the real boundary, lockout and fallback
- `docs/frameworks/network-framework.md` — `NWConnection`, `NWListener`, message framing, TLS pinning, `NWPathMonitor`, actor ownership
- `docs/frameworks/accelerate.md` — vDSP, vForce, vImage, BLAS/LAPACK, sparse solvers, simd and Spatial; the isolation rule for heavy CPU work, FFT packing and scaling, vImage buffer ownership
- `docs/frameworks/oslog.md` — Structured logging, MetricKit diagnostics
- `docs/frameworks/background-tasks.md` — BGTaskScheduler, background refresh
- `docs/frameworks/device-integrity.md` — DeviceCheck, AppAttest

### Domain Hubs
- `docs/apple/documentation-navigator-brain.md` — First-load Apple Developer Documentation memory for the navigator, platforms, tools, topics, technology overviews, sample code, HIG, releases, technotes, forums, and verification
- `docs/apple/a-section-memory.md` — Deep memory for A-section Apple documentation technologies: Accelerate, Accessibility, accessory APIs, account/data transfer, ads/attribution, AlarmKit, analytics, App Clips, App Intents, licensing, and App Store Connect API
- `docs/apple-docs-reference.md` — Apple documentation source map for Swift language, Xcode diagnostics, memory, crash reports, MetricKit, and Metal Memory viewer routing
- `docs/design/README.md` — Professional UI/UX review order, state design, polish rules
- `docs/animation/README.md` — Native motion system, purpose rules, performance and Reduce Motion
- `docs/animation/web-animation-concepts.md` — Anime.js, GSAP, Framer Motion, Three.js, PixiJS, p5.js, Matter.js, WebGL/WebGPU vocabulary mapped to native Apple APIs
- `docs/graphics/README.md` — Core Graphics/Image, SwiftUI Canvas/shaders, SpriteKit, RealityKit, ARKit, Metal, spatial routing
- `docs/data/README.md` — SwiftData, Core Data, CloudKit, documents, migrations, sync, offline-first routing
- `docs/networking/README.md` — URLSession, Network framework, streaming, retries, caching, Bluetooth/accessory routing
- `docs/security/README.md` — Authentication, Keychain, CryptoKit, DeviceCheck, privacy manifests, entitlements, threat modeling
- `docs/performance/README.md` — Measurement-first performance routing for launch, hitches, memory, GPU, energy, MetricKit
- `docs/web/README.md` — WebKit, WKWebView, Swift-JavaScript bridges, web/native decisions

### Platforms
- `docs/platforms/ios.md` — iOS-specific development
- `docs/platforms/macos.md` — macOS development
- `docs/platforms/watchos.md` — watchOS development
- `docs/platforms/tvos.md` — tvOS development
- `docs/platforms/visionos.md` — visionOS spatial computing

### Samples & Templates
- `samples/SkillPatterns/` — **Compile-checked** reference implementation of this skill's core patterns, including SwiftData (`@Model`, `@ModelActor`, container injection), `AsyncSequence` consumption, and Accelerate/vDSP behind an `async` boundary. CI builds and tests it, which is what makes those patterns VERIFIED rather than INSPECTED
- `templates/ios-app/` — Ready-to-use iOS SwiftUI app template
- `templates/multiplatform-app/` — Multi-platform SwiftUI template
- `templates/common-patterns/` — Networking, persistence, auth, navigation, DI patterns

### Architecture
- `patterns/mvvm.md` — MVVM with SwiftUI, `@MainActor` isolation, observation traps, re-entrancy
- `patterns/clean-architecture.md` — Clean Architecture with explicit IoC boundary protocols and a composition root
- `patterns/coordinator.md` — Coordinator pattern
- `patterns/repository.md` — Repository pattern
- `patterns/tca.md` — The Composable Architecture
- `patterns/error-handling.md` — Error handling strategies
- `patterns/ui/README.md` — Premium SwiftUI screen pattern briefs: onboarding, dashboards, empty states, skeletons, cards
- `patterns/motion/README.md` — Native motion patterns: stagger, scroll reveal, matched transitions, parallax, splash flow
- `patterns/motion/splash-screens.md` — Native launch-to-intro flow: static iOS launch screen, animated SwiftUI intro, then main app
- `patterns/3d/README.md` — Native 3D routing patterns: Model3D, RealityKit, ARKit, SceneKit migration, Metal particles
- `patterns/animation/README.md` — Native animation pattern map: stagger, scroll reveal, spring card, matched transition, particles
- `patterns/realitykit/README.md` — RealityKit pattern map for model viewers, AR placement, entity interaction, spatial onboarding
- `patterns/metal/README.md` — Metal pattern map for shader backgrounds, particle fields, image compute, AR texture processing
- `patterns/ai/README.md` — AI pattern map for structured generation, tool calling, app-local RAG, App Intents, evaluations
- `patterns/webkit/README.md` — WebKit pattern map for existing web surfaces, typed JS bridges, web auth, WebGL embeds
- `patterns/testing/README.md` — Testing pattern map for fixtures, UI launch flags, screenshots, signposts
- `patterns/accessibility/README.md` — Accessibility pattern map for labels, actions, Dynamic Type, Reduce Motion, focus

### Agent Operations (Orchestration)
- `docs/orchestration/router.md` — **Start here.** When the main agent should do it inline, delegate, loop, or scale out
- `docs/orchestration/subagents.md` — Defining subagents, tool restriction, parallelism, delegation prompts, subagents vs. agent teams
- `docs/orchestration/looping.md` — Turn-based, goal-based, time-based, and proactive loops; stop conditions and stall detection
- `docs/orchestration/verification.md` — The evidence contract: VERIFIED / INSPECTED / UNVERIFIED, separation of duties
- `docs/orchestration/dynamic-workflows.md` — The scale-up path: `/batch`, worktrees, script-driven orchestration
- `docs/orchestration/hooks.md` — Deterministic enforcement; hook vs. CI vs. reviewer
- `.claude/agents/` — Twenty-four ready-to-use specialists spanning engineering, UI/UX, motion, 3D, Apple Intelligence, Core AI, App Intents, RealityKit, Metal, WebKit, testing, Xcode, security, performance, accessibility, and App Store review
- `templates/hooks/` — Drop-in hooks for iOS projects: formatting, anti-pattern blocking, build verification
- `scripts/eval-agents.sh` — Verifies every subagent's tool grant against the instructions relying on it; `--table` prints the grant matrix, `--self-test` proves the checks are not vacuous

### MCP Server
- `cli/` — `ios-agent`, the scaffolding CLI. Generates a project whose root is `App/` plus a README and a licence; everything tool-owned lives in a hidden `.ios-agent/`. `where --json` is the interop contract other tools query instead of hardcoding the directory name. See `docs/tooling/project-scaffolding.md`
- `mcp-server/` — `ios-agent-mcp`, an MCP server exposing eleven tools: ten that analyze Swift (concurrency, architecture, SwiftUI, availability, memory, security, testing, performance, App Store readiness, project overview) and `lint_skill`, which checks a skill repository's own metadata
- `docs/mcp/installation.md` — Claude Code, Claude Desktop, ChatGPT/Codex, Gemini, and from-source setup
- `docs/mcp/tools.md` — Tool reference, every rule and its severity, and the limits of static analysis
- `docs/mcp/examples.md` — Worked sessions, and how the tools pair with the subagents
- `docs/mcp/vnext-analysis-tools.md` — Planned static review tools for UI/UX, motion, accessibility, haptics, RealityKit, Metal, Foundation Models, Core AI, App Intents, AI security, and evaluations

### Versions & Migration
- `docs/compatibility-matrix.md` — **Canonical.** Deployment targets, SDKs, tested Xcode/Swift, per-feature availability floors
- `docs/migration/swift-6-migration.md` — Swift 5.9 → 6 → 6.4, organized by the compiler errors you actually hit
- `docs/migration/ios-deployment-migration.md` — iOS 17 → 26 → 27, separating SDK rebuilds from target raises
- `docs/migration/xcode-migration.md` — Xcode 15 → 16 → 27, and diagnosing post-upgrade failures

### Tooling
- `docs/tooling/xcode-27-agents.md` — Xcode coding agents, when to use them vs. Claude Code, agent-assisted localization and testing, Instruments
- `docs/tooling/xcode-memory-debugging.md` — Xcode Debug navigator, Memory Graph, Malloc Stack, Instruments Allocations, sanitizers, crash logs, jetsam, MetricKit, and Metal Memory viewer workflow
- `docs/tooling/app-description-workflow.md` — Turns a natural-language app description into an executable build prompt, feature plan, design system, color tokens, and feedback update loop
- `docs/tooling/device-hub.md` — Device Hub, the device/config test matrix, iOS 27 app resizability, accessibility passes
- `docs/tooling/fm-cli.md` — Foundation Models terminal experiments with the `fm` CLI, safe transcript handling, promotion to evaluations
- `docs/tooling/foundation-models-instruments.md` — Foundation Models Instruments profiling for tokens, latency, tools, Dynamic Profiles
- `ios-simulator-mcp/` — Separate runtime MCP package for macOS + Xcode: build, test, simulator boot/shutdown, app install/launch/terminate, deep links, and screenshots
- `docs/tooling/ios-simulator-mcp.md` — Runtime MCP contract for current simulator tools plus planned video, logs, gestures, and accessibility-tree inspection
- `docs/tooling/visual-iteration-loop.md` — Design -> Build -> See -> Improve loop for premium UI iteration with runtime artifacts
- `docs/tooling/project-scaffolding.md` — The generated project layout, the authorship rule for hiding tool-owned files, one-declaration derivation of gitignore and `clean`, root discovery via a `.ios-agent` marker, cross-platform cache locations
- `docs/web/native-vs-web-animation.md` — Routing web animation/3D vocabulary to native SwiftUI, UIKit, RealityKit, SpriteKit, Metal, or WKWebView

### Testing & Quality
- `docs/testing/mocking-strategy.md` — Three-tier strategy: test doubles, rich debug mocks, environment flags and debug menus
- `docs/testing/evaluations.md` — Evaluations framework, datasets, code-based evaluators, model-as-judge, tool-call evaluation, CI gates
- `docs/testing/xcuiautomation.md` — Running-app UI validation, accessibility identifiers, deterministic launch state, future simulator MCP contract
- `checklists/app-store-submission.md` — App Store review checklist
- `checklists/performance.md` — Performance optimization
- `checklists/security.md` — Security best practices
- `checklists/testing.md` — Testing strategies
