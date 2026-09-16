# Bundle Resources

## Context

Load this when a task names **Bundle Resources** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/bundleresources) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Resources located in an app, framework, or plugin bundle.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Bundle Resources`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 2.0 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Property Lists

- [Entitlements](https://developer.apple.com/documentation/bundleresources/entitlements)
- [Information Property List](https://developer.apple.com/documentation/bundleresources/information-property-list)
- [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

### Structure

- [Placing content in a bundle](https://developer.apple.com/documentation/bundleresources/placing-content-in-a-bundle)

### Universal links service

- [applinks](https://developer.apple.com/documentation/bundleresources/applinks)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
