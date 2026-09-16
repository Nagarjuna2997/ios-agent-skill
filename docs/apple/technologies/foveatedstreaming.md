# Foveated Streaming

## Context

Load this when a task names **Foveated Streaming** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/foveatedstreaming) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Foveated Streaming enables visionOS apps to display high-resolution, low-latency immersive content from streaming endpoints.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Foveated Streaming`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| visionOS | 26.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Streaming a CloudXR application to Apple Vision Pro with foveation](https://developer.apple.com/documentation/foveatedstreaming/streaming-a-cloudxr-application-to-apple-vision-pro-with-foveation)
- [Establishing foveated streaming sessions with Apple Vision Pro](https://developer.apple.com/documentation/foveatedstreaming/establishing-foveated-streaming-sessions-with-apple-vision-pro)
- [Creating a foveated streaming client on visionOS](https://developer.apple.com/documentation/foveatedstreaming/creating-a-foveated-streaming-client-on-visionos)
- [Analyzing the performance of a foveated streaming session](https://developer.apple.com/documentation/foveatedstreaming/analyzing-the-performance-of-a-foveated-streaming-session)
- [FoveatedStreamingSession](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingsession)
- [FoveatedStreamingSpaceContent](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingspacecontent)

### Presentation and control

- [init(foveatedStreaming:)](https://developer.apple.com/documentation/swiftui/immersivespace/init(foveatedstreaming:))
- [init(foveatedStreaming:content:)](https://developer.apple.com/documentation/swiftui/immersivespace/init(foveatedstreaming:content:))
- [foveatedStreamingPauseSheet(session:)](https://developer.apple.com/documentation/swiftui/view/foveatedstreamingpausesheet(session:))

### Streaming provider extensions

- [FoveatedStreamingProviderContext](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingprovidercontext)
- [FoveatedStreamingProviderEndpoint](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingproviderendpoint)

### Classes

- [FoveatedStreamingProviderMessageChannel](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingprovidermessagechannel)

### Protocols

- [FoveatedStreamingExtension](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingextension)

### Structures

- [FoveatedStreamingProviderFocusRegion](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingproviderfocusregion)

### Enumerations

- [FoveatedStreamingProviderStatus](https://developer.apple.com/documentation/foveatedstreaming/foveatedstreamingproviderstatus)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
