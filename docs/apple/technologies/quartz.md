# Quartz

## Context

Load this when a task names **Quartz** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/quartz) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Allow users to browse, edit, and save images, using slideshows and Core Image filters.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Quartz`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Viewing and Transforming Images

- [ImageKit](https://developer.apple.com/documentation/quartz/imagekit)

### Displaying PDFs

- [PDFKit](https://developer.apple.com/documentation/quartz/pdfkit)

### Quartz Composer

- [Quartz Composer](https://developer.apple.com/documentation/quartz/quartz-composer)

### Using Quick Look

- [Quick Look](https://developer.apple.com/documentation/quartz/quick-look)

### Conversion Filters

- [Quartz Filter](https://developer.apple.com/documentation/quartz/quartz-filter)

### Constants

- [Quartz Constants](https://developer.apple.com/documentation/quartz/quartz-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
