# XCTest

## Context

Load this when a task names **XCTest** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/xctest) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create and run unit tests, performance tests, and UI tests for your Xcode project.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `XCTest`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| xcode | 5.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Test cases and test methods

- [Defining Test Cases and Test Methods](https://developer.apple.com/documentation/xctest/defining-test-cases-and-test-methods)
- [XCTestCase](https://developer.apple.com/documentation/xctest/xctestcase)
- [XCTest](https://developer.apple.com/documentation/xctest/xctest)

### Test assertions

- [Boolean Assertions](https://developer.apple.com/documentation/xctest/boolean-assertions)
- [Nil and Non-Nil Assertions](https://developer.apple.com/documentation/xctest/nil-and-non-nil-assertions)
- [Equality and Inequality Assertions](https://developer.apple.com/documentation/xctest/equality-and-inequality-assertions)
- [Comparable Value Assertions](https://developer.apple.com/documentation/xctest/comparable-value-assertions)
- [Error Assertions](https://developer.apple.com/documentation/xctest/error-assertions)
- [NSException Assertions](https://developer.apple.com/documentation/xctest/nsexception-assertions)
- [Unconditional Test Failures](https://developer.apple.com/documentation/xctest/unconditional-test-failures)
- [Expected Failures](https://developer.apple.com/documentation/xctest/expected-failures)
- [Methods for Skipping Tests](https://developer.apple.com/documentation/xctest/methods-for-skipping-tests)

### Asynchronous tests

- [Asynchronous Tests and Expectations](https://developer.apple.com/documentation/xctest/asynchronous-tests-and-expectations)

### UI tests

- [XCUIAutomation](https://developer.apple.com/documentation/xcuiautomation)

### Performance tests

- [Performance Tests](https://developer.apple.com/documentation/xctest/performance-tests)

### Activities and attachments

- [Activities and Attachments](https://developer.apple.com/documentation/xctest/activities-and-attachments)

### Test execution

- [Test Execution and Observation](https://developer.apple.com/documentation/xctest/test-execution-and-observation)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/xctest/deprecated-symbols)

### Variables

- [XCT_UI_TESTING_AVAILABLE](https://developer.apple.com/documentation/xctest/xct_ui_testing_available)

### Functions

- [XCTAssertNoThrow(_:_:file:line:)](https://developer.apple.com/documentation/xctest/xctassertnothrow(_:_:file:line:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
