# USD

## Context

Load this when a task names **USD** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/usd) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> An efficient and scalable way to represent 3D scenes.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [OpenUSD schemas for AR](https://developer.apple.com/documentation/usd/usd-schemas-for-ar)
- [Schema definitions for third-party DCCs](https://developer.apple.com/documentation/usd/schema-definitions-for-third-party-dccs)
- [Creating USD files for Apple devices](https://developer.apple.com/documentation/usd/creating-usd-files-for-apple-devices)
- [Validating feature support for USD files](https://developer.apple.com/documentation/usd/validating-usd-files)
- [Placing a prim in the real world](https://developer.apple.com/documentation/usd/placing-a-prim-in-the-real-world)
- [Previewing a Model with AR Quick Look](https://developer.apple.com/documentation/arkit/previewing-a-model-with-ar-quick-look)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
