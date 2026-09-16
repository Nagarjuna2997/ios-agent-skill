# Finder Sync

## Context

Load this when a task names **Finder Sync** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/findersync) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Modify the Finder’s user interface to express file synchronization and control.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Finder Sync`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [FIFinderSync](https://developer.apple.com/documentation/findersync/fifindersync-swift.class)
- [FIFinderSyncController](https://developer.apple.com/documentation/findersync/fifindersynccontroller)

### Protocols

- [FIFinderSyncProtocol](https://developer.apple.com/documentation/findersync/fifindersyncprotocol)

### Reference

- [FinderSync Enumerations](https://developer.apple.com/documentation/findersync/findersyncenumerations)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
