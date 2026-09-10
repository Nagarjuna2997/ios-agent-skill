# BrowserKit

## Context

Load this when a task names **BrowserKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/browserkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Transfer browser data to another browser or check a device’s eligibility to use an alternative browser engine.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `BrowserKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.4 | — | No |
| iPadOS | 18.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Transferring browsing data to another browser](https://developer.apple.com/documentation/browserkit/transferring-browsing-data-to-another-browser)
- [BEAvailability](https://developer.apple.com/documentation/browserkit/beavailability)

### Data export management

- [BEBrowserDataExportManager](https://developer.apple.com/documentation/browserkit/bebrowserdataexportmanager)
- [BEExportOptions](https://developer.apple.com/documentation/browserkit/beexportoptions)
- [BEExportMetadata](https://developer.apple.com/documentation/browserkit/beexportmetadata)

### Data import management

- [BEBrowserDataImportManager](https://developer.apple.com/documentation/browserkit/bebrowserdataimportmanager)
- [BEImportMetadata](https://developer.apple.com/documentation/browserkit/beimportmetadata)
- [BEImportOptions](https://developer.apple.com/documentation/browserkit/beimportoptions)

### Browser data

- [BEBrowserDataHistoryVisit](https://developer.apple.com/documentation/browserkit/bebrowserdatahistoryvisit)
- [BEBrowserDataBookmark](https://developer.apple.com/documentation/browserkit/bebrowserdatabookmark)
- [BEBrowserDataReadingListItem](https://developer.apple.com/documentation/browserkit/bebrowserdatareadinglistitem)
- [BEBrowserDataExtension](https://developer.apple.com/documentation/browserkit/bebrowserdataextension)
- [BEBrowserData](https://developer.apple.com/documentation/browserkit/bebrowserdata)

### Errors

- [BEBrowserDataExchangeError](https://developer.apple.com/documentation/browserkit/bebrowserdataexchangeerror-swift.struct)
- [BEBrowserDataExchangeErrorDomain](https://developer.apple.com/documentation/browserkit/bebrowserdataexchangeerrordomain)

### Classes

- [BEBrowserContentFilter](https://developer.apple.com/documentation/browserkit/bebrowsercontentfilter)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
