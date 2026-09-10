# Address Book UI

## Context

Load this when a task names **Address Book UI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/addressbookui) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access users’ contacts and display them in a graphical interface.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Address Book UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### People Picker

- [ABPeoplePickerNavigationController](https://developer.apple.com/documentation/addressbookui/abpeoplepickernavigationcontroller) — deprecated

### Detail Display

- [ABNewPersonViewController](https://developer.apple.com/documentation/addressbookui/abnewpersonviewcontroller) — deprecated
- [ABPersonViewController](https://developer.apple.com/documentation/addressbookui/abpersonviewcontroller) — deprecated
- [ABUnknownPersonViewController](https://developer.apple.com/documentation/addressbookui/abunknownpersonviewcontroller) — deprecated
- [ABCreateStringWithAddressDictionary(_:_:)](https://developer.apple.com/documentation/addressbookui/abcreatestringwithaddressdictionary(_:_:)) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
