# Media Library

## Context

Load this when a task names **Media Library** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/medialibrary) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access read-only collections of the user’s multimedia content.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Library`.

Documentation language identifiers: occ, swift.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.9 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [MLMediaGroup](https://developer.apple.com/documentation/medialibrary/mlmediagroup)
- [MLMediaLibrary](https://developer.apple.com/documentation/medialibrary/mlmedialibrary)
- [MLMediaObject](https://developer.apple.com/documentation/medialibrary/mlmediaobject)
- [MLMediaSource](https://developer.apple.com/documentation/medialibrary/mlmediasource)

### Reference

- [MediaLibrary Constants](https://developer.apple.com/documentation/medialibrary/medialibrary-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
