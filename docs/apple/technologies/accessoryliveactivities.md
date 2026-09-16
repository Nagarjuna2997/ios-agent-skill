# Accessory Live Activities

## Context

Load this when a task names **Accessory Live Activities** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/accessoryliveactivities) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Forward Live Activity alerts from iPhone to an accessory you develop.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accessory Live Activities`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.5 | — | No |
| iPadOS | 26.5 | — | No |
| Mac Catalyst | 26.5 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Receiving Live Activity updates and alerts on an accessory](https://developer.apple.com/documentation/accessoryliveactivities/receiving-live-activities-on-an-accessory)

### Authorization

- [LiveActivityForwarding](https://developer.apple.com/documentation/accessoryliveactivities/liveactivityforwarding)
- [AccessoryAuthorizationResult](https://developer.apple.com/documentation/accessoryliveactivities/accessoryauthorizationresult)

### Live Activity forwarding

- [LiveActivityForwarding.AccessoryLiveActivitiesHandler](https://developer.apple.com/documentation/accessoryliveactivities/liveactivityforwarding/accessoryliveactivitieshandler)
- [LiveActivityForwarding.Session](https://developer.apple.com/documentation/accessoryliveactivities/liveactivityforwarding/session)

### Live Activity data access

- [AccessoryLiveActivity](https://developer.apple.com/documentation/accessoryliveactivities/accessoryliveactivity)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
