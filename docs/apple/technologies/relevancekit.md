# RelevanceKit

## Context

Load this when a task names **RelevanceKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/relevancekit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide on-device intelligence with contextual clues that increase your widget’s visibility on Apple Watch.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `RelevanceKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |
| watchOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Providing relevance information

- [Increasing the visibility of widgets in Smart Stacks](https://developer.apple.com/documentation/widgetkit/widget-suggestions-in-smart-stacks)
- [RelevantContext](https://developer.apple.com/documentation/relevancekit/relevantcontext)

### Fitness clues

- [fitness(_:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/fitness(_:))
- [RelevantContext.FitnessCondition](https://developer.apple.com/documentation/relevancekit/relevantcontext/fitnesscondition)

### Hardware clues

- [hardware(headphones:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/hardware(headphones:))
- [RelevantContext.HeadphonesCondition](https://developer.apple.com/documentation/relevancekit/relevantcontext/headphonescondition)

### Location clues

- [location(_:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/location(_:))
- [location(inferred:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/location(inferred:))
- [RelevantContext.InferredLocation](https://developer.apple.com/documentation/relevancekit/relevantcontext/inferredlocation)

### Sleep clues

- [sleep(_:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/sleep(_:))
- [RelevantContext.SleepCondition](https://developer.apple.com/documentation/relevancekit/relevantcontext/sleepcondition)

### Time clues

- [date(_:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/date(_:))
- [date(_:kind:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/date(_:kind:))
- [date(interval:kind:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/date(interval:kind:))
- [date(range:kind:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/date(range:kind:))
- [RelevantContext.DateKind](https://developer.apple.com/documentation/relevancekit/relevantcontext/datekind)
- [date(from:to:)](https://developer.apple.com/documentation/relevancekit/relevantcontext/date(from:to:)) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
