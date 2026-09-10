# TelephonyMessagingKit

## Context

Load this when a task names **TelephonyMessagingKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/telephonymessagingkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Send and receive standards-based messages over cellular networks.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TelephonyMessagingKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a carrier messaging app](https://developer.apple.com/documentation/telephonymessagingkit/creating-a-carrier-messaging-app)
- [TelephonyMessagingSession](https://developer.apple.com/documentation/telephonymessagingkit/telephonymessagingsession)
- [Default Carrier Messaging App](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.carrier-messaging-app)

### Supporting types

- [RCSFileTransferMetadata](https://developer.apple.com/documentation/telephonymessagingkit/rcsfiletransfermetadata)
- [RCSGroupContext](https://developer.apple.com/documentation/telephonymessagingkit/rcsgroupcontext)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
