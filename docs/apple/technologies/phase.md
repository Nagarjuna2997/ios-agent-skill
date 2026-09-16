# PHASE

## Context

Load this when a task names **PHASE** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/phase) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create dynamic audio experiences in your game or app that react to events and cues in the environment.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PHASE`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 12.0 | — | No |
| tvOS | 17.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Playing sound from a location in a 3D scene](https://developer.apple.com/documentation/phase/playing-sound-from-a-location-in-a-3d-scene)
- [Personalizing spatial audio in your app](https://developer.apple.com/documentation/phase/personalizing-spatial-audio-in-your-app)
- [PHASE updates](https://developer.apple.com/documentation/updates/phase)

### Setup

- [PHASEEngine](https://developer.apple.com/documentation/phase/phaseengine)
- [PHASEEngine.UpdateMode](https://developer.apple.com/documentation/phase/phaseengine/updatemode)
- [PHASEEngine.RenderingMode](https://developer.apple.com/documentation/phase/phaseengine/renderingmode)
- [PHASEAssetRegistry](https://developer.apple.com/documentation/phase/phaseassetregistry)
- [PHASENormalizationMode](https://developer.apple.com/documentation/phase/phasenormalizationmode)
- [PHASESpatializationMode](https://developer.apple.com/documentation/phase/phasespatializationmode)
- [PHASEReverbPreset](https://developer.apple.com/documentation/phase/phasereverbpreset)
- [PHASEMedium](https://developer.apple.com/documentation/phase/phasemedium)

### Soundscape Creation

- [PHASESource](https://developer.apple.com/documentation/phase/phasesource)
- [PHASEListener](https://developer.apple.com/documentation/phase/phaselistener)
- [PHASEOccluder](https://developer.apple.com/documentation/phase/phaseoccluder)
- [PHASEObject](https://developer.apple.com/documentation/phase/phaseobject)
- [PHASEShape](https://developer.apple.com/documentation/phase/phaseshape)
- [PHASEShape.Element](https://developer.apple.com/documentation/phase/phaseshape/element)
- [PHASEMaterial](https://developer.apple.com/documentation/phase/phasematerial)
- [PHASEMaterialPreset](https://developer.apple.com/documentation/phase/phasematerialpreset)
- [PHASEMixerParameters](https://developer.apple.com/documentation/phase/phasemixerparameters)

### Audio Selection and Playback

- [PHASESoundAsset](https://developer.apple.com/documentation/phase/phasesoundasset)
- [PHASESoundEvent](https://developer.apple.com/documentation/phase/phasesoundevent)
- [PHASESoundEvent.RenderingState](https://developer.apple.com/documentation/phase/phasesoundevent/renderingstate-swift.enum)
- [PHASESoundEventNodeDefinition](https://developer.apple.com/documentation/phase/phasesoundeventnodedefinition)
- [PHASESoundEventNodeAsset](https://developer.apple.com/documentation/phase/phasesoundeventnodeasset)
- [PHASEAsset](https://developer.apple.com/documentation/phase/phaseasset)
- [Sound Event Nodes](https://developer.apple.com/documentation/phase/sound-event-nodes)

### Audio Layering and Effects

- [PHASEChannelMixerDefinition](https://developer.apple.com/documentation/phase/phasechannelmixerdefinition)
- [PHASEAmbientMixerDefinition](https://developer.apple.com/documentation/phase/phaseambientmixerdefinition)
- [PHASEMixerDefinition](https://developer.apple.com/documentation/phase/phasemixerdefinition)
- [PHASEMixer](https://developer.apple.com/documentation/phase/phasemixer)
- [PHASEDefinition](https://developer.apple.com/documentation/phase/phasedefinition)
- [Spatial Mixing](https://developer.apple.com/documentation/phase/spatial-mixing)

### Dynamic Sound Control

- [PHASEEnvelope](https://developer.apple.com/documentation/phase/phaseenvelope)
- [PHASEEnvelopeSegment](https://developer.apple.com/documentation/phase/phaseenvelopesegment)
- [PHASECurveType](https://developer.apple.com/documentation/phase/phasecurvetype)
- [PHASENumericPair](https://developer.apple.com/documentation/phase/phasenumericpair)
- [Playback Parameterization](https://developer.apple.com/documentation/phase/playback-parameterization)

### Sound Grouping and Management

- [PHASEGroup](https://developer.apple.com/documentation/phase/phasegroup)
- [PHASEGroupPreset](https://developer.apple.com/documentation/phase/phasegrouppreset)
- [PHASEGroupPresetSetting](https://developer.apple.com/documentation/phase/phasegrouppresetsetting)
- [PHASEDucker](https://developer.apple.com/documentation/phase/phaseducker)

### Errors

- [PHASE Errors](https://developer.apple.com/documentation/phase/phase-errors)

### Classes

- [PHASEPullStreamNode](https://developer.apple.com/documentation/phase/phasepullstreamnode)
- [PHASEPullStreamNodeDefinition](https://developer.apple.com/documentation/phase/phasepullstreamnodedefinition)
- [PHASEStreamNode](https://developer.apple.com/documentation/phase/phasestreamnode)

### Structures

- [PHASEAutomaticHeadTrackingFlags](https://developer.apple.com/documentation/phase/phaseautomaticheadtrackingflags)

### Type Aliases

- [PHASEPullStreamRenderHandler](https://developer.apple.com/documentation/phase/phasepullstreamrenderhandler)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
