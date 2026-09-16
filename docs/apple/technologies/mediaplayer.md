# Media Player

## Context

Load this when a task names **Media Player** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/mediaplayer) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Find and play songs, audio podcasts, audio books, and more from within your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Media Player`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.12.1 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 5.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [NSAppleMusicUsageDescription](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapplemusicusagedescription)

### Built-in music playback

- [Playing audio using the built-in music player](https://developer.apple.com/documentation/mediaplayer/playing-audio-using-the-built-in-music-player)
- [MPMusicPlayerController](https://developer.apple.com/documentation/mediaplayer/mpmusicplayercontroller)
- [MPMediaPlayback](https://developer.apple.com/documentation/mediaplayer/mpmediaplayback)
- [MPSystemMusicPlayerController](https://developer.apple.com/documentation/mediaplayer/mpsystemmusicplayercontroller)

### Media library synchronization

- [MPMediaLibrary](https://developer.apple.com/documentation/mediaplayer/mpmedialibrary)

### Media item queries

- [Using filters to create specialized queries](https://developer.apple.com/documentation/mediaplayer/using-filters-to-create-specialized-queries)
- [MPMediaQuery](https://developer.apple.com/documentation/mediaplayer/mpmediaquery)
- [MPMediaQuerySection](https://developer.apple.com/documentation/mediaplayer/mpmediaquerysection)
- [MPMediaPropertyPredicate](https://developer.apple.com/documentation/mediaplayer/mpmediapropertypredicate)
- [MPMediaPredicate](https://developer.apple.com/documentation/mediaplayer/mpmediapredicate)

### Media player queues

- [MPMusicPlayerControllerQueue](https://developer.apple.com/documentation/mediaplayer/mpmusicplayercontrollerqueue)
- [MPMusicPlayerControllerMutableQueue](https://developer.apple.com/documentation/mediaplayer/mpmusicplayercontrollermutablequeue)
- [MPMusicPlayerApplicationController](https://developer.apple.com/documentation/mediaplayer/mpmusicplayerapplicationcontroller)
- [MPMusicPlayerMediaItemQueueDescriptor](https://developer.apple.com/documentation/mediaplayer/mpmusicplayermediaitemqueuedescriptor)
- [MPMusicPlayerStoreQueueDescriptor](https://developer.apple.com/documentation/mediaplayer/mpmusicplayerstorequeuedescriptor)
- [MPMusicPlayerPlayParametersQueueDescriptor](https://developer.apple.com/documentation/mediaplayer/mpmusicplayerplayparametersqueuedescriptor)
- [MPMusicPlayerQueueDescriptor](https://developer.apple.com/documentation/mediaplayer/mpmusicplayerqueuedescriptor)

### Media items and playlists

- [Providing animated artwork for media items](https://developer.apple.com/documentation/mediaplayer/providing-animated-artwork-for-media-items)
- [MPMediaItem](https://developer.apple.com/documentation/mediaplayer/mpmediaitem)
- [MPMediaItemArtwork](https://developer.apple.com/documentation/mediaplayer/mpmediaitemartwork)
- [MPMediaItemAnimatedArtwork](https://developer.apple.com/documentation/mediaplayer/mpmediaitemanimatedartwork)
- [MPMediaItemCollection](https://developer.apple.com/documentation/mediaplayer/mpmediaitemcollection)
- [MPMediaPlaylist](https://developer.apple.com/documentation/mediaplayer/mpmediaplaylist)
- [MPMediaPlaylistCreationMetadata](https://developer.apple.com/documentation/mediaplayer/mpmediaplaylistcreationmetadata)
- [MPMediaEntity](https://developer.apple.com/documentation/mediaplayer/mpmediaentity)

### Media player user interface

- [Displaying a media picker from your app](https://developer.apple.com/documentation/mediaplayer/displaying-a-media-picker-from-your-app)
- [MPMediaPickerController](https://developer.apple.com/documentation/mediaplayer/mpmediapickercontroller)
- [MPVolumeView](https://developer.apple.com/documentation/mediaplayer/mpvolumeview)

### Now Playing information

- [Becoming a now playable app](https://developer.apple.com/documentation/mediaplayer/becoming-a-now-playable-app)
- [MPNowPlayingSession](https://developer.apple.com/documentation/mediaplayer/mpnowplayingsession)
- [MPNowPlayingInfoCenter](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter)
- [MPNowPlayingInfoLanguageOption](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfolanguageoption)
- [MPNowPlayingInfoLanguageOptionGroup](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfolanguageoptiongroup)
- [Language option characteristic constants](https://developer.apple.com/documentation/mediaplayer/language-option-characteristic-constants)

### External player and system event handling

- [Handling external player events notifications](https://developer.apple.com/documentation/mediaplayer/handling-external-player-events-notifications)
- [Remote command center events](https://developer.apple.com/documentation/mediaplayer/remote-command-center-events)
- [Track navigation events](https://developer.apple.com/documentation/mediaplayer/track-navigation-events)
- [Media playback mode events](https://developer.apple.com/documentation/mediaplayer/media-playback-mode-events)
- [Feedback and rating events](https://developer.apple.com/documentation/mediaplayer/feedback-and-rating-events)

### External media player items

- [MPContentItem](https://developer.apple.com/documentation/mediaplayer/mpcontentitem)

### Media player errors

- [MPError](https://developer.apple.com/documentation/mediaplayer/mperror)

### Deprecated

- [Deprecated types](https://developer.apple.com/documentation/mediaplayer/deprecated-types)

### Classes

- [MPAppEntityIdentifier](https://developer.apple.com/documentation/mediaplayer/mpappentityidentifier)

### Variables

- [MPNowPlayingInfoPropertyAppEntityIdentifiers](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfopropertyappentityidentifiers)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
