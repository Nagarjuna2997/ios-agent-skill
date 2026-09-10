# Core MIDI

## Context

Load this when a task names **Core MIDI** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/coremidi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Communicate with MIDI devices such as hardware keyboards and synthesizers.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core MIDI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.2 | — | No |
| iPadOS | 4.2 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 15.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 8.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Services

- [MIDI Services](https://developer.apple.com/documentation/coremidi/midi-services)
- [MIDI System Setup](https://developer.apple.com/documentation/coremidi/midi-system-setup)
- [MIDI Bluetooth](https://developer.apple.com/documentation/coremidi/midi-bluetooth)
- [MIDI Messages](https://developer.apple.com/documentation/coremidi/midi-messages)
- [MIDI Thru Connection](https://developer.apple.com/documentation/coremidi/midi-thru-connection)
- [MIDI Networking](https://developer.apple.com/documentation/coremidi/midi-networking)
- [MIDI Drivers](https://developer.apple.com/documentation/coremidi/midi-drivers)
- [MIDI Capability Inquiry](https://developer.apple.com/documentation/coremidi/midi-capability-inquiry)

### Reference

- [Core MIDI Structures](https://developer.apple.com/documentation/coremidi/core-midi-structures)
- [Core MIDI Enumerations](https://developer.apple.com/documentation/coremidi/core-midi-enumerations)
- [Core MIDI Constants](https://developer.apple.com/documentation/coremidi/core-midi-constants)
- [Core MIDI Functions](https://developer.apple.com/documentation/coremidi/core-midi-functions)
- [Core MIDI Data Types](https://developer.apple.com/documentation/coremidi/core-midi-data-types)
- [Core MIDI Macros](https://developer.apple.com/documentation/coremidi/coremidi-macros)

### Articles

- [Deprecated Symbols](https://developer.apple.com/documentation/coremidi/midi_system_setup-deprecated-symbols)

### Classes

- [MIDI2DeviceInfo](https://developer.apple.com/documentation/coremidi/midi2deviceinfo)
- [MIDICIDevice](https://developer.apple.com/documentation/coremidi/midicidevice)
- [MIDICIDeviceManager](https://developer.apple.com/documentation/coremidi/midicidevicemanager)
- [MIDICIDiscoveredNode](https://developer.apple.com/documentation/coremidi/midicidiscoverednode) — deprecated
- [MIDIUMPCIProfile](https://developer.apple.com/documentation/coremidi/midiumpciprofile)
- [MIDIUMPEndpoint](https://developer.apple.com/documentation/coremidi/midiumpendpoint)
- [MIDIUMPEndpointManager](https://developer.apple.com/documentation/coremidi/midiumpendpointmanager)
- [MIDIUMPFunctionBlock](https://developer.apple.com/documentation/coremidi/midiumpfunctionblock)
- [MIDIUMPMutableEndpoint](https://developer.apple.com/documentation/coremidi/midiumpmutableendpoint)
- [MIDIUMPMutableFunctionBlock](https://developer.apple.com/documentation/coremidi/midiumpmutablefunctionblock)

### Variables

- [kMIDINoteAttributeManufacturerSpecific](https://developer.apple.com/documentation/coremidi/kmidinoteattributemanufacturerspecific) — deprecated
- [kMIDINoteAttributeNone](https://developer.apple.com/documentation/coremidi/kmidinoteattributenone) — deprecated
- [kMIDINoteAttributePitch](https://developer.apple.com/documentation/coremidi/kmidinoteattributepitch) — deprecated
- [kMIDINoteAttributeProfileSpecific](https://developer.apple.com/documentation/coremidi/kmidinoteattributeprofilespecific) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
