# ios-agent-mcp

An MCP server that reviews Swift projects against the rules in
[ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill).

The skill teaches an agent how to *write* iOS code. This server lets an agent
*check* it — ten tools that read a Swift project and report defects with a file,
a line, the consequence, and the fix, plus one that lints a skill repository's
own metadata.

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
| `review_swift_memory` | Repeating `Timer` and `NotificationCenter` blocks capturing self, Combine sinks, non-`weak` delegates, stored closures, `unowned self` |
| `review_swift_security` | Hardcoded secrets, credentials in `UserDefaults`, disabled ATS, cleartext HTTP, TLS trust accepted without evaluation, MD5/SHA-1, Keychain accessibility |
| `review_swift_testing` | **Test files only.** Sleeping, tests with no assertion, live `URLSession`, `await` in an `XCTAssert` autoclosure, order-dependent static state |
| `review_swift_performance` | Formatters and collection work inside `body`, `ForEach` over indices, eager stacks in a `ScrollView`, blocking I/O on the render path |
| `lint_skill` | **Skill metadata, not Swift.** `SKILL.md` frontmatter, subagent `name`/filename mismatches, misspelled tool names, **read-only agents granted `Edit` or `Write`**, mirror files drifted from `SKILL.md`, broken doc references |

Every tool takes one argument:

```json
{ "path": "/absolute/path/to/your/project" }
```

The first ten want a Swift project root. `lint_skill` wants an Agent Skill
repository root — the folder containing `SKILL.md`.

Every review tool also returns `structuredContent` — typed data with `summary`,
`score`, `counts`, `files_checked`, `issues`, and `suggestions` — alongside the
markdown, so a workflow can branch on a result without regexing prose.

---

## Resources

Tools are verbs the model chooses to call. Resources are nouns a client can read
without being asked, so a project's shape can be attached to context up front.

```jsonc
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp", "--project", "/absolute/path/to/project"]
    }
  }
}
```

| Resource | Contains |
|---|---|
| `ios://project/info` | Counts, deployment target, UI framework, inferred architecture **with its evidence**, DI detection, frameworks |
| `ios://project/dependencies` | Third-party packages from `Package.swift` / `Package.resolved` / `Podfile`, plus Apple frameworks |
| `ios://project/issues` | Every finding across all nine categories, with counts by severity and category |

The root comes from `--project`, then `IOS_AGENT_PROJECT`, then the working
directory the client spawned the server in. **Every payload reports which root it
used**, so an empty project is never mistaken for a wrong path.

**There is deliberately no `ios://project/build-status`.** It would have to run
`xcodebuild`, which needs macOS and Xcode and breaks the
`filesystem: read, network: none` contract that lets this package install
anywhere in ~26 KB. Build and simulator state belong in the separate package that
already requires a full toolchain — see [ROADMAP.md](../ROADMAP.md).

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
npm test             # 123 tests: unit + end-to-end over real MCP stdio
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

After publishing, verify:

```bash
npm view ios-agent-mcp version     # registry has it
npx -y ios-agent-mcp --version     # 2.1.0
npx -y ios-agent-mcp --help        # usage, tool list, setup commands
```

`--help` and `--version` print and exit. Every other invocation starts the
stdio server and blocks waiting for a client, which is correct but looks like a
hang if you run it by hand.

To see exactly what would ship before committing to it:

```bash
npm pack --dry-run
```

Expect ~31 files: `dist/`, `mcp.json`, `README.md`, `LICENSE`, `package.json`. If `dist/` is missing, the build did not run.

### Version numbering

The npm package version and the repository version are **independent**:

| | Version | Why |
|---|---|---|
| `ios-agent-mcp` on npm | `2.1.0` | Generated from `package.json` — see below |
| `ios-agent-skill` repo / `SKILL.md` | `2.1.0` | Kept in lockstep since 2.1.0 |

**The version lives in `package.json` and nowhere else.** `mcp.json`,
`package-lock.json`, the CLI, and the MCP handshake are all generated from it by
`npm run sync-version`, which `build` and `typecheck` run automatically.

This exists because **2.0.1 shipped to npm with an `mcp.json` declaring
`1.0.0`** — the version was maintained by hand in four places, so one was always
wrong and nothing checked. CI runs `sync-version --check`, so a hand-edit fails
the build rather than reaching the registry.

Since 2.1.0 the skill and the server share a version. They were independent
before, which is exactly how 2.0.1 shipped with a manifest reading 1.0.0.

## License

MIT — see [LICENSE](./LICENSE).
