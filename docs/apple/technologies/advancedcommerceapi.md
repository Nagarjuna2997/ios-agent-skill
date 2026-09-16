# Advanced Commerce API

## Context

Load this when a task names **Advanced Commerce API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/advancedcommerceapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Support In-App Purchases through the App Store for exceptionally large catalogs of custom one-time purchases, subscriptions, and subscriptions with optional add-ons.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Advanced Commerce API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Advanced Commerce API | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Setting up your project for Advanced Commerce API](https://developer.apple.com/documentation/advancedcommerceapi/setting-up-your-project-for-advanced-commerce)
- [Setting up a link to manage subscriptions](https://developer.apple.com/documentation/advancedcommerceapi/setupmanagesubscriptions)
- [Advanced Commerce API changelog](https://developer.apple.com/documentation/advancedcommerceapi/changelog)

### API authorization and rate limits

- [Authorizing API requests from your server](https://developer.apple.com/documentation/advancedcommerceapi/authorizing-server-calls)
- [Identifying rate limits for Advanced Commerce APIs](https://developer.apple.com/documentation/advancedcommerceapi/ratelimits)

### Generic product IDs and SKUs

- [Setting up generic product identifiers](https://developer.apple.com/documentation/advancedcommerceapi/setting-up-generic-product-identifiers)
- [Creating SKUs for your In-App Purchases](https://developer.apple.com/documentation/advancedcommerceapi/creating-your-purchases)
- [Creating SKUs for the Mini Apps Partner Program](https://developer.apple.com/documentation/advancedcommerceapi/creating-skus-for-the-mini-app-partner-program)

### Tax codes and pricing

- [Specifying prices for Advanced Commerce SKUs](https://developer.apple.com/documentation/advancedcommerceapi/prices)
- [Choosing tax codes for your SKUs](https://developer.apple.com/documentation/advancedcommerceapi/taxcodes)
- [Handling subscription price changes](https://developer.apple.com/documentation/advancedcommerceapi/handling-subscription-price-changes)

### In-app API requests

- [Sending Advanced Commerce API requests from your app](https://developer.apple.com/documentation/storekit/sending-advanced-commerce-api-requests-from-your-app)
- [Generating JWS to sign App Store requests](https://developer.apple.com/documentation/storekit/generating-jws-to-sign-app-store-requests)

### One-time charge creation in the app

- [OneTimeChargeCreateRequest](https://developer.apple.com/documentation/advancedcommerceapi/onetimechargecreaterequest)
- [OneTimeChargeItem](https://developer.apple.com/documentation/advancedcommerceapi/onetimechargeitem)

### Subscription creation in the app

- [SubscriptionCreateRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptioncreaterequest)
- [SubscriptionCreateItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptioncreateitem)

### Subscription modification in the app

- [SubscriptionModifyInAppRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmodifyinapprequest)
- [SubscriptionModifyAddItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmodifyadditem)
- [SubscriptionModifyChangeItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmodifychangeitem)
- [SubscriptionModifyRemoveItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmodifyremoveitem)
- [SubscriptionModifyPeriodChange](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmodifyperiodchange)

### Subscription reactivation in the app

- [SubscriptionReactivateInAppRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionreactivateinapprequest)
- [SubscriptionReactivateItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionreactivateitem)

### Subscription price change from the server

- [Change Subscription Price](https://developer.apple.com/documentation/advancedcommerceapi/change-subscription-price)
- [SubscriptionPriceChangeRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionpricechangerequest)
- [SubscriptionPriceChangeResponse](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionpricechangeresponse)

### Subscription cancellation from the server

- [Cancel a Subscription](https://developer.apple.com/documentation/advancedcommerceapi/cancel-a-subscription)
- [SubscriptionCancelRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptioncancelrequest)
- [SubscriptionCancelResponse](https://developer.apple.com/documentation/advancedcommerceapi/subscriptioncancelresponse)

### Subscription revocation from the server

- [Revoke Subscription](https://developer.apple.com/documentation/advancedcommerceapi/revoke-subscription)
- [SubscriptionRevokeRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionrevokerequest)
- [SubscriptionRevokeResponse](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionrevokeresponse)

### Refund request from the server

- [Request Transaction Refund](https://developer.apple.com/documentation/advancedcommerceapi/request-transaction-refund)
- [RequestRefundRequest](https://developer.apple.com/documentation/advancedcommerceapi/requestrefundrequest)
- [RequestRefundResponse](https://developer.apple.com/documentation/advancedcommerceapi/requestrefundresponse)
- [RequestRefundItem](https://developer.apple.com/documentation/advancedcommerceapi/requestrefunditem)

### Subscription metadata changes from the server

- [Change Subscription Metadata](https://developer.apple.com/documentation/advancedcommerceapi/change-subscription-metadata)
- [SubscriptionChangeMetadataRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionchangemetadatarequest)
- [SubscriptionChangeMetadataResponse](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionchangemetadataresponse)
- [SubscriptionChangeMetadataDescriptors](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionchangemetadatadescriptors)
- [SubscriptionChangeMetadataItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionchangemetadataitem)

### Migration from the server

- [Migrate a Subscription to Advanced Commerce API](https://developer.apple.com/documentation/advancedcommerceapi/migrate-subscription-to-advanced-commerce-api)
- [SubscriptionMigrateRequest](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigraterequest)
- [SubscriptionMigrateResponse](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigrateresponse)
- [SubscriptionMigrateItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigrateitem)
- [SubscriptionMigrateRenewalItem](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigraterenewalitem)
- [SubscriptionMigrateDescriptors](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigratedescriptors)

### Objects and types

- [Data types](https://developer.apple.com/documentation/advancedcommerceapi/datatypes)

### Signed transaction information

- [JWSRenewalInfo](https://developer.apple.com/documentation/advancedcommerceapi/jwsrenewalinfo)
- [JWSTransaction](https://developer.apple.com/documentation/advancedcommerceapi/jwstransaction)

### Error handling

- [Error messages and codes](https://developer.apple.com/documentation/advancedcommerceapi/errorcodes)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
