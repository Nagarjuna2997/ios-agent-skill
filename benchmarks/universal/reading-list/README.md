# Editing a collection by record ID

This React fixture starts with two books titled Cedar. Its literal record collection, keyed links, parameterized detail route, and controlled title editor map to shared App IR 1.7. SwiftUI preserves the entry-owned collection while navigating with the system Back button. Relaunch recreates the initial collection, matching React's in-memory state.

The supported syntax uses a nonempty array of up to 100 objects with a unique URL-safe string `id` and the same 1–16 string fields. Map one collection to `Link` elements keyed by that ID, ending the path with its interpolation. A route with one trailing `:parameter` reads it with `useParams` and selects its record with `find` and strict equality. A text input may immutably update its bound string field with a conditional map over that collection. The stable ID cannot be edited. Dynamic network data, arbitrary map callbacks, filtering, sorting and nested parameterized routes remain outside this grammar.

From the repository root after building the MCP server:

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/reading-list/App.tsx ReadingShelf > /tmp/reading-shelf-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/reading-shelf-ir.json /tmp/new-reading-shelf
node benchmarks/universal/reading-list/run.mjs benchmarks/universal/native-behavior/ios-27.2.json /tmp/new-reading-shelf-evidence
```

At Large and XXXL, the XCTest opens the second Cedar, checks its author, edits its title, returns to the list, and revisits both books. It verifies that the first title stays unchanged. The run records a screenshot and test result at each size. This fixture tests native interaction and accessibility identifiers. It does not establish visual fidelity, a live backend, or persistence across launch.
