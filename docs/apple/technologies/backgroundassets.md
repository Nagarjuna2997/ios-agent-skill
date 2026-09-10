# Background Assets

## Context

Load this when a task names **Background Assets** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/backgroundassets) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Improve or eliminate the time people wait while your app downloads assets.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Background Assets`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 18.4 | — | No |
| visionOS | 2.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating managed asset packs](https://developer.apple.com/documentation/backgroundassets/creating-managed-asset-packs)
- [Downloading Apple-hosted asset packs](https://developer.apple.com/documentation/backgroundassets/downloading-apple-hosted-asset-packs)
- [Testing asset packs locally](https://developer.apple.com/documentation/backgroundassets/testing-asset-packs-locally)
- [Reducing download and storage demands with localized asset packs](https://developer.apple.com/documentation/backgroundassets/reducing-download-and-storage-demands-with-localized-asset-packs)

### Managed asset packs

- [AssetPack](https://developer.apple.com/documentation/backgroundassets/assetpack)
- [AssetPackManager](https://developer.apple.com/documentation/backgroundassets/assetpackmanager)
- [AssetPackManifest](https://developer.apple.com/documentation/backgroundassets/assetpackmanifest)
- [ManagedDownloaderExtension](https://developer.apple.com/documentation/backgroundassets/manageddownloaderextension)
- [BAAppGroupID](https://developer.apple.com/documentation/bundleresources/information-property-list/baappgroupid)
- [BAHasManagedAssetPacks](https://developer.apple.com/documentation/bundleresources/information-property-list/bahasmanagedassetpacks)

### Apple-hosted managed asset packs

- [BAUsesAppleHosting](https://developer.apple.com/documentation/bundleresources/information-property-list/bausesapplehosting)

### Self-hosted unmanaged asset packs

- [AssetPackManifest](https://developer.apple.com/documentation/backgroundassets/assetpackmanifest)

### Unmanaged asset downloads

- [Configuring an unmanaged Background Assets project](https://developer.apple.com/documentation/backgroundassets/configuring-an-unmanaged-background-assets-project)
- [Downloading essential assets in the background](https://developer.apple.com/documentation/backgroundassets/downloading-essential-assets-in-the-background)
- [BAManifestURL](https://developer.apple.com/documentation/bundleresources/information-property-list/bamanifesturl)
- [BAInitialDownloadRestrictions](https://developer.apple.com/documentation/bundleresources/information-property-list/bainitialdownloadrestrictions)
- [BAEssentialMaxInstallSize](https://developer.apple.com/documentation/bundleresources/information-property-list/baessentialmaxinstallsize)
- [BAMaxInstallSize](https://developer.apple.com/documentation/bundleresources/information-property-list/bamaxinstallsize)
- [BADownloadManager](https://developer.apple.com/documentation/backgroundassets/badownloadmanager)
- [BADownloaderExtension](https://developer.apple.com/documentation/backgroundassets/badownloaderextension-qwaw)
- [BADownloaderExtensionConfiguration](https://developer.apple.com/documentation/backgroundassets/badownloaderextensionconfiguration)
- [BAURLDownload](https://developer.apple.com/documentation/backgroundassets/baurldownload)
- [BADownload](https://developer.apple.com/documentation/backgroundassets/badownload)

### Errors

- [ManagedBackgroundAssetsError](https://developer.apple.com/documentation/backgroundassets/managedbackgroundassetserror)
- [BAErrorDomain](https://developer.apple.com/documentation/backgroundassets/baerrordomain)
- [BAErrorCode](https://developer.apple.com/documentation/backgroundassets/baerrorcode)
- [AssetPackManager.LocalAvailabilityError](https://developer.apple.com/documentation/backgroundassets/assetpackmanager/localavailabilityerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
