# MarketplaceKit

## Context

Load this when a task names **MarketplaceKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/marketplacekit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create an alternative app marketplace, distribute your app on an alternative app marketplace, or distribute your app from your website.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MarketplaceKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 18.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating an alternative app marketplace](https://developer.apple.com/documentation/marketplacekit/creating-an-alternative-app-marketplace)
- [Distributing your app from your website](https://developer.apple.com/documentation/marketplacekit/distributing-your-app-from-your-website)
- [Distributing your app on an alternative app marketplace](https://developer.apple.com/documentation/marketplacekit/distributing-your-app-on-an-alternative-marketplace)

### Web services

- [Processing alternative app marketplace notifications](https://developer.apple.com/documentation/marketplacekit/processing-alternative-marketplace-notifications)
- [Ingesting an alternative distribution package](https://developer.apple.com/documentation/marketplacekit/ingesting-an-alternative-distribution-package)
- [Installing your app from your website](https://developer.apple.com/documentation/marketplacekit/installing-your-app-from-your-website)
- [Installing apps from an alternative marketplace](https://developer.apple.com/documentation/marketplacekit/installing-apps-from-an-alternative-marketplace)
- [Supplying an install verification token](https://developer.apple.com/documentation/marketplacekit/supplying-an-install-verification-token)

### Authorization

- [Reauthenticating a person to manage apps](https://developer.apple.com/documentation/marketplacekit/reauthenticating-a-person-to-manage-apps)
- [Providing age-rating appropriate content](https://developer.apple.com/documentation/marketplacekit/providing-age-rating-appropriate-content)
- [com.apple.developer.marketplace.app-installation](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.marketplace.app-installation)
- [com.apple.developer.browser.app-installation](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.browser.app-installation)
- [App License Delivery SDK](https://developer.apple.com/documentation/applicensedeliverysdk)

### Browser support

- [Enabling alternative distribution app installation in a browser](https://developer.apple.com/documentation/marketplacekit/enabling-alternative-distribution-app-installation-in-a-browser)

### App management

- [AppLibrary](https://developer.apple.com/documentation/marketplacekit/applibrary)
- [AppVersion](https://developer.apple.com/documentation/marketplacekit/appversion)
- [AutomaticUpdate](https://developer.apple.com/documentation/marketplacekit/automaticupdate)
- [InstallRequirements](https://developer.apple.com/documentation/marketplacekit/installrequirements)
- [AppleItemID](https://developer.apple.com/documentation/marketplacekit/appleitemid)
- [AppleVersionID](https://developer.apple.com/documentation/marketplacekit/appleversionid)
- [MarketplaceKitURIScheme](https://developer.apple.com/documentation/marketplacekit/marketplacekiturischeme)
- [RequestAppDeletionAction](https://developer.apple.com/documentation/marketplacekit/requestappdeletionaction)

### Background services

- [MarketplaceAppExtension](https://developer.apple.com/documentation/marketplacekit/marketplaceappextension)

### App distribution UI

- [ActionButton](https://developer.apple.com/documentation/marketplacekit/actionbutton)
- [InstallMetadata](https://developer.apple.com/documentation/marketplacekit/installmetadata)
- [InstallConfiguration](https://developer.apple.com/documentation/marketplacekit/installconfiguration)
- [InstallConfirmationResult](https://developer.apple.com/documentation/marketplacekit/installconfirmationresult)
- [BatchInstallConfiguration](https://developer.apple.com/documentation/marketplacekit/batchinstallconfiguration)
- [BatchInstallConfirmationResult](https://developer.apple.com/documentation/marketplacekit/batchinstallconfirmationresult)
- [MarketplaceDisplayOption](https://developer.apple.com/documentation/marketplacekit/marketplacedisplayoption)
- [MarketplaceSceneDelegate](https://developer.apple.com/documentation/marketplacekit/marketplacescenedelegate)

### Installation sources

- [AppDistributor](https://developer.apple.com/documentation/marketplacekit/appdistributor)

### Token and transaction reporting

- [Reporting transactions for the Core Technology Commission](https://developer.apple.com/documentation/marketplacekit/reporting-transactions-for-core-technology-commission)
- [TransactionReporting](https://developer.apple.com/documentation/marketplacekit/transactionreporting)

### Errors

- [MarketplaceKitError](https://developer.apple.com/documentation/marketplacekit/marketplacekiterror)

### Region support

- [Participating in alternative distribution for specific regions](https://developer.apple.com/documentation/marketplacekit/participating-in-alternative-distribution-for-specific-regions)

### Deprecations

- [MarketplaceExtension](https://developer.apple.com/documentation/marketplacekit/marketplaceextension) — deprecated
- [MarketplaceExtensionConfiguration](https://developer.apple.com/documentation/marketplacekit/marketplaceextensionconfiguration) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
