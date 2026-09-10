# App License Delivery SDK

## Context

Load this when a task names **App License Delivery SDK** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/applicensedeliverysdk) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Secure the installation of alternative distribution apps on iOS or iPadOS devices by vending licenses from your web server.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `App License Delivery SDK`.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Configuring your app licensing environment](https://developer.apple.com/documentation/applicensedeliverysdk/configuring-the-app-licensing-environment)

### App licensing

- [Licensing alternative distribution apps](https://developer.apple.com/documentation/applicensedeliverysdk/licensing-alternative-distribution-apps)
- [Renewing and revoking app licenses](https://developer.apple.com/documentation/applicensedeliverysdk/renewing-and-revoking-app-licenses)
- [ALDAppKey](https://developer.apple.com/documentation/applicensedeliverysdk/aldappkey)
- [ALDLicenseAttribute](https://developer.apple.com/documentation/applicensedeliverysdk/aldlicenseattribute)
- [ALDProvider](https://developer.apple.com/documentation/applicensedeliverysdk/aldprovider)
- [ALDSession](https://developer.apple.com/documentation/applicensedeliverysdk/aldsession)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
