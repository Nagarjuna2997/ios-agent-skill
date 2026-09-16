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
| Muse Code | Local stdio setup below; existing AGENTS.md and Claude-format skills | MCP discovery and Stop command hook verified; model session unverified |
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

The optional [knowledge MCP server](knowledge-server.md) supports Streamable HTTP. Deploy it at a stable HTTPS URL, then connect `/mcp` through ChatGPT’s supported developer-mode workflow. OpenAI also supports Secure MCP Tunnel for developer-mode access to a private stdio or HTTP server; see the [official connection guide](https://developers.openai.com/plugins/deploy/connect-chatgpt). This release does not create a tunnel or expose your Mac. Account/workspace policy may limit developer mode. The repository does not invent a production endpoint. Its remote tools serve public references and plans; actual local project analysis stays in the local MCP server.

## Gemini CLI

Gemini CLI 0.49.0 validated the extension manifest and connected to the 2.7.0 server release candidate in an isolated project. A real model-driven app-building session remains unverified.

```bash
gemini mcp add ios-agent -- npx -y ios-agent-mcp@latest
```

The command above connects to the published package. For bundled `GEMINI.md` guidance, the repository’s `gemini-extension.json` is an alternative; check that its pinned npm version is published before running `gemini extensions install https://github.com/Nagarjuna2997/ios-agent-skill`. Alternatively use the Claude Desktop `mcpServers` object below in Gemini CLI settings. Use one method; the web chat is a different product and does not load CLI extensions.

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

## Muse Code

Muse Code joins Claude, Codex and Gemini CLI through the same unified local MCP
server. No separate server package, plugin ZIP or `MUSE.md` is needed.

Install the server outside the agent sandbox, using Node.js 20 or later:

```sh
npm install -g ios-agent-mcp@latest
```

Merge this into `~/.config/muse/settings.json`; preserve your other settings and
existing server entries. Do not replace the whole file. `schema_version` is required.

```json
{
  "schema_version": 1,
  "mcpServers": {
    "ios-agent": {
      "command": "ios-agent-mcp",
      "args": []
    }
  }
}
```

[Copyable template](../../templates/clients/muse-settings.json). If Muse cannot find
the command, use the absolute executable path printed by `command -v ios-agent-mcp`.
Restart Muse after updating settings. This avoids fetching a package inside Muse's
default proxy-only sandbox. It does not disable sandboxing or grant network access.

For local instructions, use the repository's `AGENTS.md`. For skill discovery,
keep the original frontmatter-bearing `SKILL.md` under your project's
project-local .claude/skills/ios-agent-skill folder with its companion references. Do not rename the
frontmatter-stripped `AGENTS.md` to `SKILL.md`. Trust only workspaces you recognize.

### Verified compatibility, 2026-09-16

Muse Code **1.3.0 (1.3.0-R3233.1)** connected to the published **ios-agent-mcp 2.6.0**
using stdio and discovered **35 tools**, including reviews, local references,
`create_app` and simulator tools. Initialization and tool discovery used the actual
Muse executable with its local `echo` provider. No account credentials or model
request were needed. `muse init` and discovery of the repository's Claude-format
skill were separately verified earlier.

A command-based **Stop hook executed** in an isolated test. The
[optional maintainer hook template](../../templates/hooks/muse-settings.json) runs
this repository's existing verification script. It is for sessions rooted in this
repository only: confirm the working directory before enabling it. Do not copy it
into an unrelated user's app or apply it globally across projects. Hook commands
execute shell code, so inspect commands before merging them into your settings.

**Not verified:** model-directed tool invocation, PreToolUse/PostToolUse ports,
verification observer behavior, sandboxed simulator operations and end-to-end
app creation by Muse. Tool discovery is not evidence that a model completed an app.
No observer toggle or privacy/pricing-tier claim is supplied without verification.

[Recorded verification result](../../examples/client-verification/muse-1.3.0.json).
The harness asserts four representative tools and records the complete discovered
catalog and installed server package version.

### Recheck on upgrades

From this repository, with Muse and the MCP package already installed:

```sh
node scripts/verify-muse.mjs /absolute/path/to/muse /absolute/path/to/ios-agent-mcp/dist/unified.js
```

This uses temporary configuration, disables foreign personal context, and checks
MCP discovery plus a Stop hook without a model call. It prints versioned JSON
results and removes the temporary files. It does not edit your Muse settings.
Rerun it when either client or server changes; record model-based checks separately.
Updating npm's `@latest` does not automatically upgrade an existing global install:
rerun `npm install -g ios-agent-mcp@latest` when choosing to upgrade.

Official sources: [Meta announcement](https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2),
[configuration](https://dev.meta.ai/docs/muse-code/configuration), and
[extensions](https://dev.meta.ai/docs/muse-code/extending). The latter documentation
requires sign-in; the compatibility claims above come from executable tests.

## Support scope and optional source installer

Active client families are Claude, ChatGPT/Codex, Gemini CLI and Muse. Other
standard MCP clients may work, but compatibility is not a maintained support
claim. Request another client through GitHub Issues and use 👍 reactions to
register demand; feasibility and verification also determine priorities.

The optional `install.sh` requires an explicit `--client`. It clones source skills
for Claude, Codex or Muse, and prints dedicated instructions for Gemini/ChatGPT.
It does not configure MCP. Existing installs update only when the checkout has
the expected origin, a clean worktree and the main branch.
