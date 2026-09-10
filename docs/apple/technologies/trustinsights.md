# Trust Insights

## Context

Load this when a task names **Trust Insights** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/trustinsights) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Evaluate transactions for potential coercive activity while preserving people’s privacy.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Trust Insights`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Obtaining permission or checking authorization to perform evaluations

- [requestAuthorization(for:)](https://developer.apple.com/documentation/trustinsights/insightevaluator/requestauthorization(for:))
- [authorizationStatus(for:)](https://developer.apple.com/documentation/trustinsights/insightevaluator/authorizationstatus(for:))
- [InsightEvaluator.AuthorizationStatus](https://developer.apple.com/documentation/trustinsights/insightevaluator/authorizationstatus)

### Creating an insight evaluation

- [init()](https://developer.apple.com/documentation/trustinsights/insightevaluator/init())

### Requesting an evaluation

- [InsightEvaluator](https://developer.apple.com/documentation/trustinsights/insightevaluator)
- [requestEvaluation(context:)](https://developer.apple.com/documentation/trustinsights/insightevaluator/requestevaluation(context:))
- [InsightEvaluation](https://developer.apple.com/documentation/trustinsights/insightevaluation)
- [TrustInsight](https://developer.apple.com/documentation/trustinsights/trustinsight)

### Evaluating insight signals

- [IsLikelyBeingCoachedInsight](https://developer.apple.com/documentation/trustinsights/islikelybeingcoachedinsight)

### Receiving evaluation notifications and handling errors

- [InsightEvaluationConsumptionStatus](https://developer.apple.com/documentation/trustinsights/insightevaluationconsumptionstatus)
- [InsightError](https://developer.apple.com/documentation/trustinsights/insighterror)

### Providing feedback

- [reportConsumption(_:insightIDsUsed:)](https://developer.apple.com/documentation/trustinsights/insightevaluation/reportconsumption(_:insightidsused:))
- [reportConsumption(_:insightsUsed:)](https://developer.apple.com/documentation/trustinsights/insightevaluation/reportconsumption(_:insightsused:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
