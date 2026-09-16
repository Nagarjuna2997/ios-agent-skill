# USDKit

## Context

Load this when a task names **USDKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/usdkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Author, compose, and manipulate Universal Scene Description content from Swift.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `USDKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |
| macOS | 27.0 | — | No |
| tvOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [USDStage](https://developer.apple.com/documentation/usdkit/usdstage)
- [USDPrim](https://developer.apple.com/documentation/usdkit/usdprim)
- [USDLayer](https://developer.apple.com/documentation/usdkit/usdlayer)

### Values and tokens

- [USDValue](https://developer.apple.com/documentation/usdkit/usdvalue)
- [USDValueProtocol](https://developer.apple.com/documentation/usdkit/usdvalueprotocol)
- [USDToken](https://developer.apple.com/documentation/usdkit/usdtoken)

### Transforms

- [USDTransformOperation](https://developer.apple.com/documentation/usdkit/usdtransformoperation)

### RealityKit rendering and playback

- [USDStageComponent](https://developer.apple.com/documentation/usdkit/usdstagecomponent)
- [USDPlayer](https://developer.apple.com/documentation/usdkit/usdplayer)

### Render diagnostics

- [USDRenderError](https://developer.apple.com/documentation/usdkit/usdrendererror)

### Structures

- [USDArray](https://developer.apple.com/documentation/usdkit/usdarray)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
