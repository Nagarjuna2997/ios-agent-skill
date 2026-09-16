# Installing the iOS Agent MCP Server

## One install, one MCP connection

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp@latest
```

The default server exposes 35 tools in 2.6.0: 12 review/metadata tools, 8 Apple reference tools, 14 simulator tools, and `create_app`. App scaffolding and simulator packages install automatically as dependencies; no separate installation or MCP connection is needed. Remove the separate knowledge/simulator connections if you previously configured them to avoid duplicate tools.

Create a starter directly:

```bash
npx -y ios-agent-mcp@latest new MyApp --brief "A reading list with local storage" --xcodegen
```

Requires Node.js 20+. Simulator operations require macOS and Xcode; XcodeGen is required to generate an Xcode project from the starter specification. The agent implements app features using the starter, source tools and verification tools. One install is not autonomous app generation. The default connection now includes tools that write files and operate the simulator; review and reference tools remain read-only.

**Load this when:** setting up `ios-agent-mcp` in Claude Code, Claude Desktop,
ChatGPT/Codex, Gemini, or another MCP-capable client.

The server includes Swift analysis and App Intents review plus `lint_skill`, which checks a
skill repository's own metadata. Full tool reference: `tools.md`.

It also serves three **resources** (`ios://project/info`, `.../dependencies`,
`.../issues`), which need a project root. Resolution order:

1. `--project PATH` in the client config
2. `IOS_AGENT_PROJECT`
3. the nearest ancestor of the working directory holding a `.ios-agent/`
   directory — the marker `ios-agent` writes (`docs/tooling/project-scaffolding.md`)
4. the working directory itself

The analysis tools only **read** that marker; it never creates one, while app creation and simulator tools have separate write/runtime effects. `ios://project/info`
reports `resolved_from` alongside the path, because an implicit root is
otherwise unfalsifiable — "no Swift files" reads identically whether the project
is empty or the server is pointed at the wrong directory.

Tools take an explicit path argument and need no configuration.
Worked sessions: `examples.md`.

---

## Choose your client

| Client | Install path | Capabilities |
|---|---|---|
| Claude Code/Desktop | Local stdio MCP configuration below | Unified local tools |
| Codex | Codex MCP CLI/config or the release plugin ZIP | Local analysis, knowledge and app-building skill |
| ChatGPT | Portable skills-only plugin ZIP; optional hosted knowledge MCP | Bundled workflows/references; implementation needs a coding environment |
| Gemini CLI | GitHub extension or local MCP configuration | GEMINI instructions, analysis and knowledge tools |

## Codex

```bash
codex mcp add ios-agent -- npx -y ios-agent-mcp@latest
```

Equivalent `config.toml` entry:

```toml
[mcp_servers.ios-agent]
command = "npx"
args = ["-y", "ios-agent-mcp@latest"]
```

Pass `--project` and an absolute app path when project resource discovery needs an explicit root. The release plugin ZIP is an alternative; use one method to avoid duplicate tools.

## ChatGPT plugin and remote MCP

The GitHub release includes `ios-agent-chatgpt.zip`, a self-contained skills-only plugin with the Apple references and app/icon workflow. It contains no local-process MCP configuration, so it does not pretend a browser can run `npx` on your Mac. Upload/import it through a supported plugin development or submission flow for your account. Public marketplace listing remains subject to publisher verification and platform review.

The optional [knowledge MCP server](knowledge-server.md) supports Streamable HTTP. Deploy it at a stable HTTPS URL, then connect `/mcp` through ChatGPT’s supported developer-mode workflow. The repository does not invent a production endpoint. Its remote tools serve public references and plans; actual local project analysis stays in the local MCP server.

## Gemini CLI

```bash
gemini extensions install https://github.com/Nagarjuna2997/ios-agent-skill
```

The repository’s `gemini-extension.json` registers the unified server and loads `GEMINI.md`. Alternatively use the Claude Desktop `mcpServers` object below in Gemini CLI settings. Use one method; the web chat is a different product and does not load CLI extensions.

Official client references: [Codex MCP](https://developers.openai.com/codex/mcp), [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins), [ChatGPT connection/testing](https://developers.openai.com/plugins/deploy/connect-chatgpt), [Gemini extension format](https://geminicli.com/docs/extensions/reference/).

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
"args": ["C:/Users/you/ios-agent-skill/mcp-server/dist/unified.js"]
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
  "args": ["/absolute/path/to/mcp-server/dist/unified.js"]
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
      "args": ["/absolute/path/to/ios-agent-skill/mcp-server/dist/unified.js"]
    }
  }
}
```

Use an **absolute** path — a relative one breaks the moment the client's working
directory differs.

---

## Requirements

- **Node 20+**. Check with `node --version`.
- Review/reference tools do not require Xcode. Simulator builds and tests require macOS/Xcode.
- Local review/reference tools read files. Builds may fetch dependencies, and simulator previews serve on loopback.

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

Review and local-reference tools read files. App creation writes a new starter; simulator tools execute Xcode and manage devices. Builds may fetch dependencies, and preview serves on loopback. The MCP client can send tool outputs to its model provider; review that client's settings.

## Xcode 27

Use the [in-Xcode agent setup](../tooling/xcode-27-agents.md#connect-this-server-inside-xcode-27). Xcode uses its own agent configuration directories. This setup is documented from Apple’s released guidance; runtime acceptance remains unverified on the current Xcode 26.6 host.

## Muse Code — partial verification only

Checked 2026-09-16 with the official Muse Code 1.3.0 (1.3.0-R3233.1) installer. In an isolated project, `muse init` created `AGENTS.md`; `muse skills list --workspace /absolute/project --trust-workspace --json` discovered this repo’s skill under the isolated project’s .claude/skills/ios-agent-skill directory with no diagnostics. The existing `AGENTS.md` mirror therefore applies; do not create a separate `MUSE.md`.

MCP tool discovery, hook schema/execution, verification observer and a real model session are **not yet verified**. No settings snippet, hook port, privacy-tier claim or Muse-specific ZIP is shipped on the basis of assumed compatibility. The installed CLI documents proxy-only networking by default; validate package fetching in the actual configured sandbox before relying on `npx`.

[Official Muse announcement and installer](https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2). The CLI is installed outside this repository for verification; user credentials were neither requested nor published.
