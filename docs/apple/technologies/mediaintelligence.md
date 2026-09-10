# Media Intelligence

## Context

Load this when a task names **Media Intelligence** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediaintelligence) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Analyze video content and group faces in images using on-device machine learning.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Intelligence`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |
| macOS | 27.0 | — | No |
| tvOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Image analysis

- [Detecting and grouping faces in images](https://developer.apple.com/documentation/mediaintelligence/detecting-and-grouping-faces-in-images)
- [FaceGroupAnalyzer](https://developer.apple.com/documentation/mediaintelligence/facegroupanalyzer)
- [MediaIntelligenceImageAsset](https://developer.apple.com/documentation/mediaintelligence/mediaintelligenceimageasset)

### Video analysis

- [Finding the best moments in a video](https://developer.apple.com/documentation/mediaintelligence/finding-the-best-moments-in-a-video)
- [VideoAnalyzer](https://developer.apple.com/documentation/mediaintelligence/videoanalyzer)
- [MediaIntelligenceVideoAsset](https://developer.apple.com/documentation/mediaintelligence/mediaintelligencevideoasset)
- [HighlightAnalysisRequest](https://developer.apple.com/documentation/mediaintelligence/highlightanalysisrequest)
- [KeyFrameAnalysisRequest](https://developer.apple.com/documentation/mediaintelligence/keyframeanalysisrequest)

### Errors

- [MediaIntelligenceError](https://developer.apple.com/documentation/mediaintelligence/mediaintelligenceerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
