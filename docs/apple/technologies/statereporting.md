# StateReporting

## Context

Load this when a task names **StateReporting** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/statereporting) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Communicate your app’s state to the system to improve diagnostic actionability.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `StateReporting`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |
| macOS | 27.0 | — | No |
| tvOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |
| watchOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Getting started with StateReporting](https://developer.apple.com/documentation/statereporting/getting-started-with-statereporting)

### Reporting

- [StateReporter](https://developer.apple.com/documentation/statereporting/statereporter)

### Defining metadata

- [ReportableMetadata](https://developer.apple.com/documentation/statereporting/reportablemetadata)
- [ReportableMetadataValue](https://developer.apple.com/documentation/statereporting/reportablemetadatavalue)

### Metadata type macros

- [ReportableMetadata()](https://developer.apple.com/documentation/statereporting/reportablemetadata())
- [ReportableMetadataKey(_:)](https://developer.apple.com/documentation/statereporting/reportablemetadatakey(_:))
- [ReportableMetadataIgnored()](https://developer.apple.com/documentation/statereporting/reportablemetadataignored())

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
