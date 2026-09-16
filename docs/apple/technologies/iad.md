# iAd

## Context

Load this when a task names **iAd** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/iad) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> The Apple Search Ads iAd Attribution API is a legacy framework for attributing app data that originates from Apple Search Ads campaigns on iOS devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `iAd`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 13.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [iAd Changelog](https://developer.apple.com/documentation/iad/iad-changelog)
- [Setting Up Apple Search Ads Attribution](https://developer.apple.com/documentation/iad/setting-up-apple-search-ads-attribution)
- [ADClient](https://developer.apple.com/documentation/iad/adclient) — deprecated

### Attribution Errors

- [ADClientErrorDomain](https://developer.apple.com/documentation/iad/adclienterrordomain) — deprecated
- [ADClientError](https://developer.apple.com/documentation/iad/adclienterror) — deprecated

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/iad/deprecated-symbols)

### Macros

- [ADCLIENT_DEPRECATED_IOS_71_145_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_ios_71_145_obsoleted_180)
- [ADCLIENT_DEPRECATED_IOS_71_150_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_ios_71_150_obsoleted_180)
- [ADCLIENT_DEPRECATED_IOS_90_145_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_ios_90_145_obsoleted_180)
- [ADCLIENT_DEPRECATED_MACOS_1014_113_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_macos_1014_113_obsoleted_180)
- [ADCLIENT_DEPRECATED_MACOS_1014_120_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_macos_1014_120_obsoleted_180)
- [ADCLIENT_DEPRECATED_TVOS_71_145_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_tvos_71_145_obsoleted_180)
- [ADCLIENT_DEPRECATED_TVOS_71_150_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_tvos_71_150_obsoleted_180)
- [ADCLIENT_DEPRECATED_TVOS_90_145_OBSOLETED_180](https://developer.apple.com/documentation/iad/adclient_deprecated_tvos_90_145_obsoleted_180)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
