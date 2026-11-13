# Siri Evaluations

## Context

Load this when a task names **Siri Evaluations** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/sirievaluations) · Source checked: 2026-11-13.

Apple’s short description (excerpt):

> Evaluate how well Siri engages your app’s intents and entities by running scripted conversations and checking what Siri does.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Siri Evaluations`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.3 | — | Yes |
| iPadOS | 27.3 | — | Yes |
| macOS | 27.3 | — | Yes |
| visionOS | 27.3 | — | Yes |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Evaluations

- [SiriService](https://developer.apple.com/documentation/sirievaluations/siriservice) — beta
- [SiriExpectationEvaluator](https://developer.apple.com/documentation/sirievaluations/siriexpectationevaluator) — beta

### Scenarios

- [SiriScenarioLoader](https://developer.apple.com/documentation/sirievaluations/siriscenarioloader) — beta
- [SiriScenario](https://developer.apple.com/documentation/sirievaluations/siriscenario) — beta
- [UserTurn](https://developer.apple.com/documentation/sirievaluations/userturn) — beta

### Expectations

- [Calls](https://developer.apple.com/documentation/sirievaluations/calls) — beta
- [Finds](https://developer.apple.com/documentation/sirievaluations/finds) — beta
- [Loads](https://developer.apple.com/documentation/sirievaluations/loads) — beta
- [OnScreen](https://developer.apple.com/documentation/sirievaluations/onscreen) — beta
- [SiriResponse](https://developer.apple.com/documentation/sirievaluations/siriresponse) — beta

### Results

- [SiriScenarioSubject](https://developer.apple.com/documentation/sirievaluations/siriscenariosubject) — beta
- [SiriTranscript](https://developer.apple.com/documentation/sirievaluations/siritranscript) — beta

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
