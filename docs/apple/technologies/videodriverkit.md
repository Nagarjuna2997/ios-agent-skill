# VideoDriverKit

## Context

Load this when a task names **VideoDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/videodriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for video capture and playback devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `VideoDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 27.0 | — | Yes |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [IOUserVideoObject](https://developer.apple.com/documentation/videodriverkit/iouservideoobject)
- [IOUserVideoDriver](https://developer.apple.com/documentation/videodriverkit/iouservideodriver)

### Video devices

- [IOUserVideoClockDevice](https://developer.apple.com/documentation/videodriverkit/iouservideoclockdevice)
- [IOUserVideoDevice](https://developer.apple.com/documentation/videodriverkit/iouservideodevice)

### Video objects

- [IOUserVideoBox](https://developer.apple.com/documentation/videodriverkit/iouservideobox)

### Video streams

- [IOUserVideoStream](https://developer.apple.com/documentation/videodriverkit/iouservideostream)

### Video controls

- [IOUserVideoControl](https://developer.apple.com/documentation/videodriverkit/iouservideocontrol)
- [IOUserVideoBooleanControl](https://developer.apple.com/documentation/videodriverkit/iouservideobooleancontrol)
- [IOUserVideoStereoPanControl](https://developer.apple.com/documentation/videodriverkit/iouservideostereopancontrol)
- [IOUserVideoSliderControl](https://developer.apple.com/documentation/videodriverkit/iouservideoslidercontrol)
- [IOUserVideoDirectionControl](https://developer.apple.com/documentation/videodriverkit/iouservideodirectioncontrol)
- [IOUserVideoSelectorControl](https://developer.apple.com/documentation/videodriverkit/iouservideoselectorcontrol)
- [IOUserVideoLevelControl](https://developer.apple.com/documentation/videodriverkit/iouservideolevelcontrol)

### Namespaces

- [VideoDriverKit](https://developer.apple.com/documentation/videodriverkit/videodriverkit)

### Macros

- [DebugMsg](https://developer.apple.com/documentation/videodriverkit/debugmsg)
- [FailIf](https://developer.apple.com/documentation/videodriverkit/failif)
- [FailIfError](https://developer.apple.com/documentation/videodriverkit/failiferror)
- [FailIfNULL](https://developer.apple.com/documentation/videodriverkit/failifnull)
- [kIOStreamBufferIDInvalid](https://developer.apple.com/documentation/videodriverkit/kiostreambufferidinvalid)
- [kIOUserVideoDriverUserClientType](https://developer.apple.com/documentation/videodriverkit/kiouservideodriveruserclienttype)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
