# Media Toolbox

## Context

Load this when a task names **Media Toolbox** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediatoolbox) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Enable support for media format readers; tap and process audio from an audio mix.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Toolbox`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 6.0 | — | No |
| iPadOS | 6.0 | — | No |
| Mac Catalyst | 6.0 | — | No |
| macOS | 10.9 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Professional video workflows

- [MTRegisterProfessionalVideoWorkflowFormatReaders()](https://developer.apple.com/documentation/mediatoolbox/mtregisterprofessionalvideoworkflowformatreaders())

### Audio Taps

- [MTAudioProcessingTapCreate(_:_:_:_:)](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapcreate(_:_:_:_:))
- [MTAudioProcessingTapGetSourceAudio(_:_:_:_:_:_:)](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapgetsourceaudio(_:_:_:_:_:_:))
- [MTAudioProcessingTapGetStorage(_:)](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapgetstorage(_:))
- [MTAudioProcessingTapGetTypeID()](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapgettypeid())
- [MTAudioProcessingTapFlags](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapflags)
- [MTAudioProcessingTap](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtap)

### Utility

- [MTCopyLocalizedNameForMediaType(_:)](https://developer.apple.com/documentation/mediatoolbox/mtcopylocalizednameformediatype(_:))
- [MTCopyLocalizedNameForMediaSubType(_:_:)](https://developer.apple.com/documentation/mediatoolbox/mtcopylocalizednameformediasubtype(_:_:))

### Enumerations

- [Anonymous Enumerations](https://developer.apple.com/documentation/mediatoolbox/anonymous-enums)

### Functions

- [MTAudioProcessingTapCreateWithPreferredFormat(_:_:_:_:_:)](https://developer.apple.com/documentation/mediatoolbox/mtaudioprocessingtapcreatewithpreferredformat(_:_:_:_:_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
