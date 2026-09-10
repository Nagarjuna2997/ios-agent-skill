# CryptoTokenKit

## Context

Load this when a task names **CryptoTokenKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/cryptotokenkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access security tokens and the cryptographic assets they store.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CryptoTokenKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.10 | — | No |
| tvOS | 13.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 8.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Smart Cards

- [Using Cryptographic Assets Stored on a Smart Card](https://developer.apple.com/documentation/cryptotokenkit/using-cryptographic-assets-stored-on-a-smart-card)
- [TKSmartCardSlotManager](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardslotmanager)
- [TKSmartCardSlot](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardslot)
- [TKSmartCard](https://developer.apple.com/documentation/cryptotokenkit/tksmartcard)

### Smart Card App Extensions

- [Authenticating Users with a Cryptographic Token](https://developer.apple.com/documentation/cryptotokenkit/authenticating-users-with-a-cryptographic-token)
- [Configuring Smart Card Authentication](https://developer.apple.com/documentation/cryptotokenkit/configuring-smart-card-authentication)
- [TKSmartCardTokenDriver](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardtokendriver)
- [TKSmartCardToken](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardtoken)
- [TKSmartCardTokenSession](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardtokensession)

### Tokens

- [TKTokenWatcher](https://developer.apple.com/documentation/cryptotokenkit/tktokenwatcher)
- [TKTokenDriver](https://developer.apple.com/documentation/cryptotokenkit/tktokendriver)
- [TKToken](https://developer.apple.com/documentation/cryptotokenkit/tktoken)
- [TKTokenSession](https://developer.apple.com/documentation/cryptotokenkit/tktokensession)

### Errors

- [TKError](https://developer.apple.com/documentation/cryptotokenkit/tkerror)
- [TKErrorDomain](https://developer.apple.com/documentation/cryptotokenkit/tkerrordomain)
- [TKError.Code](https://developer.apple.com/documentation/cryptotokenkit/tkerror/code)

### Classes

- [TKSmartCardSlotNFCSession](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardslotnfcsession)
- [TKSmartCardTokenRegistrationManager](https://developer.apple.com/documentation/cryptotokenkit/tksmartcardtokenregistrationmanager)

### Type Aliases

- [TKTokenObjectID](https://developer.apple.com/documentation/cryptotokenkit/tktokenobjectid-8mo7f) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
