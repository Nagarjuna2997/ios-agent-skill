# Service Management

## Context

Load this when a task names **Service Management** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/servicemanagement) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage startup items, launch agents, and launch daemons from within an app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Service Management`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.6 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Updating helper executables from earlier versions of macOS](https://developer.apple.com/documentation/servicemanagement/updating-helper-executables-from-earlier-versions-of-macos)
- [Updating your app package installer to use the new Service Management API](https://developer.apple.com/documentation/servicemanagement/updating-your-app-package-installer-to-use-the-new-service-management-api)

### Management

- [SMAppService](https://developer.apple.com/documentation/servicemanagement/smappservice)
- [SMJobBless(_:_:_:_:)](https://developer.apple.com/documentation/servicemanagement/smjobbless(_:_:_:_:)) — deprecated
- [Authorization Constants](https://developer.apple.com/documentation/servicemanagement/authorization-constants)
- [Property List Keys](https://developer.apple.com/documentation/servicemanagement/property-list-keys)

### Enablement

- [SMLoginItemSetEnabled(_:_:)](https://developer.apple.com/documentation/servicemanagement/smloginitemsetenabled(_:_:)) — deprecated

### Status

- [SMAppService.Status](https://developer.apple.com/documentation/servicemanagement/smappservice/status-swift.enum)

### Errors

- [Service Management Errors](https://developer.apple.com/documentation/servicemanagement/service-management-errors)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/servicemanagement/deprecated-symbols)

### Variables

- [SMAppServiceErrorDomain](https://developer.apple.com/documentation/servicemanagement/smappserviceerrordomain)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
