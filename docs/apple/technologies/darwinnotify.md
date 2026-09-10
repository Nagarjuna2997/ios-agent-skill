# Darwin Notify

## Context

Load this when a task names **Darwin Notify** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/darwinnotify) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Send and receive Darwin notifications.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Darwin Notify`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.3 | — | No |
| iPadOS | 9.3 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.14 | — | No |
| tvOS | 9.2 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [Darwin Notification API](https://developer.apple.com/documentation/darwinnotify/darwin-notification-api)
- [DarwinNotify Functions](https://developer.apple.com/documentation/darwinnotify/darwinnotify-functions)
- [DarwinNotify Data Types](https://developer.apple.com/documentation/darwinnotify/darwinnotify-data-types)
- [DarwinNotify Macros](https://developer.apple.com/documentation/darwinnotify/darwinnotify-macros)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
