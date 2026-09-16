# Automatic Assessment Configuration

## Context

Load this when a task names **Automatic Assessment Configuration** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/automaticassessmentconfiguration) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Enter single-app mode and prevent students from accessing specific system features while taking an exam.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Automatic Assessment Configuration`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.4 | — | No |
| iPadOS | 13.4 | — | No |
| Mac Catalyst | 13.4 | — | No |
| macOS | 10.15.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.automatic-assessment-configuration](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.automatic-assessment-configuration)

### Sessions

- [Preparing an educational assessment app for distribution](https://developer.apple.com/documentation/automaticassessmentconfiguration/preparing-an-educational-assessment-app-for-distribution)
- [Build an Educational Assessment App](https://developer.apple.com/documentation/automaticassessmentconfiguration/build-an-educational-assessment-app)
- [AEAssessmentConfiguration](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentconfiguration)
- [AEAssessmentSession](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentsession)

### Errors

- [AEAssessmentError](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmenterror)
- [AEAssessmentError.Code](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmenterror/code)
- [AEAssessmentErrorDomain](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmenterrordomain)

### Classes

- [AEAssessmentBinaryExecutable](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentbinaryexecutable)
- [AEAssessmentBinaryExecutableConfiguration](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentbinaryexecutableconfiguration)

### Structures

- [AEAppleMenuItem](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeapplemenuitem)
- [AEMenuBarItem](https://developer.apple.com/documentation/automaticassessmentconfiguration/aemenubaritem)

### Enumerations

- [AEUserAccountType](https://developer.apple.com/documentation/automaticassessmentconfiguration/aeuseraccounttype)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
