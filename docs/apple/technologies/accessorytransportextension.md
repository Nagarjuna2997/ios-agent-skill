# Accessory Transport Extension

## Context

Load this when a task names **Accessory Transport Extension** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/accessorytransportextension) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Transfer data securely to connected accessories that you develop.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accessory Transport Extension`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Wi-Fi network sharing

- [AccessoryTransportAppExtension](https://developer.apple.com/documentation/accessorytransportextension/accessorytransportappextension)
- [AccessoryTransportExtensionConfiguration](https://developer.apple.com/documentation/accessorytransportextension/accessorytransportextensionconfiguration)
- [AccessoryTransportSession](https://developer.apple.com/documentation/accessorytransportextension/accessorytransportsession)
- [Wi-Fi Infrastructure](https://developer.apple.com/documentation/wifiinfrastructure)

### Notification forwarding

- [Receiving iOS notifications on an accessory](https://developer.apple.com/documentation/accessorytransportextension/receiving-ios-notifications-on-an-accessory)
- [Forwarding notifications to your accessory using the internet transport type](https://developer.apple.com/documentation/accessorytransportextension/forwarding-notifications-to-your-accessory-using-the-internet-transport-type)
- [AccessoryDataProvider](https://developer.apple.com/documentation/accessorytransportextension/accessorydataprovider)
- [AccessoryDataProviderConfiguration](https://developer.apple.com/documentation/accessorytransportextension/accessorydataproviderconfiguration)
- [AccessoryTransportSecurity](https://developer.apple.com/documentation/accessorytransportextension/accessorytransportsecurity)
- [AccessoryTransportSecurityConfiguration](https://developer.apple.com/documentation/accessorytransportextension/accessorytransportsecurityconfiguration)
- [Accessory Notifications](https://developer.apple.com/documentation/accessorynotifications)

### Data and sessions

- [AccessoryFeature](https://developer.apple.com/documentation/accessorytransportextension/accessoryfeature)
- [AccessoryMessage](https://developer.apple.com/documentation/accessorytransportextension/accessorymessage)
- [AccessorySecuritySession](https://developer.apple.com/documentation/accessorytransportextension/accessorysecuritysession)
- [TransportMessage](https://developer.apple.com/documentation/accessorytransportextension/transportmessage)
- [SecurityMessage](https://developer.apple.com/documentation/accessorytransportextension/securitymessage)
- [AccessoryTransport](https://developer.apple.com/documentation/accessorytransportextension/accessorytransport)

### Protocols

- [AccessoryFeatureSession](https://developer.apple.com/documentation/accessorytransportextension/accessoryfeaturesession)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
