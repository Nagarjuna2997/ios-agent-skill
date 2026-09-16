# EnergyKit

## Context

Load this when a task names **EnergyKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/energykit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide grid forecasts and energy insights to help people optimize their electricity usage.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `EnergyKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Optimizing home electricity usage](https://developer.apple.com/documentation/energykit/optimizing-home-electricity-usage)
- [Providing charging history for electric vehicles](https://developer.apple.com/documentation/energykit/providing-informative-charging-history-for-electric-vehicles)
- [EnergyKit Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.energykit)
- [EnergyKit LoadEvents Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.energykit.loadevents-experience)

### Electricity guidance

- [ElectricityGuidance](https://developer.apple.com/documentation/energykit/electricityguidance)

### Electric vehicle events

- [ElectricVehicleLoadEvent](https://developer.apple.com/documentation/energykit/electricvehicleloadevent)
- [ElectricVehicleStatusEvent](https://developer.apple.com/documentation/energykit/electricvehiclestatusevent)
- [ElectricVehicleChargingReason](https://developer.apple.com/documentation/energykit/electricvehiclechargingreason)

### HVAC events

- [ElectricHVACLoadEvent](https://developer.apple.com/documentation/energykit/electrichvacloadevent)

### Device identification

- [ElectricalLoadDevice](https://developer.apple.com/documentation/energykit/electricalloaddevice)
- [ElectricalLoadEventProtocol](https://developer.apple.com/documentation/energykit/electricalloadeventprotocol)

### Energy venues

- [EnergyVenue](https://developer.apple.com/documentation/energykit/energyvenue)

### Electricity insights

- [ElectricityInsightService](https://developer.apple.com/documentation/energykit/electricityinsightservice)
- [ElectricityInsightQuery](https://developer.apple.com/documentation/energykit/electricityinsightquery)
- [ElectricityInsightRecord](https://developer.apple.com/documentation/energykit/electricityinsightrecord)
- [ElectricityInsightMeasure](https://developer.apple.com/documentation/energykit/electricityinsightmeasure)

### Supporting types

- [ElectricityFlowDirection](https://developer.apple.com/documentation/energykit/electricityflowdirection)
- [EnergyKitError](https://developer.apple.com/documentation/energykit/energykiterror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
