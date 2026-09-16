# Core WLAN

## Context

Load this when a task names **Core WLAN** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/corewlan) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Query AirPort interfaces and choose wireless networks.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core WLAN`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.6 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [CWChannel](https://developer.apple.com/documentation/corewlan/cwchannel)
- [CWConfiguration](https://developer.apple.com/documentation/corewlan/cwconfiguration)
- [CWInterface](https://developer.apple.com/documentation/corewlan/cwinterface)
- [CWMutableConfiguration](https://developer.apple.com/documentation/corewlan/cwmutableconfiguration)
- [CWMutableNetworkProfile](https://developer.apple.com/documentation/corewlan/cwmutablenetworkprofile)
- [CWNetwork](https://developer.apple.com/documentation/corewlan/cwnetwork)
- [CWNetworkProfile](https://developer.apple.com/documentation/corewlan/cwnetworkprofile)
- [CWWiFiClient](https://developer.apple.com/documentation/corewlan/cwwificlient)

### Protocols

- [CWEventDelegate](https://developer.apple.com/documentation/corewlan/cweventdelegate)

### Reference

- [CoreWLANConstants.h](https://developer.apple.com/documentation/corewlan/corewlanconstants-h)
- [CoreWLANTypes.h](https://developer.apple.com/documentation/corewlan/corewlantypes-h)
- [CoreWLANUtil.h](https://developer.apple.com/documentation/corewlan/corewlanutil-h)
- [CoreWLAN Enumerations](https://developer.apple.com/documentation/corewlan/corewlan-enumerations)
- [CoreWLAN Functions](https://developer.apple.com/documentation/corewlan/corewlan-functions)

### Structures

- [CWCipherKeyFlags](https://developer.apple.com/documentation/corewlan/cwcipherkeyflags)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
