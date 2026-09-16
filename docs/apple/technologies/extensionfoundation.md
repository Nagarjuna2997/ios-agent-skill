# ExtensionFoundation

## Context

Load this when a task names **ExtensionFoundation** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/extensionfoundation) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create executable bundles to extend the functionality of other apps.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ExtensionFoundation`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 17.4 | — | No |
| visionOS | 1.1 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Adding support for app extensions to your app](https://developer.apple.com/documentation/extensionfoundation/adding-support-for-app-extensions-to-your-app)

### App-extension setup

- [Building an app extension to support a host app](https://developer.apple.com/documentation/extensionfoundation/building-an-app-extension-to-support-a-host-app)
- [AppExtension](https://developer.apple.com/documentation/extensionfoundation/appextension)
- [AppExtensionConfiguration](https://developer.apple.com/documentation/extensionfoundation/appextensionconfiguration)
- [ConnectionHandler](https://developer.apple.com/documentation/extensionfoundation/connectionhandler)

### Host-app configuration

- [Discovering app extensions from your app](https://developer.apple.com/documentation/extensionfoundation/discovering-app-extensions-from-your-app)
- [AppExtensionProcess](https://developer.apple.com/documentation/extensionfoundation/appextensionprocess)
- [AppExtensionIdentity](https://developer.apple.com/documentation/extensionfoundation/appextensionidentity)

### Extension-point management

- [AppExtensionPoint](https://developer.apple.com/documentation/extensionfoundation/appextensionpoint)
- [ExtensionPointDefining](https://developer.apple.com/documentation/extensionfoundation/extensionpointdefining)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
