# ContactProvider

## Context

Load this when a task names **ContactProvider** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/contactprovider) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide contacts managed by your app to the system-wide Contacts ecosystem.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ContactProvider`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.0 | — | No |
| iPadOS | 18.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Creating a contact provider extension

- [ContactProviderExtension](https://developer.apple.com/documentation/contactprovider/contactproviderextension)

### Managing an extension in an app

- [ContactProviderManager](https://developer.apple.com/documentation/contactprovider/contactprovidermanager)

### Working with domains

- [ContactProviderDomain](https://developer.apple.com/documentation/contactprovider/contactproviderdomain)
- [DefaultContactProviderDomain](https://developer.apple.com/documentation/contactprovider/defaultcontactproviderdomain)

### Providing contacts

- [ContactItem](https://developer.apple.com/documentation/contactprovider/contactitem)
- [ContactItemEnumerating](https://developer.apple.com/documentation/contactprovider/contactitemenumerating)
- [ContactItemEnumerator](https://developer.apple.com/documentation/contactprovider/contactitemenumerator)

### Receiving contacts

- [ContactItemContentObserver](https://developer.apple.com/documentation/contactprovider/contactitemcontentobserver)
- [ContactItemChangeObserver](https://developer.apple.com/documentation/contactprovider/contactitemchangeobserver)

### Supporting types

- [ContactProviderError](https://developer.apple.com/documentation/contactprovider/contactprovidererror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
