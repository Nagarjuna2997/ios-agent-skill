# GameSave

## Context

Load this when a task names **GameSave** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/gamesave) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Store and sync your application’s save files in iCloud.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `GameSave`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Synced directory

- [GameSaveSyncedDirectory](https://developer.apple.com/documentation/gamesave/gamesavesynceddirectory)

### Error domain

- [GameSaveErrorDomain](https://developer.apple.com/documentation/gamesave/gamesaveerrordomain)

### Synced directory (Objective-C)

- [GSSyncedDirectory](https://developer.apple.com/documentation/gamesave/gssynceddirectory)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
