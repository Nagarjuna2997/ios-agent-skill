# Swift Testing

## Context

Load this when a task names **Swift Testing** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/testing) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create and run tests for your Swift packages and Xcode projects.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Swift Testing`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Swift | 6.0 | — | No |
| Xcode | 16.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Defining test functions](https://developer.apple.com/documentation/testing/definingtests)
- [Organizing test functions with suite types](https://developer.apple.com/documentation/testing/organizingtests)
- [Migrating a test from XCTest](https://developer.apple.com/documentation/testing/migratingfromxctest)
- [Test(_:_:)](https://developer.apple.com/documentation/testing/test(_:_:))
- [Test](https://developer.apple.com/documentation/testing/test)
- [Suite(_:_:)](https://developer.apple.com/documentation/testing/suite(_:_:))

### Test parameterization

- [Implementing parameterized tests](https://developer.apple.com/documentation/testing/parameterizedtesting)
- [Test(_:_:arguments:)](https://developer.apple.com/documentation/testing/test(_:_:arguments:)-8kn7a)
- [Test(_:_:arguments:_:)](https://developer.apple.com/documentation/testing/test(_:_:arguments:_:))
- [Test(_:_:arguments:)](https://developer.apple.com/documentation/testing/test(_:_:arguments:)-3rzok)
- [CustomTestArgumentEncodable](https://developer.apple.com/documentation/testing/customtestargumentencodable)
- [Test.Case](https://developer.apple.com/documentation/testing/test/case)

### Behavior validation

- [Expectations and confirmations](https://developer.apple.com/documentation/testing/expectations)
- [Known issues](https://developer.apple.com/documentation/testing/known-issues)

### Test customization

- [Traits](https://developer.apple.com/documentation/testing/traits)

### Value description and reflection

- [Describing and reflecting values](https://developer.apple.com/documentation/testing/describing-values)
- [CustomTestReflectable](https://developer.apple.com/documentation/testing/customtestreflectable)
- [CustomTestStringConvertible](https://developer.apple.com/documentation/testing/customteststringconvertible)

### Data collection

- [Attachments](https://developer.apple.com/documentation/testing/attachments)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
