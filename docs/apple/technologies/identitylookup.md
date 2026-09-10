# SMS and Call Reporting

## Context

Load this when a task names **SMS and Call Reporting** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/identitylookup) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create app extensions to manage and report unwanted SMS messages and spam calls.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SMS and Call Reporting`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 11.0 | — | No |
| iPadOS | 11.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.15 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Message filtering

- [SMS and MMS Message Filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering)

### Spam reporting

- [SMS and Call Spam Reporting](https://developer.apple.com/documentation/identitylookup/sms-and-call-spam-reporting)

### Live Caller ID Lookup

- [Understanding how Live Caller ID Lookup preserves privacy](https://developer.apple.com/documentation/identitylookup/understanding-how-live-caller-id-lookup-preserves-privacy)
- [Formatting data for blocking and identity information](https://developer.apple.com/documentation/identitylookup/formatting-data-for-blocking-and-identity-information)
- [Setting up the HTTP endpoints for Live Caller ID Lookup](https://developer.apple.com/documentation/identitylookup/setting-up-the-http-endpoints-for-live-caller-id-lookup)
- [Getting up-to-date calling and blocking information for your app](https://developer.apple.com/documentation/identitylookup/getting-up-to-date-calling-and-blocking-information-for-your-app)
- [LiveCallerIDLookupProtocol](https://developer.apple.com/documentation/identitylookup/livecalleridlookupprotocol)
- [LiveCallerIDLookupExtensionConfiguration](https://developer.apple.com/documentation/identitylookup/livecalleridlookupextensionconfiguration)
- [LiveCallerIDLookupExtensionContext](https://developer.apple.com/documentation/identitylookup/livecalleridlookupextensioncontext)
- [CallLookupExtensionStatus](https://developer.apple.com/documentation/identitylookup/calllookupextensionstatus)
- [LiveCallerIDLookupManager](https://developer.apple.com/documentation/identitylookup/livecalleridlookupmanager)

### Macros

- [Macros](https://developer.apple.com/documentation/identitylookup/macros)

### Type Aliases

- [BlockingInfoCoreDataPropertiesSet](https://developer.apple.com/documentation/identitylookup/blockinginfocoredatapropertiesset)
- [IdentityInfoCoreDataPropertiesSet](https://developer.apple.com/documentation/identitylookup/identityinfocoredatapropertiesset)
- [LiveLookupDBExtensionCoreDataPropertiesSet](https://developer.apple.com/documentation/identitylookup/livelookupdbextensioncoredatapropertiesset)
- [LiveLookupStoreCoreDataFrameworkManagedObject](https://developer.apple.com/documentation/identitylookup/livelookupstorecoredataframeworkmanagedobject)
- [LiveLookupStoreFoundationFrameworkSet](https://developer.apple.com/documentation/identitylookup/livelookupstorefoundationframeworkset)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
