# MIDIDriverKit

## Context

Load this when a task names **MIDIDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/mididriverkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop drivers for MIDI devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MIDIDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 24.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a MIDI device driver](https://developer.apple.com/documentation/mididriverkit/creating-a-midi-device-driver)
- [com.apple.developer.driverkit.family.midi](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.midi)

### Classes

- [IOUserMIDIDestination](https://developer.apple.com/documentation/mididriverkit/iousermididestination)
- [IOUserMIDIDevice](https://developer.apple.com/documentation/mididriverkit/iousermididevice)
- [IOUserMIDIDriver](https://developer.apple.com/documentation/mididriverkit/iousermididriver)
- [IOUserMIDIEndpoint](https://developer.apple.com/documentation/mididriverkit/iousermidiendpoint)
- [IOUserMIDIEntity](https://developer.apple.com/documentation/mididriverkit/iousermidientity)
- [IOUserMIDIObject](https://developer.apple.com/documentation/mididriverkit/iousermidiobject)
- [IOUserMIDISource](https://developer.apple.com/documentation/mididriverkit/iousermidisource)

### Reference

- [MIDIDriverKit Constants](https://developer.apple.com/documentation/mididriverkit/mididriverkit-constants)
- [MIDIDriverKit Data Types](https://developer.apple.com/documentation/mididriverkit/mididriverkit-data-types)

### Namespaces

- [MIDIDriverKit](https://developer.apple.com/documentation/mididriverkit/mididriverkit)

### Macros

- [kIOUserMIDIDriverUserClientType](https://developer.apple.com/documentation/mididriverkit/kiousermididriveruserclienttype)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
