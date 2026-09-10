# Apple TV Feed

## Context

Load this when a task names **Apple TV Feed** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/appletvfeed) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access the content of the Apple TV Catalog in bulk.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple TV Feed`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| AppleTVFeed | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Generating developer tokens](https://developer.apple.com/documentation/appletvfeed/generating-developer-tokens)
- [Requesting a feed export](https://developer.apple.com/documentation/appletvfeed/requesting-a-feed-export)
- [Interpreting responses](https://developer.apple.com/documentation/appletvfeed/interpreting-responses)

### Objects

- [Movie](https://developer.apple.com/documentation/appletvfeed/movie)
- [TvEpisode](https://developer.apple.com/documentation/appletvfeed/tvepisode)
- [TvSeason](https://developer.apple.com/documentation/appletvfeed/tvseason)
- [TvShow](https://developer.apple.com/documentation/appletvfeed/tvshow)
- [SportingEvent](https://developer.apple.com/documentation/appletvfeed/sportingevent)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
