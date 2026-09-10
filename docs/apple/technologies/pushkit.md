# PushKit

## Context

Load this when a task names **PushKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/pushkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Respond to push notifications related to your app’s complications, file providers, and VoIP services.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PushKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 8.0 | — | No |
| iPadOS | 8.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 6.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Registration

- [Supporting PushKit Notifications in Your App](https://developer.apple.com/documentation/pushkit/supporting-pushkit-notifications-in-your-app)
- [PKPushRegistry](https://developer.apple.com/documentation/pushkit/pkpushregistry)
- [PKPushRegistryDelegate](https://developer.apple.com/documentation/pushkit/pkpushregistrydelegate)
- [PKPushCredentials](https://developer.apple.com/documentation/pushkit/pkpushcredentials)

### Push Types

- [Responding to VoIP Notifications from PushKit](https://developer.apple.com/documentation/pushkit/responding-to-voip-notifications-from-pushkit)
- [PKPushType](https://developer.apple.com/documentation/pushkit/pkpushtype)

### Payload

- [PKPushPayload](https://developer.apple.com/documentation/pushkit/pkpushpayload)

### Data export

- [Exporting delivery metrics logs](https://developer.apple.com/documentation/pushkit/exporting-delivery-metrics-logs)
- [Exporting broadcast push notification metrics](https://developer.apple.com/documentation/pushkit/exporting-broadcast-push-notification-metrics)

### Classes

- [PKVoIPPushMetadata](https://developer.apple.com/documentation/pushkit/pkvoippushmetadata)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
