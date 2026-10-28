# AI/ML API connection

AI/ML API publishes a hosted MCP server at `https://mcp.aimlapi.com/mcp` that
exposes its model gateway: model discovery, chat, embeddings, and image, video and
audio generation, billed to the user's own AI/ML API account. It can run in the
same MCP client as iOS Agent MCP. Nothing in this repository calls it, bundles it,
resells it or stores its credentials; the iOS Agent server works without it.

This page covers running the two servers side by side and the one iOS workflow
where the pairing is useful. It is not an endorsement of a provider or a claim that
any AI/ML API model produces App Store-ready assets.

## Who it is for

Developers who already hold an AI/ML API subscription or balance and want
generation capabilities the iOS Agent server does not provide, mainly app icon
concepts, placeholder imagery and short sounds for prototypes. The account, sign-in
and charges belong to the user. Without an AI/ML API balance the connector lists
models but billable inference fails; that is the provider's behavior, not an iOS
Agent error.

## Connect both servers

Authentication is OAuth through the browser by default. Do not paste an AI/ML API
key into any file in your app repository or into this project.

Claude Code:

```sh
claude mcp add ios-agent -- npx -y ios-agent-mcp@latest
claude mcp add --transport http aimlapi https://mcp.aimlapi.com/mcp
```

Run `/mcp`, select `aimlapi` and choose Authenticate. Add `--scope user` to the
second command to make the connector available in every folder.

Claude Desktop or Claude web: add `https://mcp.aimlapi.com/mcp` as a custom
connector under Settings → Connectors and click Connect. Keep the local iOS Agent
stdio entry from [installation.md](installation.md#claude-desktop); the two do not
replace each other.

Cursor: merge [aimlapi-cursor.json](../../templates/clients/aimlapi-cursor.json)
into `~/.cursor/mcp.json` or `.cursor/mcp.json`. Leave out any `headers` block so
OAuth is used, then enable and log in from the MCP settings pane.

Other clients need remote MCP over Streamable HTTP with OAuth 2.1, PKCE and dynamic
client registration. If a client only supports bearer headers, the user supplies
their own key through the client's secret storage, never through this repository.

## When to use which server

| Task | Server |
|---|---|
| Swift review, Apple references, simulator, `/ios-build`, screenshots | iOS Agent MCP |
| Generate an icon concept, placeholder image, mock audio | AI/ML API (user's account) |
| Turn generated artwork into a layered `.icon` or an asset catalog | iOS Agent MCP: [icon-composer.md](../design/icon-composer.md), [asset-generation.md](../design/asset-generation.md) |
| Check a generated palette against contrast rules | iOS Agent MCP: `review_color_system` |

A typical flow: describe the app, let the agent plan it with `/ios-build`, ask the
AI/ML API connector for a few icon concepts, pick one, then route the chosen file
through the icon and asset guides above. Generated artwork is the user's to review
for licensing, trademark and App Review suitability; neither server checks that.

## Boundaries

- iOS Agent MCP never sends app source, prompts, logs or paths to AI/ML API, and
  this project adds no provider routing for it. The `ai ask` helper is unchanged.
- The connector's tools can spend the user's balance. Review tool permissions
  before allowing autonomous calls, the same as for file-writing iOS Agent tools.
- Removing the connector from a client does not revoke its token; revoke the app
  in the AI/ML API account for a clean reinstall.
- Rate limits, model availability and pricing are the provider's and change
  without notice. Check the provider's pages rather than this guide for current
  numbers.

## Sources

Checked October 28, 2026:

- [AI/ML API MCP quickstart](https://docs.aimlapi.com/quickstart/mcp)
- [AI/ML API model catalog](https://aimlapi.com/)

## Recorded verification

None. This page documents the provider's published setup and the intended pairing.
Connecting the hosted server requires an interactive OAuth sign-in with a personal
AI/ML API account, which has not been exercised from this repository's test
environment, so no tool discovery count or model session is claimed. Treat the
steps above as unverified until you run them yourself.
