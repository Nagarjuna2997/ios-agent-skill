# AudioAccessoryKit

## Context

Load this when a task names **AudioAccessoryKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/audioaccessorykit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Support audio features like automatic audio switching.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AudioAccessoryKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Supporting automatic audio switching for third-party accessories](https://developer.apple.com/documentation/audioaccessorykit/supporting-automatic-audio-switching)

### Audio configuration

- [AccessoryControlDevice](https://developer.apple.com/documentation/audioaccessorykit/accessorycontroldevice)

### Device characteristics

- [AccessoryControlDevice.Placement](https://developer.apple.com/documentation/audioaccessorykit/accessorycontroldevice/placement)
- [AccessoryControlDevice.Capabilities](https://developer.apple.com/documentation/audioaccessorykit/accessorycontroldevice/capabilities)
- [AccessoryControlDevice.Configuration](https://developer.apple.com/documentation/audioaccessorykit/accessorycontroldevice/configuration-swift.struct)

### Errors

- [AccessoryControlDevice.Error](https://developer.apple.com/documentation/audioaccessorykit/accessorycontroldevice/error)

### Classes

- [AudioAccessoryHeadTracking](https://developer.apple.com/documentation/audioaccessorykit/audioaccessoryheadtracking)

### Structures

- [AccessorySensorUpdates](https://developer.apple.com/documentation/audioaccessorykit/accessorysensorupdates)

### Enumerations

- [AudioAccessoryError](https://developer.apple.com/documentation/audioaccessorykit/audioaccessoryerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
