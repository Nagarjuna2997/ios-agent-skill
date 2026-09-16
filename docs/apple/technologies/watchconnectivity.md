# Watch Connectivity

## Context

Load this when a task names **Watch Connectivity** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/watchconnectivity) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Implement two-way communication between an iOS app and its paired watchOS app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Watch Connectivity`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [WCSession](https://developer.apple.com/documentation/watchconnectivity/wcsession)
- [WCSessionDelegate](https://developer.apple.com/documentation/watchconnectivity/wcsessiondelegate)

### Data Objects

- [WCSessionFile](https://developer.apple.com/documentation/watchconnectivity/wcsessionfile)
- [WCSessionFileTransfer](https://developer.apple.com/documentation/watchconnectivity/wcsessionfiletransfer)
- [WCSessionUserInfoTransfer](https://developer.apple.com/documentation/watchconnectivity/wcsessionuserinfotransfer)

### Sample Code

- [Transferring data with Watch Connectivity](https://developer.apple.com/documentation/watchconnectivity/transferring-data-with-watch-connectivity)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
