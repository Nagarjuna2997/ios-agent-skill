> Legacy adapter: not actively maintained. Current focus is Claude, ChatGPT/Codex, Gemini CLI and Muse. Request renewed support through a client-support issue.

# iOS Agent Skill for GitHub Copilot CLI

A self-contained SwiftUI implementation/verification skill and one unified MCP connection, pinned to `ios-agent-mcp@2.7.0`.

```bash
copilot plugin install Nagarjuna2997/ios-agent-skill:plugins/ios-agent-copilot
```

Requires Node.js 20+. Simulator tools require macOS/Xcode. The connection exposes 35 tools: 12 read-only Swift reviews, 8 reference tools, 14 simulator tools and app scaffolding. It includes write and simulator operations; it is not a read-only server. Plugin installation configures MCP automatically; do not add a second connection. Pass absolute app paths to tools. The skill alone does not provide Xcode or a hosted simulator.

Example: ask Copilot to implement a reading list with persistence and search, test failed writes, then verify add/finish/relaunch/search and inspect simulator screenshots. See the [working source sample](../../samples/ReadingList/README.md).

The [app-building loop](../../docs/tooling/app-building-loop.md) is a separate source-checkout preview using Claude CLI. It is not included in npm 2.5.1 and is not a Copilot loop implementation; real Claude planning/repair remains unverified. No API keys or credentials are shipped with this plugin.

Validation: skill frontmatter and references pass Microsoft Vally lint; an isolated Copilot CLI install discovers the skill and the pinned MCP configuration. Marketplace acceptance is a separate maintainer decision.
