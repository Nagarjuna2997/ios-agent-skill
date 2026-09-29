# Reading List screenshot composition example

Inputs are the existing simulator captures under `site/evidence/series/reading-list/`: empty, add, library, detail and search-empty. This sample does not recapture or invent app UI. English copy in `recipe.json` and supplied Spanish copy in `es-ES.json` describe those states.

From the repository root, build the MCP server, then:

```bash
node scripts/generate-screenshot-example.mjs /tmp/reading-list-studio-new
```

Use a new destination. The script renders 30 PNGs: five screens × minimal/dark-premium/gradient × en-US/es-ES. Each locale gets a gallery, contact sheet, metadata and validation; the root gets path-redacted `evidence.json`. It throws unless both sets have 15 passing entries. Local fonts are required (Arial on macOS/Windows, DejaVu Sans on Linux, or edit the recipe's `fontPaths`). No service credentials, simulator boot, network or app upload is needed.

[Workflow and limitations](../../docs/screenshots/README.md). Website previews are reduced contact sheets of this output, not raw UI screenshots. Full-resolution sets stay local to avoid adding dozens of large duplicate images to the repository.
