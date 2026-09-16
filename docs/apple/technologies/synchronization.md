# Synchronization

## Context

Load this when a task names **Synchronization** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/synchronization) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build synchronization constructs using low-level, primitive operations.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Synchronization`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.0 | — | No |
| iPadOS | 18.0 | — | No |
| Mac Catalyst | 18.0 | — | No |
| macOS | 15.0 | — | No |
| tvOS | 18.0 | — | No |
| visionOS | 2.0 | — | No |
| watchOS | 11.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Atomic Values

- [Atomic](https://developer.apple.com/documentation/synchronization/atomic)
- [AtomicLazyReference](https://developer.apple.com/documentation/synchronization/atomiclazyreference)
- [WordPair](https://developer.apple.com/documentation/synchronization/wordpair)
- [AtomicRepresentable](https://developer.apple.com/documentation/synchronization/atomicrepresentable)
- [AtomicOptionalRepresentable](https://developer.apple.com/documentation/synchronization/atomicoptionalrepresentable)

### Memory Ordering Semantics

- [AtomicLoadOrdering](https://developer.apple.com/documentation/synchronization/atomicloadordering)
- [AtomicStoreOrdering](https://developer.apple.com/documentation/synchronization/atomicstoreordering)
- [AtomicUpdateOrdering](https://developer.apple.com/documentation/synchronization/atomicupdateordering)
- [atomicMemoryFence(ordering:)](https://developer.apple.com/documentation/synchronization/atomicmemoryfence(ordering:))

### Structures

- [Mutex](https://developer.apple.com/documentation/synchronization/mutex)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
