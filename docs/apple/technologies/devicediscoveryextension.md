# DeviceDiscoveryExtension

## Context

Load this when a task names **DeviceDiscoveryExtension** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/devicediscoveryextension) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Stream media to a third-party device that a user selects in a system menu.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DeviceDiscoveryExtension`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| macOS | 15.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Discovering a third-party media-streaming device](https://developer.apple.com/documentation/devicediscoveryextension/discovering-a-third-party-media-streaming-device)
- [Media Device Discovery Extension](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.media-device-discovery-extension) — deprecated

### Extension

- [DDDiscoveryExtension](https://developer.apple.com/documentation/devicediscoveryextension/dddiscoveryextension)
- [DDDiscoverySession](https://developer.apple.com/documentation/devicediscoveryextension/dddiscoverysession)
- [DDDiscoveryExtensionConfigurationProtocol](https://developer.apple.com/documentation/devicediscoveryextension/dddiscoveryextensionconfigurationprotocol)

### Life cycle

- [DDDeviceEvent](https://developer.apple.com/documentation/devicediscoveryextension/dddeviceevent)
- [DDDeviceEvent.EventType](https://developer.apple.com/documentation/devicediscoveryextension/dddeviceevent/eventtype-swift.enum)
- [DDEventTypeToString(_:)](https://developer.apple.com/documentation/devicediscoveryextension/ddeventtypetostring(_:))
- [DDEventHandler](https://developer.apple.com/documentation/devicediscoveryextension/ddeventhandler)

### Device information

- [DDDevice](https://developer.apple.com/documentation/devicediscoveryextension/dddevice)
- [DDDevice.Category](https://developer.apple.com/documentation/devicediscoveryextension/dddevice/category-swift.enum)
- [DDDeviceState](https://developer.apple.com/documentation/devicediscoveryextension/dddevicestate)
- [DDDeviceCategoryToString(_:)](https://developer.apple.com/documentation/devicediscoveryextension/dddevicecategorytostring(_:))
- [DDDeviceStateToString(_:)](https://developer.apple.com/documentation/devicediscoveryextension/dddevicestatetostring(_:))
- [DDDevice.Protocol](https://developer.apple.com/documentation/devicediscoveryextension/dddevice/protocol-swift.enum)
- [DDDeviceProtocolToString(_:)](https://developer.apple.com/documentation/devicediscoveryextension/dddeviceprotocoltostring(_:))
- [DDDeviceProtocolString](https://developer.apple.com/documentation/devicediscoveryextension/dddeviceprotocolstring)
- [DDDeviceMediaPlaybackStateToString(_:)](https://developer.apple.com/documentation/devicediscoveryextension/dddevicemediaplaybackstatetostring(_:))

### Errors

- [DDError](https://developer.apple.com/documentation/devicediscoveryextension/dderror)
- [DDError.Code](https://developer.apple.com/documentation/devicediscoveryextension/dderror/code)
- [DDErrorHandler](https://developer.apple.com/documentation/devicediscoveryextension/dderrorhandler)
- [DDErrorOutType](https://developer.apple.com/documentation/devicediscoveryextension/dderrorouttype)
- [DDErrorDomain](https://developer.apple.com/documentation/devicediscoveryextension/dderrordomain)

### Reference

- [DeviceDiscoveryExtension Enumerations](https://developer.apple.com/documentation/devicediscoveryextension/devicediscoveryextension-enumerations)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
