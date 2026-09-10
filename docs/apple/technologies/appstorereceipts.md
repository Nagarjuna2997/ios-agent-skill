# App Store Receipts

## Context

Load this when a task names **App Store Receipts** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/appstorereceipts) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Validate app and In-App Purchase receipts with the App Store.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `App Store Receipts`.

Documentation language identifiers: data.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| App Store Receipts | 1.0 | 1.7 | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Receipt data

- [App Store receipt data types](https://developer.apple.com/documentation/appstorereceipts/app-store-receipt-data-types)

### Local receipt validation

- [Validating receipts on the device](https://developer.apple.com/documentation/appstorereceipts/validating-receipts-on-the-device)

### Deprecated

- [verifyReceipt](https://developer.apple.com/documentation/appstorereceipts/verify-receipt) — deprecated
- [requestBody](https://developer.apple.com/documentation/appstorereceipts/requestbody) — deprecated
- [responseBody](https://developer.apple.com/documentation/appstorereceipts/responsebody) — deprecated
- [error](https://developer.apple.com/documentation/appstorereceipts/error) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
