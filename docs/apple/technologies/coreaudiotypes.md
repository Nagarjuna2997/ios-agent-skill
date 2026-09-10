# Core Audio Types

## Context

Load this when a task names **Core Audio Types** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/coreaudiotypes) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Use specialized data types to interact with audio streams, complex buffers, and audiovisual timestamps.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Audio Types`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.0 | — | No |
| iPadOS | 13.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |
| tvOS | 13.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 6.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Buffers

- [AudioBuffer](https://developer.apple.com/documentation/coreaudiotypes/audiobuffer)
- [AudioBufferList](https://developer.apple.com/documentation/coreaudiotypes/audiobufferlist)

### Channels

- [AudioChannelDescription](https://developer.apple.com/documentation/coreaudiotypes/audiochanneldescription)
- [AudioChannelLayout](https://developer.apple.com/documentation/coreaudiotypes/audiochannellayout)

### Codecs

- [AudioClassDescription](https://developer.apple.com/documentation/coreaudiotypes/audioclassdescription)

### Audio Time

- [AudioTimeStamp](https://developer.apple.com/documentation/coreaudiotypes/audiotimestamp)
- [AudioTimeStampFlags](https://developer.apple.com/documentation/coreaudiotypes/audiotimestampflags)

### SMPTE Time

- [SMPTETime](https://developer.apple.com/documentation/coreaudiotypes/smptetime)
- [SMPTETimeFlags](https://developer.apple.com/documentation/coreaudiotypes/smptetimeflags)
- [SMPTETimeType](https://developer.apple.com/documentation/coreaudiotypes/smptetimetype)

### Values

- [AudioValueRange](https://developer.apple.com/documentation/coreaudiotypes/audiovaluerange)
- [AudioValueTranslation](https://developer.apple.com/documentation/coreaudiotypes/audiovaluetranslation)

### Streams

- [AudioStreamBasicDescription](https://developer.apple.com/documentation/coreaudiotypes/audiostreambasicdescription)
- [AudioStreamPacketDescription](https://developer.apple.com/documentation/coreaudiotypes/audiostreampacketdescription)
- [AudioFormatFlags](https://developer.apple.com/documentation/coreaudiotypes/audioformatflags)
- [Audio Format Flags](https://developer.apple.com/documentation/coreaudiotypes/audio-format-flags)
- [AudioFormatID](https://developer.apple.com/documentation/coreaudiotypes/audioformatid)
- [Audio Format Identifiers](https://developer.apple.com/documentation/coreaudiotypes/audio-format-identifiers)
- [kAudioStreamAnyRate](https://developer.apple.com/documentation/coreaudiotypes/kaudiostreamanyrate)
- [MPEG4ObjectID](https://developer.apple.com/documentation/coreaudiotypes/mpeg4objectid) — deprecated

### Common Types

- [AVAudioInteger](https://developer.apple.com/documentation/coreaudiotypes/avaudiointeger)
- [AVAudioUInteger](https://developer.apple.com/documentation/coreaudiotypes/avaudiouinteger)
- [AudioSessionID](https://developer.apple.com/documentation/coreaudiotypes/audiosessionid)
- [kAudioUnitSampleFractionBits](https://developer.apple.com/documentation/coreaudiotypes/kaudiounitsamplefractionbits)
- [COREAUDIOTYPES_VERSION](https://developer.apple.com/documentation/coreaudiotypes/coreaudiotypes_version)
- [AudioSampleType](https://developer.apple.com/documentation/coreaudiotypes/audiosampletype) — deprecated
- [AudioUnitSampleType](https://developer.apple.com/documentation/coreaudiotypes/audiounitsampletype) — deprecated
- [AudioFormatListItem](https://developer.apple.com/documentation/coreaudiotypes/audioformatlistitem)

### Errors

- [kAudio_ParamError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_paramerror)
- [kAudio_MemFullError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_memfullerror)
- [kAudio_FileNotFoundError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_filenotfounderror)
- [kAudio_UnimplementedError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_unimplementederror)

### Reference

- [CoreAudioTypes Enumerations](https://developer.apple.com/documentation/coreaudiotypes/coreaudiotypes-enumerations)

### Structures

- [AudioStreamPacketDependencyDescription](https://developer.apple.com/documentation/coreaudiotypes/audiostreampacketdependencydescription)

### Variables

- [kAudioChannelLayoutTag_Ogg_3_0](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_3_0)
- [kAudioChannelLayoutTag_Ogg_4_0](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_4_0)
- [kAudioChannelLayoutTag_Ogg_5_0](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_5_0)
- [kAudioChannelLayoutTag_Ogg_5_1](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_5_1)
- [kAudioChannelLayoutTag_Ogg_6_1](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_6_1)
- [kAudioChannelLayoutTag_Ogg_7_1](https://developer.apple.com/documentation/coreaudiotypes/kaudiochannellayouttag_ogg_7_1)
- [kAudioFormatAPAC](https://developer.apple.com/documentation/coreaudiotypes/kaudioformatapac)
- [kAudio_BadFilePathError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_badfilepatherror)
- [kAudio_FilePermissionError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_filepermissionerror)
- [kAudio_NoError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_noerror)
- [kAudio_TooManyFilesOpenError](https://developer.apple.com/documentation/coreaudiotypes/kaudio_toomanyfilesopenerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
