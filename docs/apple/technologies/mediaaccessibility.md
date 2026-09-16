# Media Accessibility

## Context

Load this when a task names **Media Accessibility** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediaaccessibility) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Make your app’s media more accessible by supporting people’s systemwide preferences for video and audio content.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Accessibility`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.9 | — | No |
| tvOS | 17.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Features

- [Captions](https://developer.apple.com/documentation/mediaaccessibility/captions)
- [Flashing lights](https://developer.apple.com/documentation/mediaaccessibility/flashing-lights)
- [Music Haptics](https://developer.apple.com/documentation/mediaaccessibility/music-haptics)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
