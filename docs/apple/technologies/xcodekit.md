# XcodeKit

## Context

Load this when a task names **XcodeKit** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/xcodekit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create extensions to add commands to the Xcode source editor.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `XcodeKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.12 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a Source Editor Extension](https://developer.apple.com/documentation/xcodekit/creating-a-source-editor-extension)
- [Testing Your Source Editor Extension](https://developer.apple.com/documentation/xcodekit/testing-your-source-editor-extension)
- [XCSourceEditorExtension](https://developer.apple.com/documentation/xcodekit/xcsourceeditorextension)

### Editor Commands

- [XCSourceEditorCommand](https://developer.apple.com/documentation/xcodekit/xcsourceeditorcommand)
- [XCSourceEditorCommandInvocation](https://developer.apple.com/documentation/xcodekit/xcsourceeditorcommandinvocation)

### Source Text

- [XCSourceTextBuffer](https://developer.apple.com/documentation/xcodekit/xcsourcetextbuffer)
- [XCSourceTextPosition](https://developer.apple.com/documentation/xcodekit/xcsourcetextposition)
- [XCSourceTextRange](https://developer.apple.com/documentation/xcodekit/xcsourcetextrange)

### XcodeKit Constants

- [XcodeKit Version Constants](https://developer.apple.com/documentation/xcodekit/xcodekit-version-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
