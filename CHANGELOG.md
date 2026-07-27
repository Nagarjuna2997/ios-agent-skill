# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added -- 1.3.0 Apple Intelligence and the iOS 27 toolchain

Content verified against Apple's current developer documentation (Xcode 27 beta, Swift 6.4, WWDC26 sessions) rather than written from model memory -- the API surface below post-dates the authoring model's training data.

- **`docs/frameworks/foundation-models.md`** -- the framework reference: `LanguageModelSession` lifecycle, `@Generable`/`@Guide` structured output, `PartiallyGenerated` streaming, the `Tool` protocol, built-in Vision-backed system tools, model selection (`SystemLanguageModel` vs. `PrivateCloudComputeLanguageModel`), the open `LanguageModel`/`LanguageModelExecutor` provider protocols, Dynamic Profiles with baton-pass and phone-a-friend orchestration, multimodal `Attachment` prompts, context/token/usage APIs, concurrency rules, error handling, the two-layer availability model, and testing that asserts shape rather than exact output.
- **`docs/frameworks/apple-intelligence.md`** -- which framework to reach for (App Intents vs. Foundation Models is the most common mistake), the privacy model for on-device / Private Cloud Compute / third-party models and what may honestly be claimed in UI, App Intents, Image Playground, Visual Intelligence, and designing features that degrade when no model is available.
- **`docs/tooling/xcode-27-agents.md`** -- Xcode coding agents, routing between an in-Xcode agent and Claude Code, agent-assisted localization (and what still needs a human: plurals, RTL, truncation), agent-assisted testing, the Swift Concurrency instrument for actor contention, and keeping non-Claude agents bound by this skill's rules via hooks.
- **`docs/tooling/device-hub.md`** -- Device Hub, the device/configuration test matrix, **iOS 27 app resizability** (rebuilding against the SDK auto-opts you in), accessibility passes, and reproducing device-specific bugs on their exact configuration.
- **Four new subagents** -- `foundation-models` (availability gating and graceful degradation), `swiftui-modernization` (behavior-preserving legacy migration with an ordered migration table), `accessibility-reviewer` (read-only VoiceOver/Dynamic Type/contrast audit with greps), `performance-reviewer` (measures before recommending; never optimizes on suspicion). Ten subagents total.

### Changed -- 1.3.0
- `SKILL.md` frontmatter: added `swift-version: 6.4`, `xcode-version: 27`, `ios-sdk-version: 27`, and a `supports` list (Foundation Models, Apple Intelligence, Private Cloud Compute, Xcode Coding Agents, Device Hub, Liquid Glass, SwiftData, Swift 6 strict concurrency). Deployment floor stays `minimum-ios: 17.0` / `minimum-swift: 5.9` -- the toolchain version and the deployment floor are different things and are now named separately. Version 1.3.0.
- `SKILL.md`: new **Target Platforms and Toolchain** section with a per-feature version-floor table, and the rule that availability guards use the version where a symbol was *introduced*, not the newest SDK.
- `SKILL.md`: new **Xcode 27 agent integration** subsection under How You Operate -- routing between Xcode agents and Claude Code, and the three rules that hold regardless of which agent wrote the code. This propagates to `AGENTS.md` and the other 23 mirrors, which is the only way to add a section to `AGENTS.md` (it is generated).
- `docs/swift/swift-concurrency.md`: Swift 6.4 ergonomics (`weak let`, `~Sendable`, unhandled-task-error warnings, async in `defer`, `@diagnose` for ratcheting strictness), a 16-point **Actor Isolation Review Checklist**, and a Foundation Models thread-safety section (single-flight sessions, off-main-actor tools, cancellation in streaming loops).
- `docs/swiftui/state-and-data-flow.md`: states explicitly that Observation is the default for new code and why `ObservableObject` is legacy.
- `docs/design/design-tokens.md`: Liquid Glass noted as refined in iOS 27, with the availability guard deliberately **kept at iOS 26** -- bumping it to 27 would drop every iOS 26 device to the fallback for no reason.
- `docs/orchestration/router.md`: routes for Foundation Models, accessibility, performance, and modernization work.
- `.claude/agents/ios-plan.md`: a Version compatibility section -- Swift 6.4 / Xcode 27 / iOS 27 SDK baseline, per-symbol availability floors, and the rule that raising a deployment target is a product decision.
- `.claude/agents/swift-reviewer.md`: review checks for Swift 6.4 isolation (discarded task errors, `@unchecked Sendable` that `weak let`/`~Sendable` would solve, unexplained `@diagnose(ignore,)`), availability correctness, and Foundation Models / Apple Intelligence usage including privacy-claim accuracy.
- README: a **Supported Platforms** section and a What's New in 1.3 section; tooling and AI documentation index entries; the subagent table extended to ten.

### Added -- 1.2.0 agent-operations layer

The repository taught the main agent what to write but never how to operate. This release adds the orchestration layer: how to split work, verify it, and scale it out. Because `AGENTS.md` and the other 23 rule files are generated from `SKILL.md`, the operating model lands in all of them.

- **`docs/orchestration/`** -- six documents forming the agent-ops layer:
  - `router.md` -- the entry point. One table deciding inline vs. delegate vs. loop vs. `/batch` vs. dynamic workflow, plus standard sequences (feature, bug, drive-a-red-suite-green, codebase-wide change) and what the main agent stays accountable for after delegating.
  - `subagents.md` -- why delegate (context preservation, independent verification, parallelism), frontmatter reference, why the `description` is the routing interface, tool restriction as a correctness feature, writing delegation prompts for a cold agent, and the distinction between subagents (hub-and-spoke, report only to the main agent) and agent teams (peer-to-peer, experimental, disabled by default).
  - `looping.md` -- turn-based, goal-based, time-based, and proactive patterns; the GOAL / CHECK / MAX / ON-STALL contract every loop declares up front; stall detection (identical failure, oscillation, growing blast radius); and the rule against reaching a stop condition by weakening the check.
  - `verification.md` -- the evidence contract. Every claim labelled VERIFIED, INSPECTED, or UNVERIFIED; what counts as evidence and what does not; iOS-specific verification commands; separation of duties so the author never grades the work; and the three enforcement layers ordered cheapest-first.
  - `dynamic-workflows.md` -- the scale ladder, when `/batch` fits (5-30 isolated PRs, worktree per unit) and when it does not (shared files, ordering constraints, exploratory work), script-driven orchestration, failure policies, and cold-start cost control.
  - `hooks.md` -- hook vs. CI vs. reviewer subagent, lifecycle events, the exit-code contract, and design rules including graceful degradation.
- **`.claude/agents/`** -- six subagent definitions with restricted tool sets and explicit return formats: `ios-explore` (read-only, parallel-safe search), `ios-plan` (read-only planner), `swift-reviewer` (read + Bash, deliberately no write tools), `swift-debugger` (reproduce -> isolate -> fix -> prove, with a Swift failure-pattern table), `swift-refactorer` (behavior-preserving, requires a green baseline), and `ios-docs` (enforces the doc structure and mirror sync). Names are prefixed `ios-`/`swift-` so they cannot shadow Claude Code's built-in subagents.
- **Hooks in this repository** -- `.claude/settings.json` now wires three hooks implemented in `scripts/hooks/`: `guard-generated-files.sh` (PreToolUse -- denies edits to the 24 generated mirrors and points at `SKILL.md`), `sync-mirrors-on-edit.sh` (PostToolUse -- regenerates mirrors whenever `SKILL.md` changes), and `verify-repo.sh` (Stop -- runs the CI checks before a turn can end).
- **`templates/hooks/`** -- drop-in hooks for real iOS projects: `swift-format.sh` (SwiftFormat + SwiftLint autocorrect), `forbid-antipatterns.sh` (blocks the `SKILL.md` anti-patterns at write time with line numbers and the fix; exempts test/mock/preview files from app-code-only rules), `build-check.sh` (Stop-time build and test verification that reports UNVERIFIED rather than implying a build it could not run), plus `settings.json.example` and installation notes.
- **`SKILL.md` -- "How You Operate" section** -- the verification evidence rule, when to delegate and when not to, the subagent roster, the loop contract, the scale-up table, and the instruction to let hooks decide what hooks can decide. This propagates to `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, and the other 21 mirrors.
- CI (`docs-consistency.yml`) and the Stop hook now also validate subagent frontmatter (`name`, `description`, kebab-case naming).

### Changed
- `SKILL.md` version bumped to 1.2.0; `skill.json` follows.
- `SKILL.md` document-routing table extended with the six orchestration triggers.
- README gained a "What's New in 1.2" section and an Agent Operations documentation index covering the orchestration docs, the six subagents, and the three hook templates.

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
