# Music Understanding

## Context

Load this when a task names **Music Understanding** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/musicunderstanding) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Analyze audio content and extract music information.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Music Understanding`.

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
| watchOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating visuals with Music Understanding analysis results](https://developer.apple.com/documentation/musicunderstanding/create-visuals-using-musicunderstanding-analysis-results)

### Audio analysis

- [MusicUnderstandingSession](https://developer.apple.com/documentation/musicunderstanding/musicunderstandingsession)

### Content results

- [MusicUnderstandingSession.SessionResult](https://developer.apple.com/documentation/musicunderstanding/musicunderstandingsession/sessionresult)
- [RhythmResult](https://developer.apple.com/documentation/musicunderstanding/rhythmresult)
- [KeyResult](https://developer.apple.com/documentation/musicunderstanding/keyresult)
- [LoudnessResult](https://developer.apple.com/documentation/musicunderstanding/loudnessresult)
- [PaceResult](https://developer.apple.com/documentation/musicunderstanding/paceresult)
- [StructureResult](https://developer.apple.com/documentation/musicunderstanding/structureresult)
- [InstrumentActivityResult](https://developer.apple.com/documentation/musicunderstanding/instrumentactivityresult)

### Support types

- [MusicUnderstandingSession.TimedValue](https://developer.apple.com/documentation/musicunderstanding/musicunderstandingsession/timedvalue)
- [MusicUnderstandingSession.RangedValue](https://developer.apple.com/documentation/musicunderstanding/musicunderstandingsession/rangedvalue)
- [AnalysisType](https://developer.apple.com/documentation/musicunderstanding/analysistype)

### Errors

- [MusicUnderstandingError](https://developer.apple.com/documentation/musicunderstanding/musicunderstandingerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
