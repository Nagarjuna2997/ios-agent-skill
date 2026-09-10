# TranslationUIProvider

## Context

Load this when a task names **TranslationUIProvider** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/translationuiprovider) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide UI for translations of text people select.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TranslationUIProvider`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.4 | — | No |
| iPadOS | 18.4 | — | No |
| Mac Catalyst | 18.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Preparing your app to be the default translation app](https://developer.apple.com/documentation/translationuiprovider/preparing-your-app-to-be-the-default-translation-app)

### Creating translation app extensions

- [TranslationUIProviderContext](https://developer.apple.com/documentation/translationuiprovider/translationuiprovidercontext)
- [TranslationUIProviderExtension](https://developer.apple.com/documentation/translationuiprovider/translationuiproviderextension)
- [TranslationUIProviderExtensionScene](https://developer.apple.com/documentation/translationuiprovider/translationuiproviderextensionscene)

### Configuration and text selection

- [TranslationProviderUIExtensionConfiguration](https://developer.apple.com/documentation/translationuiprovider/translationprovideruiextensionconfiguration)
- [TranslationUIProviderSelectedTextScene](https://developer.apple.com/documentation/translationuiprovider/translationuiproviderselectedtextscene)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
