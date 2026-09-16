# ScreenCaptureKit

## Context

Load this when a task names **ScreenCaptureKit** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/screencapturekit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Stream screen content and audio to your app with fine-grained control over what you capture.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ScreenCaptureKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 18.2 | — | No |
| macOS | 12.3 | — | No |
| tvOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [ScreenCaptureKit updates](https://developer.apple.com/documentation/updates/screencapturekit)
- [Persistent Content Capture](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.persistent-content-capture)
- [Capturing screen content on iOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-on-ios)
- [Capturing screen content in macOS](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-in-macos)

### Shareable content

- [SCShareableContent](https://developer.apple.com/documentation/screencapturekit/scshareablecontent)
- [SCShareableContentInfo](https://developer.apple.com/documentation/screencapturekit/scshareablecontentinfo)
- [SCShareableContentStyle](https://developer.apple.com/documentation/screencapturekit/scshareablecontentstyle)
- [SCDisplay](https://developer.apple.com/documentation/screencapturekit/scdisplay)
- [SCRunningApplication](https://developer.apple.com/documentation/screencapturekit/scrunningapplication)
- [SCWindow](https://developer.apple.com/documentation/screencapturekit/scwindow)

### Content capture

- [SCStream](https://developer.apple.com/documentation/screencapturekit/scstream)
- [SCStreamConfiguration](https://developer.apple.com/documentation/screencapturekit/scstreamconfiguration)
- [SCContentFilter](https://developer.apple.com/documentation/screencapturekit/sccontentfilter)
- [SCStreamDelegate](https://developer.apple.com/documentation/screencapturekit/scstreamdelegate)
- [SCScreenshotManager](https://developer.apple.com/documentation/screencapturekit/scscreenshotmanager)
- [SCScreenshotConfiguration](https://developer.apple.com/documentation/screencapturekit/scscreenshotconfiguration)
- [SCScreenshotOutput](https://developer.apple.com/documentation/screencapturekit/scscreenshotoutput)
- [SCVideoEffectOutput](https://developer.apple.com/documentation/screencapturekit/scvideoeffectoutput)

### Output processing

- [SCStreamOutput](https://developer.apple.com/documentation/screencapturekit/scstreamoutput)
- [SCStreamOutputType](https://developer.apple.com/documentation/screencapturekit/scstreamoutputtype)
- [SCStreamFrameInfo](https://developer.apple.com/documentation/screencapturekit/scstreamframeinfo)
- [SCFrameStatus](https://developer.apple.com/documentation/screencapturekit/scframestatus)
- [SCClipBufferingOutput](https://developer.apple.com/documentation/screencapturekit/scclipbufferingoutput)

### System content-sharing picker

- [SCContentSharingPicker](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpicker)
- [SCContentSharingPickerConfiguration](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpickerconfiguration-swift.struct)
- [SCContentSharingPickerMode](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpickermode)
- [SCContentSharingPickerObserver](https://developer.apple.com/documentation/screencapturekit/sccontentsharingpickerobserver)

### Stream errors (Swift)

- [SCStreamErrorDomain](https://developer.apple.com/documentation/screencapturekit/scstreamerrordomain)
- [SCStreamError](https://developer.apple.com/documentation/screencapturekit/scstreamerror)

### Classes

- [SCRecordingEditor](https://developer.apple.com/documentation/screencapturekit/screcordingeditor)

### Protocols

- [SCClipBufferingOutputDelegate](https://developer.apple.com/documentation/screencapturekit/scclipbufferingoutputdelegate)
- [SCRecordingEditorDelegate](https://developer.apple.com/documentation/screencapturekit/screcordingeditordelegate)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
