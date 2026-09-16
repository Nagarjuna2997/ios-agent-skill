# GLKit

## Context

Load this when a task names **GLKit** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/glkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Speed up OpenGL ES or OpenGL app development. Use math libraries, background texture loading, pre-created shader effects, and a standard view and view controller to …

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `GLKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 5.0 | — | No |
| iPadOS | 5.0 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Texture Loading

- [GLKTextureInfo](https://developer.apple.com/documentation/glkit/glktextureinfo) — deprecated
- [GLKTextureLoader](https://developer.apple.com/documentation/glkit/glktextureloader) — deprecated

### OpenGL ES View Rendering

- [GLKView](https://developer.apple.com/documentation/glkit/glkview) — deprecated
- [GLKViewDelegate](https://developer.apple.com/documentation/glkit/glkviewdelegate)
- [GLKViewController](https://developer.apple.com/documentation/glkit/glkviewcontroller) — deprecated
- [GLKViewControllerDelegate](https://developer.apple.com/documentation/glkit/glkviewcontrollerdelegate)

### Mesh Data Management

- [GLKMesh](https://developer.apple.com/documentation/glkit/glkmesh) — deprecated
- [GLKMeshBuffer](https://developer.apple.com/documentation/glkit/glkmeshbuffer) — deprecated
- [GLKMeshBufferAllocator](https://developer.apple.com/documentation/glkit/glkmeshbufferallocator) — deprecated
- [GLKSubmesh](https://developer.apple.com/documentation/glkit/glksubmesh) — deprecated

### Shader-Based Rendering Effects

- [GLKNamedEffect](https://developer.apple.com/documentation/glkit/glknamedeffect)
- [GLKBaseEffect](https://developer.apple.com/documentation/glkit/glkbaseeffect) — deprecated
- [GLKReflectionMapEffect](https://developer.apple.com/documentation/glkit/glkreflectionmapeffect) — deprecated
- [GLKSkyboxEffect](https://developer.apple.com/documentation/glkit/glkskyboxeffect) — deprecated

### Rendering Effect Parameters

- [GLKEffectProperty](https://developer.apple.com/documentation/glkit/glkeffectproperty) — deprecated
- [GLKEffectPropertyFog](https://developer.apple.com/documentation/glkit/glkeffectpropertyfog) — deprecated
- [GLKEffectPropertyLight](https://developer.apple.com/documentation/glkit/glkeffectpropertylight) — deprecated
- [GLKEffectPropertyTexture](https://developer.apple.com/documentation/glkit/glkeffectpropertytexture) — deprecated
- [GLKEffectPropertyMaterial](https://developer.apple.com/documentation/glkit/glkeffectpropertymaterial) — deprecated
- [GLKEffectPropertyTransform](https://developer.apple.com/documentation/glkit/glkeffectpropertytransform) — deprecated
- [GLKit Effects Constants](https://developer.apple.com/documentation/glkit/glkit-effects-constants)

### Math Utilties

- [GLKMatrixStack](https://developer.apple.com/documentation/glkit/glkmatrixstack)
- [GLKMatrix3](https://developer.apple.com/documentation/glkit/glkmatrix3-pcl)
- [GLKMatrix4](https://developer.apple.com/documentation/glkit/glkmatrix4-pce)
- [GLKVector2](https://developer.apple.com/documentation/glkit/glkvector2-pbj)
- [GLKVector3](https://developer.apple.com/documentation/glkit/glkvector3-pbt)
- [GLKVector4](https://developer.apple.com/documentation/glkit/glkvector4-pbk)
- [GLKQuaternion](https://developer.apple.com/documentation/glkit/glkquaternion-pc6)
- [GLKit Math Utilities](https://developer.apple.com/documentation/glkit/glkit-math-utilities)

### Reference

- [GLKit Structures](https://developer.apple.com/documentation/glkit/glkit-structures)
- [GLKit Enumerations](https://developer.apple.com/documentation/glkit/glkit-enumerations)
- [GLKit Constants](https://developer.apple.com/documentation/glkit/glkit-constants)
- [GLKit Functions](https://developer.apple.com/documentation/glkit/glkit-functions)
- [GLKit Data Types](https://developer.apple.com/documentation/glkit/glkit-data-types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
