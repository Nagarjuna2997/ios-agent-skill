# App Store Server Notifications

## Context

Load this when a task names **App Store Server Notifications** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/appstoreservernotifications) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Monitor In-App Purchase events in real time and learn of unreported external purchase tokens, with server notifications from the App Store.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `App Store Server Notifications`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| App Store Server Notifications | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Enabling App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications/enabling-app-store-server-notifications)
- [Receiving App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications/receiving-app-store-server-notifications)
- [Responding to App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications/responding-to-app-store-server-notifications)
- [App Store Server Notifications changelog](https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-changelog)

### Server notifications version 2

- [App Store Server Notifications V2](https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-v2)
- [responseBodyV2](https://developer.apple.com/documentation/appstoreservernotifications/responsebodyv2)
- [responseBodyV2DecodedPayload](https://developer.apple.com/documentation/appstoreservernotifications/responsebodyv2decodedpayload)
- [notificationType](https://developer.apple.com/documentation/appstoreservernotifications/notificationtype)
- [subtype](https://developer.apple.com/documentation/appstoreservernotifications/subtype)

### Deprecated

- [App Store Server Notifications Version 1](https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-version-1)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
