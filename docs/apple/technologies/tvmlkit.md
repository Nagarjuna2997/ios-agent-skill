# TVMLKit

## Context

Load this when a task names **TVMLKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/tvmlkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create client-server apps by incorporating JavaScript and TVML files in your binary app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TVMLKit`.

Documentation language identifiers: occ, swift.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| tvOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### JavaScript Environment

- [Implementing a Hybrid TV App with TVMLKit](https://developer.apple.com/documentation/tvmlkit/implementing-a-hybrid-tv-app-with-tvmlkit)
- [TVApplicationController](https://developer.apple.com/documentation/tvmlkit/tvapplicationcontroller) — deprecated
- [TVApplicationControllerContext](https://developer.apple.com/documentation/tvmlkit/tvapplicationcontrollercontext) — deprecated

### Views and View Controllers

- [TVViewElement](https://developer.apple.com/documentation/tvmlkit/tvviewelement) — deprecated
- [TVInterfaceCreating](https://developer.apple.com/documentation/tvmlkit/tvinterfacecreating) — deprecated
- [TVInterfaceFactory](https://developer.apple.com/documentation/tvmlkit/tvinterfacefactory) — deprecated
- [TVBrowserViewController](https://developer.apple.com/documentation/tvmlkit/tvbrowserviewcontroller)
- [TVDocumentViewController](https://developer.apple.com/documentation/tvmlkit/tvdocumentviewcontroller) — deprecated

### Custom Elements

- [TVElementFactory](https://developer.apple.com/documentation/tvmlkit/tvelementfactory) — deprecated
- [TVImageElement](https://developer.apple.com/documentation/tvmlkit/tvimageelement) — deprecated
- [TVTextElement](https://developer.apple.com/documentation/tvmlkit/tvtextelement) — deprecated
- [Creating TVML Elements](https://developer.apple.com/documentation/tvmlkit/creating-tvml-elements)

### Custom Styles

- [TVViewElementStyle](https://developer.apple.com/documentation/tvmlkit/tvviewelementstyle) — deprecated
- [TVStyleFactory](https://developer.apple.com/documentation/tvmlkit/tvstylefactory) — deprecated
- [TVColor](https://developer.apple.com/documentation/tvmlkit/tvcolor) — deprecated

### Custom Player

- [TVMediaItem](https://developer.apple.com/documentation/tvmlkit/tvmediaitem) — deprecated
- [TVPlaylist](https://developer.apple.com/documentation/tvmlkit/tvplaylist) — deprecated
- [TVPlayer](https://developer.apple.com/documentation/tvmlkit/tvplayer) — deprecated

### Errors

- [TVMLKitErrorDomain](https://developer.apple.com/documentation/tvmlkit/tvmlkiterrordomain) — deprecated
- [TVMLKitError](https://developer.apple.com/documentation/tvmlkit/tvmlkiterror) — deprecated
- [TVDocumentError](https://developer.apple.com/documentation/tvmlkit/tvdocumenterror-swift.struct) — deprecated

### Reference

- [TVMLKit Enumerations](https://developer.apple.com/documentation/tvmlkit/tvmlkit-enumerations)
- [TVMLKit Constants](https://developer.apple.com/documentation/tvmlkit/tvmlkit-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
