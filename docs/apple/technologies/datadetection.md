# DataDetection

## Context

Load this when a task names **DataDetection** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/datadetection) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access and utilize common types of data that the data detection system matches.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DataDetection`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 12.0 | — | No |
| tvOS | 15.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 8.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Matched strings

- [DDMatch](https://developer.apple.com/documentation/datadetection/ddmatch)
- [DataDetector](https://developer.apple.com/documentation/datadetection/datadetector)

### Matched data types

- [DDMatchCalendarEvent](https://developer.apple.com/documentation/datadetection/ddmatchcalendarevent)
- [DDMatchEmailAddress](https://developer.apple.com/documentation/datadetection/ddmatchemailaddress)
- [DDMatchFlightNumber](https://developer.apple.com/documentation/datadetection/ddmatchflightnumber)
- [DDMatchLink](https://developer.apple.com/documentation/datadetection/ddmatchlink)
- [DDMatchMoneyAmount](https://developer.apple.com/documentation/datadetection/ddmatchmoneyamount)
- [DDMatchPhoneNumber](https://developer.apple.com/documentation/datadetection/ddmatchphonenumber)
- [DDMatchPostalAddress](https://developer.apple.com/documentation/datadetection/ddmatchpostaladdress)
- [DDMatchShipmentTrackingNumber](https://developer.apple.com/documentation/datadetection/ddmatchshipmenttrackingnumber)

### Pasteboard detectors

- [detectPatterns(for:completionHandler:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectpatterns(for:completionhandler:)-23vwn)
- [detectedPatterns(for:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectedpatterns(for:))
- [detectPatterns(for:inItemSet:completionHandler:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectpatterns(for:initemset:completionhandler:)-7ubl1)
- [detectedPatterns(for:inItemSet:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectedpatterns(for:initemset:))
- [detectValues(for:completionHandler:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectvalues(for:completionhandler:)-6adre)
- [detectedValues(for:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectedvalues(for:))
- [detectValues(for:inItemSet:completionHandler:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectvalues(for:initemset:completionhandler:)-pm9l)
- [detectedValues(for:inItemSet:)](https://developer.apple.com/documentation/uikit/uipasteboard/detectedvalues(for:initemset:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
