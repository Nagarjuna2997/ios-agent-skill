# Safari Services

## Context

Load this when a task names **Safari Services** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/safariservices) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Enable web views and services in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Safari Services`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 7.0 | — | No |
| iPadOS | 7.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.12 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Safari web extensions

- [Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)

### Content blockers

- [Creating a content blocker](https://developer.apple.com/documentation/safariservices/creating-a-content-blocker)
- [SFContentBlockerManager](https://developer.apple.com/documentation/safariservices/sfcontentblockermanager)
- [SFContentBlockerState](https://developer.apple.com/documentation/safariservices/sfcontentblockerstate)

### Safari app extensions

- [Safari app extensions](https://developer.apple.com/documentation/safariservices/safari-app-extensions)
- [SFSafariExtension](https://developer.apple.com/documentation/safariservices/sfsafariextension)
- [SFSafariApplication](https://developer.apple.com/documentation/safariservices/sfsafariapplication)
- [SFSafariWindow](https://developer.apple.com/documentation/safariservices/sfsafariwindow)
- [SFSafariPage](https://developer.apple.com/documentation/safariservices/sfsafaripage)
- [SFSafariTab](https://developer.apple.com/documentation/safariservices/sfsafaritab)

### Safari content in your app

- [Importing data exported from Safari](https://developer.apple.com/documentation/safariservices/importing-data-exported-from-safari)
- [SFSafariViewController](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller)
- [SFAuthenticationSession.CompletionHandler](https://developer.apple.com/documentation/safariservices/sfauthenticationsession/completionhandler)
- [SFSafariSettings](https://developer.apple.com/documentation/safariservices/sfsafarisettings)

### Associated domains

- [Supporting associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [SFUniversalLink](https://developer.apple.com/documentation/safariservices/sfuniversallink)
- [Associated Domains Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.associated-domains)

### Availability

- [SFSafariServicesAvailable(_:)](https://developer.apple.com/documentation/safariservices/sfsafariservicesavailable(_:))
- [SFSafariServicesVersion](https://developer.apple.com/documentation/safariservices/sfsafariservicesversion)

### Safari Reading List

- [SSReadingList](https://developer.apple.com/documentation/safariservices/ssreadinglist)
- [SSReadingListErrorDomain](https://developer.apple.com/documentation/safariservices/ssreadinglisterrordomain)
- [SSReadingListError.Code](https://developer.apple.com/documentation/safariservices/ssreadinglisterror/code)
- [SSReadingListError](https://developer.apple.com/documentation/safariservices/ssreadinglisterror)

### Home Screen bookmarks

- [SFAddToHomeScreenActivityItem](https://developer.apple.com/documentation/safariservices/sfaddtohomescreenactivityitem)

### Miscellaneous errors

- [SFError](https://developer.apple.com/documentation/safariservices/sferror)
- [SFError.Code](https://developer.apple.com/documentation/safariservices/sferror/code)
- [SFErrorDomain](https://developer.apple.com/documentation/safariservices/sferrordomain)

### Deprecated

- [Deprecated symbols](https://developer.apple.com/documentation/safariservices/deprecated-symbols)

### Variables

- [SFSafariSettingsErrorDomain](https://developer.apple.com/documentation/safariservices/sfsafarisettingserrordomain)

### Enumerations

- [SFSafariSettingsError](https://developer.apple.com/documentation/safariservices/sfsafarisettingserror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
