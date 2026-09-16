# IOBluetooth UI

## Context

Load this when a task names **IOBluetooth UI** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/iobluetoothui) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Present an interface through which users can pair their devices with other Bluetooth devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `IOBluetooth UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [IOBluetoothAccessibilityIgnoredImageCell](https://developer.apple.com/documentation/iobluetoothui/iobluetoothaccessibilityignoredimagecell)
- [IOBluetoothAccessibilityIgnoredTextFieldCell](https://developer.apple.com/documentation/iobluetoothui/iobluetoothaccessibilityignoredtextfieldcell)
- [IOBluetoothDeviceSelectorController](https://developer.apple.com/documentation/iobluetoothui/iobluetoothdeviceselectorcontroller)
- [IOBluetoothDeviceSelectorControllerRef](https://developer.apple.com/documentation/iobluetoothui/iobluetoothdeviceselectorcontrollerref)
- [IOBluetoothObjectPushUIController](https://developer.apple.com/documentation/iobluetoothui/iobluetoothobjectpushuicontroller)
- [IOBluetoothPairingController](https://developer.apple.com/documentation/iobluetoothui/iobluetoothpairingcontroller)
- [IOBluetoothPairingControllerRef](https://developer.apple.com/documentation/iobluetoothui/iobluetoothpairingcontrollerref)
- [IOBluetoothPasskeyDisplay](https://developer.apple.com/documentation/iobluetoothui/iobluetoothpasskeydisplay)
- [IOBluetoothServiceBrowserController](https://developer.apple.com/documentation/iobluetoothui/iobluetoothservicebrowsercontroller)
- [IOBluetoothServiceBrowserControllerRef](https://developer.apple.com/documentation/iobluetoothui/iobluetoothservicebrowsercontrollerref)

### Reference

- [IOBluetoothUIUserLib.h](https://developer.apple.com/documentation/iobluetoothui/iobluetoothuiuserlib-h)
- [IOBluetoothUI Enumerations](https://developer.apple.com/documentation/iobluetoothui/iobluetoothui-enumerations)
- [IOBluetoothUI Constants](https://developer.apple.com/documentation/iobluetoothui/iobluetoothui-constants)
- [IOBluetoothUI Functions](https://developer.apple.com/documentation/iobluetoothui/iobluetoothui-functions)

### Structures

- [BluetoothKeyboardReturnType](https://developer.apple.com/documentation/iobluetoothui/bluetoothkeyboardreturntype)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
