# Svelte static-markup fixture

```sh
node mcp-server/dist/unified.js app-ir inspect-svelte benchmarks/universal/svelte-static/App.svelte GreenRoute > /tmp/green-route.json
node mcp-server/dist/unified.js app-ir generate /tmp/green-route.json /tmp/new-green-route
```

This initial adapter supports static lowercase HTML elements and the existing
inline-style subset inside a `.svelte` file. It shares structural validation with
Vue and lowering with the HTML adapter. No Svelte compiler, JavaScript execution,
network access or package installation occurs during import. Source hashes and
UTF-8 ranges refer to the original file.

Scripts, stylesheets, expressions, blocks, components, runes, directives, slots,
assets and SvelteKit routing are not implemented. Unsupported syntax either
throws or records a limitation that blocks generation. Raw braces are rejected,
including in comments; use HTML entities for literal brace text. Explicit matching
tags are required. HTML parser repair cannot silently change template nesting.

CLI, MCP (`ios_import_html`, `adapter: "svelte"`) and Studio share this importer.
Portable tests establish conversion/output parity and negative cases only. Native
builds, interaction/accessibility tests and visual fidelity for this fixture are
not yet verified. This is not general Svelte/SvelteKit conversion.
