# Core Video

## Context

Load this when a task names **Core Video** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/corevideo) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Process digital video, including manipulation of individual frames, using a pipeline-based API and support for both Metal and OpenGL.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Video`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.4 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 4.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Data Processing

- [CVBuffer](https://developer.apple.com/documentation/corevideo/cvbuffer-nfm)
- [CVImageBuffer](https://developer.apple.com/documentation/corevideo/cvimagebuffer-q40)
- [CVPixelBuffer](https://developer.apple.com/documentation/corevideo/cvpixelbuffer-q2e)
- [CVPixelBufferPool](https://developer.apple.com/documentation/corevideo/cvpixelbufferpool-77o)
- [CVPixelFormatDescription](https://developer.apple.com/documentation/corevideo/cvpixelformatdescription-42p)

### Time Management

- [CVTime](https://developer.apple.com/documentation/corevideo/cvtime-q1e)
- [CVDisplayLink](https://developer.apple.com/documentation/corevideo/cvdisplaylink-k0k)

### Metal

- [CVMetalTextureCache](https://developer.apple.com/documentation/corevideo/cvmetaltexturecache-q3j)
- [CVMetalTexture](https://developer.apple.com/documentation/corevideo/cvmetaltexture-q3g)
- [CVMetalBufferCache](https://developer.apple.com/documentation/corevideo/cvmetalbuffercache)

### OpenGL

- [CVOpenGLTextureCache](https://developer.apple.com/documentation/corevideo/cvopengltexturecache-780)
- [CVOpenGLTexture](https://developer.apple.com/documentation/corevideo/cvopengltexture-782)
- [CVOpenGLBuffer](https://developer.apple.com/documentation/corevideo/cvopenglbuffer-77s)
- [CVOpenGLBufferPool](https://developer.apple.com/documentation/corevideo/cvopenglbufferpool-77j)

### OpenGL ES

- [CVOpenGLESTextureCache](https://developer.apple.com/documentation/corevideo/cvopenglestexturecache-q2r)
- [CVOpenGLESTexture](https://developer.apple.com/documentation/corevideo/cvopenglestexture-q2s)

### Core Video Error Constants

- [Result Codes](https://developer.apple.com/documentation/corevideo/result-codes)
- [Data Types](https://developer.apple.com/documentation/corevideo/data-types)
- [CVError](https://developer.apple.com/documentation/corevideo/cverror)

### Reference

- [Core Video Enumerations](https://developer.apple.com/documentation/corevideo/core-video-enumerations)
- [Core Video Constants](https://developer.apple.com/documentation/corevideo/core-video-constants)
- [Core Video Functions](https://developer.apple.com/documentation/corevideo/core-video-functions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
