# CoreAudioKit

## Context

Load this when a task names **CoreAudioKit** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/coreaudiokit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Add user interfaces to audio units.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CoreAudioKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 8.0 | — | No |
| iPadOS | 8.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.4 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Audio Units

- [AUViewController](https://developer.apple.com/documentation/coreaudiokit/auviewcontroller)
- [AUAudioUnitViewConfiguration](https://developer.apple.com/documentation/coreaudiokit/auaudiounitviewconfiguration)
- [AUGenericView](https://developer.apple.com/documentation/coreaudiokit/augenericview)
- [AUPannerView](https://developer.apple.com/documentation/coreaudiokit/aupannerview)
- [AUCustomViewPersistentData](https://developer.apple.com/documentation/coreaudiokit/aucustomviewpersistentdata)

### Bluetooth Devices

- [CABTLEMIDIWindowController](https://developer.apple.com/documentation/coreaudiokit/cabtlemidiwindowcontroller)
- [CABTMIDICentralViewController](https://developer.apple.com/documentation/coreaudiokit/cabtmidicentralviewcontroller)
- [CABTMIDILocalPeripheralViewController](https://developer.apple.com/documentation/coreaudiokit/cabtmidilocalperipheralviewcontroller)

### Network Devices

- [CANetworkBrowserWindowController](https://developer.apple.com/documentation/coreaudiokit/canetworkbrowserwindowcontroller)

### Inter-Device Audio

- [CAInterDeviceAudioViewController](https://developer.apple.com/documentation/coreaudiokit/cainterdeviceaudioviewcontroller)

### Inter-App Audio

- [CAInterAppAudioSwitcherView](https://developer.apple.com/documentation/coreaudiokit/cainterappaudioswitcherview) — deprecated
- [CAInterAppAudioTransportView](https://developer.apple.com/documentation/coreaudiokit/cainterappaudiotransportview) — deprecated

### Deprecations

- [AUGenericViewInternal](https://developer.apple.com/documentation/coreaudiokit/augenericviewinternal)
- [AUGenericViewInternalBase](https://developer.apple.com/documentation/coreaudiokit/augenericviewinternalbase)

### Classes

- [AUAppleCustomViewLoader](https://developer.apple.com/documentation/coreaudiokit/auapplecustomviewloader)
- [AUGenericViewController](https://developer.apple.com/documentation/coreaudiokit/augenericviewcontroller)

### Structures

- [AUGenericViewDisplayFlags](https://developer.apple.com/documentation/coreaudiokit/augenericviewdisplayflags)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
