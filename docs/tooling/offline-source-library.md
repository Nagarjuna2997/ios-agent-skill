# Build from local source and Apple guidance

## Context

Use this workflow when implementing an Apple app without repeatedly browsing documentation or feeding entire manuals to an AI. The repository contains original implementation guides, editable source files, app templates, and testable Swift packages. Apple links identify the source of API guidance and support checking changed APIs; the local implementations can be read without opening those links.

This is not Apple's private framework implementation or a mirror of every Apple documentation article. The 405-technology directory includes services, tools and legacy APIs as well as Swift frameworks. A directory entry is not a promise of a complete working example for that technology. Generated discovery guides remain labelled as such.

## Pattern

Use a clone for offline work after installation. Search runs locally with Node and does not call an AI or make network requests:

```bash
node scripts/query-library.mjs search "Persistence" source
node scripts/query-library.mjs outline docs/frameworks/swiftdata.md
node scripts/query-library.mjs read samples/SkillPatterns/Sources/SkillPatterns/Persistence.swift 0 6000
```

`search` returns up to eight file paths, titles and sizes, without file bodies. `outline` returns headings with character offsets. `read` returns exact content, a content hash and `nextOffset`; continue from that offset until it is null when the complete source is needed. Offsets are JavaScript UTF-16 string indexes, not bytes. No excerpt is silently presented as a complete file.

The same library is bundled inside the knowledge MCP package:

1. Call `search_local_references` with a feature/API query and `kind: "source"` for reusable code, or `kind: "guide"` for explanations.
2. Use `get_reference_outline` to select a guide section.
3. Call `read_local_reference` with its exact returned path and offset. The default body budget is 6,000 characters; the maximum is 16,000 per call. Follow `nextOffset` only if necessary.
4. Read sibling package manifests, dependencies and tests before adapting a source file. Preserve error handling, actor isolation and availability requirements.
5. Build and test the resulting app with the installed SDK. A source file being indexed does not prove it builds independently.

`get_apple_technology` now defaults to an overview with local guide/source routes. Request `view: "full"` only when the entire guide and topic map are needed. The repository's Markdown examples also contain explicitly labelled wrong patterns; retain their surrounding explanation and do not automatically extract every fenced block as production Swift.

### Where the complete code lives

- `samples/SkillPatterns/`: Swift package containing persistence, streams, routing, observation, composition and signal-processing implementations with tests.
- `samples/AppleRecipes/`: original Apple API implementations with their own manifest, tests and build evidence. See its README for exact platform coverage.
- `templates/ios-app/`: an app's screens, models, repositories and test starting points.
- `templates/common-patterns/`: editable networking, persistence, authentication, design and navigation source; adaptation and app-level testing are required.
- `cli/src/`: complete source of the app scaffolder.
- `mcp-server/src/`: complete source of the analysis and local knowledge servers.

See `docs/apple/local-library.md` for the generated file inventory. The index contains metadata only. Content has one canonical source file; the MCP bundle stores identical content once by SHA-256. Plugin archives carry those same canonical files so they work without fetching individual guides.

### Apple guidance and ownership

Original code in this repository is covered by the repository's MIT license, subject to any file-specific notices. Apple documentation links in the guides are attribution and freshness references. Apple SDK binaries, internal source and proprietary manuals are not relicensed as part of this project. Use the installed SDK and the linked official guidance for availability or behavior that changed after the snapshot.

## Anti-Patterns

- WRONG: load the whole catalog and all guides for each feature. RIGHT: search first, then fetch the relevant section or source.
- WRONG: label link coverage as implementation coverage. RIGHT: identify actual source paths and show build/test evidence.
- WRONG: concatenate all Swift fences into one target. RIGHT: choose the correct implementation, its dependencies and tests; keep labelled anti-patterns out of production.
- WRONG: promise a fixed token reduction. RIGHT: limit returned characters and measure the selected model's actual usage. Characters are not tokens.
