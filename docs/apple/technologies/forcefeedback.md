# Force Feedback

## Context

Load this when a task names **Force Feedback** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/forcefeedback) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Control force feedback devices attached to the system. Develop plug-ins that enable communication with force feedback hardware.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Force Feedback`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [ForceFeedback.h](https://developer.apple.com/documentation/forcefeedback/forcefeedback-h)
- [ForceFeedbackConstants.h](https://developer.apple.com/documentation/forcefeedback/forcefeedbackconstants-h)
- [ForceFeedback Enumerations](https://developer.apple.com/documentation/forcefeedback/forcefeedback-enumerations)
- [ForceFeedback Constants](https://developer.apple.com/documentation/forcefeedback/forcefeedback-constants)
- [ForceFeedback Data Types](https://developer.apple.com/documentation/forcefeedback/forcefeedback-data-types)

### Variables

- [kFFAPIMajorRev](https://developer.apple.com/documentation/forcefeedback/kffapimajorrev)
- [kFFAPIMinorAndBugRev](https://developer.apple.com/documentation/forcefeedback/kffapiminorandbugrev)
- [kFFAPINonRelRev](https://developer.apple.com/documentation/forcefeedback/kffapinonrelrev)
- [kFFAPIStage](https://developer.apple.com/documentation/forcefeedback/kffapistage)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
