# Journaling Suggestions

## Context

Load this when a task names **Journaling Suggestions** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/journalingsuggestions) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Display a set of recent, personal events that inspire someone to contribute to your app’s creative workflow.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Journaling Suggestions`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.2 | — | No |
| iPadOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Journaling Suggestions updates](https://developer.apple.com/documentation/updates/journalingsuggestions)
- [Presenting the suggestions picker and processing a selection](https://developer.apple.com/documentation/journalingsuggestions/presenting-the-suggestions-picker-and-processing-a-selection)
- [com.apple.developer.journal.allow](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.journal.allow)

### Implementation

- [JournalingSuggestionsPicker](https://developer.apple.com/documentation/journalingsuggestions/journalingsuggestionspicker)
- [JournalingSuggestion](https://developer.apple.com/documentation/journalingsuggestions/journalingsuggestion)
- [JournalingSuggestionAsset](https://developer.apple.com/documentation/journalingsuggestions/journalingsuggestionasset)

### Notifications

- [Receiving journaling suggestions system notifications](https://developer.apple.com/documentation/journalingsuggestions/receiving-journaling-suggestions-from-system-notifications)
- [JournalingSuggestionPresentationToken](https://developer.apple.com/documentation/journalingsuggestions/journalingsuggestionpresentationtoken)
- [JournalingSuggestionsConfiguration](https://developer.apple.com/documentation/journalingsuggestions/journalingsuggestionsconfiguration)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
