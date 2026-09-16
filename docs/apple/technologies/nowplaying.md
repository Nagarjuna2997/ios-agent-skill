# Now Playing

## Context

Load this when a task names **Now Playing** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/nowplaying) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Make your app’s media playback controls available on the Lock Screen, Control Center, and connected accessories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Now Playing`.

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

### Local sessions

- [Publishing media sessions](https://developer.apple.com/documentation/nowplaying/publishing-media-sessions)
- [MediaSessionRepresentable](https://developer.apple.com/documentation/nowplaying/mediasessionrepresentable)
- [MediaSession](https://developer.apple.com/documentation/nowplaying/mediasession)
- [MediaSessionError](https://developer.apple.com/documentation/nowplaying/mediasessionerror)

### Remote sessions

- [Publishing remote media sessions](https://developer.apple.com/documentation/nowplaying/publishing-remote-media-sessions)
- [RemoteMediaSessionRepresentable](https://developer.apple.com/documentation/nowplaying/remotemediasessionrepresentable)
- [RemoteMediaSession](https://developer.apple.com/documentation/nowplaying/remotemediasession)
- [RemoteMediaSessionExtension](https://developer.apple.com/documentation/nowplaying/remotemediasessionextension)
- [RemoteMediaSessionExtensionConfiguration](https://developer.apple.com/documentation/nowplaying/remotemediasessionextensionconfiguration)
- [RemoteMediaSessionAttributes](https://developer.apple.com/documentation/nowplaying/remotemediasessionattributes)
- [RemoteMediaSessionError](https://developer.apple.com/documentation/nowplaying/remotemediasessionerror)
- [MediaDevice](https://developer.apple.com/documentation/nowplaying/mediadevice)

### Playback

- [MediaPlaybackSnapshot](https://developer.apple.com/documentation/nowplaying/mediaplaybacksnapshot)
- [Content types and metadata](https://developer.apple.com/documentation/nowplaying/content-types-and-metadata)
- [Playback commands](https://developer.apple.com/documentation/nowplaying/playback-commands)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
