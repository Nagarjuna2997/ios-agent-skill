# Device Management

## Context

Load this when a task names **Device Management** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/devicemanagement) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage your organization’s devices remotely.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Device Management`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |
| tvOS | 13.0 | — | No |
| visionOS | 1.1 | — | No |
| watchOS | 6.0 | — | No |
| Device Assignment Services | 5.0 | — | No |
| VPP License Management | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Implementing device management

- [Device management essentials](https://developer.apple.com/documentation/devicemanagement/device-management-essentials)
- [Device enrollment](https://developer.apple.com/documentation/devicemanagement/device-enrollment)
- [Identity management](https://developer.apple.com/documentation/devicemanagement/identity-management)
- [Content management](https://developer.apple.com/documentation/devicemanagement/content-management)
- [Device life cycle](https://developer.apple.com/documentation/devicemanagement/device-life-cycle)

### MDM protocol

- [Commands and queries](https://developer.apple.com/documentation/devicemanagement/commands-and-queries)
- [Check-in](https://developer.apple.com/documentation/devicemanagement/check-in)

### Declarative management

- [Declarations](https://developer.apple.com/documentation/devicemanagement/devicemanagement-declarations)
- [Status items](https://developer.apple.com/documentation/devicemanagement/status-items)

### Configuration profiles

- [Profile-specific payload keys](https://developer.apple.com/documentation/devicemanagement/profile-specific-payload-keys)

### Miscellaneous data formats

- [ManifestURL](https://developer.apple.com/documentation/devicemanagement/manifesturl)
- [PasswordHash](https://developer.apple.com/documentation/devicemanagement/passwordhash)

### Deployment services

- [Device assignment](https://developer.apple.com/documentation/devicemanagement/device-assignment)
- [Roster management](https://developer.apple.com/documentation/devicemanagement/roster-management)
- [App, Book, and Subscription Management](https://developer.apple.com/documentation/devicemanagement/app-book-and-subscription-management)
- [Apple School Manager and Apple Business APIs](https://developer.apple.com/documentation/apple-school-and-business-manager-api)

### Removed items

- [Removed commands and profiles](https://developer.apple.com/documentation/devicemanagement/removed-commands-and-profiles)

### Dictionaries

- [InApps](https://developer.apple.com/documentation/devicemanagement/inapps)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
