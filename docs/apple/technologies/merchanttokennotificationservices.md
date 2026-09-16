# Apple Pay Merchant Token Management API

## Context

Load this when a task names **Apple Pay Merchant Token Management API** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/merchanttokennotificationservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Retrieve and manage payment life-cycle events for your Apple Pay merchant tokens.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Pay Merchant Token Management API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| App Store Connect API | 1.0 | — | No |
| Apple Pay Merchant Token Management API | 1.0.12 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Adding merchant token usage information](https://developer.apple.com/documentation/applepaymerchanttokenmanagementapi/adding-merchant-token-usage-information)
- [Apple Pay Merchant Token Usage Information API](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation)

### Merchant token notification handling

- [Receiving and handling merchant token notifications](https://developer.apple.com/documentation/applepaymerchanttokenmanagementapi/receiving-and-handling-merchant-token-notifications)
- [Send Merchant Token Event](https://developer.apple.com/documentation/merchanttokennotificationservices/send-merchant-token-event)
- [Update Merchant Metadata](https://developer.apple.com/documentation/merchanttokennotificationservices/update-merchant-metadata)

### Merchant token event retrieval

- [Get Details of a Merchant Token Event](https://developer.apple.com/documentation/merchanttokennotificationservices/merchant-token-event-retrieval)
- [MerchantTokenEventResponse](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttokeneventresponse)
- [MerchantTokenMetadata](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttokenmetadata)
- [CardArt](https://developer.apple.com/documentation/merchanttokennotificationservices/cardart)
- [CardMetadata](https://developer.apple.com/documentation/merchanttokennotificationservices/cardmetadata)

### Merchant token usage information

- [Retrieve Merchant Token Public Key](https://developer.apple.com/documentation/merchanttokennotificationservices/retrieve-merchant-token-public-key)
- [MerchantToken Usage Data Availability Notification](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttoken-usage-data-availability-notification)
- [MerchantTokenUsageDataAvailabilityNotificationRequest](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttokenusagedataavailabilitynotificationrequest)
- [Get MerchantToken Usage Information Package](https://developer.apple.com/documentation/merchanttokennotificationservices/get-merchanttoken-usage-information-package)
- [GetMerchantTokenUsageInformationPackageResponse](https://developer.apple.com/documentation/merchanttokennotificationservices/getmerchanttokenusageinformationpackageresponse)
- [AutomaticReloadPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/automaticreloadpaymentdetails)
- [CurrencyAmount](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/currencyamount)
- [DeferredPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/deferredpaymentdetails)
- [PastPayment](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/pastpayment)
- [PaymentIssueDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/paymentissuedetails)
- [RecurringPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/recurringpaymentdetails)
- [UpcomingPayment](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/upcomingpayment)
- [UsageInformation](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/usageinformation)

### Merchant token invalidation

- [Invalidate a Merchant Token](https://developer.apple.com/documentation/merchanttokennotificationservices/unlinking-merchanttoken)
- [MerchantTokenUnlinkRequest](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttokenunlinkrequest)

### Error handling

- [ErrorResponse](https://developer.apple.com/documentation/merchanttokennotificationservices/errorresponse)

### Dictionaries

- [MerchantMetadata](https://developer.apple.com/documentation/merchanttokennotificationservices/merchantmetadata)
- [MerchantTokenUsageMetadata](https://developer.apple.com/documentation/merchanttokennotificationservices/merchanttokenusagemetadata)
- [RetrieveMerchantTokenPublicKeyRequest](https://developer.apple.com/documentation/merchanttokennotificationservices/retrievemerchanttokenpublickeyrequest)
- [RetrieveMerchantTokenPublicKeyResponse](https://developer.apple.com/documentation/merchanttokennotificationservices/retrievemerchanttokenpublickeyresponse)
- [UpdateMerchantMetadataRequest](https://developer.apple.com/documentation/merchanttokennotificationservices/updatemerchantmetadatarequest)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
