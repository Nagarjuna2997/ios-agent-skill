# Automatic Sign-In API

## Context

Load this when a task names **Automatic Sign-In API** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/automaticsigninapi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage sign-in tokens from your web server that facilitate single sign-on across the devices of your media-streaming service customers.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Automatic Sign-In API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Automatic Sign-In API | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Authorization

- [Authorizing API calls using bearer tokens](https://developer.apple.com/documentation/videosubscriberaccount/authorizing-api-calls-using-bearer-tokens)

### Token updates

- [Update Sign-In Token](https://developer.apple.com/documentation/automaticsigninapi/update-this-token-for-all-associated-users)
- [UpdateAutoSignInTokenRequest](https://developer.apple.com/documentation/automaticsigninapi/updateautosignintokenrequest)

### Token deletion

- [Delete Sign-In Token](https://developer.apple.com/documentation/automaticsigninapi/delete-this-token-for-all-associated-users)
- [DeleteAutoSignInTokenRequest](https://developer.apple.com/documentation/automaticsigninapi/deleteautosignintokenrequest)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
