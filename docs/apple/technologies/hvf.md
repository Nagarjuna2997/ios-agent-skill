# hvf

## Context

Load this when a task names **hvf** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/hvf) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Render Hierarchical Variable Font (HVF) glyph outlines, and support font editors and related tools.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `hvf`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.4 | — | No |
| iPadOS | 18.4 | — | No |
| Mac Catalyst | 18.4 | — | No |
| macOS | 15.4 | — | No |
| tvOS | 18.4 | — | No |
| visionOS | 2.4 | — | No |
| watchOS | 11.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [HVGLPartLoader](https://developer.apple.com/documentation/hvf/hvglpartloader)
- [PartRenderer](https://developer.apple.com/documentation/hvf/partrenderer)

### Protocols

- [CompositeWriter](https://developer.apple.com/documentation/hvf/compositewriter)
- [PartGenerator](https://developer.apple.com/documentation/hvf/partgenerator)
- [ShapeWriter](https://developer.apple.com/documentation/hvf/shapewriter)

### Structures

- [CompositeExtremumIndex](https://developer.apple.com/documentation/hvf/compositeextremumindex)
- [CompositeSubpart](https://developer.apple.com/documentation/hvf/compositesubpart)
- [CompositeSubpartTranslation](https://developer.apple.com/documentation/hvf/compositesubparttranslation)

### Variables

- [hvfLibraryVersion](https://developer.apple.com/documentation/hvf/hvflibraryversion-swift.var)

### Type Aliases

- [CustomPartLoader](https://developer.apple.com/documentation/hvf/custompartloader)

### Enumerations

- [AxisExtremum](https://developer.apple.com/documentation/hvf/axisextremum)
- [PartResult](https://developer.apple.com/documentation/hvf/partresult)
- [PointCoordinate](https://developer.apple.com/documentation/hvf/pointcoordinate)
- [SegmentBlendType](https://developer.apple.com/documentation/hvf/segmentblendtype)
- [SegmentPoint](https://developer.apple.com/documentation/hvf/segmentpoint)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
