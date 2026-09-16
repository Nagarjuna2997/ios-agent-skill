# Apple Pay Web Merchant Registration API

## Context

Load this when a task names **Apple Pay Web Merchant Registration API** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Manage merchant registration through your web platform.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Pay Web Merchant Registration API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Apple Pay Web Merchant Registration API | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Applying to use the registration API and configuring IDs](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/applying-to-use-the-registration-api-and-configuring-ids)

### Web Merchant Registration

- [Preparing merchant domains for verification](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/preparing-merchant-domains-for-verification)
- [Register Merchant](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/register-merchant)
- [RegisterMerchantRequest](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/registermerchantrequest)

### Web Merchant Unregistration

- [Unregister Merchant](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/unregister-merchant)
- [UnregisterMerchantRequest](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/unregistermerchantrequest)

### Web Merchant Details

- [Get Merchant Details](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/get-merchant)
- [MerchantDetails](https://developer.apple.com/documentation/applepaywebmerchantregistrationapi/merchantdetails)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
