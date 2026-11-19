# VisionEntitlementServices

## Context

Load this when a task names **VisionEntitlementServices** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/visionentitlementservices) · Source checked: 2026-11-18.

Apple’s short description (excerpt):

> Inspect an app’s visionOS Enterprise license state and its approved managed entitlements.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `VisionEntitlementServices`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reading license state

- [EnterpriseLicenseDetails](https://developer.apple.com/documentation/visionentitlementservices/enterpriselicensedetails)
- [EnterpriseLicenseDetails.EnterpriseEntitlement](https://developer.apple.com/documentation/visionentitlementservices/enterpriselicensedetails/enterpriseentitlement)
- [EnterpriseLicenseDetails.Status](https://developer.apple.com/documentation/visionentitlementservices/enterpriselicensedetails/status)

### App Compute Category

- [AppComputeCategory](https://developer.apple.com/documentation/visionentitlementservices/appcomputecategory)
- [AppComputeCategory.Status](https://developer.apple.com/documentation/visionentitlementservices/appcomputecategory/status-swift.enum)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
