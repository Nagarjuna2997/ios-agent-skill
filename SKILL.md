---
name: ios-agent-skill
description: Expert iOS/Swift developer behavior for AI coding agents. Use when writing, reviewing, or refactoring Swift, SwiftUI, UIKit, or SwiftData code; when designing iOS app architecture (MVVM, Clean Architecture, coordinators, routing); when building UI that must meet Apple's Human Interface Guidelines, contrast, dark-mode, and Dynamic Type standards; when working with any Apple framework (SwiftData, Core Data, CloudKit, StoreKit, HealthKit, WidgetKit, App Intents, CoreML, Vision, ARKit, RealityKit, SceneKit, Metal, and 30+ more); or when targeting iOS, macOS, watchOS, tvOS, or visionOS. Also use for Swift concurrency questions — actors, @MainActor isolation, Sendable, structured concurrency.
version: "3.5.0"
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

# Apple app engineering

Use the current project and the user's requested feature as the scope. Build working Swift implementations with explicit errors, injected dependencies, preview data and meaningful verification.

## Retrieve locally before expanding context

1. Search the local library for the feature or API. With MCP use `search_local_references`; with a checkout run `node scripts/query-library.mjs search "feature"`. Restrict to source or guides when helpful.
2. Read only a matching source file or relevant guide section. MCP provides `get_reference_outline` and `read_local_reference`; the offline command provides `outline` and `read`. Follow `nextOffset` when you need the complete file.
3. Prefer canonical source and tests in `samples/` and `templates/`. Keep dependencies and availability requirements. Documentation can contain labelled anti-patterns and incomplete examples; do not blindly concatenate its code fences.
4. Use official Apple links for attribution and changed-API checks. The library is a dated local reference, not Apple's private framework source. A catalog entry does not prove a working implementation exists.

Do not load the whole inventory, all technology topic maps, or the detailed engineering guide by default. Character limits bound tool output; actual token use depends on the model.

## Implementation rules

- UI-observed models are isolated to `@MainActor`; use `@Observable` where supported.
- Inject services through protocols and initializers. Keep concrete service construction at the composition root. Previews must work without network or disk.
- Show loading, empty, success and error outcomes. Catch errors deliberately and preserve cancellation semantics.
- Respect deployment availability, privacy permissions and entitlements. Use the installed SDK to validate generated APIs.
- Use shared design tokens, semantic colors and Dynamic Type. Account for VoiceOver, Reduce Motion and iPad layouts.
- Compile and run appropriate tests before claiming code works. Separate inspected source, successful build/test evidence, and unverified runtime/device behavior.
- Generated apps belong to their users. Do not put this repository maintainer’s name, username, branding, signing team or bundle identifier into generated app UI, source headers or ownership metadata. Use user-provided identity or neutral placeholders. Preserve legally required third-party notices separately.
- Follow the user's publication scope. Do not create paid services or publish an app without authorization.

## Load by task

| Task | Local reference |
|---|---|
| Find/reuse full source while keeping context small | `docs/tooling/offline-source-library.md` |
| Turn an idea into screens, features and a build | `docs/tooling/idea-to-app.md`, `docs/tooling/app-description-workflow.md` |
| Search an Apple technology | MCP `search_apple_technologies`, then compact `get_apple_technology`; otherwise search `docs/apple/all-technologies.md` |
| SDK updates or release notes | `docs/apple/updates-and-release-notes.md` |
| Layered app icon | `docs/design/icon-composer.md`; preserve editable layers and verify native `.icon` with Icon Composer |
| Swift concurrency or observation | `docs/swift/swift-concurrency.md`, `docs/swiftui/state-and-data-flow.md` |
| Architecture and dependencies | `patterns/clean-architecture.md`, `patterns/mvvm.md` |
| Design, colors and typography | `docs/design/README.md`, `docs/design/design-tokens.md` |
| Compile-tested implementations | `samples/SkillPatterns/`, `samples/AppleRecipes/` and their READMEs |
| Run an app, see it in a sidebar, or inspect simulator/Duo availability | `docs/tooling/ios-simulator-mcp.md`, `docs/platforms/iphone-duo.md` |
| Client setup and MCP | `docs/mcp/installation.md`, `docs/mcp/knowledge-server.md` |
| Detailed engineering rules or a broader topic route | `docs/agent-engineering-guide.md` — search headings before reading the whole file |

For repository maintenance, regenerate mirrors after editing this entry point with `scripts/sync-mirrors.sh`. Run `scripts/hooks/verify-repo.sh`, check the local index, and run tests appropriate to changed code. Preserve existing instructions in supporting guides; use an independent reviewer for shipped changes as described in `docs/orchestration/verification.md`.
