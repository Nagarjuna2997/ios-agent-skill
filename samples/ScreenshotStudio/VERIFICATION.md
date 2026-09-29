# Screenshot Studio implementation record

Verified locally on September 29, 2026. This is source-release evidence, not an npm publication or App Store approval.

## 1–2. Files added and modified

Added `mcp-server/src/screenshots/{catalog,input,text,studio,tools,cli}.ts`, `mcp-server/test/screenshots.test.js`, the `samples/ScreenshotStudio/` recipe/copy/evidence documentation, `docs/screenshots/README.md`, `scripts/generate-screenshot-example.mjs`, `scripts/render-screenshot-studio.mjs`, `site/screenshot-studio.html` and reduced preview/evidence files under `site/evidence/screenshots/`.

Modified the unified/index server entry points, MCP manifest and package dependency lock, protocol/count tests, README/package README, CHANGELOG, SKILL and its instruction mirrors, local-library index, Pages/test workflows, home/release pages and generated website discovery files. No simulator capture implementation or historical benchmark score was changed.

## 3–4. MCP and CLI

Nine tools added: `list_screenshot_templates`, `get_screenshot_template`, `generate_screenshot_set`, `generate_screenshot_variants`, `render_app_store_screenshot`, `preview_screenshot_set`, `export_screenshot_set`, `localize_screenshot_set`, `inspect_screenshot_set`.

Unified MCP count: **47 → 56**, verified through the real stdio protocol and manifest check. CLI entry point: `ios-agent-mcp screenshots list|generate|variants|preview|inspect|export|localize`. It belongs to the unified package; the separate scaffolding CLI is unchanged.

## 5–7. Templates, layouts and output profiles

Eight templates: minimal (hero), dark-premium (floating), gradient (feature), editorial (split), feature-card (card), full-bleed (large contained UI), comparison (two supplied images), multi-device (two or three supplied images). Device bezels are neutral programmatic artwork.

Four profiles: iPhone portrait 1260 × 2736, iPhone landscape 2736 × 1260, iPad portrait 2064 × 2752 and iPad landscape 2752 × 2064. Source/date are in the registry. These accepted dimensions do not determine the required device classes for an individual app.

## 8–9. Localization and renderer

Supplied translations, preserved order/layout, local font coverage, wrapping, overflow rejection and single-direction RTL layout. Omitted translated subtitle/badge fields are cleared. Mixed-direction RTL is rejected, including numbers, non-Arabic/Hebrew letters and paired brackets. Automatic translation is not claimed.

Offline SVG composition → `@resvg/resvg-js` 2.6.2 → opaque RGB PNG via pngjs 7.0.0. fontkit 2.0.4 shapes local glyph paths; JPEG input uses jpeg-js 0.4.4. Source and font hashes support reproduction with the same binaries. No proprietary fonts are bundled.

## 10–11. Tests and exact results

- MCP build/typecheck: PASS.
- `npm test` in mcp-server: **380 tests, 380 pass, 0 fail** (359 previous tests + 20 renderer tests + one protocol/schema test).
- Renderer suite after manifest hardening: **20 tests, 20 pass, 0 fail**. Unicode RTL regression after final guard correction: **1 test, 1 pass**.
- Existing app CLI build/tests: **67 tests, 67 pass, 0 fail**.
- Existing simulator runtime build/tests: **16 tests, 16 pass, 0 fail**. These are its existing controlled tests, not a new simulator capture session.
- Python documentation/community checks: **16 tests, OK**.
- Discovery tests: **4 tests, 4 pass, 0 fail**.
- Repository verification hook, local-library check and 56-tool manifest: PASS.
- Site discovery: **PASS: 236 pages**; metadata, local JSON-LD schemas, sitemap, llms, Atom, robots and two-click reachability.

Renderer tests cover all layouts/profiles, PNG/JPEG import, invalid/missing inputs, folder ordering, catalog accent extraction, wrapping/glyph bounds, font coverage, RTL, long copy, aspect ratio, output hashes/dimensions, contact sheets, repeated deterministic output, collisions, translated copy, missing/tampered files, unsafe manifest paths, metadata consistency and unified CLI dispatch. Independent review found four edge cases; all were corrected and rechecked.

## 12. Sample output

Generated **30** full-resolution PNGs using five existing Reading List captures × three templates × two locales. English and Spanish each report `passed: true`, `checked: 15`, no errors and no warnings. Both contact sheets were visually inspected. CLI export validated and copied both complete sets to new local directories. Website evidence records output/source/font hashes and geometry without local recipe paths. Full-resolution output is reproducible from the sample and is not committed.

## 13–14. Website and documentation

Added a focused Screenshot Studio page using existing styles, light/dark navigation, an English contact sheet, expandable Spanish preview, registry-generated layout/profile descriptions, source CLI/MCP workflow and explicit limits. Linked from Home and release notes; discovery generation includes it. Browser inspection checked the page and images in light/dark appearance. The guide covers recipes, sequencing, copy, profiles, localization, fonts, previews, inspection, export and capture-tool handoff.

## 15–16. Limitations and deferred work

No hosted translation, upload, OCR, content-truth verification, conversion-rate claims or Apple approval. PNG/JPEG inputs only; EXIF/profiled JPEGs and animated/profiled PNGs require normalization. Full Unicode bidirectional text, custom fonts per role, perspective/3D frames, automatic target-specific name/icon selection, camera cutouts, source corner masks and arrows are deferred. Frames preserve the complete source rectangle; no distortion or automatic crop. The app's internal screenshot UI is not localized by translating marketing copy. Local manifests contain absolute source/font paths and must be reviewed before sharing.

npm stays at 2.7.2. The source package's reserved 2.7.3 version is not an npm publication.
