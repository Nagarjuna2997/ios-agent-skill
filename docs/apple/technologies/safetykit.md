# SafetyKit

## Context

Load this when a task names **SafetyKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/safetykit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Detect and respond to car crash events in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SafetyKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.1 | — | No |
| macOS | 13.0 | — | No |
| watchOS | 10.1 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Detecting a crash

- [SACrashDetectionManager](https://developer.apple.com/documentation/safetykit/sacrashdetectionmanager)
- [SAAuthorizationStatus](https://developer.apple.com/documentation/safetykit/saauthorizationstatus)
- [SACrashDetectionEvent](https://developer.apple.com/documentation/safetykit/sacrashdetectionevent)
- [SACrashDetectionDelegate](https://developer.apple.com/documentation/safetykit/sacrashdetectiondelegate)

### Responding to a crash

- [SAEmergencyResponseManager](https://developer.apple.com/documentation/safetykit/saemergencyresponsemanager)
- [SAEmergencyResponseDelegate](https://developer.apple.com/documentation/safetykit/saemergencyresponsedelegate)
- [SACrashDetectionEvent.Response](https://developer.apple.com/documentation/safetykit/sacrashdetectionevent/response-swift.enum)

### Handling errors

- [SAErrorDomain](https://developer.apple.com/documentation/safetykit/saerrordomain)
- [SAError.Code](https://developer.apple.com/documentation/safetykit/saerror/code)
- [SAError](https://developer.apple.com/documentation/safetykit/saerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
