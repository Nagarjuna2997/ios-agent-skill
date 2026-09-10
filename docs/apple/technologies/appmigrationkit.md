# AppMigrationKit

## Context

Load this when a task names **AppMigrationKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/appmigrationkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Perform a one-time transfer of your app’s on-device data to or from a device running another platform.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AppMigrationKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.1 | — | No |
| iPadOS | 26.1 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### App extensions

- [AppMigrationExtension](https://developer.apple.com/documentation/appmigrationkit/appmigrationextension)
- [com.apple.developer.app-migration.data-container-access](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.app-migration.data-container-access)

### Export operations

- [ResourcesExportingWithOptions](https://developer.apple.com/documentation/appmigrationkit/resourcesexportingwithoptions)
- [ResourcesExporting](https://developer.apple.com/documentation/appmigrationkit/resourcesexporting)

### Import operations

- [ResourcesImporting](https://developer.apple.com/documentation/appmigrationkit/resourcesimporting)

### Migration status

- [MigrationStatus](https://developer.apple.com/documentation/appmigrationkit/migrationstatus)

### Migration code tests

- [AppMigrationTester](https://developer.apple.com/documentation/appmigrationkit/appmigrationtester)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
