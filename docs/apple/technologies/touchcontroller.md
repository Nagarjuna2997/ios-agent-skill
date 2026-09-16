# Touch Controller

## Context

Load this when a task names **Touch Controller** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/touchcontroller) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Integrate onscreen touch controls into your Metal-based games.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Touch Controller`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [TCTouchController](https://developer.apple.com/documentation/touchcontroller/tctouchcontroller)

### Controls

- [TCControl](https://developer.apple.com/documentation/touchcontroller/tccontrol)
- [TCButton](https://developer.apple.com/documentation/touchcontroller/tcbutton)
- [TCDirectionPad](https://developer.apple.com/documentation/touchcontroller/tcdirectionpad)
- [TCSwitch](https://developer.apple.com/documentation/touchcontroller/tcswitch)
- [TCThumbstick](https://developer.apple.com/documentation/touchcontroller/tcthumbstick)
- [TCThrottle](https://developer.apple.com/documentation/touchcontroller/tcthrottle)
- [TCTouchpad](https://developer.apple.com/documentation/touchcontroller/tctouchpad)

### Visuals

- [TCControlContents](https://developer.apple.com/documentation/touchcontroller/tccontrolcontents)
- [TCControlImage](https://developer.apple.com/documentation/touchcontroller/tccontrolimage)
- [TCControlLayout](https://developer.apple.com/documentation/touchcontroller/tccontrollayout)

### System content

- [TCControlContents.ButtonShape](https://developer.apple.com/documentation/touchcontroller/tccontrolcontents/buttonshape)
- [TCControlContents.DpadDirection](https://developer.apple.com/documentation/touchcontroller/tccontrolcontents/dpaddirection)
- [TCControlContents.DpadElementStyle](https://developer.apple.com/documentation/touchcontroller/tccontrolcontents/dpadelementstyle)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
