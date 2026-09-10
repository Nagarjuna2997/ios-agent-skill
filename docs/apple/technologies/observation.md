# Observation

## Context

Load this when a task names **Observation** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/observation) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Make responsive apps that update the presentation when underlying data changes.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Observation`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |
| macOS | 14.0 | — | No |
| tvOS | 17.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Observable conformance

- [Observable()](https://developer.apple.com/documentation/observation/observable())
- [Observable](https://developer.apple.com/documentation/observation/observable)

### Change tracking

- [withObservationTracking(_:onChange:)](https://developer.apple.com/documentation/observation/withobservationtracking(_:onchange:))
- [ObservationRegistrar](https://developer.apple.com/documentation/observation/observationregistrar)

### Observation in SwiftUI

- [Managing model data in your app](https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app)
- [Migrating from the Observable Object protocol to the Observable macro](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)

### Structures

- [ObservationTracking](https://developer.apple.com/documentation/observation/observationtracking)
- [Observations](https://developer.apple.com/documentation/observation/observations)

### Functions

- [withContinuousObservation(options:apply:)](https://developer.apple.com/documentation/observation/withcontinuousobservation(options:apply:))
- [withObservationTracking(options:_:onChange:)](https://developer.apple.com/documentation/observation/withobservationtracking(options:_:onchange:))

### Macros

- [ObservationIgnored()](https://developer.apple.com/documentation/observation/observationignored())
- [ObservationTracked()](https://developer.apple.com/documentation/observation/observationtracked())

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
