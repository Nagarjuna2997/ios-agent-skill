# Automated Device Enrollment

## Context

Load this when a task names **Automated Device Enrollment** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/automateddeviceenrollment) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Allow users of third-party MDM apps to add macOS and iOS devices to their organization.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Automated Device Enrollment`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.1 | — | No |
| iPadOS | 16.1 | — | No |
| Mac Catalyst | 16.1 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [automatedDeviceEnrollmentAddition(isPresented:)](https://developer.apple.com/documentation/swiftui/view/automateddeviceenrollmentaddition(ispresented:))
- [com.apple.developer.automated-device-enrollment.add-devices](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.automated-device-enrollment.add-devices)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
