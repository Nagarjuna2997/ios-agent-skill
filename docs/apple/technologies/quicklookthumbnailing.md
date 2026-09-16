# Quick Look Thumbnailing

## Context

Load this when a task names **Quick Look Thumbnailing** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/quicklookthumbnailing) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Generate thumbnails for common file types and add a Thumbnail Extension to your app to enable others to create thumbnails of your custom files.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Quick Look Thumbnailing`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Thumbnail Generation

- [Creating Quick Look Thumbnails to Preview Files in Your App](https://developer.apple.com/documentation/quicklookthumbnailing/creating-quick-look-thumbnails-to-preview-files-in-your-app)
- [QLThumbnailGenerator](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailgenerator)
- [QLThumbnailRepresentation](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailrepresentation)

### Thumbnails for Custom File Types

- [Providing Thumbnails of Your Custom File Types](https://developer.apple.com/documentation/quicklookthumbnailing/providing-thumbnails-of-your-custom-file-types)
- [QLThumbnailProvider](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailprovider)
- [QLFileThumbnailRequest](https://developer.apple.com/documentation/quicklookthumbnailing/qlfilethumbnailrequest)
- [QLThumbnailReply](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailreply)

### Error Information

- [QLThumbnailErrorDomain](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailerrordomain)
- [QLThumbnailError](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailerror-swift.struct)
- [QLThumbnailError.Code](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailerror-swift.struct/code)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
