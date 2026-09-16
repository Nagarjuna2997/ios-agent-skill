# Playground Bluetooth

## Context

Load this when a task names **Playground Bluetooth** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/playgroundbluetooth) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Display and manage connections to Bluetooth peripherals in Swift Playgrounds.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Swift Playgrounds | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Peripheral Connection

- [Connecting to Bluetooth Peripherals in Swift Playgrounds](https://developer.apple.com/documentation/playgroundbluetooth/connecting_to_bluetooth_peripherals_in_swift_playgrounds)
- [PlaygroundBluetoothCentralManager](https://developer.apple.com/documentation/playgroundbluetooth/playgroundbluetoothcentralmanager)
- [PlaygroundBluetoothCentralManagerDelegate](https://developer.apple.com/documentation/playgroundbluetooth/playgroundbluetoothcentralmanagerdelegate)

### Peripheral Display

- [PlaygroundBluetoothConnectionView](https://developer.apple.com/documentation/playgroundbluetooth/playgroundbluetoothconnectionview)
- [PlaygroundBluetoothConnectionViewDelegate](https://developer.apple.com/documentation/playgroundbluetooth/playgroundbluetoothconnectionviewdelegate)
- [PlaygroundBluetoothConnectionViewDataSource](https://developer.apple.com/documentation/playgroundbluetooth/playgroundbluetoothconnectionviewdatasource)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
