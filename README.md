<p align="center">
  <img src="https://img.shields.io/badge/Swift-6.4-F05138?style=for-the-badge&logo=swift&logoColor=white" alt="Swift 6.4">
  <img src="https://img.shields.io/badge/Xcode-27-147EFB?style=for-the-badge&logo=xcode&logoColor=white" alt="Xcode 27">
  <img src="https://img.shields.io/badge/iOS-17--27-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS 17 through 27">
  <img src="https://img.shields.io/badge/MCP-11%20analysis%20tools-8B5CF6?style=for-the-badge" alt="MCP tools">
  <img src="https://img.shields.io/badge/Subagents-24-00D084?style=for-the-badge" alt="24 subagents">
</p>

<h1 align="center">iOS Agent Skill</h1>

<p align="center">
  <strong>Apple-platform engineering rules, analyzers, agents, and runtime tooling for AI coding agents.</strong><br>
  Swift, SwiftUI, UIKit, SwiftData, Foundation Models, Apple Intelligence, RealityKit, SceneKit, ARKit, Metal, Xcode, and the iOS Simulator.
</p>

<p align="center">
  <a href="https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml"><img src="https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/github/license/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="GitHub stars">
  <a href="https://www.npmjs.com/package/ios-agent-mcp"><img src="https://img.shields.io/npm/v/ios-agent-mcp?style=flat-square&logo=npm&label=ios-agent-mcp" alt="ios-agent-mcp on npm"></a>
  <a href="https://www.linkedin.com/in/nagarjuna-reddy-97836a193/"><img src="https://img.shields.io/badge/by-Nagarjuna%20Reddy-0A66C2?style=flat-square&logo=linkedin" alt="Author"></a>
</p>

---

## What This Is

`ios-agent-skill` is a repo you can install into AI coding tools so they behave more like senior iOS engineers:

- The **skill** teaches the agent what good Apple-platform code looks like.
- The **static MCP server** reviews an existing Swift project and returns structured findings.
- The **CLI** scaffolds a clean iOS project layout.
- The **simulator MCP package** is the first runtime slice: build, test, install, launch, deep link, and screenshot through Xcode and Simulator.
- The **subagents** route specialized work to reviewers for SwiftUI, UIKit, RealityKit, Metal, WebKit, testing, security, performance, App Store readiness, and more.

The central rule is simple: do not let an agent say "it works" without evidence. Build output, test output, screenshots, logs, and structured findings matter more than confident prose.

## Why It Exists

AI-generated Swift often compiles while still being wrong in production-shaped ways.

| Problem | Common AI output | This repo enforces |
|---|---|---|
| Concurrency | `@Observable` state read by SwiftUI with no `@MainActor` isolation | Main-actor UI state, Sendable boundaries, structured tasks |
| Architecture | View models creating `URLSession`, `ModelContext`, or singletons directly | Protocol boundaries, dependency injection, preview-safe screens |
| Availability | `#available(iOS 27, *)` around an API introduced earlier | Guards on the symbol's real introduction version |
| Error handling | `try!`, empty `catch`, swallowed failures | User-visible outcomes or documented deliberate no-ops |
| Design | Fixed fonts, literal colors, inaccessible icon buttons | Design tokens, Dynamic Type, contrast, VoiceOver labels |
| Verification | "Should work now" | Commands run, output shown, evidence labelled |

## Quick Install

### Install the skill

Use this when you want your AI agent to load the iOS rules while writing code:

```bash
npx skills add Nagarjuna2997/ios-agent-skill
```

Or clone it into an iOS project so tools can read the mirrored instruction files:

```bash
cd /path/to/YourApp
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git .ios-skill
```

### Install the static MCP analyzer

`ios-agent-mcp` is published on npm. It is read-only and does not require Xcode.

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp --project /path/to/YourApp
```

Generic MCP config:

```jsonc
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp", "--project", "/path/to/YourApp"]
    }
  }
}
```

More client setup is in [docs/mcp/installation.md](docs/mcp/installation.md).

### Use the CLI

The CLI is currently used from source:

```bash
cd cli
npm install
npm run build
node dist/index.js new MyApp
```

The CLI creates a visible app root and keeps tool-owned state under `.ios-agent/`.

### Use the simulator MCP package from source

`ios-simulator-mcp` is intentionally separate from `ios-agent-mcp` because it requires macOS, Xcode, and simulator side effects.

```bash
cd ios-simulator-mcp
npm install
npm run build
node dist/index.js --help
```

## Packages

| Package | Status | Runtime | Purpose |
|---|---|---|---|
| [mcp-server](mcp-server/) / `ios-agent-mcp` | Published as `2.1.0` | Node, any OS | Static Swift analysis and skill linting |
| [cli](cli/) / `ios-agent` | Source package | Node 20+ | Project scaffolding and layout management |
| [ios-simulator-mcp](ios-simulator-mcp/) | Source package, v4 seed | macOS + Xcode | Runtime build/test/simulator evidence |
| [samples/SkillPatterns](samples/SkillPatterns/) | CI sample | Swift Package Manager | Compile-checked examples of the rules |

## MCP Tools

`ios-agent-mcp` exposes eleven read-only tools:

| Tool | Use when |
|---|---|
| `analyze_swift_project` | You need a project overview, file counts, frameworks, architecture signals, DI evidence, and issue totals |
| `review_swift_concurrency` | You are checking actor isolation, `@MainActor`, `Sendable`, task structure, and empty catches |
| `review_swift_architecture` | You are checking MVVM/Clean Architecture boundaries and dependency injection |
| `review_swiftui` | You are checking SwiftUI layout, state, deprecated APIs, design tokens, and accessibility basics |
| `check_availability_guards` | You are checking iOS version guards and runtime model availability |
| `audit_app_store_readiness` | You are checking Info.plist permissions, privacy manifest risk, localization, labels, and diagnostics |
| `review_swift_memory` | You are checking retain cycles, delegates, timers, Combine sinks, and `unowned self` |
| `review_swift_security` | You are checking secrets, ATS, HTTP, Keychain accessibility, weak hashes, randomness, and JS injection |
| `review_swift_testing` | You are checking test quality, flakiness, sleeps, live network, and vacuous tests |
| `review_swift_performance` | You are checking SwiftUI render-path work, formatters, sorting, stacks, and blocking I/O |
| `lint_skill` | You are checking this skill repo or another Agent Skill for metadata, mirrors, agents, and references |

Every review returns markdown plus `structuredContent` with counts, issues, score, checked files, and suggestions.

## Simulator Tools

`ios-simulator-mcp` currently exposes the safe first slice of runtime automation:

| Tool | Backend |
|---|---|
| `simulator_list` | `xcrun simctl list devices available --json` |
| `simulator_boot` | `xcrun simctl boot` |
| `simulator_shutdown` | `xcrun simctl shutdown` |
| `build_project` | `xcodebuild build` |
| `run_tests` | `xcodebuild test` |
| `install_app` | `xcrun simctl install` |
| `launch_app` | `xcrun simctl launch` |
| `terminate_app` | `xcrun simctl terminate` |
| `open_deep_link` | `xcrun simctl openurl` |
| `screenshot` | `xcrun simctl io screenshot` |

No current simulator tool erases all simulator content. Video, logs, UI gestures, accessibility-tree inspection, and visual comparison are planned next. See [docs/tooling/ios-simulator-mcp.md](docs/tooling/ios-simulator-mcp.md).

## What It Checks

Example MCP finding:

```text
Sources/FeedModel.swift:3
Severity: blocker
Rule: observable-without-mainactor

@Observable type is not @MainActor-isolated.

Why it matters:
SwiftUI reads observable state during layout. A background write can become a
data race under Swift 5 mode and a compile error under Swift 6 strict checking.

Fix:
Annotate UI-rendered observable state:
@MainActor @Observable final class FeedModel { ... }
```

The same rules are documented in the skill docs so agents can learn the fix before generating new code.

## Documentation Map

Start here:

| Area | Read |
|---|---|
| MCP setup and tools | [docs/mcp/installation.md](docs/mcp/installation.md), [docs/mcp/tools.md](docs/mcp/tools.md), [docs/mcp/examples.md](docs/mcp/examples.md) |
| Swift and SwiftUI rules | [docs/swift/swift-language.md](docs/swift/swift-language.md), [docs/swift/swift-concurrency.md](docs/swift/swift-concurrency.md), [docs/swift/memory-lifetime.md](docs/swift/memory-lifetime.md), [docs/swiftui/state-and-data-flow.md](docs/swiftui/state-and-data-flow.md), [docs/swiftui/views-and-controls.md](docs/swiftui/views-and-controls.md) |
| Architecture | [patterns/mvvm.md](patterns/mvvm.md), [patterns/clean-architecture.md](patterns/clean-architecture.md) |
| Design, motion, graphics | [docs/design/README.md](docs/design/README.md), [docs/animation/README.md](docs/animation/README.md), [docs/graphics/README.md](docs/graphics/README.md) |
| AI and intelligence | [docs/ai/README.md](docs/ai/README.md), [docs/frameworks/foundation-models.md](docs/frameworks/foundation-models.md), [docs/frameworks/apple-intelligence.md](docs/frameworks/apple-intelligence.md) |
| RealityKit, SceneKit, ARKit, Metal | [docs/frameworks/realitykit.md](docs/frameworks/realitykit.md), [docs/frameworks/scenekit.md](docs/frameworks/scenekit.md), [docs/frameworks/arkit.md](docs/frameworks/arkit.md), [docs/frameworks/metal.md](docs/frameworks/metal.md) |
| Testing and verification | [docs/testing/mocking-strategy.md](docs/testing/mocking-strategy.md), [docs/testing/xcuiautomation.md](docs/testing/xcuiautomation.md), [docs/orchestration/verification.md](docs/orchestration/verification.md) |
| Xcode and simulator workflows | [docs/tooling/xcode-27-agents.md](docs/tooling/xcode-27-agents.md), [docs/tooling/xcode-memory-debugging.md](docs/tooling/xcode-memory-debugging.md), [docs/tooling/device-hub.md](docs/tooling/device-hub.md), [docs/tooling/ios-simulator-mcp.md](docs/tooling/ios-simulator-mcp.md) |
| Apple docs reference | [docs/apple-docs-reference.md](docs/apple-docs-reference.md), [docs/performance/README.md](docs/performance/README.md), [docs/frameworks/metal.md](docs/frameworks/metal.md) |
| App description to build prompt | [docs/tooling/app-description-workflow.md](docs/tooling/app-description-workflow.md), [docs/design/design-tokens.md](docs/design/design-tokens.md), [docs/design/color-system.md](docs/design/color-system.md) |
| Version and migration guidance | [docs/compatibility-matrix.md](docs/compatibility-matrix.md), [docs/migration/swift-6-migration.md](docs/migration/swift-6-migration.md), [docs/migration/xcode-migration.md](docs/migration/xcode-migration.md) |

## Apple Technology Catalog

<!-- apple-catalog:start -->
Apple catalog tracked: **98** technologies. Covered: **68**. Planned: **30**. Skipped: **0**. Deprecated: **0**. Coverage: **69.4%**.

Source of truth: [`frameworks.json`](frameworks.json). Human index: [`docs/apple-framework-index.md`](docs/apple-framework-index.md).
<!-- apple-catalog:end -->

The catalog is generated and checked by CI. Update `frameworks.json`, then run:

```bash
node scripts/check-framework-catalog.mjs
```

## Subagents

The repo ships 24 specialist subagents in [.claude/agents](.claude/agents/). Highlights:

| Agent | Use for |
|---|---|
| `swift-reviewer` | Independent read-only verification before shipping |
| `swift-debugger` | Reproduce, isolate, fix, and prove a Swift failure |
| `swiftui-expert` | SwiftUI layout, state, navigation, and modern interactions |
| `ui-ux-designer` | Product UI hierarchy, accessibility, state design, and polish |
| `realitykit-expert` | RealityKit, Model3D, ARKit integration, and spatial review |
| `metal-expert` | Metal rendering, shaders, compute, and frame-loop review |
| `testing-expert` | Swift Testing, XCTest, XCUIAutomation, and evaluations |
| `xcode-expert` | Xcode projects, schemes, Device Hub, and Instruments |
| `security-reviewer` | Authentication, Keychain, privacy, permissions, and threat modeling |
| `app-store-reviewer` | App Review, StoreKit, privacy manifests, release risk |

Read routing guidance in [docs/orchestration/router.md](docs/orchestration/router.md) and [docs/orchestration/subagents.md](docs/orchestration/subagents.md).

## Recommended Workflow

For a new iOS app:

1. Create the real Xcode project first in Xcode.
2. Add this skill repo as `.ios-skill/` or install it through your AI tool.
3. Configure `ios-agent-mcp` with `--project /path/to/YourApp`.
4. Ask the agent to build features inside the Xcode project, not beside it.
5. Run static MCP reviews.
6. Build and test in Xcode or with `ios-simulator-mcp`.
7. Capture screenshots or logs before claiming the UI/runtime path works.

For an existing app:

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp --project /path/to/ExistingApp
```

Then ask:

```text
Analyze this Swift project and list blockers first.
Review concurrency, SwiftUI, security, testing, performance, and App Store readiness.
Show evidence and exact file locations.
```

## Local Development

Run repo consistency checks:

```bash
./scripts/hooks/verify-repo.sh
node scripts/check-framework-catalog.mjs
./scripts/eval-agents.sh --table
```

Run the static MCP package:

```bash
cd mcp-server
npm install
npm run typecheck
npm run build
npm test
```

Run the CLI package:

```bash
cd cli
npm install
npm run typecheck
npm run build
npm test
```

Run the simulator MCP package:

```bash
cd ios-simulator-mcp
npm install
npm run typecheck
npm run build
npm test
```

## Publishing

`ios-agent-mcp@2.1.0` is published on npm:

```bash
npm view ios-agent-mcp version
```

npm publishing is manual from a local trusted machine. GitHub Actions creates GitHub Releases but does not store npm tokens or run `npm publish`.

```bash
cd mcp-server
npm login
npm publish --access public
```

If npm asks for security-key approval, use the browser link printed by the CLI and approve with the passkey/security key registered on the npm account.

## Roadmap

Current state:

- v2.1: static MCP analyzer complete and published.
- v3.0: Apple Platform Intelligence docs, catalog, routing hubs, and specialist subagents.
- v4.0 seed: executable simulator MCP package for Build -> Run -> See evidence.

Next work:

- Add runtime video capture and log streaming.
- Choose the UI automation backend for tap, swipe, type, and accessibility-tree inspection.
- Add visual-review loops that pair screenshots with UI/UX, accessibility, motion, RealityKit, Metal, and performance reviewers.
- Expand static review contracts for UI/UX, motion, haptics, 3D, AI safety, and evaluations.

Detailed planning lives in [ROADMAP.md](ROADMAP.md).

## Works With

Primary support is intentionally focused on:

- Claude Code and Claude Desktop
- ChatGPT / Codex
- Gemini CLI

Other instruction-file mirrors may exist in the repo for compatibility, but the product direction is Claude, ChatGPT/Codex, and Gemini first.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing docs, agents, mirrors, or package behavior.

Important rules:

- Edit `SKILL.md`, then run `./scripts/sync-mirrors.sh`; do not hand-edit mirrors.
- Keep examples complete and compiling.
- Add tests when behavior changes.
- Do not commit npm tokens, recovery codes, `.npmrc` credentials, or GitHub secrets.

## License

MIT. See [LICENSE](LICENSE).
