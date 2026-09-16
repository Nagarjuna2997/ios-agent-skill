# System Configuration

## Context

Load this when a task names **System Configuration** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/systemconfiguration) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Allow applications to access a device’s network configuration settings. Determine the reachability of the device, such as whether Wi-Fi or cell connectivity are active.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `System Configuration`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.1 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [SCDynamicStore](https://developer.apple.com/documentation/systemconfiguration/scdynamicstore-gb2)
- [SCDynamicStoreCopySpecific](https://developer.apple.com/documentation/systemconfiguration/scdynamicstorecopyspecific)
- [SCDynamicStoreKey](https://developer.apple.com/documentation/systemconfiguration/scdynamicstorekey)
- [SCNetwork](https://developer.apple.com/documentation/systemconfiguration/scnetwork)
- [SCNetworkConfiguration](https://developer.apple.com/documentation/systemconfiguration/scnetworkconfiguration)
- [SCNetworkConnection](https://developer.apple.com/documentation/systemconfiguration/scnetworkconnection-g7e)
- [SCNetworkReachability](https://developer.apple.com/documentation/systemconfiguration/scnetworkreachability-g7d)
- [SCPreferences](https://developer.apple.com/documentation/systemconfiguration/scpreferences-ft8)
- [SCPreferencesPath](https://developer.apple.com/documentation/systemconfiguration/scpreferencespath)
- [SCPreferencesSetSpecific](https://developer.apple.com/documentation/systemconfiguration/scpreferencessetspecific)
- [SCSchemaDefinitions](https://developer.apple.com/documentation/systemconfiguration/scschemadefinitions)
- [System Configuration](https://developer.apple.com/documentation/systemconfiguration/system-configuration)
- [SystemConfiguration Enumerations](https://developer.apple.com/documentation/systemconfiguration/systemconfiguration-enumerations)
- [SystemConfiguration Constants](https://developer.apple.com/documentation/systemconfiguration/systemconfiguration-constants)
- [SystemConfiguration Functions](https://developer.apple.com/documentation/systemconfiguration/systemconfiguration-functions)
- [SystemConfiguration Data Types](https://developer.apple.com/documentation/systemconfiguration/systemconfiguration-data-types)

### Entitlements

- [Access Wi-Fi Information Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.networking.wifi-info)

### Type Aliases

- [AuthorizationRef](https://developer.apple.com/documentation/systemconfiguration/authorizationref)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
