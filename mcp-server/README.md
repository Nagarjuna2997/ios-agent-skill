# ios-agent-mcp

An MCP server that reviews Swift projects against the rules in
[ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill).

The skill teaches an agent how to *write* iOS code. This server lets an agent
*check* it — six tools that read a Swift project and report defects with a file,
a line, the consequence, and the fix.

```
You:  Review my Swift project for concurrency problems.

Claude → review_swift_concurrency

🔴 Sources/FeedModel.swift:3 — @Observable type is not @MainActor-isolated.
   Why: @Observable grants no isolation. SwiftUI reads this state during layout
        while any task may write it — a data race under Swift 5 mode, a compile
        error under Swift 6.
   Fix: Annotate the type: `@MainActor @Observable final class …`
```

---

## Install

### Claude Code

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp
```

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git
cd ios-agent-skill/mcp-server
npm install && npm run build
# then point your client at: node /absolute/path/to/mcp-server/dist/index.js
```

---

## Tools

| Tool | Finds |
|------|-------|
| `analyze_swift_project` | Structure — file counts, deployment target, frameworks, tests — plus finding counts per category. **Start here.** |
| `review_swift_concurrency` | `@Observable` without `@MainActor`, `Task.detached`, `DispatchQueue.main.async`, `@unchecked Sendable`, `nonisolated(unsafe)`, unstructured `Task` in `onAppear`, empty `catch`, a type named `Task` |
| `review_swift_architecture` | Live-implementation default arguments, presentation naming `URLSession`/`APIClient`/`ModelContext`, singletons in view models, domain importing SwiftUI, nested `NavigationStack`, `NavigationView` |
| `review_swiftui` | Fixed font sizes and heights, `AnyView`, `.cornerRadius`, literal spacing, materials over solid backgrounds, view state on models, `ObservableObject`, `@EnvironmentObject`, `try!` |
| `check_availability_guards` | Missing guards, **over-restrictive guards** (an iOS 26 API guarded at iOS 27 silently drops every iOS 26 device), Foundation Models without a runtime availability check |
| `audit_app_store_readiness` | Permission frameworks with no Info.plist purpose string, missing `PrivacyInfo.xcprivacy`, unlocalized strings, unlabeled icon buttons, `print()` |

Every tool takes one argument:

```json
{ "path": "/absolute/path/to/your/project" }
```

---

## What it does and does not do

**Does:** static analysis. Reads `.swift`, `Info.plist`, `Package.swift`, and
`project.pbxproj` under the path you give it. No network, no writes.

**Does not:** prove your app builds or behaves correctly. Run `swift build` and
`swift test` for that — the tools say so in their own output.

Findings are graded so you can triage:

| | Meaning |
|---|---|
| 🔴 **blocker** | Crashes, data races, or App Review rejection |
| 🟠 **serious** | Real defect — untestable code, accessibility failure, deprecated API |
| 🟡 **minor** | Maintainability and consistency |

Test, mock, stub, and preview files are exempt from the app-code-only rules, and
`Package.swift` is skipped — they legitimately do things app code must not.

---

## Development

```bash
npm install
npm run build        # tsc
npm test             # 38 tests: unit + end-to-end over real MCP stdio
npm run typecheck
```

Analyzers are pure functions of `(path, content) → Finding[]`, so they are
tested without the MCP transport. `test/server.smoke.test.js` launches the real
server and speaks the real protocol, because unit tests cannot tell you whether
the server actually starts.

To add a rule: write the analyzer, then a test that **fails without the rule**.
A test that passes either way is not a test.

---

## Publishing (maintainers)

```bash
cd mcp-server
npm install          # REQUIRED FIRST — see below
npm login
npm publish
```

**`npm install` is not optional.** `prepublishOnly` runs `npm run build && npm test`, and `build` is `tsc`. On a fresh clone there is no `node_modules`, so the compiler is not present and publish fails with:

```
error TS2591: Cannot find name 'node:fs/promises'. Do you need to install
type definitions for node? Try `npm i --save-dev @types/node`
```

That is the guard working as intended — it refuses to publish an unbuilt package — but the fix is `npm install`, not disabling the hook.

To see exactly what would ship before committing to it:

```bash
npm pack --dry-run
```

Expect ~31 files: `dist/`, `mcp.json`, `README.md`, `LICENSE`, `package.json`. If `dist/` is missing, the build did not run.

### Version numbering

The npm package version and the repository version are **independent**:

| | Version | Why |
|---|---|---|
| `ios-agent-mcp` on npm | `1.0.0` | First release of this package |
| `ios-agent-skill` repo / `SKILL.md` | `2.0.0` | Its own release history |

This is not a mismatch. Bump the npm version only when the server changes.

## License

MIT — see [LICENSE](./LICENSE).
