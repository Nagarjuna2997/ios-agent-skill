# AudioDriverKit

## Context

Load this when a task names **AudioDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/audiodriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for audio devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AudioDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 21.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [IOUserAudioObject](https://developer.apple.com/documentation/audiodriverkit/iouseraudioobject)
- [IOUserAudioDriver](https://developer.apple.com/documentation/audiodriverkit/iouseraudiodriver)
- [DriverKit Audio Family](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.audio)
- [Creating an audio device driver](https://developer.apple.com/documentation/audiodriverkit/creating-an-audio-device-driver)

### Working with Audio Devices

- [IOUserAudioClockDevice](https://developer.apple.com/documentation/audiodriverkit/iouseraudioclockdevice)
- [IOUserAudioDevice](https://developer.apple.com/documentation/audiodriverkit/iouseraudiodevice)

### Containing Audio Objects

- [IOUserAudioBox](https://developer.apple.com/documentation/audiodriverkit/iouseraudiobox)

### Working with Audio Streams

- [IOUserAudioStream](https://developer.apple.com/documentation/audiodriverkit/iouseraudiostream)

### Using Audio Controls

- [IOUserAudioControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudiocontrol)
- [IOUserAudioBooleanControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudiobooleancontrol)
- [IOUserAudioStereoPanControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudiostereopancontrol)
- [IOUserAudioSliderControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudioslidercontrol)
- [IOUserAudioSelectorControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudioselectorcontrol)
- [IOUserAudioLevelControl](https://developer.apple.com/documentation/audiodriverkit/iouseraudiolevelcontrol)

### Supporting Types

- [IOUserAudioReservedConfigChangeAction](https://developer.apple.com/documentation/audiodriverkit/audiodriverkit/iouseraudioreservedconfigchangeaction)

### Namespaces

- [AudioDriverKit](https://developer.apple.com/documentation/audiodriverkit/audiodriverkit)

### Macros

- [DebugMsg](https://developer.apple.com/documentation/audiodriverkit/debugmsg)
- [FailIf](https://developer.apple.com/documentation/audiodriverkit/failif)
- [FailIfError](https://developer.apple.com/documentation/audiodriverkit/failiferror)
- [FailIfNULL](https://developer.apple.com/documentation/audiodriverkit/failifnull)
- [kIOUserAudioDriverUserClientType](https://developer.apple.com/documentation/audiodriverkit/kiouseraudiodriveruserclienttype)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
