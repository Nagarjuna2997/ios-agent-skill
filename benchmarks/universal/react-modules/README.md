# Local React component modules

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-modules/App.tsx TripList > /tmp/trip-list-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/trip-list-ir.json /tmp/new-trip-list
```

This fixture resolves three local TSX files through the existing React parser,
App IR and SwiftUI generator. It does not install packages or execute JavaScript.
The existing `ios_import_html` MCP tool with `adapter: "react"` uses the same
local-file path. Studio paste mode remains single-file.

The entry may use supported React state/router imports. Dependency modules contain
named function components and relative component imports only. Import names must
match declarations; aliases, namespace imports, re-exports, dependency package
imports, cycles, duplicate component names and components used without an import
are rejected. Paths start with `./`, stay under the entry directory and resolve to
explicit `.tsx` files (the extension may be omitted). No index/package resolver.
Symlink files and escapes through parent symlinks are rejected. Limits: 32 modules,
256 KiB aggregate source, plus the existing IR/expansion limits.

IR sources retain per-file hashes and original UTF-8 evidence ranges. A single
source keeps the previous IR shape. Changes in source files require re-import;
this is a snapshot rather than a watched development server.

Portable tests cover linking, deterministic rendering and failures. Native build,
interaction/accessibility and visual fidelity for this fixture have not been run.
