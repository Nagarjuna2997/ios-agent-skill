# Objective-C Runtime

## Context

Load this when a task names **Objective-C Runtime** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/objectivec) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Gain low-level access to the Objective-C runtime and the Objective-C root types.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Objective-C Runtime`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [NSObject](https://developer.apple.com/documentation/objectivec/nsobject-swift.class)
- [Protocol](https://developer.apple.com/documentation/objectivec/protocol)

### Protocols

- [NSObjectProtocol](https://developer.apple.com/documentation/objectivec/nsobjectprotocol)

### Reference

- [Objective-C Runtime](https://developer.apple.com/documentation/objectivec/objective-c-runtime)
- [Objective-C Structures](https://developer.apple.com/documentation/objectivec/objective-c-structures)
- [Objective-C Constants](https://developer.apple.com/documentation/objectivec/objective-c-constants)
- [Objective-C Functions](https://developer.apple.com/documentation/objectivec/objective-c-functions)
- [Objective-C Data Types](https://developer.apple.com/documentation/objectivec/objective-c-data-types)
- [Objective-C Macros](https://developer.apple.com/documentation/objectivec/objective-c-macros)
- [Objective-C Enumerations](https://developer.apple.com/documentation/objectivec/objective-c-enums)

### Functions

- [objc_copyImageHeaders(_:)](https://developer.apple.com/documentation/objectivec/objc_copyimageheaders(_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
