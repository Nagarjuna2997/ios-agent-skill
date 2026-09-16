# Professional Video Applications

## Context

Load this when a task names **Professional Video Applications** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/professional_video_applications) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Exchange data with Final Cut Pro, and create effects plug-ins for Final Cut Pro and Motion.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Professional Video Applications`.

Documentation language identifiers: occ, swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Effects

- [FxPlug](https://developer.apple.com/documentation/professional-video-applications/fxplug)
- [Create an effect template for use in Final Cut Pro](https://developer.apple.com/documentation/professional-video-applications/create-an-effect-template-for-use-in-final-cut-pro)

### XML Data Exchange

- [Content and Metadata Exchanges with Final Cut Pro](https://developer.apple.com/documentation/professional-video-applications/content-and-metadata-exchanges-with-final-cut-pro)
- [Workflow Extensions](https://developer.apple.com/documentation/professional-video-applications/workflow-extensions)
- [FCPXML Reference](https://developer.apple.com/documentation/professional-video-applications/fcpxml-reference)

### Compressor Encoder Extensions

- [Encoder Extensions](https://developer.apple.com/documentation/professional-video-applications/encoder-extensions)

### Reference

- [Professional Video Applications Enumerations](https://developer.apple.com/documentation/professional-video-applications/professional-video-applications-enumerations)
- [Professional Video Applications Constants](https://developer.apple.com/documentation/professional-video-applications/professional-video-applications-constants)
- [Professional Video Applications Data Types](https://developer.apple.com/documentation/professional-video-applications/professional-video-applications-data-types)
- [Professional Video Applications Protocols](https://developer.apple.com/documentation/professional-video-applications/professional-video-applications-protocols)

### Variables

- [kFxPropertyKey_ChangesOutputSize](https://developer.apple.com/documentation/professional_video_applications/kfxpropertykey_changesoutputsize)
- [kFxPropertyKey_DesiredProcessingColorInfo](https://developer.apple.com/documentation/professional_video_applications/kfxpropertykey_desiredprocessingcolorinfo)
- [kFxPropertyKey_NeedsFullBuffer](https://developer.apple.com/documentation/professional_video_applications/kfxpropertykey_needsfullbuffer)
- [kFxPropertyKey_VariesWhenParamsAreStatic](https://developer.apple.com/documentation/professional_video_applications/kfxpropertykey_varieswhenparamsarestatic)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
