# Screen Saver

## Context

Load this when a task names **Screen Saver** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/screensaver) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Animate screen savers, and interact with the screen saver infrastructure.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Screen Saver`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Interface

- [ScreenSaverView](https://developer.apple.com/documentation/screensaver/screensaverview)
- [ScreenSaverDefaults](https://developer.apple.com/documentation/screensaver/screensaverdefaults)

### Utilities

- [SSRandomIntBetween(_:_:)](https://developer.apple.com/documentation/screensaver/ssrandomintbetween(_:_:))
- [SSRandomFloatBetween(_:_:)](https://developer.apple.com/documentation/screensaver/ssrandomfloatbetween(_:_:))
- [SSRandomPointForSizeWithinRect(_:_:)](https://developer.apple.com/documentation/screensaver/ssrandompointforsizewithinrect(_:_:))
- [SSCenteredRectInRect(_:_:)](https://developer.apple.com/documentation/screensaver/sscenteredrectinrect(_:_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
