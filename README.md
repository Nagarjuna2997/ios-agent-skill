# iOS Agent Skill

Build and review Swift apps with one MCP connection: local Apple references, editable source, app scaffolding and simulator tools.

[![Tests](https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/tests.yml/badge.svg)](https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/tests.yml)
[![Docs](https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml/badge.svg)](https://github.com/Nagarjuna2997/ios-agent-skill/actions/workflows/docs-consistency.yml)
[![npm total downloads](https://img.shields.io/endpoint?url=https%3A%2F%2Fnagarjuna2997.github.io%2Fios-agent-skill%2Fnpm-downloads.json)](https://nagarjuna2997.github.io/ios-agent-skill/npm-downloads-details.json)

[Website](https://nagarjuna2997.github.io/ios-agent-skill/) · [npm](https://www.npmjs.com/package/ios-agent-mcp) · [Release notes](CHANGELOG.md)

## Install once

For Claude Code:

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp@latest
```

[Other clients and source installation](docs/mcp/installation.md). Requires Node.js 20+. Builds and simulator operations require macOS and Xcode. Scaffolding and simulator dependencies install automatically; do not add duplicate MCP connections.

Create a starter with the same package:

```bash
npx -y ios-agent-mcp@latest new MyApp --brief "A reading list with local storage" --xcodegen
```

XcodeGen is needed to generate a project from the starter specification. Your coding agent implements the app’s features.

## Give it a concrete task

> Build a SwiftUI reading list with persistence, search, and accessible empty/error states. Search the local source library before writing code. Run the build and tests, then show simulator evidence. Stop and explain anything that fails.

For an existing app, ask it to review an absolute project path and return findings with file locations. In 2.6.0, `review_app_intents` adds SiriKit migration advice and opt-in entity/schema checks. [Rule scope](docs/frameworks/app-intents-intelligence.md#static-integration-review).

## What you get

| Capability | Try it |
|---|---|
| Swift reviews and App Intents integration checks | [Tool reference](docs/mcp/tools.md) |
| Search local guides and complete Swift source in bounded sections | [Offline library](docs/tooling/offline-source-library.md) |
| Apple technology directory from Accelerate to XPC | [405-entry snapshot](docs/apple/all-technologies.md), [release verification](docs/apple/ios-27-release-verification.md) |
| Build, test, launch and screenshot through Xcode | [Simulator workflow](docs/tooling/ios-simulator-mcp.md) |
| Layered icons and an editable app starter | [Icon Composer](docs/design/icon-composer.md), [idea-to-app guide](docs/tooling/idea-to-app.md) |
| Foundation Models tool calling with local fallback | [Compiling sample and tests](samples/AppleRecipes/README.md#foundation-models-tool-calling) |

The 2.6.0 source exposes **35 tools**: 12 review/metadata tools, 8 reference tools, 14 simulator tools, and `create_app`. Reviews are heuristic suggestions. The Apple directory is a discovery map, not 405 compiled integrations or Apple’s proprietary source. Retrieval bounds output size; token savings have not been benchmarked.

## See a working app

The [Reading List demo](samples/ReadingList/README.md) includes persistence, search, progress and error states, with simulator acceptance tests and six captured screens.

![Reading List simulator capture](examples/reading-list/library.png)

The [resumable build/test/fix loop](docs/tooling/app-building-loop.md) saves progress and bounds retries. Engine tests and simulator checks pass; a real Claude repair session remains unverified. The [Foundation Models sample](samples/AppleRecipes/Sources/AppleRecipes/ReadingAssistant.swift) compiles and its deterministic tests pass; live model generation and Xcode 27-only routing remain separate checks.

## Client support and evidence

[Setup guides](docs/mcp/installation.md) cover Claude, Codex, Cursor-compatible stdio configurations, Gemini CLI and Muse Code. Browser ChatGPT cannot launch a local process; its hosted reference/skills path is documented separately. Xcode 27 setup is documented but not runtime-verified on the current Xcode 26.6 host. Muse Code 1.3.0 skill discovery, discovery of all 35 published MCP tools and a Stop command hook are verified; real model sessions and the verification observer remain unverified.

npm download counts refresh daily through the last complete UTC day; downloads are not unique users. Tests and docs have separate CI badges above.

<details>
<summary>Curated documentation coverage</summary>

This curated guide index is separate from the full Apple directory; coverage means documentation, not compiled implementations.

<!-- apple-catalog:start -->
Apple catalog tracked: **99** technologies. Covered: **99**. Planned: **0**. Skipped: **0**. Deprecated: **0**. Coverage: **100.0%**.

Source of truth: [`frameworks.json`](frameworks.json). Human index: [`docs/apple-framework-index.md`](docs/apple-framework-index.md).
<!-- apple-catalog:end -->

</details>

[Contributing](CONTRIBUTING.md) · [Development](docs/development.md) · [Security](SECURITY.md) · [Roadmap](ROADMAP.md) · [MIT license](LICENSE)
