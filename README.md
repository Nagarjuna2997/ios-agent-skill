# iOS Agent Skill
[![npm total downloads](https://img.shields.io/endpoint?url=https%3A%2F%2Fnagarjuna2997.github.io%2Fios-agent-skill%2Fnpm-downloads.json)](https://nagarjuna2997.github.io/ios-agent-skill/npm-downloads-details.json) 


_Total npm downloads for `ios-agent-mcp`, refreshed daily through the latest complete UTC day. Downloads are not unique users._

## One install, one MCP connection (2.5.1)

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp@2.5.1
```

The default server exposes 34 tools: 11 Swift reviews, 8 Apple reference tools, 14 simulator tools, and `create_app`. App scaffolding and simulator packages install automatically as dependencies; no separate installation or MCP connection is needed. Remove the separate knowledge/simulator connections if you previously configured them to avoid duplicate tools.

Create a starter directly:

```bash
npx -y ios-agent-mcp@2.5.1 new MyApp --brief "A reading list with local storage" --xcodegen
```

Requires Node.js 20+. Simulator operations require macOS and Xcode; XcodeGen is required to generate an Xcode project from the starter specification. The agent implements app features using the starter, source tools and verification tools. One install is not autonomous app generation. The default connection now includes tools that write files and operate the simulator; review and reference tools remain read-only.

**[Website & quick start →](https://nagarjuna2997.github.io/ios-agent-skill/)**

**Give your AI coding agent local Swift source, Apple guides, code review tools, and a way to see the app running.**

Build with Claude, Codex, or Gemini CLI. Portable references are also available for ChatGPT workflows. Free and open source under MIT.

<p align="center">
  <a href="https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml"><img src="https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/github/license/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/Nagarjuna2997/ios-agent-skill?style=flat-square" alt="GitHub stars">
  <a href="https://www.npmjs.com/package/ios-agent-mcp"><img src="https://img.shields.io/npm/v/ios-agent-mcp?style=flat-square&logo=npm&label=ios-agent-mcp" alt="ios-agent-mcp on npm"></a>
  <a href="https://www.linkedin.com/in/nagarjuna-reddy-97836a193/"><img src="https://img.shields.io/badge/by-Nagarjuna%20Reddy-0A66C2?style=flat-square&logo=linkedin" alt="Author"></a>
</p>


## New: a resumable app-building loop (preview)

[Run the reading-list demo](samples/ReadingList/README.md): persistence, search, progress, error handling and six simulator screenshots. The [local Claude workflow](docs/tooling/app-building-loop.md) turns a brief into a plan, runs your acceptance checks, requests bounded repairs and saves progress. Completion requires all configured checks to pass. The engine and demo are tested; real Claude repair remains unverified pending local authentication. Available from this checkout; the published npm version remains 2.5.1.

## Try it in your next app

Install the skill into your coding agent:

```bash
npx skills add Nagarjuna2997/ios-agent-skill
```

For build/run/screenshot tools, also configure the optional [simulator MCP](docs/tooling/ios-simulator-mcp.md) on a Mac with Xcode. Installing the skill alone adds guidance, not runtime tools.

Then ask:

> Build a SwiftUI reading list with local persistence, search, and accessible empty/error states. Reuse this skill's local source where it fits. Run the build and tests, and show simulator evidence for what you verified.

Already have an app? Ask: **“Review this project for concurrency, architecture, accessibility, and security issues. Give me file locations and fix the blockers first.”**

[Client setup](docs/mcp/installation.md) · [Start a new app](docs/tooling/idea-to-app.md) · [Download integrations](https://github.com/Nagarjuna2997/ios-agent-skill/releases/latest) · [Contribute](CONTRIBUTING.md)

## What makes it useful

| Feature | What you can do |
|---|---|
| **Local source, retrieved in small sections** | Search complete editable Swift files, templates, and guides; read only the matching section using [offline commands or MCP](docs/tooling/offline-source-library.md). No need to load the whole library into each prompt. |
| **Apple technology discovery: Accelerate → XPC** | Navigate [405 unique technology entries](docs/apple/all-technologies.md), plus [updates and release notes](docs/apple/updates-and-release-notes.md), with official Apple attribution and dated snapshots. |
| **11 read-only Swift review tools** | Find concurrency, architecture, SwiftUI, memory, security, testing, performance, and App Store readiness issues with [file-level findings](mcp-server/README.md). |
| **Build → run → see** | Use [14 simulator tools](docs/tooling/ios-simulator-mcp.md) to build/test, launch an app, capture screenshots, and open a private browser preview alongside your agent. Requires macOS and Xcode. |
| **An app starter you own** | Generate a Swift starter, app brief, optional XcodeGen spec, and [editable icon layers](docs/design/icon-composer.md). Your coding agent implements the features; you keep the source. |
| **Examples with tests** | Reuse [SkillPatterns](samples/SkillPatterns/) and [AppleRecipes](samples/AppleRecipes/): persistence, networking, cryptography, language, vector statistics, and PDF recipes. |

Local retrieval bounds output size; token and cost savings depend on the model and task and have not been benchmarked. The catalog is a discovery map, not 405 completed framework implementations or Apple's proprietary source. Static reviews are heuristic findings; builds, tests, and runtime checks supply separate evidence.

## What This Is

`ios-agent-skill` is a repo you can install into AI coding tools so they behave more like senior iOS engineers:

- The **skill** teaches the agent what good Apple-platform code looks like.
- The **static MCP server** reviews an existing Swift project and returns structured findings.
- The **CLI** scaffolds a clean iOS project layout.
- The **simulator MCP package** is the first runtime slice: build, test, install, launch, deep link, and screenshot through Xcode and Simulator.
- The **subagents** route specialized work to reviewers for SwiftUI, UIKit, RealityKit, Metal, WebKit, testing, security, performance, App Store readiness, and more.

The central rule is simple: do not let an agent say "it works" without evidence. Build output, test output, screenshots, logs, and structured findings matter more than confident prose.

## All Apple Technologies

The [complete Apple technology directory](docs/apple/all-technologies.md) covers **405 unique entries**, from **Accelerate to XPC**, checked against Apple on **2026-09-10**. It reuses existing guides for **83 technology entries** and adds **322 dedicated reference pages**, with platform metadata and **11,500 API/topic links**. Five Apple directory entries lead to external resources.

The [machine-readable snapshot](docs/apple/technologies.json) and `python3 scripts/sync-apple-technologies.py --check` keep names, URLs, routes, and generated pages consistent. Use `--refresh` to retrieve the live directory again. This is complete technology-level discovery, not a per-symbol documentation mirror or a claim that every integration has been compiled.

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

## Start with your app idea

```bash
npx -y @nagarjuna2002/ios-agent@0.2.0 new MyApp --brief "Describe the app you want" --xcodegen
```

Open the generated folder with your coding agent and ask it to implement `App/APP_BRIEF.md` through build and screen verification. The starter includes an XcodeGen project spec and separate editable icon layers. [Full idea-to-app workflow](docs/tooling/idea-to-app.md).

### Claude, ChatGPT/Codex and Gemini

- **Claude and Codex:** local MCP analyzers plus eight Apple knowledge/source tools. A Codex plugin ZIP is included in releases.
- **ChatGPT:** a portable skills-only plugin ZIP with bundled references. The optional knowledge server supports HTTP for deployment to your own HTTPS host.
- **Gemini CLI:** install this GitHub repository as an extension; it includes both MCP connections and GEMINI guidance.

[Client installation](docs/mcp/installation.md) · [Knowledge MCP](docs/mcp/knowledge-server.md) · [Apple updates and release notes](docs/apple/updates-and-release-notes.md) · [Layer-by-layer Icon Composer workflow](docs/design/icon-composer.md) · [Release downloads](https://github.com/Nagarjuna2997/ios-agent-skill/releases)

The release artifacts are installable packages, not a claim of acceptance into a public plugin marketplace. Xcode builds and native Icon Composer editing require a compatible Mac environment.

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

`ios-agent-mcp` is published on npm. Reviews and references are read-only; app creation and simulator tools have write/runtime effects. Simulator operations require Xcode.

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

The CLI is published on npm. For a quick start, use `npx -y @nagarjuna2002/ios-agent@0.2.0 new MyApp --xcodegen`. To develop it from source:

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
| [ios-agent-mcp](https://www.npmjs.com/package/ios-agent-mcp) | Version: `2.5.1` | Node 20+; runtime tools need Mac/Xcode | 34 tools in one default connection |
| [@nagarjuna2002/ios-agent](https://www.npmjs.com/package/@nagarjuna2002/ios-agent) | Published: `0.2.0` | Node 20+ | Project scaffolding, app briefs, editable icon layers |
| [@nagarjuna2002/ios-simulator-mcp](https://www.npmjs.com/package/@nagarjuna2002/ios-simulator-mcp) | Published: `0.2.0` | macOS + Xcode | 14 tools for runtime evidence and browser preview |
| [samples/SkillPatterns](samples/SkillPatterns/) | CI sample | Swift Package Manager | Compile-checked examples of the rules |

## MCP Tools

The unified server includes these eleven read-only review tools:

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

`@nagarjuna2002/ios-simulator-mcp` exposes 14 runtime tools:

| Tool | Backend |
|---|---|
| `simulator_list` | `xcrun simctl list devices available --json` |
| `simulator_environment` | Installed Xcode, runtime and device availability |
| `simulator_show` | Open native Simulator |
| `simulator_preview_start` | Start private, read-only browser screenshot preview |
| `simulator_preview_stop` | Stop browser preview |
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
| Swift and SwiftUI rules | [docs/swift/swift-brain.md](docs/swift/swift-brain.md), [docs/swift/swift-language.md](docs/swift/swift-language.md), [docs/swift/swift-concurrency.md](docs/swift/swift-concurrency.md), [docs/swift/memory-lifetime.md](docs/swift/memory-lifetime.md), [docs/swiftui/state-and-data-flow.md](docs/swiftui/state-and-data-flow.md), [docs/swiftui/views-and-controls.md](docs/swiftui/views-and-controls.md) |
| Architecture | [patterns/mvvm.md](patterns/mvvm.md), [patterns/clean-architecture.md](patterns/clean-architecture.md) |
| Design, motion, graphics | [docs/design/README.md](docs/design/README.md), [docs/animation/README.md](docs/animation/README.md), [docs/graphics/README.md](docs/graphics/README.md) |
| AI and intelligence | [docs/ai/machine-learning-brain.md](docs/ai/machine-learning-brain.md), [docs/ai/README.md](docs/ai/README.md), [docs/frameworks/foundation-models.md](docs/frameworks/foundation-models.md), [docs/frameworks/apple-intelligence.md](docs/frameworks/apple-intelligence.md) |
| RealityKit, SceneKit, ARKit, Metal | [docs/frameworks/realitykit.md](docs/frameworks/realitykit.md), [docs/frameworks/scenekit.md](docs/frameworks/scenekit.md), [docs/frameworks/arkit.md](docs/frameworks/arkit.md), [docs/frameworks/metal.md](docs/frameworks/metal.md) |
| Testing and verification | [docs/testing/mocking-strategy.md](docs/testing/mocking-strategy.md), [docs/testing/xcuiautomation.md](docs/testing/xcuiautomation.md), [docs/orchestration/verification.md](docs/orchestration/verification.md) |
| Xcode and simulator workflows | [docs/tooling/xcode-27-agents.md](docs/tooling/xcode-27-agents.md), [docs/tooling/xcode-memory-debugging.md](docs/tooling/xcode-memory-debugging.md), [docs/tooling/device-hub.md](docs/tooling/device-hub.md), [docs/tooling/ios-simulator-mcp.md](docs/tooling/ios-simulator-mcp.md) |
| Apple documentation memory | [docs/apple/documentation-navigator-brain.md](docs/apple/documentation-navigator-brain.md), [docs/apple/a-section-memory.md](docs/apple/a-section-memory.md), [docs/apple/b-m-section-memory.md](docs/apple/b-m-section-memory.md), [docs/apple/n-z-section-memory.md](docs/apple/n-z-section-memory.md), [docs/apple/resources-support-memory.md](docs/apple/resources-support-memory.md), [docs/apple/coverage-status.md](docs/apple/coverage-status.md) |
| App description to build prompt | [docs/tooling/app-description-workflow.md](docs/tooling/app-description-workflow.md), [docs/design/design-tokens.md](docs/design/design-tokens.md), [docs/design/color-system.md](docs/design/color-system.md) |
| Version and migration guidance | [docs/compatibility-matrix.md](docs/compatibility-matrix.md), [docs/migration/swift-6-migration.md](docs/migration/swift-6-migration.md), [docs/migration/xcode-migration.md](docs/migration/xcode-migration.md) |

## Curated Framework Guide Coverage

This smaller, curated guide index is separate from the 405-entry Apple directory above. “Covered” tracks documentation coverage, not compiled integrations.

<!-- apple-catalog:start -->
Apple catalog tracked: **99** technologies. Covered: **99**. Planned: **0**. Skipped: **0**. Deprecated: **0**. Coverage: **100.0%**.

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

`ios-agent-mcp@2.5.1` is published on npm:

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

- v3.3.0 repository release: local source library, Apple catalog, cross-client integrations, and simulator preview.
- npm: unified package 2.5.1, app CLI 0.2.0, and simulator package 0.2.0.

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
