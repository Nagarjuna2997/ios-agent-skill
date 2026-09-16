# Core Services

## Context

Load this when a task names **Core Services** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/coreservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access and manage key operating system services, such as launch and identity services.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 12.0 | — | No |
| iPadOS | 12.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 12.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 5.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [Apple Events](https://developer.apple.com/documentation/coreservices/apple_events)
- [Backup Core](https://developer.apple.com/documentation/coreservices/backup_core)
- [Dictionary Services](https://developer.apple.com/documentation/coreservices/dictionary_services)
- [File System Events](https://developer.apple.com/documentation/coreservices/file_system_events)
- [Launch Services](https://developer.apple.com/documentation/coreservices/launch_services)
- [File Metadata](https://developer.apple.com/documentation/coreservices/file_metadata)
- [OS Services](https://developer.apple.com/documentation/coreservices/os_services)
- [Search Kit](https://developer.apple.com/documentation/coreservices/search_kit)
- [Carbon Core](https://developer.apple.com/documentation/coreservices/carbon_core)
- [Core Services Constants](https://developer.apple.com/documentation/coreservices/core_services_constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
