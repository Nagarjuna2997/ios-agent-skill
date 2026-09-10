# External Purchase Server API

## Context

Load this when a task names **External Purchase Server API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/externalpurchaseserverapi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Send and manage reports you send to Apple for tokens you receive when your app provides external purchases for digital goods and services.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `External Purchase Server API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| External Purchase Server API | 1.0.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating API keys to authorize API requests](https://developer.apple.com/documentation/appstoreserverapi/creating-api-keys-to-authorize-api-requests)
- [Generating JSON Web Tokens for API requests](https://developer.apple.com/documentation/appstoreserverapi/generating-json-web-tokens-for-api-requests)
- [External Purchase Server API changelog](https://developer.apple.com/documentation/externalpurchaseserverapi/changelog)

### External purchase tokens

- [Receiving and decoding external purchase tokens](https://developer.apple.com/documentation/storekit/receiving-and-decoding-external-purchase-tokens)

### External purchase reporting

- [Send External Purchase Report](https://developer.apple.com/documentation/externalpurchaseserverapi/send-external-purchase-report)
- [ExternalPurchaseReport](https://developer.apple.com/documentation/externalpurchaseserverapi/externalpurchasereport)
- [SendReportSuccessResponse](https://developer.apple.com/documentation/externalpurchaseserverapi/sendreportsuccessresponse)
- [SendReportErrorResponse](https://developer.apple.com/documentation/externalpurchaseserverapi/sendreporterrorresponse)

### External purchase report transactions

- [Reporting tokens with transactions](https://developer.apple.com/documentation/externalpurchaseserverapi/reportwithtransactions)
- [Reporting corrections](https://developer.apple.com/documentation/externalpurchaseserverapi/reportcorrections)
- [OneTimeBuyLineItem](https://developer.apple.com/documentation/externalpurchaseserverapi/onetimebuylineitem)
- [RefundLineItem](https://developer.apple.com/documentation/externalpurchaseserverapi/refundlineitem)
- [SubscriptionBuyLineItem](https://developer.apple.com/documentation/externalpurchaseserverapi/subscriptionbuylineitem)
- [Line item fields](https://developer.apple.com/documentation/externalpurchaseserverapi/lineitems)

### External purchase report without transactions

- [Reporting unrecognized and transactionless tokens](https://developer.apple.com/documentation/externalpurchaseserverapi/reportwithouttransactions)

### External purchase report retrieval

- [Retrieve External Purchase Report](https://developer.apple.com/documentation/externalpurchaseserverapi/retrieve-external-purchase-report)
- [RetrieveReportSuccessResponse](https://developer.apple.com/documentation/externalpurchaseserverapi/retrievereportsuccessresponse)

### Error handling

- [Error messages and codes](https://developer.apple.com/documentation/externalpurchaseserverapi/errorcodes)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
