# Apple Pay Merchant Token Usage Information API

## Context

Load this when a task names **Apple Pay Merchant Token Usage Information API** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Add details about your merchant token usage information package.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Pay Merchant Token Usage Information API`.

Documentation language identifiers: data.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Adding merchant token usage information](https://developer.apple.com/documentation/applepaymerchanttokenmanagementapi/adding-merchant-token-usage-information)

### Getting the currency amount

- [CurrencyAmount](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/currencyamount)

### Getting payment details

- [AutomaticReloadPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/automaticreloadpaymentdetails)
- [DeferredPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/deferredpaymentdetails)
- [PastPayment](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/pastpayment)
- [PaymentIssueDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/paymentissuedetails)
- [RecurringPaymentDetails](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/recurringpaymentdetails)
- [UpcomingPayment](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/upcomingpayment)

### Getting usage information

- [UsageInformation](https://developer.apple.com/documentation/applepaymerchanttokenusageinformation/usageinformation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
