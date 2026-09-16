# HTTP Live Streaming

## Context

Load this when a task names **HTTP Live Streaming** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/http-live-streaming) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Send audio and video to iOS, tvOS, and macOS devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Deploying a Basic HTTP Live Streaming (HLS) Stream](https://developer.apple.com/documentation/http-live-streaming/deploying-a-basic-http-live-streaming-hls-stream)
- [Preparing Audio for HTTP Live Streaming](https://developer.apple.com/documentation/http-live-streaming/preparing-audio-for-http-live-streaming)

### Stream creation

- [Example playlists for HTTP Live Streaming](https://developer.apple.com/documentation/http-live-streaming/example-playlists-for-http-live-streaming)
- [About the EXT-X-VERSION tag](https://developer.apple.com/documentation/http-live-streaming/about-the-ext-x-version-tag)

### Tool usage and validation

- [Using Apple’s HTTP Live Streaming (HLS) Tools](https://developer.apple.com/documentation/http-live-streaming/using-apple-s-http-live-streaming-hls-tools)

### Specifications and other documents

- [HTTP Live Streaming (HLS) authoring specification for Apple devices](https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices)
- [Using content protection systems with HLS](https://developer.apple.com/documentation/http-live-streaming/using-content-protection-systems-with-hls)
- [About the Common Media Application Format with HTTP Live Streaming (HLS)](https://developer.apple.com/documentation/http-live-streaming/about-the-common-media-application-format-with-http-live-streaming-hls)
- [Enabling Low-Latency HTTP Live Streaming (HLS)](https://developer.apple.com/documentation/http-live-streaming/enabling-low-latency-http-live-streaming-hls)
- [Links to additional specifications and videos](https://developer.apple.com/documentation/http-live-streaming/links-to-additional-specifications-and-videos)
- [Videos about HLS](https://developer.apple.com/documentation/http-live-streaming/videos-about-hls)
- [Providing metadata for xHE-AAC video soundtracks](https://developer.apple.com/documentation/http-live-streaming/providing-metadata-for-xhe-aac-video-soundtracks)
- [Adjusting anchor loudness](https://developer.apple.com/documentation/http-live-streaming/adjusting-anchor-loudness)
- [Providing JavaScript Object Notation (JSON) chapters](https://developer.apple.com/documentation/http-live-streaming/providing-javascript-object-notation-json-chapters)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
