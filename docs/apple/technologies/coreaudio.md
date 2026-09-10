# Core Audio

## Context

Load this when a task names **Core Audio** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/coreaudio) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Use the Core Audio framework to interact with device’s audio hardware.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Audio`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 3.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Drivers

- [Creating an Audio Server Driver Plug-in](https://developer.apple.com/documentation/coreaudio/creating-an-audio-server-driver-plug-in)
- [Building an Audio Server Plug-in and Driver Extension](https://developer.apple.com/documentation/coreaudio/building-an-audio-server-plug-in-and-driver-extension)
- [Capturing system audio with Core Audio taps](https://developer.apple.com/documentation/coreaudio/capturing-system-audio-with-core-audio-taps)

### Reference

- [Core Audio Structures](https://developer.apple.com/documentation/coreaudio/core-audio-structures)
- [Core Audio Data Types](https://developer.apple.com/documentation/coreaudio/core-audio-data-types)
- [Core Audio Functions](https://developer.apple.com/documentation/coreaudio/core-audio-functions)
- [Core Audio Constants](https://developer.apple.com/documentation/coreaudio/core-audio-constants)
- [Core Audio Enumerations](https://developer.apple.com/documentation/coreaudio/core-audio-enumerations)

### Classes

- [AudioHardwareAggregateDevice](https://developer.apple.com/documentation/coreaudio/audiohardwareaggregatedevice)
- [AudioHardwareBox](https://developer.apple.com/documentation/coreaudio/audiohardwarebox)
- [AudioHardwareClock](https://developer.apple.com/documentation/coreaudio/audiohardwareclock)
- [AudioHardwareControl](https://developer.apple.com/documentation/coreaudio/audiohardwarecontrol)
- [AudioHardwareDevice](https://developer.apple.com/documentation/coreaudio/audiohardwaredevice)
- [AudioHardwareObject](https://developer.apple.com/documentation/coreaudio/audiohardwareobject)
- [AudioHardwarePlugin](https://developer.apple.com/documentation/coreaudio/audiohardwareplugin)
- [AudioHardwareProcess](https://developer.apple.com/documentation/coreaudio/audiohardwareprocess)
- [AudioHardwareStream](https://developer.apple.com/documentation/coreaudio/audiohardwarestream)
- [AudioHardwareSystem](https://developer.apple.com/documentation/coreaudio/audiohardwaresystem)
- [AudioHardwareTap](https://developer.apple.com/documentation/coreaudio/audiohardwaretap)
- [CATapDescription](https://developer.apple.com/documentation/coreaudio/catapdescription)

### Protocols

- [PropertyListenerDelegate](https://developer.apple.com/documentation/coreaudio/propertylistenerdelegate)

### Structures

- [AudioHardwareError](https://developer.apple.com/documentation/coreaudio/audiohardwareerror)
- [ManagedAudioChannelLayout](https://developer.apple.com/documentation/coreaudio/managedaudiochannellayout)

### Variables

- [kAudioDevicePropertySuggestedReferenceDevice](https://developer.apple.com/documentation/coreaudio/kaudiodevicepropertysuggestedreferencedevice)
- [kAudioDevicePropertyWantsControlsRestored](https://developer.apple.com/documentation/coreaudio/kaudiodevicepropertywantscontrolsrestored)
- [kAudioDevicePropertyWantsStreamFormatsRestored](https://developer.apple.com/documentation/coreaudio/kaudiodevicepropertywantsstreamformatsrestored)
- [kAudioDeviceTransportTypeRemoteScreen](https://developer.apple.com/documentation/coreaudio/kaudiodevicetransporttyperemotescreen)
- [kAudioDeviceTransportTypeRemoteStreaming](https://developer.apple.com/documentation/coreaudio/kaudiodevicetransporttyperemotestreaming)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
