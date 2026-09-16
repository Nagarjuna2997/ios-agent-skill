# MetalFX

## Context

Load this when a task names **MetalFX** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/metalfx) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Boost your Metal app’s performance by upscaling lower-resolution content to save GPU time.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MetalFX`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Temporal scaling

- [Applying temporal antialiasing and upscaling using MetalFX](https://developer.apple.com/documentation/metalfx/applying-temporal-antialiasing-and-upscaling-using-metalfx)
- [MTLFXTemporalScaler](https://developer.apple.com/documentation/metalfx/mtlfxtemporalscaler)
- [MTLFXTemporalScalerDescriptor](https://developer.apple.com/documentation/metalfx/mtlfxtemporalscalerdescriptor)

### Spatial scaling

- [MTLFXSpatialScaler](https://developer.apple.com/documentation/metalfx/mtlfxspatialscaler)
- [MTLFXSpatialScalerDescriptor](https://developer.apple.com/documentation/metalfx/mtlfxspatialscalerdescriptor)
- [MTLFXSpatialScalerColorProcessingMode](https://developer.apple.com/documentation/metalfx/mtlfxspatialscalercolorprocessingmode)

### Classes

- [MTLFXFrameInterpolatorDescriptor](https://developer.apple.com/documentation/metalfx/mtlfxframeinterpolatordescriptor)
- [MTLFXTemporalDenoisedScalerDescriptor](https://developer.apple.com/documentation/metalfx/mtlfxtemporaldenoisedscalerdescriptor)

### Protocols

- [MTL4FXFrameInterpolator](https://developer.apple.com/documentation/metalfx/mtl4fxframeinterpolator)
- [MTL4FXSpatialScaler](https://developer.apple.com/documentation/metalfx/mtl4fxspatialscaler)
- [MTL4FXTemporalDenoisedScaler](https://developer.apple.com/documentation/metalfx/mtl4fxtemporaldenoisedscaler)
- [MTL4FXTemporalScaler](https://developer.apple.com/documentation/metalfx/mtl4fxtemporalscaler)
- [MTLFXFrameInterpolatableScaler](https://developer.apple.com/documentation/metalfx/mtlfxframeinterpolatablescaler)
- [MTLFXFrameInterpolator](https://developer.apple.com/documentation/metalfx/mtlfxframeinterpolator)
- [MTLFXFrameInterpolatorBase](https://developer.apple.com/documentation/metalfx/mtlfxframeinterpolatorbase)
- [MTLFXSpatialScalerBase](https://developer.apple.com/documentation/metalfx/mtlfxspatialscalerbase)
- [MTLFXTemporalDenoisedScaler](https://developer.apple.com/documentation/metalfx/mtlfxtemporaldenoisedscaler)
- [MTLFXTemporalDenoisedScalerBase](https://developer.apple.com/documentation/metalfx/mtlfxtemporaldenoisedscalerbase)
- [MTLFXTemporalScalerBase](https://developer.apple.com/documentation/metalfx/mtlfxtemporalscalerbase)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
