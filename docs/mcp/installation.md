# Installing the iOS Agent MCP Server

**Load this when:** setting up `ios-agent-mcp` in Claude Code, Claude Desktop,
Cursor, or another MCP client.

The server exposes six Swift analysis tools. Full tool reference: `tools.md`.
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

## Cursor

`.cursor/mcp.json` (per project) or `~/.cursor/mcp.json` (global) — same shape
as above.

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
