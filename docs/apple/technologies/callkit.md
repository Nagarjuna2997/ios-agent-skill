# CallKit

## Context

Load this when a task names **CallKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/callkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Display the system-calling UI for your app’s VoIP services, and coordinate your calling services with other apps and the system.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CallKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 10.0 | — | No |
| iPadOS | 10.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 13.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [CXProvider](https://developer.apple.com/documentation/callkit/cxprovider)
- [CXProviderDelegate](https://developer.apple.com/documentation/callkit/cxproviderdelegate)
- [CXProviderConfiguration](https://developer.apple.com/documentation/callkit/cxproviderconfiguration)
- [Making and receiving VoIP calls](https://developer.apple.com/documentation/callkit/making-and-receiving-voip-calls)
- [VoIP calling with CallKit](https://developer.apple.com/documentation/callkit/voip-calling-with-callkit)
- [Preparing your app to be the default calling app](https://developer.apple.com/documentation/callkit/preparing-your-app-to-be-the-default-calling-app)
- [CallKit updates](https://developer.apple.com/documentation/updates/callkit)

### Incoming calls

- [Responding to VoIP Notifications from PushKit](https://developer.apple.com/documentation/pushkit/responding-to-voip-notifications-from-pushkit)
- [CXCallUpdate](https://developer.apple.com/documentation/callkit/cxcallupdate)
- [CXAnswerCallAction](https://developer.apple.com/documentation/callkit/cxanswercallaction)

### Outgoing calls

- [Sending End-to-End Encrypted VoIP Calls](https://developer.apple.com/documentation/callkit/sending-end-to-end-encrypted-voip-calls)
- [CXCallController](https://developer.apple.com/documentation/callkit/cxcallcontroller)
- [CXTransaction](https://developer.apple.com/documentation/callkit/cxtransaction)
- [CXStartCallAction](https://developer.apple.com/documentation/callkit/cxstartcallaction)

### Call-related actions

- [CXAction](https://developer.apple.com/documentation/callkit/cxaction)
- [CXCallAction](https://developer.apple.com/documentation/callkit/cxcallaction)
- [CXEndCallAction](https://developer.apple.com/documentation/callkit/cxendcallaction)
- [CXPlayDTMFCallAction](https://developer.apple.com/documentation/callkit/cxplaydtmfcallaction)
- [CXSetGroupCallAction](https://developer.apple.com/documentation/callkit/cxsetgroupcallaction)
- [CXSetHeldCallAction](https://developer.apple.com/documentation/callkit/cxsetheldcallaction)
- [CXSetMutedCallAction](https://developer.apple.com/documentation/callkit/cxsetmutedcallaction)
- [CXSetTranslatingCallAction](https://developer.apple.com/documentation/callkit/cxsettranslatingcallaction)

### Call information

- [CXCall](https://developer.apple.com/documentation/callkit/cxcall)
- [CXCallObserver](https://developer.apple.com/documentation/callkit/cxcallobserver)
- [CXCallObserverDelegate](https://developer.apple.com/documentation/callkit/cxcallobserverdelegate)
- [CXHandle](https://developer.apple.com/documentation/callkit/cxhandle)

### Caller ID

- [Identifying and blocking calls](https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls)
- [CXCallDirectoryProvider](https://developer.apple.com/documentation/callkit/cxcalldirectoryprovider)
- [CXCallDirectoryExtensionContext](https://developer.apple.com/documentation/callkit/cxcalldirectoryextensioncontext)
- [CXCallDirectoryExtensionContextDelegate](https://developer.apple.com/documentation/callkit/cxcalldirectoryextensioncontextdelegate)
- [CXCallDirectoryManager](https://developer.apple.com/documentation/callkit/cxcalldirectorymanager)

### Reference

- [CallKit Enumerations](https://developer.apple.com/documentation/callkit/callkit-enumerations)
- [CallKit Constants](https://developer.apple.com/documentation/callkit/callkit-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
