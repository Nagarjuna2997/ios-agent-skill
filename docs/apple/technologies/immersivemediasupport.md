# Immersive Media Support

## Context

Load this when a task names **Immersive Media Support** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/immersivemediasupport) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Read and write essential Apple Immersive Video metadata.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Immersive Media Support`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Authoring Apple Immersive Video](https://developer.apple.com/documentation/immersivemediasupport/authoring-apple-immersive-video)
- [Processing Apple Immersive Video with foveation](https://developer.apple.com/documentation/immersivemediasupport/processing-apple-immersive-video-with-foveation)

### Camera metadata

- [VenueDescriptor](https://developer.apple.com/documentation/immersivemediasupport/venuedescriptor)
- [ImmersiveCamera](https://developer.apple.com/documentation/immersivemediasupport/immersivecamera)
- [ImmersiveCameraLensDefinition](https://developer.apple.com/documentation/immersivemediasupport/immersivecameralensdefinition)
- [ImmersiveCameraCalibration](https://developer.apple.com/documentation/immersivemediasupport/immersivecameracalibration)
- [ImmersiveCameraMask](https://developer.apple.com/documentation/immersivemediasupport/immersivecameramask)
- [ImmersiveDynamicMask](https://developer.apple.com/documentation/immersivemediasupport/immersivedynamicmask)
- [ImmersiveImageMask](https://developer.apple.com/documentation/immersivemediasupport/immersiveimagemask)

### Presentation commands

- [PresentationCommand](https://developer.apple.com/documentation/immersivemediasupport/presentationcommand)
- [FadeCommand](https://developer.apple.com/documentation/immersivemediasupport/fadecommand)
- [FadeEnvironmentCommand](https://developer.apple.com/documentation/immersivemediasupport/fadeenvironmentcommand)
- [SetCameraCommand](https://developer.apple.com/documentation/immersivemediasupport/setcameracommand)
- [ShotFlopCommand](https://developer.apple.com/documentation/immersivemediasupport/shotflopcommand)
- [ShotFlipCommand](https://developer.apple.com/documentation/immersivemediasupport/shotflipcommand)
- [PresentationDescriptor](https://developer.apple.com/documentation/immersivemediasupport/presentationdescriptor)
- [PresentationDescriptorReader](https://developer.apple.com/documentation/immersivemediasupport/presentationdescriptorreader)

### Parametric immersive support

- [ParametricImmersiveAssetInfo](https://developer.apple.com/documentation/immersivemediasupport/parametricimmersiveassetinfo)

### Immersive video rendering support

- [ImmersiveVideoFrame](https://developer.apple.com/documentation/immersivemediasupport/immersivevideoframe)
- [ImmersiveCameraViewModel](https://developer.apple.com/documentation/immersivemediasupport/immersivecameraviewmodel)
- [ImmersiveVideoMask](https://developer.apple.com/documentation/immersivemediasupport/immersivevideomask)

### Preview

- [ImmersiveMediaPreviewMessagingProtocol](https://developer.apple.com/documentation/immersivemediasupport/immersivemediapreviewmessagingprotocol)
- [ImmersiveMediaRemotePreviewSender](https://developer.apple.com/documentation/immersivemediasupport/immersivemediaremotepreviewsender)
- [ImmersiveMediaRemotePreviewReceiver](https://developer.apple.com/documentation/immersivemediasupport/immersivemediaremotepreviewreceiver)
- [ImmersivePreviewRenderer](https://developer.apple.com/documentation/immersivemediasupport/immersivepreviewrenderer)

### Validation

- [AIVUValidator](https://developer.apple.com/documentation/immersivemediasupport/aivuvalidator)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
