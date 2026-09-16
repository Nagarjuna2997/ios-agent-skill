# Shared with You

## Context

Load this when a task names **Shared with You** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/sharedwithyou) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Surface shared content and collaborate in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Shared with You`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Frameworks

- [Shared with You Core](https://developer.apple.com/documentation/sharedwithyoucore)

### Shared content

- [Making your app content shareable](https://developer.apple.com/documentation/sharedwithyou/making-your-app-content-shareable)
- [Shared content interactions](https://developer.apple.com/documentation/sharedwithyou/shared-content-interactions)

### Collaboration

- [Adding shared content collaboration to your app](https://developer.apple.com/documentation/sharedwithyou/adding-shared-content-collaboration-to-your-app)
- [Adding custom collaboration to your app](https://developer.apple.com/documentation/sharedwithyou/adding-custom-collaboration-to-your-app)
- [Collaboration views](https://developer.apple.com/documentation/sharedwithyou/collaboration-views)

### Framework versions

- [Version number](https://developer.apple.com/documentation/sharedwithyou/version-number)
- [Version string](https://developer.apple.com/documentation/sharedwithyou/version-string)

### Macros

- [Macros](https://developer.apple.com/documentation/sharedwithyou/macros)

### Variables

- [SWCopyRepresentationTypeIdentifier](https://developer.apple.com/documentation/sharedwithyou/swcopyrepresentationtypeidentifier)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
