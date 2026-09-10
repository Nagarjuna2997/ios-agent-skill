# SKAdNetwork for Web Ads

## Context

Load this when a task names **SKAdNetwork for Web Ads** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/skadnetworkforwebads) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Attribute app-install campaigns that originate on the web.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SKAdNetwork for Web Ads`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| SKAdNetwork for Web Ads | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating an attributable ad link](https://developer.apple.com/documentation/skadnetworkforwebads/creating-an-attributable-ad-link)

### Receiving a request for a web ad  payload

- [Get a Signed Web Ad Impression Payload](https://developer.apple.com/documentation/skadnetworkforwebads/get-a-signed-skadnetwork-ad-payload-for-a-web-ad.)
- [AdImpressionRequest](https://developer.apple.com/documentation/skadnetworkforwebads/adimpressionrequest)

### Providing the web ad signature and response

- [Generating a signature for attributable web ads](https://developer.apple.com/documentation/skadnetworkforwebads/generating-a-signature-for-attributable-web-ads)
- [AdImpressionResponse](https://developer.apple.com/documentation/skadnetworkforwebads/adimpressionresponse)
- [signature](https://developer.apple.com/documentation/skadnetworkforwebads/signature)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
