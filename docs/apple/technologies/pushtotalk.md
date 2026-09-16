# Push to Talk

## Context

Load this when a task names **Push to Talk** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/pushtotalk) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Display the system user interface for your app’s Push to Talk services.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Push to Talk`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a Push to Talk app](https://developer.apple.com/documentation/pushtotalk/creating-a-push-to-talk-app)
- [PTChannelManager](https://developer.apple.com/documentation/pushtotalk/ptchannelmanager)

### Channel management

- [PTChannelManagerDelegate](https://developer.apple.com/documentation/pushtotalk/ptchannelmanagerdelegate)
- [PTTransmissionMode](https://developer.apple.com/documentation/pushtotalk/pttransmissionmode)
- [PTServiceStatus](https://developer.apple.com/documentation/pushtotalk/ptservicestatus)
- [PTChannelJoinReason](https://developer.apple.com/documentation/pushtotalk/ptchanneljoinreason)
- [PTChannelLeaveReason](https://developer.apple.com/documentation/pushtotalk/ptchannelleavereason)
- [PTChannelTransmitRequestSource](https://developer.apple.com/documentation/pushtotalk/ptchanneltransmitrequestsource)

### Channel restoration

- [PTChannelDescriptor](https://developer.apple.com/documentation/pushtotalk/ptchanneldescriptor)
- [PTChannelRestorationDelegate](https://developer.apple.com/documentation/pushtotalk/ptchannelrestorationdelegate)

### Channel participants

- [PTParticipant](https://developer.apple.com/documentation/pushtotalk/ptparticipant)

### Push notification results

- [PTPushResult](https://developer.apple.com/documentation/pushtotalk/ptpushresult)

### Push to Talk errors

- [PTChannelError](https://developer.apple.com/documentation/pushtotalk/ptchannelerror-swift.struct)
- [PTChannelError.Code](https://developer.apple.com/documentation/pushtotalk/ptchannelerror-swift.struct/code)
- [PTInstantiationError](https://developer.apple.com/documentation/pushtotalk/ptinstantiationerror-swift.struct)
- [PTInstantiationError.Code](https://developer.apple.com/documentation/pushtotalk/ptinstantiationerror-swift.struct/code)
- [PTChannelErrorDomain](https://developer.apple.com/documentation/pushtotalk/ptchannelerrordomain)
- [PTInstantiationErrorDomain](https://developer.apple.com/documentation/pushtotalk/ptinstantiationerrordomain)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
