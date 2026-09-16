# Assets Library

## Context

Load this when a task names **Assets Library** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/assetslibrary) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access the assets in a user’s media library.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Assets Library`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [AssetsLibrary Enumerations](https://developer.apple.com/documentation/assetslibrary/assetslibrary-enumerations)
- [AssetsLibrary Constants](https://developer.apple.com/documentation/assetslibrary/assetslibrary-constants)
- [AssetsLibrary Data Types](https://developer.apple.com/documentation/assetslibrary/assetslibrary-data-types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
