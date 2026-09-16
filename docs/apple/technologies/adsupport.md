# AdSupport

## Context

Load this when a task names **AdSupport** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/adsupport) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide apps with access to an advertising identifier.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AdSupport`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 6.0 | — | No |
| iPadOS | 6.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.14 | — | No |
| tvOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [ASIdentifierManager](https://developer.apple.com/documentation/adsupport/asidentifiermanager)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
