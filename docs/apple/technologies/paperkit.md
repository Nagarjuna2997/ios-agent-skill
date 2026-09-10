# PaperKit

## Context

Load this when a task names **PaperKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/paperkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Add drawings, shapes, and a consistent markup experience to your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PaperKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Integrating PaperKit into your app](https://developer.apple.com/documentation/paperkit/getting-started-with-paperkit)

### View controllers

- [PaperMarkupViewController](https://developer.apple.com/documentation/paperkit/papermarkupviewcontroller)
- [MarkupEditViewController](https://developer.apple.com/documentation/paperkit/markupeditviewcontroller)
- [MarkupToolbarViewController](https://developer.apple.com/documentation/paperkit/markuptoolbarviewcontroller)

### Configuration

- [FeatureSet](https://developer.apple.com/documentation/paperkit/featureset)
- [ShapeConfiguration](https://developer.apple.com/documentation/paperkit/shapeconfiguration)
- [RenderingOptions](https://developer.apple.com/documentation/paperkit/renderingoptions)
- [MarkupAutoresizing](https://developer.apple.com/documentation/paperkit/markupautoresizing)

### Data model

- [PaperMarkup](https://developer.apple.com/documentation/paperkit/papermarkup)
- [MarkupOrderedSet](https://developer.apple.com/documentation/paperkit/markuporderedset)
- [MarkupID](https://developer.apple.com/documentation/paperkit/markupid)

### Markup elements

- [Markup](https://developer.apple.com/documentation/paperkit/markup)
- [ImageMarkup](https://developer.apple.com/documentation/paperkit/imagemarkup)
- [ShapeMarkup](https://developer.apple.com/documentation/paperkit/shapemarkup)
- [LinkMarkup](https://developer.apple.com/documentation/paperkit/linkmarkup)
- [LoupeMarkup](https://developer.apple.com/documentation/paperkit/loupemarkup)
- [MarkupInteractions](https://developer.apple.com/documentation/paperkit/markupinteractions)

### Adornments

- [MarkupAdornment](https://developer.apple.com/documentation/paperkit/markupadornment)

### Error handling

- [MarkupError](https://developer.apple.com/documentation/paperkit/markuperror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
