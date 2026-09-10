# Accounts

## Context

Load this when a task names **Accounts** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/accounts) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Help users access and manage their external accounts from within your app, without requiring them to enter login credentials.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accounts`.

Documentation language identifiers: occ, swift.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 5.0 | — | No |
| iPadOS | 5.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.8 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Account Management

- [ACAccountStore](https://developer.apple.com/documentation/accounts/acaccountstore) — deprecated
- [ACAccount](https://developer.apple.com/documentation/accounts/acaccount) — deprecated
- [ACAccountCredential](https://developer.apple.com/documentation/accounts/acaccountcredential) — deprecated

### Account Types

- [ACAccountType](https://developer.apple.com/documentation/accounts/acaccounttype) — deprecated

### Errors

- [ACErrorCode](https://developer.apple.com/documentation/accounts/acerrorcode)
- [ACErrorDomain](https://developer.apple.com/documentation/accounts/acerrordomain)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/accounts/deprecated-symbols)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
