# Apple Knowledge MCP

## Context

`ios-agent-knowledge` is the public-reference companion to `ios-agent-mcp`. Both binaries ship in `ios-agent-mcp@2.2.0`. The analyzer keeps its eleven local-project tools; the knowledge server has five separate tools and never exposes project paths over HTTP.

## Pattern

| Tool | Result |
|---|---|
| `search_apple_technologies` | Ranked matches in the 405-technology snapshot |
| `get_apple_technology` | Source URL, availability metadata, topic links, and local guide |
| `get_apple_updates` | Search of 96 update/release-note landing pages |
| `plan_ios_app` | Implementation workflow and CLI executable/argument array |
| `plan_app_icon` | Editable foreground-layer specification and Icon Composer workflow |

Start a local MCP connection:

```bash
npx -y --package=ios-agent-mcp@2.2.0 ios-agent-knowledge
```

For a remotely hosted ChatGPT MCP connection, run the HTTP transport behind your host’s HTTPS ingress:

```bash
npx -y --package=ios-agent-mcp@2.2.0 ios-agent-knowledge --http --host 0.0.0.0 --port 3000
```

The MCP route is `/mcp`; readiness is `/health`. Without `--http`, the process uses stdio. The default HTTP host is loopback. The Dockerfile at `mcp-server/Dockerfile.knowledge` builds this public-reference service from the repository root.

This service accepts only search strings, catalog IDs and app/icon briefs. It reads a bundled allowlisted knowledge file, not caller-supplied file paths. It has no source upload, code execution, build or publishing tools, makes no runtime network requests, and does not store briefs. Configure HTTPS, request limits and operational logging on the deployment host. Account-specific or private-data tools would need a separate authentication design.

The data has explicit snapshot dates. Refresh source snapshots in the repository and rebuild before release. A successful HTTP handshake proves protocol compatibility, not that an arbitrary host or client account has been configured.

## Anti-Patterns

- Exposing the local analyzer to the internet with arbitrary filesystem paths.
- Advertising a localhost address as a published ChatGPT endpoint.
- Treating `plan_ios_app` as an autonomous code generator; the coding agent performs implementation.
- Describing catalog snapshots as live Apple updates.

Sources: [OpenAI MCP server guidance](https://developers.openai.com/plugins/build/mcp-server), [plugin submission](https://developers.openai.com/plugins/deploy/submission). A public directory submission needs a stable HTTPS endpoint and publisher verification; a skills-only plugin bundle is also supported.
