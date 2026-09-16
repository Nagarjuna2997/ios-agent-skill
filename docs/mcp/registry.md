# Official MCP Registry publication

The namespace is `io.github.Nagarjuna2997/ios-agent-skill`. `mcp-server/package.json` carries the matching `mcpName`; `mcp-server/server.json` declares the npm artifact and stdio transport. The existing version-sync script keeps package and registry versions aligned.

The [official publication flow](https://modelcontextprotocol.io/registry/quickstart) requires the matching npm version to be public before registry submission, plus authentication proving control of the namespace. Metadata alone does not publish a listing.

From `mcp-server`, after package checks and npm publication:

```bash
node scripts/sync-version.mjs --check
mcp-publisher login github
mcp-publisher publish
```

Keep authentication files outside the repository. Verify the returned registry record and version before claiming acceptance. Downstream directories have their own ingestion schedule; a successful registry publication does not establish a PulseMCP listing.
