# OpenGL ES

## Context

Load this when a task names **OpenGL ES** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/opengles) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create 3D and 2D graphics effects with this compact, efficient subset of OpenGL.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `OpenGL ES`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | 12.0 | No |
| iPadOS | 2.0 | 12.0 | No |
| Mac Catalyst | 2.0 | — | No |
| tvOS | 9.0 | 12.0 | No |
| visionOS | 1.0 | 1.0 | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [EAGLContext](https://developer.apple.com/documentation/opengles/eaglcontext) — deprecated
- [EAGLSharegroup](https://developer.apple.com/documentation/opengles/eaglsharegroup) — deprecated

### Protocols

- [EAGLDrawable](https://developer.apple.com/documentation/opengles/eagldrawable) — deprecated

### Reference

- [EAGL Functions](https://developer.apple.com/documentation/opengles/eagl-functions)
- [OpenGL ES Enumerations](https://developer.apple.com/documentation/opengles/opengl-es-enumerations)
- [OpenGL ES Constants](https://developer.apple.com/documentation/opengles/opengl-es-constants)
- [OpenGL ES Functions](https://developer.apple.com/documentation/opengles/opengl-es-functions)
- [OpenGL ES Data Types](https://developer.apple.com/documentation/opengles/opengl-es-data-types)

### Variables

- [GL_SAMPLER_2D_SHADOW](https://developer.apple.com/documentation/opengles/gl_sampler_2d_shadow)
- [GL_TEXTURE_ENV_COLOR](https://developer.apple.com/documentation/opengles/gl_texture_env_color)
- [GL_TEXTURE_ENV_MODE](https://developer.apple.com/documentation/opengles/gl_texture_env_mode)
- [GL_TIMEOUT_IGNORED](https://developer.apple.com/documentation/opengles/gl_timeout_ignored)

### Functions

- [glFramebufferTextureLayer(_:_:_:_:_:)](https://developer.apple.com/documentation/opengles/glframebuffertexturelayer(_:_:_:_:_:)) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
