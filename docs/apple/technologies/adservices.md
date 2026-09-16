# AdServices

## Context

Load this when a task names **AdServices** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/adservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Attribute app-download campaigns that originate from the App Store on iOS devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AdServices`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.3 | — | No |
| iPadOS | 14.3 | — | No |
| Mac Catalyst | 14.3 | — | No |
| macOS | 11.1 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Changelog](https://developer.apple.com/documentation/adservices/changelog)

### Tokens

- [AAAttribution](https://developer.apple.com/documentation/adservices/aaattribution)

### Errors

- [AAAttributionError](https://developer.apple.com/documentation/adservices/aaattributionerror)
- [AAAttributionErrorDomain](https://developer.apple.com/documentation/adservices/aaattributionerrordomain)
- [AAAttributionError.Code](https://developer.apple.com/documentation/adservices/aaattributionerror/code)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
