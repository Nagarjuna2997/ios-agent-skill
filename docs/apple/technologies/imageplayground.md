# Image Playground

## Context

Load this when a task names **Image Playground** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/imageplayground) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Present a system interface to generate images based on descriptive information.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Image Playground`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.1 | — | No |
| iPadOS | 18.1 | — | No |
| Mac Catalyst | 18.1 | — | No |
| macOS | 15.1 | — | No |
| visionOS | 2.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### SwiftUI presentation

- [imagePlaygroundSheet(isPresented:concept:sourceImage:onCompletion:onCancellation:)](https://developer.apple.com/documentation/swiftui/view/imageplaygroundsheet(ispresented:concept:sourceimage:oncompletion:oncancellation:))
- [imagePlaygroundSheet(isPresented:concepts:sourceImage:onCompletion:onCancellation:)](https://developer.apple.com/documentation/swiftui/view/imageplaygroundsheet(ispresented:concepts:sourceimage:oncompletion:oncancellation:))
- [imagePlaygroundSheet(isPresented:concepts:sourceImageURL:onCompletion:onCancellation:)](https://developer.apple.com/documentation/swiftui/view/imageplaygroundsheet(ispresented:concepts:sourceimageurl:oncompletion:oncancellation:))

### UIKit and AppKit presentation

- [ImagePlaygroundViewController](https://developer.apple.com/documentation/imageplayground/imageplaygroundviewcontroller)

### Programmatic creation

- [ImageCreator](https://developer.apple.com/documentation/imageplayground/imagecreator) — deprecated

### Platform support

- [ImagePlaygroundConcept](https://developer.apple.com/documentation/imageplayground/imageplaygroundconcept)
- [ImagePlaygroundStyle](https://developer.apple.com/documentation/imageplayground/imageplaygroundstyle)

### Structures

- [ImagePlaygroundOptions](https://developer.apple.com/documentation/imageplayground/imageplaygroundoptions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
