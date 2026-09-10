# Apple Pay on the Web

## Context

Load this when a task names **Apple Pay on the Web** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/applepayontheweb) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Support Apple Pay on your website with JavaScript-based APIs.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Pay on the Web`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Safari Desktop | 10.0 | — | No |
| Safari Mobile | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Loading the latest version of the Apple Pay JS SDK](https://developer.apple.com/documentation/applepayontheweb/loading-the-latest-version-of-apple-pay-js)

### Apple Pay setup

- [Setting Up Your Server](https://developer.apple.com/documentation/applepayontheweb/setting-up-your-server)
- [Configuring Your Environment](https://developer.apple.com/documentation/applepayontheweb/configuring-your-environment)
- [Maintaining Your Environment](https://developer.apple.com/documentation/applepayontheweb/maintaining-your-environment)

### Apple Pay merchandising

- [Integrating the Apple Pay merchandising component](https://developer.apple.com/documentation/applepayontheweb/integrating-the-apple-pay-merchandising-component)

### Apple order tracking button

- [Adding a Track with Apple Wallet button](https://developer.apple.com/documentation/applepayontheweb/adding-a-track-with-apple-wallet-button)

### Apple Pay buttons

- [Displaying Apple Pay Buttons Using JavaScript](https://developer.apple.com/documentation/applepayontheweb/displaying-apple-pay-buttons-using-javascript)
- [ApplePayButton](https://developer.apple.com/documentation/applepayontheweb/applepaybutton)
- [Displaying Apple Pay Buttons Using CSS](https://developer.apple.com/documentation/applepayontheweb/displaying-apple-pay-buttons-using-css)

### Apple Pay JavaScript APIs

- [Choosing an API for Implementing Apple Pay on Your Website](https://developer.apple.com/documentation/applepayontheweb/choosing-an-api-for-implementing-apple-pay-on-your-website)
- [Apple Pay on the Web version history](https://developer.apple.com/documentation/applepayontheweb/apple-pay-on-the-web-version-history)
- [Apple Pay JS API](https://developer.apple.com/documentation/applepayontheweb/apple-pay-js-api)
- [Payment Request API](https://developer.apple.com/documentation/applepayontheweb/payment-request-api)

### Supported payment networks

- [Supporting payment networks](https://developer.apple.com/documentation/applepayontheweb/supported-networks)

### Errors

- [ApplePayError](https://developer.apple.com/documentation/applepayontheweb/applepayerror)

### Apple Pay JS SDK change log

- [Apple Pay JS change log](https://developer.apple.com/documentation/applepayontheweb/apple-pay-js-change-log)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
