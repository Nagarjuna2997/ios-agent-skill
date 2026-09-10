# Audio Toolbox

## Context

Load this when a task names **Audio Toolbox** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/audiotoolbox) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Record or play audio, convert formats, parse audio streams, and configure your audio session.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Audio Toolbox`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.0 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Porting your audio code to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-your-audio-code-to-apple-silicon)

### Audio Units

- [Generating spatial audio from a multichannel audio stream](https://developer.apple.com/documentation/audiotoolbox/generating-spatial-audio-from-a-multichannel-audio-stream)
- [Audio Unit v3 Plug-Ins](https://developer.apple.com/documentation/audiotoolbox/audio-unit-v3-plug-ins)
- [Audio Components](https://developer.apple.com/documentation/audiotoolbox/audio-components)
- [Audio Unit v2 (C) API](https://developer.apple.com/documentation/audiotoolbox/audio-unit-v2-c-api)
- [Audio Unit Properties](https://developer.apple.com/documentation/audiotoolbox/audio-unit-properties)
- [Audio Unit Voice I/O](https://developer.apple.com/documentation/audiotoolbox/audio-unit-voice-i-o)

### Playback and Recording

- [Audio Queue Services](https://developer.apple.com/documentation/audiotoolbox/audio-queue-services)
- [Audio Services](https://developer.apple.com/documentation/audiotoolbox/audio-services)
- [Music Player](https://developer.apple.com/documentation/audiotoolbox/music-player)
- [Anchoring sound to a window or volume](https://developer.apple.com/documentation/audiotoolbox/spatializing-sound-from-a-uiscene)

### Audio Files and Formats

- [Audio Format Services](https://developer.apple.com/documentation/audiotoolbox/audio-format-services)
- [Audio File Services](https://developer.apple.com/documentation/audiotoolbox/audio-file-services)
- [Extended Audio File Services](https://developer.apple.com/documentation/audiotoolbox/extended-audio-file-services)
- [Audio File Stream Services](https://developer.apple.com/documentation/audiotoolbox/audio-file-stream-services)
- [Audio File Components](https://developer.apple.com/documentation/audiotoolbox/audio-file-components)
- [Core Audio File Format](https://developer.apple.com/documentation/audiotoolbox/core-audio-file-format)

### Utilities

- [Analyzing audio performance with Instruments](https://developer.apple.com/documentation/audiotoolbox/analyzing-audio-performance-with-instruments)
- [Audio Converter Services](https://developer.apple.com/documentation/audiotoolbox/audio-converter-services)
- [Audio Session Support](https://developer.apple.com/documentation/audiotoolbox/audio-session-support)
- [Audio Toolbox Debugging](https://developer.apple.com/documentation/audiotoolbox/audio-toolbox-debugging)
- [Workgroup Management](https://developer.apple.com/documentation/audiotoolbox/workgroup-management)
- [Audio Codec](https://developer.apple.com/documentation/audiotoolbox/audio-codec)
- [Clock Utilities](https://developer.apple.com/documentation/audiotoolbox/clock-utilities)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/audiotoolbox/deprecated-symbols)

### Reference

- [AudioToolbox Structures](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-structures)
- [AudioToolbox Enumerations](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-enumerations)
- [AudioToolbox Constants](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-constants)
- [AudioToolbox Functions](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-functions)
- [AudioToolbox Data Types](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-data-types)

### Macros

- [Macros](https://developer.apple.com/documentation/audiotoolbox/audiotoolbox-macros)

### Protocols

- [SpatialAudioExperience](https://developer.apple.com/documentation/audiotoolbox/spatialaudioexperience)

### Structures

- [AutomaticSpatialAudio](https://developer.apple.com/documentation/audiotoolbox/automaticspatialaudio)
- [BypassedSpatialAudio](https://developer.apple.com/documentation/audiotoolbox/bypassedspatialaudio)
- [FixedSpatialAudio](https://developer.apple.com/documentation/audiotoolbox/fixedspatialaudio)
- [HeadTrackedSpatialAudio](https://developer.apple.com/documentation/audiotoolbox/headtrackedspatialaudio)

### Variables

- [kAUAudioMixParameter_RemixAmount](https://developer.apple.com/documentation/audiotoolbox/kauaudiomixparameter_remixamount)
- [kAUAudioMixParameter_Style](https://developer.apple.com/documentation/audiotoolbox/kauaudiomixparameter_style)
- [kAUAudioMixProperty_EnableSpatialization](https://developer.apple.com/documentation/audiotoolbox/kauaudiomixproperty_enablespatialization)
- [kAUAudioMixProperty_SpatialAudioMixMetadata](https://developer.apple.com/documentation/audiotoolbox/kauaudiomixproperty_spatialaudiomixmetadata)
- [kAudioCodecContentSource_AV_Spatial_Live](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_av_spatial_live)
- [kAudioCodecContentSource_AV_Spatial_Offline](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_av_spatial_offline)
- [kAudioCodecContentSource_AV_Traditional_Live](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_av_traditional_live)
- [kAudioCodecContentSource_AV_Traditional_Offline](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_av_traditional_offline)
- [kAudioCodecContentSource_AppleAV_Spatial_Live](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_appleav_spatial_live)
- [kAudioCodecContentSource_AppleAV_Spatial_Offline](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_appleav_spatial_offline)
- [kAudioCodecContentSource_AppleAV_Traditional_Live](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_appleav_traditional_live)
- [kAudioCodecContentSource_AppleAV_Traditional_Offline](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_appleav_traditional_offline)
- [kAudioCodecContentSource_AppleCapture_Spatial](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applecapture_spatial)
- [kAudioCodecContentSource_AppleCapture_Spatial_Enhanced](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applecapture_spatial_enhanced)
- [kAudioCodecContentSource_AppleCapture_Traditional](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applecapture_traditional)
- [kAudioCodecContentSource_AppleMusic_Spatial](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applemusic_spatial)
- [kAudioCodecContentSource_AppleMusic_Traditional](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applemusic_traditional)
- [kAudioCodecContentSource_ApplePassthrough](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_applepassthrough)
- [kAudioCodecContentSource_Capture_Spatial](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_capture_spatial)
- [kAudioCodecContentSource_Capture_Spatial_Enhanced](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_capture_spatial_enhanced)
- [kAudioCodecContentSource_Capture_Traditional](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_capture_traditional)
- [kAudioCodecContentSource_Music_Spatial](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_music_spatial)
- [kAudioCodecContentSource_Music_Traditional](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_music_traditional)
- [kAudioCodecContentSource_Passthrough](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_passthrough)
- [kAudioCodecContentSource_Reserved](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_reserved)
- [kAudioCodecContentSource_Unspecified](https://developer.apple.com/documentation/audiotoolbox/kaudiocodeccontentsource_unspecified)
- [kAudioCodecDynamicRangeControlConfiguration_Capture](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecdynamicrangecontrolconfiguration_capture)
- [kAudioCodecDynamicRangeControlConfiguration_Movie](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecdynamicrangecontrolconfiguration_movie)
- [kAudioCodecDynamicRangeControlConfiguration_Music](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecdynamicrangecontrolconfiguration_music)
- [kAudioCodecDynamicRangeControlConfiguration_None](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecdynamicrangecontrolconfiguration_none)
- [kAudioCodecDynamicRangeControlConfiguration_Speech](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecdynamicrangecontrolconfiguration_speech)
- [kAudioCodecPropertyASPFrequency](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecpropertyaspfrequency)
- [kAudioCodecPropertyContentSource](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecpropertycontentsource)
- [kAudioCodecPropertyDynamicRangeControlConfiguration](https://developer.apple.com/documentation/audiotoolbox/kaudiocodecpropertydynamicrangecontrolconfiguration)
- [kAudioConverterPropertyChannelMixMap](https://developer.apple.com/documentation/audiotoolbox/kaudioconverterpropertychannelmixmap)
- [kAudioConverterPropertyPerformDownmix](https://developer.apple.com/documentation/audiotoolbox/kaudioconverterpropertyperformdownmix)
- [kAudioUnitErr_MultipleVoiceProcessors](https://developer.apple.com/documentation/audiotoolbox/kaudiouniterr_multiplevoiceprocessors)
- [kAudioUnitSubType_AUAudioMix](https://developer.apple.com/documentation/audiotoolbox/kaudiounitsubtype_auaudiomix)
- [kReverb2Param_LegacyMode](https://developer.apple.com/documentation/audiotoolbox/kreverb2param_legacymode)

### Functions

- [AudioConverterFillComplexBufferRealtimeSafe(_:_:_:_:_:_:)](https://developer.apple.com/documentation/audiotoolbox/audioconverterfillcomplexbufferrealtimesafe(_:_:_:_:_:_:))
- [AudioConverterFillComplexBufferWithPacketDependencies(_:_:_:_:_:_:_:)](https://developer.apple.com/documentation/audiotoolbox/audioconverterfillcomplexbufferwithpacketdependencies(_:_:_:_:_:_:_:))
- [AudioFileWritePacketsWithDependencies(_:_:_:_:_:_:_:_:)](https://developer.apple.com/documentation/audiotoolbox/audiofilewritepacketswithdependencies(_:_:_:_:_:_:_:_:))
- [AudioServicesPlayAlertSound(_:spatialExperience:)](https://developer.apple.com/documentation/audiotoolbox/audioservicesplayalertsound(_:spatialexperience:))
- [AudioServicesPlaySystemSound(_:spatialExperience:)](https://developer.apple.com/documentation/audiotoolbox/audioservicesplaysystemsound(_:spatialexperience:))

### Type Aliases

- [AudioConverterComplexInputDataProcRealtimeSafe](https://developer.apple.com/documentation/audiotoolbox/audioconvertercomplexinputdataprocrealtimesafe)

### Enumerations

- [AUAudioMixRenderingStyle](https://developer.apple.com/documentation/audiotoolbox/auaudiomixrenderingstyle)
- [SpatialAudioExperiences](https://developer.apple.com/documentation/audiotoolbox/spatialaudioexperiences)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
