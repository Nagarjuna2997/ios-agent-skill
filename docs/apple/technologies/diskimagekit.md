# DiskImageKit

## Context

Load this when a task names **DiskImageKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/diskimagekit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create, open, and manage disk images.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DiskImageKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essential Types

- [DiskImage](https://developer.apple.com/documentation/diskimagekit/diskimage)
- [StackedImage](https://developer.apple.com/documentation/diskimagekit/stackedimage)
- [OpenConfigurationProtocol](https://developer.apple.com/documentation/diskimagekit/openconfigurationprotocol)
- [OpenConfiguration](https://developer.apple.com/documentation/diskimagekit/openconfiguration)
- [OpenConfiguration.Mode](https://developer.apple.com/documentation/diskimagekit/openconfiguration/mode-swift.enum)

### Creating disk images

- [init(creating:)](https://developer.apple.com/documentation/diskimagekit/diskimage/init(creating:))
- [ASIFCreationConfiguration](https://developer.apple.com/documentation/diskimagekit/asifcreationconfiguration)
- [ASIFLayerCreationConfiguration](https://developer.apple.com/documentation/diskimagekit/asiflayercreationconfiguration)
- [DiskImage.CreationConfiguration](https://developer.apple.com/documentation/diskimagekit/diskimage/creationconfiguration)
- [RAWCreationConfiguration](https://developer.apple.com/documentation/diskimagekit/rawcreationconfiguration)

### Opening and closing disk images

- [init(opening:)](https://developer.apple.com/documentation/diskimagekit/diskimage/init(opening:))

### Appending layers and resizing existing images

- [DiskImage.StackableLayer](https://developer.apple.com/documentation/diskimagekit/diskimage/stackablelayer)
- [appending(_:)](https://developer.apple.com/documentation/diskimagekit/diskimage/appending(_:)-4wifj)

### Values that describe block sizes and image formats

- [DiskImage.Format](https://developer.apple.com/documentation/diskimagekit/diskimage/format-swift.enum)
- [DiskImage.BlockSize](https://developer.apple.com/documentation/diskimagekit/diskimage/blocksize-swift.enum)
- [DiskImage.LayerType](https://developer.apple.com/documentation/diskimagekit/diskimage/layertype-swift.struct)

### Errors

- [IncompatibleStackingError](https://developer.apple.com/documentation/diskimagekit/incompatiblestackingerror)
- [InvalidBlockCountError](https://developer.apple.com/documentation/diskimagekit/invalidblockcounterror)
- [CorruptedImageError](https://developer.apple.com/documentation/diskimagekit/corruptedimageerror)
- [UnsupportedFormatError](https://developer.apple.com/documentation/diskimagekit/unsupportedformaterror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
