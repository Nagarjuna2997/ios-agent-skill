# From an Idea to a Running Apple App

## Context

Use this when the user gives an app description and wants the coding agent to implement it. The CLI creates a project starting point; the agent implements the requested features and verifies them with Xcode.

## Pattern

### One command to start

```bash
npx -y @nagarjuna2002/ios-agent@0.2.0 new MyApp --brief "A reading tracker with offline reading sessions and weekly goals" --xcodegen
```

The output includes SwiftUI source, an editable implementation brief, an XcodeGen project specification, and separate SVG icon layers. It preserves an existing nonempty project unless explicitly instructed; even force mode does not silently overwrite generated-file collisions.

Open the new folder in Claude Code, Codex, or Gemini CLI with this skill installed. Ask the agent to implement `App/APP_BRIEF.md` through build and visual verification. It should translate the idea into screens, data models, persistence, user flows, error states, and a small testable first release. Build the actual requested product instead of stopping at the starter screen.

### Build and see it

On macOS with Xcode and XcodeGen installed:

```bash
cd MyApp/App
xcodegen generate --spec project.yml
open MyApp.xcodeproj
xcodebuild -project MyApp.xcodeproj -scheme MyApp -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ../.ios-agent/build build CODE_SIGNING_ALLOWED=NO
```

Use Xcode’s destination list for simulator tests. The optional simulator MCP can help run and inspect the app; it requires local Xcode and is not exposed by the public knowledge server. Keep account credentials, service configuration and signing identities in the user’s environment.

### Finish the app identity

Customize the generated background, foreground and accent SVGs in the app’s IconLayers folder. Follow [Icon Composer](../design/icon-composer.md) to create a native icon with editable groups and appearance variants, then assign it to the target and verify it in a build. The starter layers are intentionally generic artwork.

### Client capabilities

Claude Code, Codex and Gemini CLI can perform local implementation when granted filesystem/terminal access. The portable ChatGPT plugin supplies the same workflow and bundled references. ChatGPT without a coding environment can prepare a plan and code artifacts; a local macOS environment must perform iOS simulator builds. A remote MCP knowledge endpoint supplies public reference tools and never gets access to the user’s local source tree.

## Anti-Patterns

- Calling the app complete just because scaffolding succeeded.
- Claiming automatic App Store publication, signing, backend provisioning or native icon creation.
- Replacing an existing app’s architecture with the starter scaffold.
- Presenting mock services or placeholder test assertions as production features.
