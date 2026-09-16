# USBSerialDriverKit

## Context

Load this when a task names **USBSerialDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/usbserialdriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for serial USB devices connected to your Mac.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `USBSerialDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Serial USB Interface

- [com.apple.developer.driverkit.family.serial](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.serial)
- [IOUserUSBSerial](https://developer.apple.com/documentation/usbserialdriverkit/iouserusbserial)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
