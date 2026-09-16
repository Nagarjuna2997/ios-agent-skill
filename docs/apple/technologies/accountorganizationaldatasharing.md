# Account & Organizational Data Sharing

## Context

Load this when a task names **Account & Organizational Data Sharing** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/accountorganizationaldatasharing) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide people with the ability to authorize your apps and websites that access information about them on Apple REST services, like Roster API.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Account & Organizational Data Sharing`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| AccountOrganizationalDataSharing | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Generating tokens

- [Creating a client secret](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret)
- [Fetch Apple's public key for verifying token signature](https://developer.apple.com/documentation/accountorganizationaldatasharing/fetch-apple's-public-key-for-verifying-token-signature)
- [Generate and validate tokens](https://developer.apple.com/documentation/accountorganizationaldatasharing/generate-and-validate-tokens)

### Using and revoking tokens

- [Request an authorization](https://developer.apple.com/documentation/accountorganizationaldatasharing/request-an-authorization)
- [Token revocation](https://developer.apple.com/documentation/accountorganizationaldatasharing/revoke-tokens)

### Common objects

- [JWKSet](https://developer.apple.com/documentation/accountorganizationaldatasharing/jwkset)
- [TokenResponse](https://developer.apple.com/documentation/accountorganizationaldatasharing/tokenresponse)
- [ErrorResponse](https://developer.apple.com/documentation/accountorganizationaldatasharing/errorresponse)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
