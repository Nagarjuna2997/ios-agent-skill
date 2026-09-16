# Family Controls

## Context

Load this when a task names **Family Controls** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/familycontrols) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Authorize your app to provide parental controls on a device.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Family Controls`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Authorizations

- [AuthorizationCenter](https://developer.apple.com/documentation/familycontrols/authorizationcenter)
- [AuthorizationStatus](https://developer.apple.com/documentation/familycontrols/authorizationstatus)
- [Family Controls](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls)
- [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)

### Account types

- [FamilyControlsMember](https://developer.apple.com/documentation/familycontrols/familycontrolsmember)

### Activity selections

- [FamilyActivityPicker](https://developer.apple.com/documentation/familycontrols/familyactivitypicker)
- [FamilyActivitySelection](https://developer.apple.com/documentation/familycontrols/familyactivityselection)

### Activity labels

- [Displaying Activity Labels](https://developer.apple.com/documentation/familycontrols/displayingactivitylabels)

### Activity data

- [FamilyActivityData](https://developer.apple.com/documentation/familycontrols/familyactivitydata)

### Errors

- [FamilyControlsError](https://developer.apple.com/documentation/familycontrols/familycontrolserror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
