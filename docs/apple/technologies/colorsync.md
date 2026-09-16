# ColorSync

## Context

Load this when a task names **ColorSync** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/colorsync) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Reproduce colors accurately across a range of input, output, and display devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ColorSync`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.13 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Color conversion

- [Color transforms](https://developer.apple.com/documentation/colorsync/color-transforms)
- [Pixel format and data layout](https://developer.apple.com/documentation/colorsync/pixel-format)

### Profile and HDR metadata

- [Color profiles](https://developer.apple.com/documentation/colorsync/color-profiles)
- [Headroom Adaptive Gain Curve](https://developer.apple.com/documentation/colorsync/headroom-adaptive-gain-curve)

### System color management

- [Color devices](https://developer.apple.com/documentation/colorsync/color-devices)
- [Color management modules](https://developer.apple.com/documentation/colorsync/color-management-modules)

### Supporting types and conventions

- [Supporting types and conventions](https://developer.apple.com/documentation/colorsync/supporting-types-and-conventions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
