# iTunes Library

## Context

Load this when a task names **iTunes Library** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/ituneslibrary) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Retrieve the properties of the media in the user’s iTunes library.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `iTunes Library`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.13 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [ITLibrary](https://developer.apple.com/documentation/ituneslibrary/itlibrary)

### Albums and Playlists

- [ITLibAlbum](https://developer.apple.com/documentation/ituneslibrary/itlibalbum)
- [ITLibPlaylist](https://developer.apple.com/documentation/ituneslibrary/itlibplaylist)

### Media Items

- [ITLibMediaItem](https://developer.apple.com/documentation/ituneslibrary/itlibmediaitem)
- [ITLibMediaEntity](https://developer.apple.com/documentation/ituneslibrary/itlibmediaentity)
- [ITLibArtist](https://developer.apple.com/documentation/ituneslibrary/itlibartist)
- [ITLibArtwork](https://developer.apple.com/documentation/ituneslibrary/itlibartwork)
- [ITLibMediaItemVideoInfo](https://developer.apple.com/documentation/ituneslibrary/itlibmediaitemvideoinfo)

### Structures

- [DidChangeLibraryMessage](https://developer.apple.com/documentation/ituneslibrary/didchangelibrarymessage)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
