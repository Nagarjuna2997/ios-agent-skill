# PackageDescription

## Context

Load this when a task names **PackageDescription** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/packagedescription) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create reusable code, organize it in a lightweight way, and share it across your projects and with other developers.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PackageDescription`.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Creating a Package

- [Package](https://developer.apple.com/documentation/packagedescription/package)
- [Context](https://developer.apple.com/documentation/packagedescription/context)

### Structures

- [GitInformation](https://developer.apple.com/documentation/packagedescription/gitinformation)
- [Version](https://developer.apple.com/documentation/packagedescription/version)

### Enumerations

- [WarningLevel](https://developer.apple.com/documentation/packagedescription/warninglevel)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
