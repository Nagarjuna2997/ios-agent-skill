# ClockKit

## Context

Load this when a task names **ClockKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/clockkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Display app-specific data on the clock face.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ClockKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| watchOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Migration Support

- [Migrating ClockKit complications to WidgetKit](https://developer.apple.com/documentation/widgetkit/converting-a-clockkit-app)
- [CLKComplicationDataSource](https://developer.apple.com/documentation/clockkit/clkcomplicationdatasource)
- [CLKDefaultComplicationIdentifier](https://developer.apple.com/documentation/clockkit/clkdefaultcomplicationidentifier)
- [CLKComplicationDescriptor](https://developer.apple.com/documentation/clockkit/clkcomplicationdescriptor)

### Face Sharing

- [Sharing an Apple Watch face](https://developer.apple.com/documentation/clockkit/sharing-an-apple-watch-face)
- [CLKWatchFaceLibrary](https://developer.apple.com/documentation/clockkit/clkwatchfacelibrary)

### Deprecated

- [Deprecated articles and symbols](https://developer.apple.com/documentation/clockkit/deprecated-articles-and-symbols)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
