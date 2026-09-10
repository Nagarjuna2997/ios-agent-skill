# File Provider UI

## Context

Load this when a task names **File Provider UI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/fileproviderui) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Add actions to the document browser’s context menu.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `File Provider UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 11.0 | — | No |
| iPadOS | 11.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 10.15 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Document Browser Customization

- [Adding Actions to the Context Menu](https://developer.apple.com/documentation/fileproviderui/adding-actions-to-the-context-menu)
- [FPUIActionExtensionViewController](https://developer.apple.com/documentation/fileproviderui/fpuiactionextensionviewcontroller)

### Errors

- [FPUIExtensionErrorCode](https://developer.apple.com/documentation/fileproviderui/fpuiextensionerrorcode)
- [FPUIErrorDomain](https://developer.apple.com/documentation/fileproviderui/fpuierrordomain)

### Reference

- [FileProviderUI Data Types](https://developer.apple.com/documentation/fileproviderui/fileproviderui-data-types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
