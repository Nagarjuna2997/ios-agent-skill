# Grok Build connection

Grok Build can use the existing iOS Agent MCP server over local stdio. There is no
separate Grok server, duplicated tool catalog or required inference-provider change.
This setup is for the official `grok` coding CLI, not an assertion that Grok web
chat or every Grok bot can launch a process on your Mac.

## Connect

Install Grok Build using its [official setup instructions](https://docs.x.ai/build/overview),
then run from your app folder:

```sh
grok mcp add ios-agent -- npx -y ios-agent-mcp@latest
grok mcp doctor ios-agent --json
```

Node.js 20+ is required. Local Xcode builds and simulator tools require macOS and
Xcode. Grok account access and model charges are separate from this open-source
package. Authenticate directly with Grok; never put account keys in this repository.

The equivalent table is in [grok-config.toml](../../templates/clients/grok-config.toml).
Merge it into `~/.grok/config.toml` without replacing existing settings. Its longer
startup timeout allows an initial npm download. To share only with a project, use
`grok mcp add --scope project ios-agent -- npx -y ios-agent-mcp@latest`.

Grok can import Claude/Cursor MCP configuration too. Run `grok inspect` and
`grok mcp list --json` before adding a duplicate connection. In the TUI, `/mcps`
shows connections. Use `grok mcp remove ios-agent` to remove the registered entry.

## First task

Ask Grok to list the `ios-agent` tools, call `search_local_references` for a narrow
Swift topic, and review a small synthetic Swift file. Do not interpret tool discovery
as a successful model-driven build. Review write operations before allowing source
changes, simulator actions or distribution workflows.

The repository's existing `AGENTS.md` supplies project instructions when working
in this checkout. Grok also supports skills in `.grok/skills/` and extra skill paths;
use the existing skill with its referenced docs/templates, not a detached copy of
SKILL.md. Installing the MCP connection alone does not install a slash command.
The package's `install-command` command currently targets Claude Code.

## Other Grok environments

The xAI Responses API supports **remote** MCP over HTTP/SSE. It cannot reach this
local stdio process directly. This project does not deploy an authenticated public
Mac endpoint for you. Do not expose the write-capable local server as an unauthenticated
public service. API remote-MCP setup and live Grok bot sessions require separate
verification; this change does not add them or add Grok to `ai ask` provider routing.

## Sources

Checked October 28, 2026:

- [Grok MCP configuration and diagnostics](https://docs.x.ai/build/features/mcp-servers)
- [Grok skills and plugin discovery](https://docs.x.ai/build/features/skills-plugins-marketplaces)
- [xAI remote MCP API](https://docs.x.ai/developers/tools/remote-mcp)

## Recorded verification

Grok Build 1.0.70 connected to ios-agent-mcp 2.10.3, negotiated MCP 2025-11-25 and
discovered 82 tools on October 28, 2026. This is an actual Grok `mcp doctor` result,
not a mock client. See [the bounded evidence record](../../examples/client-verification/grok-1.0.70.json).
No model-driven session or tool execution is claimed by that discovery check.

Repeat on macOS/Linux against installed binaries and a built checkout (the helper
requires POSIX process-group cleanup; on Windows use `grok mcp doctor` directly):

```sh
node scripts/verify-grok.mjs /absolute/path/to/grok /absolute/path/to/mcp-server/dist/unified.js
```

The probe trusts only its own temporary project configuration for the invocation,
uses the existing server, and deletes the temporary workspace. It does not call a
model, configure your app, register a permanent MCP server or print credentials.
Project-scoped configurations outside this probe may require Grok's workspace trust
approval; review them before granting it.
