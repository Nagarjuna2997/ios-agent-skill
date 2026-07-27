# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added -- 1.1.0 skill revision
- `docs/design/design-tokens.md` -- three-tier token architecture (primitive -> semantic -> component), swappable themes via `@Environment`, dark-mode elevation rules, a Dynamic Type compliance checklist, materials vs. Liquid Glass (`glassEffect`, `GlassEffectContainer`) with an availability fallback, and a WCAG contrast helper you can assert in tests.
- `docs/swiftui/deep-linking-and-routing.md` -- typed `Route` enums, a `@MainActor` `Router`, deep-link parsing split into a pure testable parser plus an applier, universal links via `onContinueUserActivity`, queuing links that arrive before the app is ready, `NavigationPath` state restoration through `@SceneStorage`, and per-tab stacks.
- `docs/frameworks/data-concurrency.md` -- the "pass the identifier, not the object" rule for SwiftData and Core Data, `@ModelActor` background importers with batched saves, `performBackgroundTask`, batch delete/update with change merging, and in-memory stores for tests.
- `docs/testing/mocking-strategy.md` -- the three-tier strategy: Tier 1 test doubles (stub/fake/spy/mock, and why a reconfigured double must be a reference type), Tier 2 rich `#if DEBUG` mocks with one preview per screen state, Tier 3 `AppConfiguration` launch flags and a QA debug menu, each with a release branch that ignores it.
- `scripts/sync-mirrors.sh` -- regenerates all 24 agent rule files from `SKILL.md`, with a `--check` mode.
- `.github/workflows/docs-consistency.yml` -- CI enforcing mirror sync, `SKILL.md` frontmatter validity, existence of every referenced documentation path, and absence of placeholder stubs in Swift templates.

### Changed
- `SKILL.md` frontmatter expanded to the full Agent Skills schema (`name`, `description`, `version`, `license`, `allowed-tools`, `metadata`), with a trigger-rich description so agents load it on the right tasks.
- `SKILL.md` gained a **When to Load This Skill** section (including when *not* to load it and a trigger-to-document routing table) and a **How These Docs Are Structured** section defining the Context -> Pattern -> Anti-Patterns convention plus six non-negotiable code rules.
- `patterns/clean-architecture.md` now declares explicit inbound (use-case) and outbound (repository) boundary protocols. The presentation layer depends on `any …UseCaseProtocol` existentials only, previews run with no network, the `DependencyContainer.shared` singleton is replaced by an `AppDependencies` protocol injected through `@Environment`, and an IoC review checklist with verification greps was added.
- `patterns/mvvm.md` rewritten around `@MainActor @Observable final class` view models: isolation rationale, re-entrancy and stale-index guidance, `Task` vs `Task.detached`, child-view observation traps, and reference-type test doubles.
- `docs/swiftui/state-and-data-flow.md` gained sections on `@Observable` isolation, five child-view observation traps, async boundaries in views, a property-wrapper decision checklist, and an anti-pattern summary.
- `docs/swift/swift-concurrency.md` gained an "Isolation in SwiftUI Code" section covering escaping the main actor, four isolation-leak shapes, `MainActor.assumeIsolated`, `nonisolated(unsafe)`, re-entrancy, and Sendable across the SwiftUI boundary.
- `CONTRIBUTING.md` mirror-sync instructions now point at the script instead of a hand-rolled `cp` loop that would have copied the YAML frontmatter into all 24 mirrors.

### Fixed
- `patterns/clean-architecture.md`: `catch { self.error = nil }` silently discarded every non-`DomainError` failure.
- `patterns/mvvm.md`: the sample model was named `Task`, shadowing `_Concurrency.Task` so that `Task { … }` in the same file did not compile; renamed to `TodoItem`.
- `patterns/mvvm.md`: the `toggleCompletion` revert test mutated a struct double *after* injecting it, so the view model never saw `shouldFail` and the test asserted nothing.
- `patterns/mvvm.md`: optimistic updates wrote back through an array index captured before an `await`.
- Removed `.github/workflows/ruby.yml`, a leftover GitHub starter workflow that ran `bundle exec rake` against a repository with no Ruby in it.

### Added
- `LICENSE` (MIT) -- previously referenced in README but absent from the repo.
- `docs/frameworks/arkit.md` -- complete ARKit guide covering world/face/body/image/object/geo tracking, plane and mesh detection, RealityKit integration, world map persistence, and lifecycle handling.
- `docs/frameworks/realitykit.md` -- complete RealityKit guide covering ECS, `RealityView`, `ARView`, PBR materials, animation, physics, gestures, audio, and platform differences across iOS/macOS/visionOS.
- `CONTRIBUTING.md` -- contributor workflow, house style, and instructions for keeping the 25+ rule files in sync.
- `CODE_OF_CONDUCT.md` -- Contributor Covenant 2.1.
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`.
- `.github/PULL_REQUEST_TEMPLATE.md`.
- `templates/ios-app/Tests/AppTests.swift` -- Swift Testing example (modern, iOS 18+).
- `templates/ios-app/Tests/AppXCTests.swift` -- XCTest example (works back to iOS 13).
- README references for the new framework docs and tests template.

## [1.0.0] -- 2026-04

### Added
- Xcode project-first workflow in README and `SKILL.md` -- generators produce `.swift` files, not `.xcodeproj`.
- Color contrast and readability rules promoted to non-negotiable status in the agent brain.
- AI setup guide (`docs/ai-setup-guide.md`) covering 28 AI tools across macOS and Windows.
- Universal AI-agent compatibility -- `.cursorrules`, `.clinerules`, `.continuerules`, `.kilocoderules`, `.roorules`, `.rules`, `.windsurfrules`, plus rule files under `.aiassistant/`, `.amazonq/`, `.augment/`, `.continue/`, `.cursor/`, `.junie/`, `.kilocode/`, `.roo/`, `.tabnine/`, `.trae/`, `.windsurf/`, and `.github/copilot-instructions.md`.
- Codex compatibility: `SKILL.md`, `skill.json`, `install.sh`.
- iOS 18 animations, UIKit animation system, third-party Lottie/Rive integration guides.
- 26 new framework docs: AI/ML (`coreml`, `vision`, `natural-language`, `speech`, `on-device-ai`), hardware (`core-bluetooth`, `core-motion`, `core-nfc`, `healthkit`, `homekit`), services (`contacts`, `eventkit`, `passkit`, `weatherkit`), security (`cryptokit`, `device-integrity`), and the TCA architecture pattern.
- Ultimate font catalog (`docs/design/fonts-catalog.md`) -- every iOS font, 100+ Google Fonts, 15 pairings, variable fonts, international families.
- Interaction standards, button styles, `ViewState` pattern, and full coverage across the four checklists (App Store submission, performance, security, testing).
- Complete UI design system -- color palettes, typography, stunning UI patterns.
- Initial commit: agent brain, MVVM/Clean Architecture/Coordinator/Repository/Error Handling patterns, iOS-app and multiplatform-app templates, GitHub Actions + Fastfile CI/CD templates.

[Unreleased]: https://github.com/Nagarjuna2997/ios-agent-skill/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Nagarjuna2997/ios-agent-skill/releases/tag/v1.0.0
