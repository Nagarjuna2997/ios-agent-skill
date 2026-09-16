# Social

## Context

Load this when a task names **Social** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/social) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Post content to supported social networking services, using standard system interfaces.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Social`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 6.0 | — | No |
| iPadOS | 6.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.8 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Composition Interfaces

- [SLComposeServiceViewController](https://developer.apple.com/documentation/social/slcomposeserviceviewcontroller)
- [SLComposeViewController](https://developer.apple.com/documentation/social/slcomposeviewcontroller)

### Server Communication

- [SLRequest](https://developer.apple.com/documentation/social/slrequest)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
