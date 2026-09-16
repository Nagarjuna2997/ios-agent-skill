# Compositor Services

## Context

Load this when a task names **Compositor Services** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/compositorservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Take control of the drawing environment and render your own content using Metal.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Compositor Services`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### App integration

- [Drawing fully immersive content using Metal](https://developer.apple.com/documentation/compositorservices/drawing-fully-immersive-content-using-metal)
- [Interacting with virtual content blended with passthrough](https://developer.apple.com/documentation/compositorservices/interacting-with-virtual-content-blended-with-passthrough)
- [Rendering hover effects in Metal immersive apps](https://developer.apple.com/documentation/compositorservices/rendering_hover_effects_in_metal_immersive_apps)
- [CompositorLayer](https://developer.apple.com/documentation/compositorservices/compositorlayer)
- [CompositorLayerConfiguration](https://developer.apple.com/documentation/compositorservices/compositorlayerconfiguration)
- [DefaultCompositorLayerConfiguration](https://developer.apple.com/documentation/compositorservices/defaultcompositorlayerconfiguration)

### Render-loop setup

- [LayerRenderer](https://developer.apple.com/documentation/compositorservices/layerrenderer)
- [LayerRenderer.Frame](https://developer.apple.com/documentation/compositorservices/layerrenderer/frame)

### Drawing environment

- [LayerRenderer.Drawable](https://developer.apple.com/documentation/compositorservices/layerrenderer/drawable)
- [LayerRenderer.Drawable.View](https://developer.apple.com/documentation/compositorservices/layerrenderer/drawable/view)

### Errors

- [LayerRendererConfigurationError](https://developer.apple.com/documentation/compositorservices/layerrendererconfigurationerror)

### Articles

- [Controlling Metal rendering immersion level](https://developer.apple.com/documentation/compositorservices/controlling-metal-rendering-immersion-level)

### Structures

- [TextureTopology](https://developer.apple.com/documentation/compositorservices/texturetopology)

### Variables

- [CP_ARKIT_AVAILABLE](https://developer.apple.com/documentation/compositorservices/cp_arkit_available)

### Type Aliases

- [cp_drawable_array_t](https://developer.apple.com/documentation/compositorservices/cp_drawable_array_t)
- [cp_hover_effect_t](https://developer.apple.com/documentation/compositorservices/cp_hover_effect_t)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
