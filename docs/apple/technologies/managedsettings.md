# Managed Settings

## Context

Load this when a task names **Managed Settings** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/managedsettings) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access and change settings with your app while maintaining user privacy and control.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Managed Settings`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Manage settings on devices in a Family Sharing group](https://developer.apple.com/documentation/managedsettings/connectionwithframeworks)
- [Confirming the effective TV and movie ratings](https://developer.apple.com/documentation/managedsettings/readingmedia)

### Settings

- [ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)

### Shield actions

- [ShieldAction](https://developer.apple.com/documentation/managedsettings/shieldaction)
- [ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)

### Family privacy

- [Token](https://developer.apple.com/documentation/managedsettings/token)

### Apps

- [Application](https://developer.apple.com/documentation/managedsettings/application)
- [ApplicationToken](https://developer.apple.com/documentation/managedsettings/applicationtoken)

### Categories

- [ActivityCategory](https://developer.apple.com/documentation/managedsettings/activitycategory)
- [ActivityCategoryToken](https://developer.apple.com/documentation/managedsettings/activitycategorytoken)

### Websites

- [WebDomain](https://developer.apple.com/documentation/managedsettings/webdomain)
- [WebDomainToken](https://developer.apple.com/documentation/managedsettings/webdomaintoken)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
