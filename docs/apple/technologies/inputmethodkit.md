# InputMethodKit

## Context

Load this when a task names **InputMethodKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/inputmethodkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop input methods and manage communication with client applications, candidates windows, and input method modes.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `InputMethodKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.5 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [IMKCandidates](https://developer.apple.com/documentation/inputmethodkit/imkcandidates)
- [IMKInputController](https://developer.apple.com/documentation/inputmethodkit/imkinputcontroller)
- [IMKServer](https://developer.apple.com/documentation/inputmethodkit/imkserver)

### Protocols

- [IMKMouseHandling](https://developer.apple.com/documentation/inputmethodkit/imkmousehandling)
- [IMKServerInput](https://developer.apple.com/documentation/inputmethodkit/imkserverinput)
- [IMKStateSetting](https://developer.apple.com/documentation/inputmethodkit/imkstatesetting)

### Reference

- [InputMethodKit Enumerations](https://developer.apple.com/documentation/inputmethodkit/inputmethodkit-enumerations)
- [InputMethodKit Constants](https://developer.apple.com/documentation/inputmethodkit/inputmethodkit-constants)
- [InputMethodKit Data Types](https://developer.apple.com/documentation/inputmethodkit/inputmethodkit-data_types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
