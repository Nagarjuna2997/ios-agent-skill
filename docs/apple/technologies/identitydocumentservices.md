# IdentityDocumentServices

## Context

Load this when a task names **IdentityDocumentServices** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/identitydocumentservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Share mobile documents using the Digital Credentials API.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `IdentityDocumentServices`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| macOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Requesting a mobile document on the web](https://developer.apple.com/documentation/identitydocumentservices/requesting-a-mobile-document-on-the-web)
- [Implementing as an identity document provider](https://developer.apple.com/documentation/identitydocumentservices/implenting-as-an-identity-document-provider)
- [Verifying a mobile document from a passport](https://developer.apple.com/documentation/identitydocumentservices/verifying-a-mobile-document-from-a-passport)

### Registering as an identity document provider

- [IdentityDocumentProviderRegistrationStore](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentproviderregistrationstore)
- [IdentityDocumentRegistration](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentregistration)
- [MobileDocumentRegistration](https://developer.apple.com/documentation/identitydocumentservices/mobiledocumentregistration)

### Implementing the web presentment flow into your browser

- [IdentityDocumentWebPresentmentRawRequestValidator](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentwebpresentmentrawrequestvalidator)
- [IdentityDocumentWebPresentmentRequest](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentwebpresentmentrequest)
- [ISO18013MobileDocumentRequest](https://developer.apple.com/documentation/identitydocumentservices/iso18013mobiledocumentrequest)
- [IdentityDocumentWebPresentmentResponse](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentwebpresentmentresponse)
- [ISO18013MobileDocumentResponse](https://developer.apple.com/documentation/identitydocumentservices/iso18013mobiledocumentresponse)
- [IdentityDocumentWebPresentmentRawRequest](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentwebpresentmentrawrequest)

### Structures

- [IdentityDocumentPresentmentError](https://developer.apple.com/documentation/identitydocumentservices/identitydocumentpresentmenterror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
