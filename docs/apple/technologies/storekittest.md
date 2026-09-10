# StoreKit Test

## Context

Load this when a task names **StoreKit Test** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/storekittest) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create and automate tests in Xcode for your app’s subscription and in-app purchase transactions, and SKAdNetwork implementations.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `StoreKit Test`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |
| tvOS | 14.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 7.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### StoreKit transaction testing

- [Setting up StoreKit Testing in Xcode](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [SKTestSession](https://developer.apple.com/documentation/storekittest/sktestsession)
- [SKTestTransaction](https://developer.apple.com/documentation/storekittest/sktesttransaction)

### StoreKit transaction testing errors

- [SKTestErrorDomain](https://developer.apple.com/documentation/storekittest/sktesterrordomain)
- [SKTestError](https://developer.apple.com/documentation/storekittest/sktesterror)

### Ad impression and postback testing

- [Testing and validating ad impression signatures and postbacks for SKAdNetwork](https://developer.apple.com/documentation/storekittest/testing-and-validating-ad-impression-signatures-and-postbacks-for-skadnetwork)
- [SKAdTestSession](https://developer.apple.com/documentation/storekittest/skadtestsession)
- [SKAdTestPostback](https://developer.apple.com/documentation/storekittest/skadtestpostback)
- [SKAdTestPostbackResponse](https://developer.apple.com/documentation/storekittest/skadtestpostbackresponse)
- [SKAdTestPostbackVersion](https://developer.apple.com/documentation/storekittest/skadtestpostbackversion)

### Ad impression and postback errors

- [SKAdTestErrorDomain](https://developer.apple.com/documentation/storekittest/skadtesterrordomain)
- [SKAdTestError](https://developer.apple.com/documentation/storekittest/skadtesterror)

### Structures

- [StoreKitAppStoreSyncAPI](https://developer.apple.com/documentation/storekittest/storekitappstoresyncapi)
- [StoreKitAppTransactionAPI](https://developer.apple.com/documentation/storekittest/storekitapptransactionapi)
- [StoreKitLoadProductsAPI](https://developer.apple.com/documentation/storekittest/storekitloadproductsapi)
- [StoreKitManageSubscriptionsAPI](https://developer.apple.com/documentation/storekittest/storekitmanagesubscriptionsapi)
- [StoreKitOfferCodeRedeemAPI](https://developer.apple.com/documentation/storekittest/storekitoffercoderedeemapi)
- [StoreKitPurchaseAPI](https://developer.apple.com/documentation/storekittest/storekitpurchaseapi)
- [StoreKitRefundRequestAPI](https://developer.apple.com/documentation/storekittest/storekitrefundrequestapi)
- [StoreKitSubscriptionStatusAPI](https://developer.apple.com/documentation/storekittest/storekitsubscriptionstatusapi)
- [StoreKitVerificationAPI](https://developer.apple.com/documentation/storekittest/storekitverificationapi)

### Enumerations

- [SKTestFailures](https://developer.apple.com/documentation/storekittest/sktestfailures)

### Protocols

- [FailableStoreKitAPI](https://developer.apple.com/documentation/storekittest/failablestorekitapi)
- [SKTestFailure](https://developer.apple.com/documentation/storekittest/sktestfailure)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
