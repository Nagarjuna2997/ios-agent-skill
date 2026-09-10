# ImageCaptureCore

## Context

Load this when a task names **ImageCaptureCore** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/imagecapturecore) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Browse for media devices and control them programmatically from your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ImageCaptureCore`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.6 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [ICDeviceBrowser](https://developer.apple.com/documentation/imagecapturecore/icdevicebrowser)
- [Photos Library Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.personal-information.photos-library)
- [NSCameraUsageDescription](https://developer.apple.com/documentation/bundleresources/information-property-list/nscamerausagedescription)

### Cameras

- [ICCameraDevice](https://developer.apple.com/documentation/imagecapturecore/iccameradevice)
- [ICCameraDeviceDelegate](https://developer.apple.com/documentation/imagecapturecore/iccameradevicedelegate)
- [ICCameraItem](https://developer.apple.com/documentation/imagecapturecore/iccameraitem)
- [ICCameraFile](https://developer.apple.com/documentation/imagecapturecore/iccamerafile)
- [ICCameraFolder](https://developer.apple.com/documentation/imagecapturecore/iccamerafolder)

### Scanners

- [ICScannerDevice](https://developer.apple.com/documentation/imagecapturecore/icscannerdevice)
- [ICScannerDeviceDelegate](https://developer.apple.com/documentation/imagecapturecore/icscannerdevicedelegate)
- [Scanner Configuration](https://developer.apple.com/documentation/imagecapturecore/scanner-configuration)

### Errors

- [ICReturn](https://developer.apple.com/documentation/imagecapturecore/icreturn)
- [ICLegacyReturn](https://developer.apple.com/documentation/imagecapturecore/iclegacyreturn)
- [ICReturnConnectionError](https://developer.apple.com/documentation/imagecapturecore/icreturnconnectionerror)
- [ICReturnDownloadError](https://developer.apple.com/documentation/imagecapturecore/icreturndownloaderror)
- [ICReturnMetadataError](https://developer.apple.com/documentation/imagecapturecore/icreturnmetadataerror)
- [ICReturnObjectError](https://developer.apple.com/documentation/imagecapturecore/icreturnobjecterror)
- [ICReturnPTPDeviceError](https://developer.apple.com/documentation/imagecapturecore/icreturnptpdeviceerror)
- [ICReturnThumbnailError](https://developer.apple.com/documentation/imagecapturecore/icreturnthumbnailerror)

### Legacy Symbols

- [ICRunLoopMode](https://developer.apple.com/documentation/imagecapturecore/icrunloopmode) — deprecated

### Articles

- [ImageCaptureCore Constants](https://developer.apple.com/documentation/imagecapturecore/imagecapturecore-constants)
- [ImageCaptureCore Data Types](https://developer.apple.com/documentation/imagecapturecore/imagecapturecore-data-types)
- [ImageCaptureCore Enumerations](https://developer.apple.com/documentation/imagecapturecore/imagecapturecore-enumerations)
- [ImageCaptureCore Macros](https://developer.apple.com/documentation/imagecapturecore/imagecapturecore-macros)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
