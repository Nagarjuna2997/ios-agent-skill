# Apple Music Feed

## Context

Load this when a task names **Apple Music Feed** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/applemusicfeed) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access the content of the Apple Music Catalog in bulk.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Music Feed`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| AppleMusicFeed | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Generating developer tokens](https://developer.apple.com/documentation/applemusicfeed/generating-developer-tokens)
- [Requesting a feed export](https://developer.apple.com/documentation/applemusicfeed/requesting-a-feed-export)
- [Interpreting responses](https://developer.apple.com/documentation/applemusicfeed/interpreting-responses)

### Objects

- [Album](https://developer.apple.com/documentation/applemusicfeed/album)
- [Song](https://developer.apple.com/documentation/applemusicfeed/song)
- [Artist](https://developer.apple.com/documentation/applemusicfeed/artist)
- [PopularityTopChartAlbums](https://developer.apple.com/documentation/applemusicfeed/popularitytopchartalbums)
- [PopularityTopChartSongs](https://developer.apple.com/documentation/applemusicfeed/popularitytopchartsongs)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
