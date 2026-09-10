# Wi-Fi Aware

## Context

Load this when a task names **Wi-Fi Aware** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/wifiaware) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Securely pair and connect to external devices over peer-to-peer Wi-Fi.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Wi-Fi Aware`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Building peer-to-peer apps](https://developer.apple.com/documentation/wifiaware/building-peer-to-peer-apps)
- [Connecting devices for peer-to-peer Wi-Fi](https://developer.apple.com/documentation/wifiaware/connecting-paired-devices)
- [Adopting Wi-Fi Aware](https://developer.apple.com/documentation/wifiaware/adopting-wi-fi-aware)
- [com.apple.developer.wifi-aware](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.wifi-aware)
- [WiFiAwareServices](https://developer.apple.com/documentation/bundleresources/information-property-list/wifiawareservices)

### Host capabilities

- [WACapabilities](https://developer.apple.com/documentation/wifiaware/wacapabilities)
- [WACapabilities.Feature](https://developer.apple.com/documentation/wifiaware/wacapabilities/feature)

### Services to discover

- [WAService](https://developer.apple.com/documentation/wifiaware/waservice)
- [WASubscribableService](https://developer.apple.com/documentation/wifiaware/wasubscribableservice)
- [WAPublishableService](https://developer.apple.com/documentation/wifiaware/wapublishableservice)

### Paired devices

- [WAPairedDevice](https://developer.apple.com/documentation/wifiaware/wapaireddevice)
- [WAPairedDevice.Devices](https://developer.apple.com/documentation/wifiaware/wapaireddevice/devices)
- [WAPairedDevice.DevicesSequence](https://developer.apple.com/documentation/wifiaware/wapaireddevice/devicessequence)
- [WAPairedDevice.PairingInfo](https://developer.apple.com/documentation/wifiaware/wapaireddevice/pairinginfo-swift.struct)

### Subscriber

- [WASubscriberBrowser](https://developer.apple.com/documentation/wifiaware/wasubscriberbrowser)
- [WASubscriberBrowser.Action](https://developer.apple.com/documentation/wifiaware/wasubscriberbrowser/action)
- [WASubscriberBrowser.Devices](https://developer.apple.com/documentation/wifiaware/wasubscriberbrowser/devices)

### Publisher

- [WAPublisherListener](https://developer.apple.com/documentation/wifiaware/wapublisherlistener)
- [WAPublisherListener.Action](https://developer.apple.com/documentation/wifiaware/wapublisherlistener/action)
- [WAPublisherListener.Devices](https://developer.apple.com/documentation/wifiaware/wapublisherlistener/devices)
- [WAPublisherListener.DatapathParameters](https://developer.apple.com/documentation/wifiaware/wapublisherlistener/datapathparameters)

### Parameters

- [NWParameters](https://developer.apple.com/documentation/network/nwparameters)
- [NWParametersBuilder](https://developer.apple.com/documentation/network/nwparametersbuilder)
- [WAParameters](https://developer.apple.com/documentation/wifiaware/waparameters)

### Connections

- [WAEndpoint](https://developer.apple.com/documentation/wifiaware/waendpoint)
- [WAConnection](https://developer.apple.com/documentation/wifiaware/waconnection)

### Security

- [WASharedSecret](https://developer.apple.com/documentation/wifiaware/washaredsecret)

### Connection performance

- [NWPath](https://developer.apple.com/documentation/network/nwpath)
- [WAPath](https://developer.apple.com/documentation/wifiaware/wapath)
- [WAPerformanceMode](https://developer.apple.com/documentation/wifiaware/waperformancemode)
- [WAAccessCategory](https://developer.apple.com/documentation/wifiaware/waaccesscategory)
- [WAPerformanceReport](https://developer.apple.com/documentation/wifiaware/waperformancereport)

### Errors

- [NWError](https://developer.apple.com/documentation/network/nwerror)
- [WAError](https://developer.apple.com/documentation/wifiaware/waerror)

### Structures

- [WAPerformanceForecast](https://developer.apple.com/documentation/wifiaware/waperformanceforecast)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
