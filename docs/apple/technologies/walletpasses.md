# Wallet Passes

## Context

Load this when a task names **Wallet Passes** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/walletpasses) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create, distribute, and update passes for the Wallet app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Wallet Passes`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 6.0 | — | No |
| iPadOS | 6.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a pass with Pass Designer](https://developer.apple.com/documentation/walletpasses/creating-a-pass-with-pass-designer)
- [Creating a Poster Generic Pass](https://developer.apple.com/documentation/walletpasses/creating-a-poster-generic-pass)
- [Creating the Source for a Pass](https://developer.apple.com/documentation/walletpasses/creating-the-source-for-a-pass)
- [Building a Pass](https://developer.apple.com/documentation/walletpasses/building-a-pass)
- [Defining the metadata of your Wallet Pass](https://developer.apple.com/documentation/walletpasses/defining-the-metadata-of-your-wallet-pass)
- [Distributing and updating a pass](https://developer.apple.com/documentation/walletpasses/distributing-and-updating-a-pass)
- [Pass](https://developer.apple.com/documentation/walletpasses/pass)
- [PassFields](https://developer.apple.com/documentation/walletpasses/passfields)

### Boarding passes

- [Creating an airline boarding pass using semantic tags](https://developer.apple.com/documentation/walletpasses/creating-an-airline-boarding-pass-using-semantic-tags)
- [Pass.BoardingPass](https://developer.apple.com/documentation/walletpasses/pass/boardingpass-data.dictionary)
- [SemanticTags](https://developer.apple.com/documentation/walletpasses/semantictags)
- [SemanticTagType](https://developer.apple.com/documentation/walletpasses/semantictagtype)

### Coupon passes

- [Creating a coupon pass](https://developer.apple.com/documentation/walletpasses/creating-a-coupon-pass)
- [Pass.Coupon](https://developer.apple.com/documentation/walletpasses/pass/coupon-data.dictionary)

### Event passes

- [Creating a poster event pass using semantic tags](https://developer.apple.com/documentation/walletpasses/creating-an-event-pass-using-semantic-tags)
- [Pass.EventTicket](https://developer.apple.com/documentation/walletpasses/pass/eventticket-data.dictionary)
- [SemanticTags](https://developer.apple.com/documentation/walletpasses/semantictags)
- [SemanticTagType](https://developer.apple.com/documentation/walletpasses/semantictagtype)
- [UpcomingPassInformationEntry](https://developer.apple.com/documentation/walletpasses/upcomingpassinformationentry)
- [UpcomingPassInformationEntryType](https://developer.apple.com/documentation/walletpasses/upcomingpassinformationentrytype)

### Generic passes

- [Creating a Poster Generic Pass](https://developer.apple.com/documentation/walletpasses/creating-a-poster-generic-pass)
- [Pass.Generic](https://developer.apple.com/documentation/walletpasses/pass/generic-data.dictionary)

### Store card passes

- [Creating a store card pass](https://developer.apple.com/documentation/walletpasses/creating-a-store-card-pass)
- [Pass.StoreCard](https://developer.apple.com/documentation/walletpasses/pass/storecard-data.dictionary)

### Pass updates

- [Adding a Web Service to Update Passes](https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes)
- [Register a Pass for Update Notifications](https://developer.apple.com/documentation/walletpasses/register-a-pass-for-update-notifications)
- [Get the List of Updatable Passes](https://developer.apple.com/documentation/walletpasses/get-the-list-of-updatable-passes)
- [Send an Updated Pass](https://developer.apple.com/documentation/walletpasses/send-an-updated-pass)
- [Unregister a Pass for Update Notifications](https://developer.apple.com/documentation/walletpasses/unregister-a-pass-for-update-notifications)
- [Log a Message](https://developer.apple.com/documentation/walletpasses/log-a-message)
- [PushToken](https://developer.apple.com/documentation/walletpasses/pushtoken)
- [SerialNumbers](https://developer.apple.com/documentation/walletpasses/serialnumbers)
- [LogEntries](https://developer.apple.com/documentation/walletpasses/logentries)

### Personalized passes

- [Return a Personalized Pass](https://developer.apple.com/documentation/walletpasses/return-a-personalized-pass)
- [PersonalizationDictionary](https://developer.apple.com/documentation/walletpasses/personalizationdictionary)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
