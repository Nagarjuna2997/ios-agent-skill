# Security Interface

## Context

Load this when a task names **Security Interface** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/securityinterface) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide user interface elements for security features such as authorization, access to digital certificates, and access to items in keychains.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Security Interface`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.3 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [SFAuthorizationPluginView](https://developer.apple.com/documentation/securityinterface/sfauthorizationpluginview)
- [SFAuthorizationView](https://developer.apple.com/documentation/securityinterface/sfauthorizationview)
- [SFCertificatePanel](https://developer.apple.com/documentation/securityinterface/sfcertificatepanel)
- [SFCertificateTrustPanel](https://developer.apple.com/documentation/securityinterface/sfcertificatetrustpanel)
- [SFCertificateView](https://developer.apple.com/documentation/securityinterface/sfcertificateview)
- [SFChooseIdentityPanel](https://developer.apple.com/documentation/securityinterface/sfchooseidentitypanel)
- [SFChooseIdentityTableCellView](https://developer.apple.com/documentation/securityinterface/sfchooseidentitytablecellview)
- [SFKeychainSavePanel](https://developer.apple.com/documentation/securityinterface/sfkeychainsavepanel)
- [SFKeychainSettingsPanel](https://developer.apple.com/documentation/securityinterface/sfkeychainsettingspanel)

### Reference

- [SFAuthorizationViewState](https://developer.apple.com/documentation/securityinterface/sfauthorizationviewstate)
- [SFButtonType](https://developer.apple.com/documentation/securityinterface/sfbuttontype)
- [SFViewType](https://developer.apple.com/documentation/securityinterface/sfviewtype)
- [SecurityInterface Constants](https://developer.apple.com/documentation/securityinterface/securityinterface-constants)
- [SecurityInterface Data Types](https://developer.apple.com/documentation/securityinterface/securityinterface-data-types)
- [SecurityInterface Enumerations](https://developer.apple.com/documentation/securityinterface/securityinterface-enumerations)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
