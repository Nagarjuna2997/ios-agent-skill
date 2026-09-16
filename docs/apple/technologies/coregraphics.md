# Core Graphics

## Context

Load this when a task names **Core Graphics** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/coregraphics) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Harness the power of Quartz technology to perform lightweight 2D rendering with high-fidelity output. Handle path-based drawing, antialiased rendering, gradients, images, color management, PDF documents, …

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Graphics`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Geometric Data Types

- [CGFloat](https://developer.apple.com/documentation/corefoundation/cgfloat-swift.struct)
- [CGPoint](https://developer.apple.com/documentation/corefoundation/cgpoint)
- [CGSize](https://developer.apple.com/documentation/corefoundation/cgsize)
- [CGRect](https://developer.apple.com/documentation/corefoundation/cgrect)
- [CGVector](https://developer.apple.com/documentation/corefoundation/cgvector)
- [CGAffineTransform](https://developer.apple.com/documentation/corefoundation/cgaffinetransform)

### 2D Drawing

- [CGContext](https://developer.apple.com/documentation/coregraphics/cgcontext)
- [CGImage](https://developer.apple.com/documentation/coregraphics/cgimage)
- [CGPath](https://developer.apple.com/documentation/coregraphics/cgpath)
- [CGMutablePath](https://developer.apple.com/documentation/coregraphics/cgmutablepath)
- [CGLayer](https://developer.apple.com/documentation/coregraphics/cglayer)

### Colors and Fonts

- [CGColor](https://developer.apple.com/documentation/coregraphics/cgcolor)
- [CGColorConversionInfo](https://developer.apple.com/documentation/coregraphics/cgcolorconversioninfo)
- [CGColorSpace](https://developer.apple.com/documentation/coregraphics/cgcolorspace)
- [CGFont](https://developer.apple.com/documentation/coregraphics/cgfont)

### Working with PDF Documents

- [CGPDFDocument](https://developer.apple.com/documentation/coregraphics/cgpdfdocument)

### Utility and Support Classes

- [CGDataConsumer](https://developer.apple.com/documentation/coregraphics/cgdataconsumer)
- [CGDataProvider](https://developer.apple.com/documentation/coregraphics/cgdataprovider)
- [CGShading](https://developer.apple.com/documentation/coregraphics/cgshading)
- [CGGradient](https://developer.apple.com/documentation/coregraphics/cggradient)
- [CGFunction](https://developer.apple.com/documentation/coregraphics/cgfunction)
- [CGPattern](https://developer.apple.com/documentation/coregraphics/cgpattern)

### Services

- [Quartz Display Services](https://developer.apple.com/documentation/coregraphics/quartz-display-services)
- [Quartz Event Services](https://developer.apple.com/documentation/coregraphics/quartz-event-services)
- [Quartz Window Services](https://developer.apple.com/documentation/coregraphics/quartz-window-services)

### Reference

- [Core Graphics Structures](https://developer.apple.com/documentation/coregraphics/core-graphics-structures)
- [Core Graphics Enumerations](https://developer.apple.com/documentation/coregraphics/core-graphics-enumerations)
- [Core Graphics Constants](https://developer.apple.com/documentation/coregraphics/core-graphics-constants)
- [Core Graphics Functions](https://developer.apple.com/documentation/coregraphics/core-graphics-functions)
- [Core Graphics Data Types](https://developer.apple.com/documentation/coregraphics/core-graphics-data-types)

### Classes

- [CGPDFMarkedContentItem](https://developer.apple.com/documentation/coregraphics/cgpdfmarkedcontentitem)
- [CGPDFStructureElement](https://developer.apple.com/documentation/coregraphics/cgpdfstructureelement)
- [CGRenderingBufferProvider](https://developer.apple.com/documentation/coregraphics/cgrenderingbufferprovider)

### Structures

- [CGBitmapParameters](https://developer.apple.com/documentation/coregraphics/cgbitmapparameters-4v8wo)
- [CGColorModel](https://developer.apple.com/documentation/coregraphics/cgcolormodel)
- [CGContentInfo](https://developer.apple.com/documentation/coregraphics/cgcontentinfo)

### Enumerations

- [CGBitmapLayout](https://developer.apple.com/documentation/coregraphics/cgbitmaplayout)
- [CGComponent](https://developer.apple.com/documentation/coregraphics/cgcomponent)
- [CGContentToneMappingInfo](https://developer.apple.com/documentation/coregraphics/cgcontenttonemappinginfo-swift.enum)
- [CGImageComponentInfo](https://developer.apple.com/documentation/coregraphics/cgimagecomponentinfo)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
