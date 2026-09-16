# AVFAudio

## Context

Load this when a task names **AVFAudio** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/avfaudio) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Play, record, and process audio; configure your app’s system audio behavior.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AVFAudio`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 14.5 | — | No |
| iPadOS | 14.5 | — | No |
| Mac Catalyst | 14.5 | — | No |
| macOS | 11.3 | — | No |
| tvOS | 14.5 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [AVFAudio updates](https://developer.apple.com/documentation/updates/avfaudio)

### System audio

- [Handling audio interruptions](https://developer.apple.com/documentation/avfaudio/handling-audio-interruptions)
- [Responding to audio route changes](https://developer.apple.com/documentation/avfaudio/responding-to-audio-route-changes)
- [Routing audio to specific devices in multidevice sessions](https://developer.apple.com/documentation/avfaudio/routing-audio-to-specific-devices-in-multidevice-sessions)
- [Adding synthesized speech to calls](https://developer.apple.com/documentation/avfaudio/adding-synthesized-speech-to-calls)
- [Capturing stereo audio from built-In microphones](https://developer.apple.com/documentation/avfaudio/capturing-stereo-audio-from-built-in-microphones)
- [AVAudioSession](https://developer.apple.com/documentation/avfaudio/avaudiosession)
- [AVAudioApplication](https://developer.apple.com/documentation/avfaudio/avaudioapplication)
- [AVAudioRoutingArbiter](https://developer.apple.com/documentation/avfaudio/avaudioroutingarbiter)

### Basic playback and recording

- [AVAudioPlayer](https://developer.apple.com/documentation/avfaudio/avaudioplayer)
- [AVAudioRecorder](https://developer.apple.com/documentation/avfaudio/avaudiorecorder)
- [AVMIDIPlayer](https://developer.apple.com/documentation/avfaudio/avmidiplayer)

### Advanced audio processing

- [Audio Engine](https://developer.apple.com/documentation/avfaudio/audio-engine)

### Speech synthesis

- [Speech synthesis](https://developer.apple.com/documentation/avfaudio/speech-synthesis)

### Macros

- [Macros](https://developer.apple.com/documentation/avfaudio/macros)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
