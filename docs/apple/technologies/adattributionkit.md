# AdAttributionKit

## Context

Load this when a task names **AdAttributionKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/adattributionkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Present, process, and register postbacks for in-app ads in the App Store and alternative app marketplaces.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AdAttributionKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 17.4 | — | No |
| Mac Catalyst | 17.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Understanding AdAttributionKit and SKAdNetwork interoperability](https://developer.apple.com/documentation/adattributionkit/adattributionkit-skadnetwork-interoperability)
- [Presenting ads in your app](https://developer.apple.com/documentation/adattributionkit/presenting-ads-in-your-app)
- [Receiving ad attributions and postbacks](https://developer.apple.com/documentation/adattributionkit/receiving-ad-attributions-and-postbacks)
- [Identifying conversion values with conversion tags](https://developer.apple.com/documentation/adattributionkit/conversion-tags)

### Ad network registration and configuration

- [Registering an ad network](https://developer.apple.com/documentation/adattributionkit/registering-an-ad-network)
- [Configuring a publisher app](https://developer.apple.com/documentation/adattributionkit/configuring-a-publisher-app)
- [Configuring an advertised app](https://developer.apple.com/documentation/adattributionkit/configuring-an-advertised-app)
- [Configuring attribution rules for your app](https://developer.apple.com/documentation/adattributionkit/configuring-attribution-rules-for-your-app)

### Ad attribution testing

- [Testing ad attributions with Developer Mode](https://developer.apple.com/documentation/adattributionkit/testing-adattributionkit-with-developer-mode)
- [Creating postbacks in developer settings](https://developer.apple.com/documentation/adattributionkit/creating-postbacks-in-developer-settings)
- [Testing ad attributions with a downloaded profile](https://developer.apple.com/documentation/adattributionkit/testing-ad-attributions-with-a-downloaded-profile)

### Signatures

- [Generating JWS impressions](https://developer.apple.com/documentation/adattributionkit/generating-jws-impressions)

### App impressions

- [AppImpression](https://developer.apple.com/documentation/adattributionkit/appimpression)

### Postbacks

- [Postback](https://developer.apple.com/documentation/adattributionkit/postback)
- [PostbackUpdate](https://developer.apple.com/documentation/adattributionkit/postbackupdate)
- [CoarseConversionValue](https://developer.apple.com/documentation/adattributionkit/coarseconversionvalue)

### Postback verification and parameter identification

- [Verifying a postback](https://developer.apple.com/documentation/adattributionkit/verifying-a-postback)
- [Identifying the parameters in a postback](https://developer.apple.com/documentation/adattributionkit/identifying-the-parameters-in-a-postback)

### Errors

- [AdAttributionKitError](https://developer.apple.com/documentation/adattributionkit/adattributionkiterror)

### Articles

- [Receiving postbacks in multiple conversion windows](https://developer.apple.com/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
