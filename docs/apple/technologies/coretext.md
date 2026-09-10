# Core Text

## Context

Load this when a task names **Core Text** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/coretext) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create text layouts, optimize font handling, and access font metrics and glyph data.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Text`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 3.2 | — | No |
| iPadOS | 3.2 | — | No |
| Mac Catalyst | 13.1 | — | No |
| macOS | 10.8 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Opaque Types

- [CTFont](https://developer.apple.com/documentation/coretext/ctfont)
- [CTFontCollection](https://developer.apple.com/documentation/coretext/ctfontcollection)
- [CTFontDescriptor](https://developer.apple.com/documentation/coretext/ctfontdescriptor)
- [CTFrame](https://developer.apple.com/documentation/coretext/ctframe)
- [CTFramesetter](https://developer.apple.com/documentation/coretext/ctframesetter)
- [CTGlyphInfo](https://developer.apple.com/documentation/coretext/ctglyphinfo)
- [CTLine](https://developer.apple.com/documentation/coretext/ctline)
- [CTParagraphStyle](https://developer.apple.com/documentation/coretext/ctparagraphstyle)
- [CTRun](https://developer.apple.com/documentation/coretext/ctrun)
- [CTRunDelegate](https://developer.apple.com/documentation/coretext/ctrundelegate)
- [CTTextTab](https://developer.apple.com/documentation/coretext/cttexttab)
- [CTTypesetter](https://developer.apple.com/documentation/coretext/cttypesetter)

### Reference

- [Styling Attributed Strings](https://developer.apple.com/documentation/coretext/styling-attributed-strings)
- [Core Text Structures](https://developer.apple.com/documentation/coretext/core-text-structures)
- [Core Text Enumerations](https://developer.apple.com/documentation/coretext/core-text-enumerations)
- [Core Text Constants](https://developer.apple.com/documentation/coretext/core-text-constants)
- [Core Text Functions](https://developer.apple.com/documentation/coretext/core-text-functions)
- [Core Text Data Types](https://developer.apple.com/documentation/coretext/core-text-data-types)
- [SFNT Support](https://developer.apple.com/documentation/coretext/sfnt-support)

### Macros

- [Macros](https://developer.apple.com/documentation/coretext/coretext-macros)

### Classes

- [CTRubyAnnotation](https://developer.apple.com/documentation/coretext/ctrubyannotation)

### Protocols

- [CTAdaptiveImageProviding](https://developer.apple.com/documentation/coretext/ctadaptiveimageproviding)

### Variables

- [kCTFontDescriptorLanguageAttribute](https://developer.apple.com/documentation/coretext/kctfontdescriptorlanguageattribute)

### Functions

- [CTFontGetUIFontType(_:)](https://developer.apple.com/documentation/coretext/ctfontgetuifonttype(_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
