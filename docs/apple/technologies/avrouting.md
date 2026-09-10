# AVRouting

## Context

Load this when a task names **AVRouting** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/avrouting) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Display custom destinations to stream media in the system route picker.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AVRouting`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Media routing

- [AVCustomRoutingController](https://developer.apple.com/documentation/avrouting/avcustomroutingcontroller)
- [AVCustomRoutingControllerDelegate](https://developer.apple.com/documentation/avrouting/avcustomroutingcontrollerdelegate)
- [AVCustomRoutingEvent](https://developer.apple.com/documentation/avrouting/avcustomroutingevent)
- [AVCustomRoutingActionItem](https://developer.apple.com/documentation/avrouting/avcustomroutingactionitem)

### Playback arbitration

- [AVRoutingPlaybackArbiter](https://developer.apple.com/documentation/avrouting/avroutingplaybackarbiter)
- [AVRoutingPlaybackParticipant](https://developer.apple.com/documentation/avrouting/avroutingplaybackparticipant)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
