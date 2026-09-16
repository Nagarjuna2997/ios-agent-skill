# LockedCameraCapture

## Context

Load this when a task names **LockedCameraCapture** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/lockedcameracapture) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Capture content with your app’s camera experience when the device is locked.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `LockedCameraCapture`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.0 | — | No |
| iPadOS | 18.0 | — | No |
| Mac Catalyst | 18.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a camera experience for the Lock Screen](https://developer.apple.com/documentation/lockedcameracapture/creating-a-camera-experience-for-the-lock-screen)

### Capture and launch

- [LockedCameraCaptureUIScene](https://developer.apple.com/documentation/lockedcameracapture/lockedcameracaptureuiscene)
- [LockedCameraCaptureSession](https://developer.apple.com/documentation/lockedcameracapture/lockedcameracapturesession)

### App integration

- [LockedCameraCaptureManager](https://developer.apple.com/documentation/lockedcameracapture/lockedcameracapturemanager)
- [NSUserActivityTypeLockedCameraCapture](https://developer.apple.com/documentation/lockedcameracapture/nsuseractivitytypelockedcameracapture)

### Extension

- [LockedCameraCaptureExtension](https://developer.apple.com/documentation/lockedcameracapture/lockedcameracaptureextension)
- [LockedCameraCaptureExtensionScene](https://developer.apple.com/documentation/lockedcameracapture/lockedcameracaptureextensionscene)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
