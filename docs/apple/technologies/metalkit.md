# MetalKit

## Context

Load this when a task names **MetalKit** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/metalkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build Metal apps quicker and easier using a common set of utility classes.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MetalKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 9.0 | — | No |
| iPadOS | 9.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.11 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### View Management

- [MTKView](https://developer.apple.com/documentation/metalkit/mtkview)
- [MTKViewDelegate](https://developer.apple.com/documentation/metalkit/mtkviewdelegate)

### Texture Loading

- [MTKTextureLoader](https://developer.apple.com/documentation/metalkit/mtktextureloader)

### Model Handling

- [MTKMesh](https://developer.apple.com/documentation/metalkit/mtkmesh)
- [MTKMeshBuffer](https://developer.apple.com/documentation/metalkit/mtkmeshbuffer)
- [MTKMeshBufferAllocator](https://developer.apple.com/documentation/metalkit/mtkmeshbufferallocator)
- [MTKSubmesh](https://developer.apple.com/documentation/metalkit/mtksubmesh)
- [Conversion Functions](https://developer.apple.com/documentation/metalkit/conversion-functions)
- [Model Errors](https://developer.apple.com/documentation/metalkit/model-errors)

### Reference

- [MetalKit Functions](https://developer.apple.com/documentation/metalkit/metalkit-functions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
