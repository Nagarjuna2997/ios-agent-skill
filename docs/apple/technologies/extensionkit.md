# ExtensionKit

## Context

Load this when a task names **ExtensionKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/extensionkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Make custom UI from an app extension available in a host app, and manage the list of enabled and disabled app extensions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ExtensionKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.1 | — | No |
| iPadOS | 16.1 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Including extension-based UI in your interface](https://developer.apple.com/documentation/extensionkit/including-extension-based-ui-in-your-interface)

### UI definition

- [AppExtensionScene](https://developer.apple.com/documentation/extensionkit/appextensionscene)
- [PrimitiveAppExtensionScene](https://developer.apple.com/documentation/extensionkit/primitiveappextensionscene)
- [AppExtensionSceneBuilder](https://developer.apple.com/documentation/extensionkit/appextensionscenebuilder)

### App extension configuration

- [AppExtensionSceneConfiguration](https://developer.apple.com/documentation/extensionkit/appextensionsceneconfiguration)

### Host app presentation

- [Displaying the app extensions available to your app](https://developer.apple.com/documentation/extensionkit/displaying-the-app-extensions-available-to-your-app)
- [EXHostViewController](https://developer.apple.com/documentation/extensionkit/exhostviewcontroller)
- [EXAppExtensionBrowserViewController](https://developer.apple.com/documentation/extensionkit/exappextensionbrowserviewcontroller)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
