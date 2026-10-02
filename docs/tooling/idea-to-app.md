# From an Idea to a Running Apple App

## Context

Use this when the user gives an app description and wants it built. This page picks the workflow. Three exist, and they do different jobs:

| You want | Workflow | Guide |
|---|---|---|
| A whole app from one sentence: plan, project, code, build-and-fix, simulator screenshots, run report | `/ios-build` agent | [iOS build agent](ios-build-agent.md) |
| An editable starter and a written brief, then implement it yourself or with any coding agent | `ios-agent new --brief` | this page, below |
| An existing project driven until your own acceptance checks pass | `ios-agent-mcp loop` | [App-building loop](app-building-loop.md) |

For turning a vague description into screens, flows and visual direction before any of these, see the [app description workflow](app-description-workflow.md).

## Pattern

### Default: the build agent

In Claude Code with the `ios-agent` server connected (2.10.0 or later; [install](ios-build-agent.md#install)):

```text
/ios-build "A reading tracker with offline reading sessions and weekly goals"
```

The agent plans the screens and capabilities and writes PLAN.md, including what the app will cost and which accounts it needs. It then creates the Xcode project and writes the SwiftUI code. It builds and fixes errors within a budget of attempts and time, screenshots each screen in the iOS Simulator and writes RUN_REPORT.md. It needs macOS with Xcode 16 or later; XcodeGen is optional. Use `--refine "<change>"` for follow-up changes and `--resume` to continue a stopped run.

### Manual: a starter and a brief

```bash
npx -y @nagarjuna2002/ios-agent@0.4.0 new MyApp --brief "A reading tracker with offline reading sessions and weekly goals" --xcodegen
```

The output includes SwiftUI source, an editable implementation brief (`App/APP_BRIEF.md`), an XcodeGen project specification and separate SVG icon layers. It preserves an existing nonempty project unless explicitly instructed; even force mode does not silently overwrite generated-file collisions. The starter does not implement the description.

Open the new folder in Claude Code, Codex or Gemini CLI with this skill installed. Ask the agent to implement `App/APP_BRIEF.md` through build and visual verification: screens, data models, persistence, user flows, error states and a small testable first release.

On macOS with Xcode and XcodeGen installed:

```bash
cd MyApp/App
xcodegen generate --spec project.yml
open MyApp.xcodeproj
xcodebuild -project MyApp.xcodeproj -scheme MyApp -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ../.ios-agent/build build CODE_SIGNING_ALLOWED=NO
```

The simulator tools of the `ios-agent` server can run and screenshot the app. Keep account credentials, service configuration and signing identities in the user's environment.

### Finish the app identity

Customize the generated background, foreground and accent SVGs in the app's IconLayers folder. Follow [Icon Composer](../design/icon-composer.md) to create a native icon with editable groups and appearance variants, then assign it to the target and verify it in a build. The starter layers are intentionally generic artwork.

### Client capabilities

Claude Code runs `/ios-build`. Codex and Gemini CLI can implement a starter locally when granted filesystem and terminal access. The portable ChatGPT plugin supplies the same references. ChatGPT without a coding environment can prepare a plan and code; a local macOS environment must perform iOS simulator builds. A remote MCP knowledge endpoint supplies public reference tools and never gets access to the user's local source tree.

## Anti-Patterns

- Calling the app complete just because scaffolding succeeded, or because the agent's plan was written.
- Claiming automatic App Store publication, signing, backend provisioning or native icon creation.
- Replacing an existing app's architecture with the starter scaffold.
- Presenting mock services or placeholder test assertions as production features.
