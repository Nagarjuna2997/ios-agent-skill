# GSS

## Context

Load this when a task names **GSS** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/gss) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Conduct secure, authenticated network transactions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `GSS`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 5.0 | — | No |
| iPadOS | 5.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.14 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Memory and Context

- [Allocating and Releasing Objects](https://developer.apple.com/documentation/gss/allocating-and-releasing-objects)
- [Function Status](https://developer.apple.com/documentation/gss/function-status)
- [Buffer Management](https://developer.apple.com/documentation/gss/buffer-management)
- [Context Services](https://developer.apple.com/documentation/gss/context-services)

### Credentials

- [Credential Management](https://developer.apple.com/documentation/gss/credential-management)
- [Security Mechanisms](https://developer.apple.com/documentation/gss/security-mechanisms)

### Names and Object Identifiers

- [Name Handling](https://developer.apple.com/documentation/gss/name-handling)
- [Object Identifiers](https://developer.apple.com/documentation/gss/object-identifiers)

### Messages

- [Token Management](https://developer.apple.com/documentation/gss/token-management)
- [Message Protection](https://developer.apple.com/documentation/gss/message-protection)
- [Kerberos Implementation](https://developer.apple.com/documentation/gss/kerberos-implementation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
