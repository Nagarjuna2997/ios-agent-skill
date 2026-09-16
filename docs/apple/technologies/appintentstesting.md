# App Intents Testing

## Context

Load this when a task names **App Intents Testing** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/appintentstesting) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Test your app intents, entities, queries, and integration with system features like Siri or Spotlight.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `App Intents Testing`.

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
| watchOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Testing your App Intents code](https://developer.apple.com/documentation/appintentstesting/testing-your-app-intents-code)

### Intents, entities, enums, and queries

- [IntentDefinitions](https://developer.apple.com/documentation/appintentstesting/intentdefinitions)

### Intent and query result verification

- [ResolvedIntentResult](https://developer.apple.com/documentation/appintentstesting/resolvedintentresult)
- [ResolvedValueQueryResult](https://developer.apple.com/documentation/appintentstesting/resolvedvaluequeryresult)

### Entity annotation testing

- [ViewAnnotation](https://developer.apple.com/documentation/appintentstesting/viewannotation)

### Intermediate types

- [AnyAppIntent](https://developer.apple.com/documentation/appintentstesting/anyappintent)
- [AnyAppEntity](https://developer.apple.com/documentation/appintentstesting/anyappentity)
- [AnyEntityQuery](https://developer.apple.com/documentation/appintentstesting/anyentityquery)
- [AnyAppEnum](https://developer.apple.com/documentation/appintentstesting/anyappenum)
- [AnyTransientAppEntity](https://developer.apple.com/documentation/appintentstesting/anytransientappentity)

### Supporting types

- [AppIntentTypeDefinition](https://developer.apple.com/documentation/appintentstesting/appintenttypedefinition)
- [DynamicPropertyPath](https://developer.apple.com/documentation/appintentstesting/dynamicpropertypath)
- [DynamicPropertyPathCollection](https://developer.apple.com/documentation/appintentstesting/dynamicpropertypathcollection)
- [IntentValuePropertiesCallable](https://developer.apple.com/documentation/appintentstesting/intentvaluepropertiescallable)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
