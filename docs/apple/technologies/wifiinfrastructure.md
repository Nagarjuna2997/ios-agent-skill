# Wi-Fi Infrastructure

## Context

Load this when a task names **Wi-Fi Infrastructure** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/wifiinfrastructure) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Share Wi-Fi network credentials securely between devices and connected accessories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Wi-Fi Infrastructure`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.2 | — | No |
| iPadOS | 26.2 | — | No |
| Mac Catalyst | 26.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.wifi-infrastructure](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.wifi-infrastructure)
- [Sharing Wi-Fi network credentials](https://developer.apple.com/documentation/wifiinfrastructure/sharing-wi-fi-network-credentials)

### Network sharing

- [WINetworkSharingController](https://developer.apple.com/documentation/wifiinfrastructure/winetworksharingcontroller)
- [WINetworkSharingProvider](https://developer.apple.com/documentation/wifiinfrastructure/winetworksharingprovider)
- [WINetworkSharingAskToShareState](https://developer.apple.com/documentation/wifiinfrastructure/winetworksharingasktosharestate)

### Common data

- [WISSID](https://developer.apple.com/documentation/wifiinfrastructure/wissid)
- [WIChannel](https://developer.apple.com/documentation/wifiinfrastructure/wichannel)
- [WIMACAddress](https://developer.apple.com/documentation/wifiinfrastructure/wimacaddress)

### Errors

- [WINetworkSharingError](https://developer.apple.com/documentation/wifiinfrastructure/winetworksharingerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
