---
name: ios-builder
description: Turn an Apple app idea into a concrete implementation using Swift, Apple technology references, release notes, and separately editable Icon Composer layers. Use for creating or extending native Apple apps; requires a coding environment for file edits and Xcode for iOS builds.
---

# Build an Apple App

Turn the user's idea into a working, tested implementation in their available coding environment. Start with the existing project when present; otherwise use a new directory. Make routine design choices and record assumptions. Ask only for missing information that materially blocks the app, such as required service credentials.

1. Read `docs/tooling/app-description-workflow.md` and define the user flows, screens, data, and acceptance criteria from the brief.
2. Read `docs/tooling/offline-source-library.md` and search local source first. With terminal access use `node scripts/query-library.mjs search "feature"`; read only needed sections or complete source files. Find frameworks in `docs/apple/all-technologies.md`. Load only relevant guides. Consult `docs/apple/updates-and-release-notes.md` for SDK changes and use source dates honestly.
3. With terminal access, scaffold via `npx -y @nagarjuna2002/ios-agent@0.2.0 new AppName --brief "the app idea" --xcodegen`. Use a validated Swift identifier for AppName and pass user text as an argument rather than interpolating it into shell syntax. Read the generated `App/APP_BRIEF.md` and implement it; the scaffolder itself does not generate the finished product from natural language.
4. Implement features using the existing app architecture. Use `templates/` and `patterns/` only where appropriate. Add real loading, empty, error and populated states; provide preview data and keep live service dependencies injectable.
5. Read `docs/design/icon-composer.md`. Create and customize separate SVG/PNG foreground layers plus a background decision. Use Icon Composer to annotate and verify the native document when available. Never claim a flattened image or renamed JSON is a native layered icon.
6. Generate the project with XcodeGen when using that scaffold, build with the actual Xcode SDK, run meaningful tests, then inspect app screens and accessible interactions. Fix failures before reporting completion.
7. Report files changed, runnable commands, test/build evidence, and anything needing credentials, hardware or user decisions. Do not publish an app or create paid service resources without the user's authorization.

If the environment lacks filesystem or Xcode access, deliver the concrete plan/source artifacts it can support and explain what must run in a local coding environment. A plugin installation is not evidence that an app has been built. These bundled references are a dated snapshot; consult linked official sources for changing APIs.

For optional local Simulator control and a browser/sidebar preview, read `docs/tooling/ios-simulator-mcp.md`. Inspect installed device profiles before claiming support for a newly announced phone; current Duo guidance is in `docs/platforms/iphone-duo.md`. Runtime control requires a local Mac with Xcode.
