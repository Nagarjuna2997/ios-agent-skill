# Media Device

## Context

Load this when a task names **Media Device** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediadevice) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Let people stream media from any iOS app to your playback hardware through the media device picker.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Device`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a media device extension](https://developer.apple.com/documentation/mediadevice/creating-a-media-device-extension)
- [Routing media to third-party devices](https://developer.apple.com/documentation/avsystemrouting/routing-media-to-third-party-devices)
- [MediaDeviceExtension](https://developer.apple.com/documentation/mediadevice/mediadeviceextension)
- [MediaDeviceExtensionConfiguration](https://developer.apple.com/documentation/mediadevice/mediadeviceextensionconfiguration)

### Device discovery and management

- [MediaOutputDevice](https://developer.apple.com/documentation/mediadevice/mediaoutputdevice)
- [MediaOutputDevice.Capabilities](https://developer.apple.com/documentation/mediadevice/mediaoutputdevice/capabilities-swift.struct)
- [MediaOutputDevice.DeviceType](https://developer.apple.com/documentation/mediadevice/mediaoutputdevice/devicetype-swift.enum)
- [MediaOutputDevice.VolumeControl](https://developer.apple.com/documentation/mediadevice/mediaoutputdevice/volumecontrol-swift.enum)
- [MediaOutputDevice.AuthorizationMethod](https://developer.apple.com/documentation/mediadevice/mediaoutputdevice/authorizationmethod)

### Session and system communication

- [MediaOutputSession](https://developer.apple.com/documentation/mediadevice/mediaoutputsession)
- [MediaDeviceRoutingManager](https://developer.apple.com/documentation/mediadevice/mediadeviceroutingmanager)
- [RealtimeSampleHandling](https://developer.apple.com/documentation/mediadevice/realtimesamplehandling)
- [MediaDeviceError](https://developer.apple.com/documentation/mediadevice/mediadeviceerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
