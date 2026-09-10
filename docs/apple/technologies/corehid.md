# Core HID

## Context

Load this when a task names **Core HID** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/corehid) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Interact with keyboards, mice, and other human interface devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core HID`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 15.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Discovery

- [Discovering HID devices from Terminal](https://developer.apple.com/documentation/corehid/discoveringhiddevicesfromterminal)
- [HIDDeviceManager](https://developer.apple.com/documentation/corehid/hiddevicemanager)
- [HIDDeviceManager.DeviceMatchingCriteria](https://developer.apple.com/documentation/corehid/hiddevicemanager/devicematchingcriteria)

### Interaction

- [Communicating with human interface devices](https://developer.apple.com/documentation/corehid/communicatingwithhiddevices)
- [HIDDeviceClient](https://developer.apple.com/documentation/corehid/hiddeviceclient)
- [HIDElement](https://developer.apple.com/documentation/corehid/hidelement)
- [HIDElementCollection](https://developer.apple.com/documentation/corehid/hidelementcollection)
- [HIDElement.Value](https://developer.apple.com/documentation/corehid/hidelement/value)
- [HIDElementUpdate](https://developer.apple.com/documentation/corehid/hidelementupdate)
- [HIDReportType](https://developer.apple.com/documentation/corehid/hidreporttype)
- [HIDReportID](https://developer.apple.com/documentation/corehid/hidreportid)
- [HIDUsage](https://developer.apple.com/documentation/corehid/hidusage)
- [HIDDeviceError](https://developer.apple.com/documentation/corehid/hiddeviceerror)
- [HIDDeviceTransport](https://developer.apple.com/documentation/corehid/hiddevicetransport)
- [HIDDeviceLocalizationCode](https://developer.apple.com/documentation/corehid/hiddevicelocalizationcode)

### Simulation

- [Creating virtual devices](https://developer.apple.com/documentation/corehid/creatingvirtualdevices)
- [HIDVirtualDevice](https://developer.apple.com/documentation/corehid/hidvirtualdevice)
- [HIDVirtualDeviceDelegate](https://developer.apple.com/documentation/corehid/hidvirtualdevicedelegate)
- [HIDVirtualDevice.Properties](https://developer.apple.com/documentation/corehid/hidvirtualdevice/properties)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
