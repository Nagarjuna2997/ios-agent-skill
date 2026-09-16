# Contacts UI

## Context

Load this when a task names **Contacts UI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/contactsui) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide an interface that allows people to display information about their contacts.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Contacts UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.11 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Contact viewer

- [CNContactViewController](https://developer.apple.com/documentation/contactsui/cncontactviewcontroller)

### Contact pickers

- [CNContactPickerViewController](https://developer.apple.com/documentation/contactsui/cncontactpickerviewcontroller)
- [CNContactPicker](https://developer.apple.com/documentation/contactsui/cncontactpicker)

### Contact access

- [ContactAccessButton](https://developer.apple.com/documentation/contactsui/contactaccessbutton)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
