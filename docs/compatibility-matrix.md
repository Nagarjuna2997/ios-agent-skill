# Compatibility Matrix

**The canonical version reference for this skill.** Everything else links here
rather than restating versions, so there is exactly one place to update.

**Load this when:** choosing a deployment target, adding an `@available` guard,
deciding whether an API is safe to use, or bumping a toolchain.

---

## 1. At a glance

| | Version |
|---|---|
| **Written against** | Swift 6.4 · Xcode 27 · iOS 27 SDK |
| **Minimum deployment target** | iOS 17.0 · macOS 14 · watchOS 10 · tvOS 17 · visionOS 2 |
| **Minimum Swift** | 5.9 |
| **Language mode** | Swift 6 (strict concurrency) recommended; Swift 5 mode supported |

Three different things, routinely confused:

| Term | Means | Here |
|------|-------|------|
| **Toolchain version** | The Xcode/Swift you compile with | Xcode 27 / Swift 6.4 |
| **SDK version** | The API surface you compile against | iOS 27 SDK |
| **Deployment target** | The oldest OS your app runs on | iOS 17 |

You compile with the newest toolchain, against the newest SDK, and still run on
old devices. Newer SDK APIs require an availability guard; they do **not**
require raising the deployment target.

---

## 2. Toolchain support

| Xcode | Swift | SDKs | Status here |
|-------|-------|------|-------------|
| 27 | 6.4 | iOS/iPadOS/macOS/watchOS/tvOS/visionOS 27 | **Primary.** Beta — content tied to it is provisional |
| 26 | 6.2 | iOS 26 | Supported. Liquid Glass and Foundation Models baseline |
| 16 | 6.0–6.1 | iOS 18 | Supported. Swift 6 language mode available |
| 15 | 5.9–5.10 | iOS 17 | Minimum. Observation, SwiftData, `NavigationStack` |
| ≤ 14 | ≤ 5.8 | ≤ iOS 16 | **Not supported.** No Observation, no SwiftData |

Xcode 15 is the floor because this skill's core patterns — `@Observable`,
SwiftData, `#Preview`, `.navigationDestination` — do not exist before it.

---

## 3. Feature availability

**The rule: guard on the version where a symbol was introduced, never on the
newest SDK you happen to be building with.** Writing `#available(iOS 27, *)`
around an iOS 26 API silently drops every iOS 26 device to your fallback — a
regression that is invisible when testing on a current device.

### iOS 17 — the baseline (no guard needed)

| Feature | Notes |
|---------|-------|
| Observation (`@Observable`, `@Bindable`) | Replaces `ObservableObject` |
| SwiftData (`@Model`, `@Query`) | |
| `NavigationStack` + `NavigationPath` | `NavigationView` deprecated |
| `.navigationDestination(for:)` | |
| `#Preview` macro | |
| `ContentUnavailableView` | |
| `.onChange(of:) { old, new }` | Two-parameter form |
| `.scrollTargetBehavior`, `PhaseAnimator` | |
| SwiftUI/UIKit animation interop | |

### iOS 18

| Feature | Guard |
|---------|-------|
| `MeshGradient` | `@available(iOS 18, *)` |
| Zoom navigation transitions | `@available(iOS 18, *)` |
| `TextRenderer` | `@available(iOS 18, *)` |
| New `Tab` API for `TabView` | `@available(iOS 18, *)` |
| Control Center widgets | `@available(iOS 18, *)` |
| SwiftData History API, `@Index` | `@available(iOS 18, *)` |

### iOS 26

| Feature | Guard |
|---------|-------|
| **Liquid Glass** — `glassEffect`, `GlassEffectContainer`, `glassEffectID`, `.buttonStyle(.glass)` | `@available(iOS 26, *)` |
| **Foundation Models baseline** — `SystemLanguageModel`, `LanguageModelSession`, `@Generable`, `@Guide`, `Tool` | `@available(iOS 26, *)` |
| `model.contextSize`, `tokenCount(for:)` | iOS 26.4+ |

> Liquid Glass is **refined** in iOS 27, not reintroduced. The guard stays at 26.

### iOS 27

| Feature | Guard |
|---------|-------|
| `PrivateCloudComputeLanguageModel` | `@available(iOS 27, *)` |
| Dynamic Profiles (`DynamicProfile`, `Profile`, `DynamicInstructions`) | `@available(iOS 27, *)` |
| Image attachments in prompts (`Attachment`) | `@available(iOS 27, *)` |
| Custom `LanguageModel` / `LanguageModelExecutor` providers | `@available(iOS 27, *)` |
| Built-in system tools (`OCRTool`, `BarcodeReaderTool`) | `@available(iOS 27, *)` |
| **App resizability** on iPad and iPhone Mirroring | **No guard — automatic on SDK rebuild** |

App resizability is the one to watch: it is not opt-in. Rebuilding against the
iOS 27 SDK enables it, so any layout assuming a fixed width breaks without a
line of your code changing. See `tooling/device-hub.md`.

### Swift language features

| Feature | Swift |
|---------|-------|
| Macros, `if`/`switch` expressions, parameter packs | 5.9 |
| Strict concurrency, `Sendable` enforcement, data-race safety | 6.0 |
| `@concurrent`, `nonisolated(nonsending)` | 6.2 |
| `weak let`, `~Sendable`, `@diagnose`, `async` in `defer`, unhandled-task-error warning | 6.4 |

Swift language features follow the **compiler**, not the OS — no `@available`
guard needed, but they do raise your minimum Xcode.

---

## 4. Framework floors

| Framework | Minimum | Notes |
|-----------|---------|-------|
| SwiftUI | iOS 13 | This skill targets iOS 17+ patterns |
| Observation | iOS 17 | |
| SwiftData | iOS 17 | Core Data for anything earlier |
| Foundation Models | **iOS 26** | Plus a runtime availability check |
| App Intents | iOS 16 | Schemas and testing framework are newer |
| WidgetKit | iOS 14 | Live Activities iOS 16.1+, Control widgets iOS 18+ |
| ActivityKit | iOS 16.1 | |
| TipKit | iOS 17 | |
| StoreKit 2 | iOS 15 | |
| WeatherKit | iOS 16 | |
| RealityKit | iOS 13 | visionOS is its own surface |

---

## 5. Runtime checks are not optional

An `@available` guard proves the symbol **exists**. It does not prove the
feature **works on this device right now**. Foundation Models needs both:

```swift
// Compile-time: does the symbol exist?
@available(iOS 26.0, *)
func makeSession() -> LanguageModelSession? {
    // Runtime: is the model actually usable here?
    guard case .available = SystemLanguageModel.default.availability else {
        return nil          // ineligible device, disabled, or unsupported region
    }
    return LanguageModelSession(instructions: "…")
}
```

Anything gated on hardware, region, or a user setting needs the second check.
Shipping only the first produces a button that fails on tap.

---

## 6. Choosing a deployment target

| Target | Reach | You give up |
|--------|-------|-------------|
| **iOS 17** | Widest this skill supports | iOS 18+ APIs need guards |
| **iOS 18** | Drops iOS 17 devices | Little — most patterns are iOS 17 |
| **iOS 26** | Recent devices only | Nothing in this skill |

**Raising a deployment target is a product decision, not a technical one.** It
removes users. The right default is to keep the target low and guard newer APIs
— which is what every example in this repo does.

Everything above your floor is **additive**: a newer-OS feature must degrade to a
working path, never disappear.

---

## 7. This repo's own CI

| Job | Runs on | Checks |
|-----|---------|--------|
| `consistency` | ubuntu-latest | Mirror sync, frontmatter, doc references, subagent definitions, hook behavior, markdown links, code-fence languages |
| `sample-package` | macos-latest | Builds and tests `samples/SkillPatterns` — the compile check behind the skill's patterns |

The sample package is scoped to **stable APIs only** (iOS 17 / macOS 14) so it
compiles on standard runners. Beta-SDK features are documented but not
compile-checked — that is why sections tied to Xcode 27 carry a verification
note.

---

## Quick reference

```swift
// Baseline — no guard.
@Observable @MainActor final class ViewModel { }

// iOS 26 — Liquid Glass, Foundation Models baseline.
if #available(iOS 26.0, *) { view.glassEffect() }

// iOS 27 — PCC, Dynamic Profiles, attachments, custom providers.
if #available(iOS 27.0, *) { LanguageModelSession(profile: MyProfile()) }

// Runtime check, in addition to the compile-time guard.
guard case .available = SystemLanguageModel.default.availability else { return }
```

| Migrating? | See |
|-----------|-----|
| Swift 5.9 → 6 → 6.4 | `migration/swift-6-migration.md` |
| iOS 17 → 26 → 27 | `migration/ios-deployment-migration.md` |
| Xcode 15 → 16 → 27 | `migration/xcode-migration.md` |
