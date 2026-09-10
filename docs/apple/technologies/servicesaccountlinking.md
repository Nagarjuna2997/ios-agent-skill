# ServicesAccountLinking

## Context

Load this when a task names **ServicesAccountLinking** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/servicesaccountlinking) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Link reseller accounts with Apple Media & Purchases accounts.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ServicesAccountLinking`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.4 | — | No |
| iPadOS | 16.4 | — | No |
| Mac Catalyst | 16.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Registration

- [ResellerAccount](https://developer.apple.com/documentation/servicesaccountlinking/reselleraccount)

### Error handling

- [RegistrationError](https://developer.apple.com/documentation/servicesaccountlinking/registrationerror)
- [RegistrationErrorDomain](https://developer.apple.com/documentation/servicesaccountlinking/registrationerrordomain)

### Variables

- [RegistrationErrorRetryAfterKey](https://developer.apple.com/documentation/servicesaccountlinking/registrationerrorretryafterkey)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
