# Apple Documentation Navigator Brain

## Context

Load this when the user asks for Apple Developer Documentation memory, the documentation navigator, "404 items", broad Apple platform coverage, technology overviews, sample code, release notes, HIG, downloads, technotes, forums, or a framework name that is not yet covered by a dedicated local guide.

This is memory, not a source index. It tells the agent how to think when it sees Apple documentation categories and navigator entries.

## First rule

Apple documentation is bigger than any one app project. Do not pretend every symbol page is loaded. Build memory in layers:

1. Navigator brain: top-level categories and routing.
2. Alphabet brain: framework families and obscure APIs by name.
3. Framework brain: when to choose, how to implement, privacy/security, performance, verification.
4. Symbol brain: only when a specific API or compiler error requires it.

When a topic is not yet deep in this repo, route it through this navigator brain and report the gap honestly.

## Top-level Apple documentation memory

The Apple documentation landing page is not only API reference. It is a working map:

- Documentation: API references, articles, framework guides, symbols, and conceptual pages.
- Sample code: complete projects that show setup, lifecycle, entitlement, and integration details.
- Technology overviews: product-level maps for broad specialties such as app design, games, tools, distribution, AI, security, web, health, and maps.
- Updates and release notes: what changed in OS, SDK, Xcode, Swift, frameworks, App Store, and tools.
- Human Interface Guidelines: user experience, platform conventions, generative AI guidance, accessibility, input, layout, terminology, and trust.
- Downloads: SDKs, beta OS builds, Xcode, tools, profiles, and resources.
- Technotes: in-depth engineering notes for recurring platform problems.
- Videos: WWDC and developer-event intent, architecture, and migration guidance.
- Forums: clarification and edge-case discussion, useful but weaker than docs.
- Feedback Assistant: bug reports and documentation feedback.

Memory rule: API reference tells what exists. HIG tells what should feel right. Sample code tells how pieces fit together. Release notes tell what changed. Forums explain edge cases but do not override documentation.

## Platform memory

| Platform | Agent default |
|---|---|
| iOS | Primary mobile app target. Focus on SwiftUI/UIKit, privacy prompts, background limits, App Store review, device testing. |
| iPadOS | iOS plus resizable windows, keyboard/trackpad, multitasking, pencil, drag/drop, document workflows. |
| macOS | AppKit/SwiftUI, sandboxing, file access, menus, windows, notarization, Apple silicon performance. |
| tvOS | Focus, remote input, media, games, large-screen layout, limited text entry. |
| visionOS | Spatial UI, RealityKit, immersion, hand/eye input, comfort, privacy. |
| watchOS | Glanceable UI, complications, health, sensors, background limits, paired-device behavior. |

## Tool memory

| Tool | Agent default |
|---|---|
| Swift | Language, standard library, concurrency, memory, package code. Load `docs/swift/swift-brain.md`. |
| SwiftUI | Declarative UI, state, layout, navigation, animation, platform adaptation. |
| Swift Playground | Learning/prototyping, not production build pipeline. |
| TestFlight | Beta distribution, tester feedback, crash collection, staged validation. |
| Xcode | Project, build, debug, Instruments, simulator/device, signing, assets, localization. |
| Xcode Cloud | CI, signing, workflows, TestFlight/App Store delivery. |
| SF Symbols | System iconography, variable rendering, accessibility, localization-aware symbols. |

## Topic routing memory

| Topic | Route |
|---|---|
| Accessibility | `docs/frameworks/accessibility.md`, design review, UI tests, VoiceOver. |
| Accessories | Accessory brain: AccessorySetupKit, Accessory Notifications, Accessory Live Activities, ExternalAccessory, Core Bluetooth, MFi. |
| App Extension | Extension lifecycle, memory/time limits, host app separation, entitlements. |
| App Store | StoreKit, App Store Server API, review checklist, privacy, commerce. |
| Audio & Video | AVFoundation, AVKit, Core Media, ReplayKit, Speech, Sound Analysis. |
| Augmented Reality | ARKit, RealityKit, SceneKit migration, RoomPlan, Object Capture. |
| Design | HIG, typography, color, layout, interaction, animation, platform feel. |
| Distribution | App Store Connect, signing, provisioning, TestFlight, Xcode Cloud, notarization. |
| Education | Classroom, student privacy, accessibility, account/institution flows. |
| Fonts | SF Symbols, system fonts, Dynamic Type, custom fonts, localization. |
| Games | SpriteKit, GameplayKit, Game Controller, Metal, Game Center, StoreKit. |
| Health & Fitness | HealthKit, sensors, privacy, consent, on-device analysis. |
| In-App Purchase | StoreKit, App Store Server API, receipts/transactions, subscription state. |
| Localization | String Catalogs, Translation, locale formatting, RTL, pluralization. |
| Maps & Location | MapKit, Core Location, privacy, background location, routing. |
| Machine Learning & AI | `docs/ai/machine-learning-brain.md`. |
| Open Source | Swift packages, MLX, model/tool repos, license review. |
| Security | Keychain, CryptoKit, Security framework, passkeys, LocalAuthentication, App Attest. |
| Safari & Web | WebKit, Safari extensions, passkeys, universal links, web/native decisions. |

## Documentation workflow memory

When a user pastes an Apple documentation navigator or asks for "everything":

1. Extract the visible topics and framework names.
2. Group them by product domain, not alphabet only.
3. For each item, write memory in this shape:
   - what it is for
   - when to choose it
   - when not to choose it
   - required setup or entitlement
   - implementation default
   - privacy/security risk
   - performance/lifecycle risk
   - verification checklist
4. Add a small source anchor only at the bottom if needed; never make links the main content.
5. Wire new memory into `SKILL.md`, `README.md`, and mirrors.
6. Run catalog/doc checks before pushing.

## Navigator anti-patterns

- Treating a framework name as implementation guidance.
- Creating a link list and calling it memory.
- Routing all unfamiliar Apple APIs to SwiftUI.
- Ignoring entitlements, App Review limits, region limits, or account constraints.
- Using beta APIs without calling out instability.
- Using forum posts as stronger evidence than documentation.
- Treating sample code architecture as mandatory for every app.
- Claiming 404-item completion when only top-level routing is implemented.

## Verification memory

Report broad Apple documentation work like this:

```text
Status: VERIFIED / INSPECTED / UNVERIFIED
Navigator area: platform / tool / topic / framework family
Memory layer: navigator / alphabet / framework / symbol
Local files loaded: docs/apple/...
Coverage added: names and categories
Evidence: repo checks, catalog checks, build/tests if code changed
Remaining gap: next alphabet section or framework family not deepened yet
```
