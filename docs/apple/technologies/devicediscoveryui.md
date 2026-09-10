# DeviceDiscoveryUI

## Context

Load this when a task names **DeviceDiscoveryUI** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/devicediscoveryui) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Display an interface that lets people connect iOS, iPadOS, tvOS, watchOS, and Mac Catalyst apps over peer-to-peer networks.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DeviceDiscoveryUI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| tvOS | 16.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Publishing service availability

- [Building peer-to-peer apps](https://developer.apple.com/documentation/wifiaware/building-peer-to-peer-apps)
- [DevicePairingView](https://developer.apple.com/documentation/devicediscoveryui/devicepairingview)
- [DDDevicePairingViewController](https://developer.apple.com/documentation/devicediscoveryui/dddevicepairingviewcontroller)
- [DDDevicePairingAccess](https://developer.apple.com/documentation/devicediscoveryui/dddevicepairingaccess)
- [NSApplicationServices](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapplicationservices)

### Pairing with nearby devices

- [DevicePicker](https://developer.apple.com/documentation/devicediscoveryui/devicepicker)
- [DDDevicePickerViewController](https://developer.apple.com/documentation/devicediscoveryui/dddevicepickerviewcontroller)
- [DevicePickerSupportedAction](https://developer.apple.com/documentation/devicediscoveryui/devicepickersupportedaction)
- [Connecting a tvOS app to other devices over the local network](https://developer.apple.com/documentation/devicediscoveryui/connecting-a-tvos-app-to-other-devices-over-the-local-network)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
