# Installing the iOS Agent MCP Server

**Load this when:** setting up `ios-agent-mcp` in Claude Code, Claude Desktop,
ChatGPT/Codex, Gemini, or another MCP-capable client.

The server exposes ten Swift analysis tools plus `lint_skill`, which checks a
skill repository's own metadata. Full tool reference: `tools.md`.

It also serves three **resources** (`ios://project/info`, `.../dependencies`,
`.../issues`), which need a project root. Resolution order:

1. `--project PATH` in the client config
2. `IOS_AGENT_PROJECT`
3. the nearest ancestor of the working directory holding a `.ios-agent/`
   directory — the marker `ios-agent` writes (`docs/tooling/project-scaffolding.md`)
4. the working directory itself

The server only **reads** that marker; it never creates one, so its
`filesystem: read, network: none` contract is unchanged. `ios://project/info`
reports `resolved_from` alongside the path, because an implicit root is
otherwise unfalsifiable — "no Swift files" reads identically whether the project
is empty or the server is pointed at the wrong directory.

Tools take an explicit path argument and need no configuration.
Worked sessions: `examples.md`.

---

## Claude Code

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp
```

Verify:

```bash
claude mcp list
```

## Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Restart Claude Desktop. The tools appear under the connectors icon.

## Platform notes

Config file locations differ by OS. The command itself is the same everywhere.

| | Claude Desktop config |
|---|---|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

### Windows

`npx` is a shell script, not an executable, so some MCP clients cannot spawn it
directly. If the server fails to start with no error, wrap it in `cmd`:

```json
{
  "mcpServers": {
    "ios-agent": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "ios-agent-mcp"]
    }
  }
}
```

Use forward slashes or escaped backslashes in any absolute path — raw `\` in
JSON is an escape character:

```json
"args": ["C:/Users/you/ios-agent-skill/mcp-server/dist/index.js"]
```

### macOS and Linux

The plain `npx` form works. If `npx` is not on the client's `PATH` (GUI apps do
not inherit your shell profile), use an absolute path to `node`:

```bash
which node    # e.g. /opt/homebrew/bin/node
```

```json
{
  "command": "/opt/homebrew/bin/node",
  "args": ["/absolute/path/to/mcp-server/dist/index.js"]
}
```

This is the single most common cause of "the server won't start" on macOS.

### Avoiding a fetch on every launch

`npx -y` re-resolves the package each time. Install once instead:

```bash
npm install -g ios-agent-mcp
```

```json
{ "command": "ios-agent-mcp", "args": [] }
```

## From source

```bash
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git
cd ios-agent-skill/mcp-server
npm install && npm run build
```

Then point the client at the built entry point:

```json
{
  "mcpServers": {
    "ios-agent": {
      "command": "node",
      "args": ["/absolute/path/to/ios-agent-skill/mcp-server/dist/index.js"]
    }
  }
}
```

Use an **absolute** path — a relative one breaks the moment the client's working
directory differs.

---

## Requirements

- **Node 18+**. Check with `node --version`.
- No Xcode required. The server is static analysis; it never invokes a build.
- No network access. It reads local files only.

---

## Verifying it works

Ask the agent:

> Analyze the Swift project at /path/to/MyApp

You should get a structure summary and a per-category finding table. If instead
you get "No Swift files found", the path is wrong — pass the folder containing
`Package.swift` or the `.xcodeproj`, not a subfolder.

---

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| Tools do not appear | Client not restarted, or malformed JSON in the config |
| "Path does not exist" | Relative path passed — use an absolute one |
| "No Swift files found" | Pointed at a build directory, or the wrong folder |
| Everything is clean and you doubt it | Run `analyze_swift_project` — it reports the file count it scanned |
| `npx` fetches every launch | Install globally: `npm i -g ios-agent-mcp`, then use `ios-agent-mcp` as the command |

Build outputs are skipped deliberately: `.build`, `DerivedData`, `Pods`,
`Carthage`, `node_modules`, and `*.xcodeproj` bundles. So is `Package.swift` —
it is build configuration, not app source.

---

## Privacy

The server reads files under the path you pass to a tool. It makes **no network
requests** and **writes nothing**. Your source never leaves the machine, except
insofar as your MCP client sends the tool's text output to its model — the same
as any file you paste into a chat.
