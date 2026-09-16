# Managed App Distribution

## Context

Load this when a task names **Managed App Distribution** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/managedappdistribution) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Manage the distribution of apps within an organization.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ManagedAppDistribution`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.2 | — | No |
| iPadOS | 17.2 | — | No |
| Mac Catalyst | 26.4 | — | No |
| macOS | 26.4 | — | No |
| visionOS | 2.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Fetching and displaying managed apps](https://developer.apple.com/documentation/managedappdistribution/fetching-and-displaying-managed-apps)
- [ManagedApp](https://developer.apple.com/documentation/managedappdistribution/managedapp)
- [ManagedAppLibrary](https://developer.apple.com/documentation/managedappdistribution/managedapplibrary)

### App information

- [Platform](https://developer.apple.com/documentation/managedappdistribution/platform)

### View creation

- [ManagedAppView](https://developer.apple.com/documentation/managedappdistribution/managedappview)
- [ManagedContentView](https://developer.apple.com/documentation/managedappdistribution/managedcontentview)
- [ManagedContentOfferState](https://developer.apple.com/documentation/managedappdistribution/managedcontentofferstate)
- [ManagedContentStyle](https://developer.apple.com/documentation/managedappdistribution/managedcontentstyle)

### Errors

- [ManagedAppDistributionError](https://developer.apple.com/documentation/managedappdistribution/managedappdistributionerror)

### Classes

- [ManagedPackageLibrary](https://developer.apple.com/documentation/managedappdistribution/managedpackagelibrary)

### Structures

- [ManagedPackage](https://developer.apple.com/documentation/managedappdistribution/managedpackage)
- [ManagedPackageView](https://developer.apple.com/documentation/managedappdistribution/managedpackageview)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
