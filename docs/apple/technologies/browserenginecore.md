# BrowserEngineCore

## Context

Load this when a task names **BrowserEngineCore** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/browserenginecore) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Integrate an alternative browser engine into your web browser app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `BrowserEngineCore`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 18.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Kernel events

- [be_kevent(_:_:_:_:_:_:)](https://developer.apple.com/documentation/browserenginecore/be_kevent(_:_:_:_:_:_:))
- [be_kevent64(_:_:_:_:_:_:)](https://developer.apple.com/documentation/browserenginecore/be_kevent64(_:_:_:_:_:_:))
- [BE_KEVENT_NO_FLAGS](https://developer.apple.com/documentation/browserenginecore/be_kevent_no_flags)
- [BE_KEVENT_RETURN_IMMEDIATELY](https://developer.apple.com/documentation/browserenginecore/be_kevent_return_immediately)

### JIT compilation

- [BE_JIT_WRITE_PROTECT_TAG](https://developer.apple.com/documentation/browserenginecore/be_jit_write_protect_tag)

### Audio preferences

- [BEAudioSession](https://developer.apple.com/documentation/browserenginecore/beaudiosession-7bb2q)
- [BEAudioSession](https://developer.apple.com/documentation/browserenginecore/beaudiosession-6b7ig)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
