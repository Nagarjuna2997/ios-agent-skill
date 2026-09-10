# DockKit

## Context

Load this when a task names **DockKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/dockkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Interact with accessories that track subjects on camera as they move around.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DockKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Controlling the dock accessory

- [Controlling a DockKit accessory using your camera app](https://developer.apple.com/documentation/dockkit/controlling-a-dockkit-accessory-using-your-camera-app)
- [DockAccessoryManager](https://developer.apple.com/documentation/dockkit/dockaccessorymanager)
- [DockAccessory](https://developer.apple.com/documentation/dockkit/dockaccessory)
- [DockKitError](https://developer.apple.com/documentation/dockkit/dockkiterror)

### Customizing tracking behavior

- [Modify rotation and positioning programmatically](https://developer.apple.com/documentation/dockkit/modify-rotation-and-positioning-behavior-programmatically)
- [Track custom objects in a frame](https://developer.apple.com/documentation/dockkit/track-custom-objects-in-a-frame)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
