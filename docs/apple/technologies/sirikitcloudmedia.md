# SiriKit Cloud Media

## Context

Load this when a task names **SiriKit Cloud Media** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/sirikitcloudmedia) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Stream music directly to HomePod speakers from your media service.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SiriKit Cloud Media`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| SiriKit Cloud Media | 1.0.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Device Configuration

- [Configure Your Service Endpoints](https://developer.apple.com/documentation/sirikitcloudmedia/configuration-resource)
- [ExtensionConfigTag](https://developer.apple.com/documentation/sirikitcloudmedia/extensionconfigtag)
- [ExtensionConfig](https://developer.apple.com/documentation/sirikitcloudmedia/extensionconfig)
- [PlayMediaControlActivity](https://developer.apple.com/documentation/sirikitcloudmedia/playmediacontrolactivity)

### Media Play Queues

- [Process a Play Media Intent](https://developer.apple.com/documentation/sirikitcloudmedia/playmedia-1g2o9)
- [Get a Media Queue](https://developer.apple.com/documentation/sirikitcloudmedia/playmedia-1onzj)

### Content Protection

- [Retrieve an Asset’s Content Protection Key](https://developer.apple.com/documentation/sirikitcloudmedia/contentprotectionkey)
- [ContentProtectionKeyRequest](https://developer.apple.com/documentation/sirikitcloudmedia/contentprotectionkeyrequest)
- [ContentProtectionKeyResponse](https://developer.apple.com/documentation/sirikitcloudmedia/contentprotectionkeyresponse)
- [ContentProtectionKeySystem](https://developer.apple.com/documentation/sirikitcloudmedia/contentprotectionkeysystem)

### Playback Events

- [QueueActivityReportEvent](https://developer.apple.com/documentation/sirikitcloudmedia/queueactivityreportevent)
- [Report Playback Progress and Activity](https://developer.apple.com/documentation/sirikitcloudmedia/updateactivity)
- [UpdateActivityRequest](https://developer.apple.com/documentation/sirikitcloudmedia/updateactivityrequest)
- [UpdateActivityResponse](https://developer.apple.com/documentation/sirikitcloudmedia/updateactivityresponse)
- [Process an Update Media Affinity Intent](https://developer.apple.com/documentation/sirikitcloudmedia/updatemediaaffinity)

### Playback Failure

- [Recover from Content Playback Failure](https://developer.apple.com/documentation/sirikitcloudmedia/contentplaybackfailure)
- [ContentFailure](https://developer.apple.com/documentation/sirikitcloudmedia/contentfailure)
- [ContentPlaybackFailureRequest](https://developer.apple.com/documentation/sirikitcloudmedia/contentplaybackfailurerequest)
- [ContentPlaybackFailureResponse](https://developer.apple.com/documentation/sirikitcloudmedia/contentplaybackfailureresponse)

### Library and Playlists

- [Process an Add Media Intent](https://developer.apple.com/documentation/sirikitcloudmedia/addmedia)

### Media Items

- [MediaItem](https://developer.apple.com/documentation/sirikitcloudmedia/mediaitem)
- [MediaReference](https://developer.apple.com/documentation/sirikitcloudmedia/mediareference)
- [MediaSearch](https://developer.apple.com/documentation/sirikitcloudmedia/mediasearch)
- [MediaItemType](https://developer.apple.com/documentation/sirikitcloudmedia/mediaitemtype)

### Requests

- [Invocation](https://developer.apple.com/documentation/sirikitcloudmedia/invocation)
- [Session](https://developer.apple.com/documentation/sirikitcloudmedia/session)
- [Constraints](https://developer.apple.com/documentation/sirikitcloudmedia/constraints)
- [PlayerContext](https://developer.apple.com/documentation/sirikitcloudmedia/playercontext)
- [InvocationResponse](https://developer.apple.com/documentation/sirikitcloudmedia/invocationresponse)

### Intents

- [Intent](https://developer.apple.com/documentation/sirikitcloudmedia/intent)
- [IntentResponse](https://developer.apple.com/documentation/sirikitcloudmedia/intentresponse)
- [UserActivity](https://developer.apple.com/documentation/sirikitcloudmedia/useractivity)
- [IntentResolutionResult](https://developer.apple.com/documentation/sirikitcloudmedia/intentresolutionresult)
- [BooleanResolutionResult](https://developer.apple.com/documentation/sirikitcloudmedia/booleanresolutionresult)

### Exceptions

- [ProtocolExceptionInvocationResponse](https://developer.apple.com/documentation/sirikitcloudmedia/protocolexceptioninvocationresponse)
- [ProtocolException](https://developer.apple.com/documentation/sirikitcloudmedia/protocolexception)
- [ProtocolExceptionReason](https://developer.apple.com/documentation/sirikitcloudmedia/protocolexceptionreason)

### Errors

- [UnderlyingError](https://developer.apple.com/documentation/sirikitcloudmedia/underlyingerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
