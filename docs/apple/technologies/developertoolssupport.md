# Developer Tools Support

## Context

Load this when a task names **Developer Tools Support** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/developertoolssupport) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Expose custom views and modifiers in the Xcode library.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DeveloperToolsSupport`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.0 | — | No |
| iPadOS | 14.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |
| tvOS | 14.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 7.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Library customization

- [LibraryContentProvider](https://developer.apple.com/documentation/developertoolssupport/librarycontentprovider)
- [LibraryItem](https://developer.apple.com/documentation/developertoolssupport/libraryitem)

### Preview definition

- [Preview](https://developer.apple.com/documentation/developertoolssupport/preview)
- [PreviewLayout](https://developer.apple.com/documentation/developertoolssupport/previewlayout)
- [PreviewTrait](https://developer.apple.com/documentation/developertoolssupport/previewtrait)
- [PreviewRegistry](https://developer.apple.com/documentation/developertoolssupport/previewregistry)

### Preview camera management

- [PreviewCamera](https://developer.apple.com/documentation/developertoolssupport/previewcamera)
- [PreviewCameraBuilder](https://developer.apple.com/documentation/developertoolssupport/previewcamerabuilder)

### Resource definition

- [ColorResource](https://developer.apple.com/documentation/developertoolssupport/colorresource)
- [ImageResource](https://developer.apple.com/documentation/developertoolssupport/imageresource)

### Structures

- [PreviewArguments](https://developer.apple.com/documentation/developertoolssupport/previewarguments)
- [PreviewBodyBuilder](https://developer.apple.com/documentation/developertoolssupport/previewbodybuilder)
- [PreviewMacroBodyBuilder](https://developer.apple.com/documentation/developertoolssupport/previewmacrobodybuilder)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
