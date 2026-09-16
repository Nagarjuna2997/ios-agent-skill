# AVSystemRouting

## Context

Load this when a task names **AVSystemRouting** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/avsystemrouting) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Send media from your app to a TV, speaker, or other device through a media device extension.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AVSystemRouting`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Routing media to third-party devices](https://developer.apple.com/documentation/avsystemrouting/routing-media-to-third-party-devices)
- [Routing and streaming media to remote devices](https://developer.apple.com/documentation/avsystemrouting/routing-and-streaming-media-to-remote-devices)
- [AVSystemRouteController](https://developer.apple.com/documentation/avsystemrouting/avsystemroutecontroller-18ns8)
- [AVSystemRouteControllerObserver](https://developer.apple.com/documentation/avsystemrouting/avsystemroutecontrollerobserver-5syvg)

### Routing events

- [AVSystemRouteEvent](https://developer.apple.com/documentation/avsystemrouting/avsystemrouteevent-2elr5)
- [AVSystemRouteEvent.Reason](https://developer.apple.com/documentation/avsystemrouting/avsystemrouteevent-2elr5/reason-swift.enum)

### Routes and sessions

- [AVSystemRoute](https://developer.apple.com/documentation/avsystemrouting/avsystemroute-5s2um)
- [AVSystemRouteSession](https://developer.apple.com/documentation/avsystemrouting/avsystemroutesession-gp78)
- [AVSystemRoute.LaunchMode](https://developer.apple.com/documentation/avsystemrouting/avsystemroute-5s2um/launchmode)

### Playback and communication

- [AVSystemRouteMediaSession](https://developer.apple.com/documentation/avsystemrouting/avsystemroutemediasession-98ioq)
- [AVSystemRoute.DataChannel](https://developer.apple.com/documentation/avsystemrouting/avsystemroute-5s2um/datachannel)
- [AVSystemRouteDataDelegate](https://developer.apple.com/documentation/avsystemrouting/avsystemroutedatadelegate-7vt4b)

### Errors

- [AVSystemRoutingError](https://developer.apple.com/documentation/avsystemrouting/avsystemroutingerror-7miya)
- [AVSystemRoutingError](https://developer.apple.com/documentation/avsystemrouting/avsystemroutingerror-19zkj)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
