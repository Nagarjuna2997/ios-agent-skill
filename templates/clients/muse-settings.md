# Muse Code settings template

`muse-settings.json` was verified on Muse Code 1.3.0 (1.3.0-R3233.1) on 2026-09-16
against ios-agent-mcp 2.7.0. See [the recorded check](../../examples/client-verification/muse-1.3.0.json).

The `mcpServers` key in this template is the one that loaded on 1.3.0.
Some descriptions of Meta’s documentation quote `mcp_servers` (snake_case);
that alternative has not been verified here. If a later release rejects the template,
check that release’s configuration documentation and open an issue with the client
version and a synthetic configuration, without credentials or private paths.

The file must contain `"schema_version": 1` or Muse Code refuses to start.
Preserve existing settings when merging this template.
