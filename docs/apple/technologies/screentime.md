# Screen Time

## Context

Load this when a task names **Screen Time** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/screentime) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Share and manage web-usage data, and observe changes made by a parent or guardian.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Screen Time`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [STWebpageController](https://developer.apple.com/documentation/screentime/stwebpagecontroller)

### Configuration queries

- [STScreenTimeConfigurationObserver](https://developer.apple.com/documentation/screentime/stscreentimeconfigurationobserver)
- [STScreenTimeConfiguration](https://developer.apple.com/documentation/screentime/stscreentimeconfiguration)

### Web-Usage data deletion

- [STWebHistory](https://developer.apple.com/documentation/screentime/stwebhistory)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
