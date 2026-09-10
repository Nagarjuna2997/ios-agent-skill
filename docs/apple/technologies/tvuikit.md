# TVUIKit

## Context

Load this when a task names **TVUIKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/tvuikit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Show common user interface elements from Apple TV in your native app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TVUIKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| tvOS | 12.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Collections of content

- [Creating immersive experiences using a full-screen layout](https://developer.apple.com/documentation/tvuikit/creating-immersive-experiences-using-a-full-screen-layout)
- [TVCollectionViewFullScreenLayout](https://developer.apple.com/documentation/tvuikit/tvcollectionviewfullscreenlayout)
- [TVCollectionViewDelegateFullScreenLayout](https://developer.apple.com/documentation/tvuikit/tvcollectionviewdelegatefullscreenlayout)
- [TVCollectionViewFullScreenCell](https://developer.apple.com/documentation/tvuikit/tvcollectionviewfullscreencell)
- [TVCollectionViewFullScreenLayoutAttributes](https://developer.apple.com/documentation/tvuikit/tvcollectionviewfullscreenlayoutattributes)

### Content views

- [TVMediaItemContentView](https://developer.apple.com/documentation/tvuikit/tvmediaitemcontentview)
- [TVMonogramContentView](https://developer.apple.com/documentation/tvuikit/tvmonogramcontentview)

### Numeric input

- [TVDigitEntryViewController](https://developer.apple.com/documentation/tvuikit/tvdigitentryviewcontroller)

### Lockup views

- [TVLockupView](https://developer.apple.com/documentation/tvuikit/tvlockupview)
- [TVLockupViewComponent](https://developer.apple.com/documentation/tvuikit/tvlockupviewcomponent)
- [TVLockupHeaderFooterView](https://developer.apple.com/documentation/tvuikit/tvlockupheaderfooterview)
- [TVCardView](https://developer.apple.com/documentation/tvuikit/tvcardview)
- [TVPosterView](https://developer.apple.com/documentation/tvuikit/tvposterview)
- [TVCaptionButtonView](https://developer.apple.com/documentation/tvuikit/tvcaptionbuttonview)
- [TVMonogramView](https://developer.apple.com/documentation/tvuikit/tvmonogramview) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
