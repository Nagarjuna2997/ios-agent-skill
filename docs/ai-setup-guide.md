# AI Setup Guide

This repository intentionally focuses on three AI entry points:

- Claude Code / Claude Desktop
- ChatGPT / Codex
- Gemini CLI

Other AI-tool mirrors were removed to keep the repo smaller and easier to
maintain.

## Shared Setup

Clone the skill into your iOS project:

```bash
cd /path/to/YourApp
git clone https://github.com/Nagarjuna2997/ios-agent-skill.git .ios-skill
```

The three supported instruction mirrors are generated from `SKILL.md`:

| Tool family | File |
|---|---|
| Claude | `CLAUDE.md` |
| ChatGPT / Codex | `AGENTS.md` |
| Gemini | `GEMINI.md` |

When `SKILL.md` changes, regenerate them:

```bash
./scripts/sync-mirrors.sh
./scripts/sync-mirrors.sh --check
```

## Claude Code

From inside the project:

```bash
cd /path/to/YourApp
claude
```

Claude Code reads `CLAUDE.md` when it is present in the working tree. If the
skill is cloned as `.ios-skill/`, point Claude at the docs or copy `CLAUDE.md`
to the project root when you want the rules always loaded.

Add the static MCP analyzer:

```bash
claude mcp add ios-agent -- npx -y ios-agent-mcp --project /path/to/YourApp
```

## Claude Desktop

Edit the Claude Desktop MCP config and add:

```jsonc
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp", "--project", "/path/to/YourApp"]
    }
  }
}
```

Restart Claude Desktop after editing the config.

## ChatGPT / Codex

Use `AGENTS.md` as the repo instruction file for Codex-style agents.

Recommended layout:

```bash
cd /path/to/YourApp
cp .ios-skill/AGENTS.md AGENTS.md
```

Then open the project in Codex/ChatGPT tooling and ask it to load the iOS skill
rules before generating Swift.

If your client supports MCP, configure `ios-agent-mcp` with:

```jsonc
{
  "mcpServers": {
    "ios-agent": {
      "command": "npx",
      "args": ["-y", "ios-agent-mcp", "--project", "/path/to/YourApp"]
    }
  }
}
```

## Gemini CLI

Use `GEMINI.md` as the Gemini instruction file:

```bash
cd /path/to/YourApp
cp .ios-skill/GEMINI.md GEMINI.md
gemini
```

Ask Gemini to follow the iOS skill rules for Swift, SwiftUI, architecture,
design tokens, accessibility, testing, and verification evidence.

## First Prompt

Use this after setup:

```text
Use the iOS Agent Skill rules. Build this feature with SwiftUI, protocol-based
dependencies, @MainActor @Observable view models, tokenized colors, previews
that do not touch network or disk, and verification evidence.
```

For app-description driven generation, use
[`docs/tooling/app-description-workflow.md`](tooling/app-description-workflow.md).
