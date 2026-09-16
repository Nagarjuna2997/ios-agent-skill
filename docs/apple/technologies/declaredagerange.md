# Declared Age Range

## Context

Load this when a task names **Declared Age Range** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/declaredagerange) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create age-appropriate experiences in your app by asking people to share their age range.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Declared Age Range`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.declared-age-range](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.declared-age-range)
- [Requesting people’s age range information in your app](https://developer.apple.com/documentation/declaredagerange/requesting-people-share-their-age-range-with-your-app)
- [Implementing age assurance and permissions](https://developer.apple.com/documentation/declaredagerange/implementing-age-assurance-and-permissions)

### Age range requests

- [AgeRangeService](https://developer.apple.com/documentation/declaredagerange/agerangeservice)
- [DeclaredAgeRangeAction](https://developer.apple.com/documentation/declaredagerange/declaredagerangeaction)

### Significant change acknowledgment

- [SignificantUpdateAction](https://developer.apple.com/documentation/declaredagerange/significantupdateaction)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
