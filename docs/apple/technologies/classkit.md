# ClassKit

## Context

Load this when a task names **ClassKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/classkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Enable teachers to assign activities from your app’s content and to view student progress.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ClassKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 11.4 | — | No |
| iPadOS | 11.4 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Enabling ClassKit in your app](https://developer.apple.com/documentation/classkit/enabling-classkit-in-your-app)
- [ClassKit Environment Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.classkit-environment)
- [Incorporating ClassKit into an Educational App](https://developer.apple.com/documentation/classkit/incorporating-classkit-into-an-educational-app)
- [ClassKit UI](https://developer.apple.com/documentation/classkitui)
- [CLSDataStore](https://developer.apple.com/documentation/classkit/clsdatastore)

### Contexts

- [Advertising your app’s assignable content](https://developer.apple.com/documentation/classkit/advertising-your-app-s-assignable-content)
- [CLSContext](https://developer.apple.com/documentation/classkit/clscontext)
- [CLSContextProvider](https://developer.apple.com/documentation/classkit/clscontextprovider)

### Activities

- [Recording student progress](https://developer.apple.com/documentation/classkit/recording-student-progress)
- [CLSActivity](https://developer.apple.com/documentation/classkit/clsactivity)

### Activity items

- [Recording additional metrics about a completed task](https://developer.apple.com/documentation/classkit/recording-additional-metrics-about-a-completed-task)
- [CLSScoreItem](https://developer.apple.com/documentation/classkit/clsscoreitem)
- [CLSBinaryItem](https://developer.apple.com/documentation/classkit/clsbinaryitem)
- [CLSQuantityItem](https://developer.apple.com/documentation/classkit/clsquantityitem)
- [CLSActivityItem](https://developer.apple.com/documentation/classkit/clsactivityitem)

### Errors

- [CLSError](https://developer.apple.com/documentation/classkit/clserror)
- [CLSErrorCodeDomain](https://developer.apple.com/documentation/classkit/clserrorcodedomain)
- [CLSError.Code](https://developer.apple.com/documentation/classkit/clserror/code)
- [CLSErrorUserInfoKey](https://developer.apple.com/documentation/classkit/clserroruserinfokey)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
