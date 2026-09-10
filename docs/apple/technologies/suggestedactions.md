# Suggested Actions

## Context

Load this when a task names **Suggested Actions** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/suggestedactions) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Offer quick actions next to messages in your messaging app, based on context you provide.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Suggested Actions`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |
| macOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Suggested Actions](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.suggested-actions)

### Suggested actions for messages

- [SuggestedActionsView](https://developer.apple.com/documentation/suggestedactions/suggestedactionsview)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
