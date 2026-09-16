# Exposure Notification

## Context

Load this when a task names **Exposure Notification** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/exposurenotification) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Implement a COVID-19 exposure notification system that protects user privacy.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Exposure Notification`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 13.5 | — | No |
| iPadOS | 13.5 | — | No |
| Mac Catalyst | 13.5 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Supporting Exposure Notifications Express](https://developer.apple.com/documentation/exposurenotification/supporting-exposure-notifications-express)
- [Building an App to Notify Users of COVID-19 Exposure](https://developer.apple.com/documentation/exposurenotification/building-an-app-to-notify-users-of-covid-19-exposure)
- [Setting Up a Key Server](https://developer.apple.com/documentation/exposurenotification/setting-up-a-key-server)
- [ENManager](https://developer.apple.com/documentation/exposurenotification/enmanager) — deprecated
- [ENDeveloperRegion](https://developer.apple.com/documentation/bundleresources/information-property-list/endeveloperregion)
- [ENAPIVersion](https://developer.apple.com/documentation/bundleresources/information-property-list/enapiversion)
- [Changing Configuration Values Using the Server‑to‑Server API](https://developer.apple.com/documentation/exposurenotification/changing-configuration-values-using-the-server-to-server-api)
- [Testing Exposure Notifications Apps in iOS 13.7 and Later](https://developer.apple.com/documentation/exposurenotification/testing-exposure-notifications-apps-in-ios-13-7-and-later)
- [Supporting Exposure Notifications in iOS 12.5](https://developer.apple.com/documentation/exposurenotification/supporting-exposure-notifications-in-ios-12-5)

### Exposures

- [Configuring Exposure Notifications](https://developer.apple.com/documentation/exposurenotification/configuring-exposure-notifications)
- [ENExposureConfiguration](https://developer.apple.com/documentation/exposurenotification/enexposureconfiguration) — deprecated
- [ENExposureWindow](https://developer.apple.com/documentation/exposurenotification/enexposurewindow) — deprecated
- [ENScanInstance](https://developer.apple.com/documentation/exposurenotification/enscaninstance) — deprecated
- [Exposure Parameter Limits](https://developer.apple.com/documentation/exposurenotification/exposure-parameter-limits)

### Summaries

- [ENExposureDetectionSummary](https://developer.apple.com/documentation/exposurenotification/enexposuredetectionsummary) — deprecated
- [ENExposureDaySummary](https://developer.apple.com/documentation/exposurenotification/enexposuredaysummary) — deprecated
- [ENExposureSummaryItem](https://developer.apple.com/documentation/exposurenotification/enexposuresummaryitem) — deprecated

### Status

- [ENAuthorizationStatus](https://developer.apple.com/documentation/exposurenotification/enauthorizationstatus) — deprecated
- [ENStatus](https://developer.apple.com/documentation/exposurenotification/enstatus) — deprecated

### Errors

- [ENError](https://developer.apple.com/documentation/exposurenotification/enerror) — deprecated
- [ENError.Code](https://developer.apple.com/documentation/exposurenotification/enerror/code) — deprecated
- [ENErrorDomain](https://developer.apple.com/documentation/exposurenotification/enerrordomain) — deprecated
- [ENErrorHandler](https://developer.apple.com/documentation/exposurenotification/enerrorhandler) — deprecated

### Variables

- [ENRiskWeightDefaultV2](https://developer.apple.com/documentation/exposurenotification/enriskweightdefaultv2) — deprecated
- [ENRiskWeightMaxV2](https://developer.apple.com/documentation/exposurenotification/enriskweightmaxv2) — deprecated
- [EN_FEATURE_GENERAL](https://developer.apple.com/documentation/exposurenotification/en_feature_general)

### Type Aliases

- [ENDetectExposuresHandler](https://developer.apple.com/documentation/exposurenotification/endetectexposureshandler) — deprecated
- [ENErrorOutType](https://developer.apple.com/documentation/exposurenotification/enerrorouttype) — deprecated
- [ENGetDiagnosisKeysHandler](https://developer.apple.com/documentation/exposurenotification/engetdiagnosiskeyshandler) — deprecated
- [ENGetExposureInfoHandler](https://developer.apple.com/documentation/exposurenotification/engetexposureinfohandler) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
