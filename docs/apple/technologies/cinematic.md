# Cinematic

## Context

Load this when a task names **Cinematic** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/cinematic) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Integrate playback and editing of assets captured in Cinematic mode into your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Cinematic`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| macOS | 14.0 | — | No |
| tvOS | 17.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Playing and editing Cinematic mode video](https://developer.apple.com/documentation/cinematic/playing-and-editing-cinematic-mode-video)
- [CNScript](https://developer.apple.com/documentation/cinematic/cnscript-1ispe)

### Reading and rendering

- [CNAssetInfo](https://developer.apple.com/documentation/cinematic/cnassetinfo-2ata2)
- [CNCompositionInfo](https://developer.apple.com/documentation/cinematic/cncompositioninfo-7eunn)
- [CNRenderingSession](https://developer.apple.com/documentation/cinematic/cnrenderingsession-1hzh8)

### Editing

- [Editing Spatial Audio with an audio mix](https://developer.apple.com/documentation/cinematic/editing-spatial-audio-with-an-audio-mix)
- [CNDetection](https://developer.apple.com/documentation/cinematic/cndetection-swift.struct)
- [CNDecision](https://developer.apple.com/documentation/cinematic/cndecision-swift.struct)
- [CNDetectionTrack](https://developer.apple.com/documentation/cinematic/cndetectiontrack-2bxtd)
- [CNFixedDetectionTrack](https://developer.apple.com/documentation/cinematic/cnfixeddetectiontrack-93rrw)
- [CNCustomDetectionTrack](https://developer.apple.com/documentation/cinematic/cncustomdetectiontrack-9a2zo)
- [CNDetectionType](https://developer.apple.com/documentation/cinematic/cndetectiontype)

### Custom Object Tracking

- [CNBoundsPrediction](https://developer.apple.com/documentation/cinematic/cnboundsprediction-swift.struct)
- [CNObjectTracker](https://developer.apple.com/documentation/cinematic/cnobjecttracker-1n598)

### Structures

- [CNCinematicError](https://developer.apple.com/documentation/cinematic/cncinematicerror)

### Reference

- [Cinematic Enumerations](https://developer.apple.com/documentation/cinematic/cinematic-enumerations)
- [Cinematic Constants](https://developer.apple.com/documentation/cinematic/cinematic-constants)
- [Cinematic Data Types](https://developer.apple.com/documentation/cinematic/cinematic-data-types)

### Classes

- [CNAssetPreprocessConfiguration](https://developer.apple.com/documentation/cinematic/cnassetpreprocessconfiguration-5u7dk)
- [CNAssetSpatialAudioInfo](https://developer.apple.com/documentation/cinematic/cnassetspatialaudioinfo-7hdev)
- [CNImageRenderingSession](https://developer.apple.com/documentation/cinematic/cnimagerenderingsession)
- [CNImageRenderingSessionConfiguration](https://developer.apple.com/documentation/cinematic/cnimagerenderingsessionconfiguration)

### Enumerations

- [CNCinematicCapability](https://developer.apple.com/documentation/cinematic/cncinematiccapability)
- [CNCinematicResourceVersion](https://developer.apple.com/documentation/cinematic/cncinematicresourceversion)
- [CNResourceStatus](https://developer.apple.com/documentation/cinematic/cnresourcestatus)
- [CNSpatialAudioContentType](https://developer.apple.com/documentation/cinematic/cnspatialaudiocontenttype)
- [CNSpatialAudioRenderingStyle](https://developer.apple.com/documentation/cinematic/cnspatialaudiorenderingstyle)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
