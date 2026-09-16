# IdentityDocumentServicesUI

## Context

Load this when a task names **IdentityDocumentServicesUI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/identitydocumentservicesui) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide an interface so people can present mobile documents.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `IdentityDocumentServicesUI`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| macOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Building identity document provider authorization UI

- [IdentityDocumentProvider](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentprovider)
- [IdentityDocumentRequestScene](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentrequestscene)
- [ISO18013MobileDocumentRequestScene](https://developer.apple.com/documentation/identitydocumentservicesui/iso18013mobiledocumentrequestscene)
- [ISO18013MobileDocumentRequestContext](https://developer.apple.com/documentation/identitydocumentservicesui/iso18013mobiledocumentrequestcontext)
- [IdentityDocumentRequestSceneBuilder](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentrequestscenebuilder)

### Implementing the web presentment flow into your browser

- [Implementing as an identity document provider](https://developer.apple.com/documentation/identitydocumentservices/implenting-as-an-identity-document-provider)
- [IdentityDocumentWebPresentmentController](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentwebpresentmentcontroller)
- [IdentityDocumentWebPresentmentControllerDelegate](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentwebpresentmentcontrollerdelegate)
- [IdentityDocumentPresentmentControllerPresentationContextProviding](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentpresentmentcontrollerpresentationcontextproviding)
- [IdentityDocumentPresentationAnchor](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentpresentationanchor)
- [IdentityDocumentPresentmentControlling](https://developer.apple.com/documentation/identitydocumentservicesui/identitydocumentpresentmentcontrolling)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
