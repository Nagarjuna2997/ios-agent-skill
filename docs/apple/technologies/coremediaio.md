# Core Media I/O

## Context

Load this when a task names **Core Media I/O** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/coremediaio) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Securely support custom camera devices in macOS.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Media I/O`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.7 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Providers

- [Creating a camera extension with Core Media I/O](https://developer.apple.com/documentation/coremediaio/creating-a-camera-extension-with-core-media-i-o)
- [Overriding the default USB video class extension](https://developer.apple.com/documentation/coremediaio/overriding-the-default-usb-video-class-extension)
- [CMIOExtensionProvider](https://developer.apple.com/documentation/coremediaio/cmioextensionprovider)
- [CMIOExtensionProviderSource](https://developer.apple.com/documentation/coremediaio/cmioextensionprovidersource)
- [CMIOExtensionProviderProperties](https://developer.apple.com/documentation/coremediaio/cmioextensionproviderproperties)

### Devices

- [CMIOExtensionDevice](https://developer.apple.com/documentation/coremediaio/cmioextensiondevice)
- [CMIOExtensionDeviceSource](https://developer.apple.com/documentation/coremediaio/cmioextensiondevicesource)
- [CMIOExtensionDeviceProperties](https://developer.apple.com/documentation/coremediaio/cmioextensiondeviceproperties)

### Streams

- [CMIOExtensionStream](https://developer.apple.com/documentation/coremediaio/cmioextensionstream)
- [CMIOExtensionStreamSource](https://developer.apple.com/documentation/coremediaio/cmioextensionstreamsource)
- [CMIOExtensionStreamProperties](https://developer.apple.com/documentation/coremediaio/cmioextensionstreamproperties)
- [CMIOExtensionClient](https://developer.apple.com/documentation/coremediaio/cmioextensionclient)

### Properties

- [CMIOExtensionProperty](https://developer.apple.com/documentation/coremediaio/cmioextensionproperty)
- [CMIOExtensionPropertyState](https://developer.apple.com/documentation/coremediaio/cmioextensionpropertystate)
- [CMIOExtensionPropertyAttributes](https://developer.apple.com/documentation/coremediaio/cmioextensionpropertyattributes)
- [CMIOExtensionInfoDictionaryKey](https://developer.apple.com/documentation/coremediaio/cmioextensioninfodictionarykey)
- [CMIOExtensionMachServiceNameKey](https://developer.apple.com/documentation/coremediaio/cmioextensionmachservicenamekey)

### DAL Plug-Ins

- [Device Abstraction Layer (DAL) Plug-Ins](https://developer.apple.com/documentation/coremediaio/device-abstraction-layer-dal-plug-ins)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
