# Sensitive Content Analysis

## Context

Load this when a task names **Sensitive Content Analysis** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/sensitivecontentanalysis) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide a safer experience in your app by detecting and alerting people to sensitive content in images and videos before displaying them.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Sensitive Content Analysis`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |
| macOS | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Setup

- [Detecting sensitive content in media and providing intervention options](https://developer.apple.com/documentation/sensitivecontentanalysis/detecting-nudity-in-media-and-providing-intervention-options)

### Authorization

- [com.apple.developer.sensitivecontentanalysis.client](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.sensitivecontentanalysis.client)

### Image and video file analysis

- [SCSensitivityAnalyzer](https://developer.apple.com/documentation/sensitivecontentanalysis/scsensitivityanalyzer)
- [SCSensitivityAnalysisPolicy](https://developer.apple.com/documentation/sensitivecontentanalysis/scsensitivityanalysispolicy)

### Video stream analysis

- [SCVideoStreamAnalyzer](https://developer.apple.com/documentation/sensitivecontentanalysis/scvideostreamanalyzer)

### Analysis results

- [SCSensitivityAnalysis](https://developer.apple.com/documentation/sensitivecontentanalysis/scsensitivityanalysis)

### Testing

- [Testing your app’s response to sensitive media](https://developer.apple.com/documentation/sensitivecontentanalysis/testing-your-app-s-response-to-sensitive-media)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
