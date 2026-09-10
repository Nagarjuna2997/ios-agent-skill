# Video Subscriber Account

## Context

Load this when a task names **Video Subscriber Account** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/videosubscriberaccount) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Support TV provider and Apple TV app functionality.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Video Subscriber Account`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 10.0 | — | No |
| iPadOS | 10.0 | — | No |
| Mac Catalyst | 10.0 | — | No |
| macOS | 10.14 | — | No |
| tvOS | 10.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Video Subscriber Account updates](https://developer.apple.com/documentation/updates/videosubscriberaccount)

### TV provider authentication

- [VSAccountManager](https://developer.apple.com/documentation/videosubscriberaccount/vsaccountmanager)

### TV app integration

- [VSAppleSubscription](https://developer.apple.com/documentation/videosubscriberaccount/vsapplesubscription-swift.struct)
- [VSSubscriptionRegistrationCenter](https://developer.apple.com/documentation/videosubscriberaccount/vssubscriptionregistrationcenter)
- [VSAccountApplicationProvider](https://developer.apple.com/documentation/videosubscriberaccount/vsaccountapplicationprovider)

### User account management

- [Signing people in to their media accounts automatically](https://developer.apple.com/documentation/videosubscriberaccount/signing-people-in-to-media-apps-automatically)
- [VSUserAccountManager](https://developer.apple.com/documentation/videosubscriberaccount/vsuseraccountmanager)
- [VSUserAccount](https://developer.apple.com/documentation/videosubscriberaccount/vsuseraccount-swift.struct)

### Errors

- [VSErrorDomain](https://developer.apple.com/documentation/videosubscriberaccount/vserrordomain)
- [VSErrorInfoKeySAMLResponse](https://developer.apple.com/documentation/videosubscriberaccount/vserrorinfokeysamlresponse)
- [VSErrorInfoKeySAMLResponseStatus](https://developer.apple.com/documentation/videosubscriberaccount/vserrorinfokeysamlresponsestatus)
- [VSErrorInfoKeyAccountProviderResponse](https://developer.apple.com/documentation/videosubscriberaccount/vserrorinfokeyaccountproviderresponse)
- [VSErrorInfoKeyUnsupportedProviderIdentifier](https://developer.apple.com/documentation/videosubscriberaccount/vserrorinfokeyunsupportedprovideridentifier)
- [VSError](https://developer.apple.com/documentation/videosubscriberaccount/vserror)
- [VSError.Code](https://developer.apple.com/documentation/videosubscriberaccount/vserror/code)

### Deprecated

- [VSSubscription](https://developer.apple.com/documentation/videosubscriberaccount/vssubscription) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
