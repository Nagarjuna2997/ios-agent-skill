# Apple documentation change audit — September 29, 2026

## Scope and evidence

Refetched all 405 technology landing pages against baseline `6b1fb452745d72fef73e9e3910220be2eef82e49`. Found 25 changed pages, no added or removed directory entries, and 18 topic URLs absent from their former landing pages. 15 of those URLs still return documentation; the other fetch results are recorded below. A delisted link is not an API-removal diagnostic.

The [machine-readable audit](source-audit-2026-09-29.json) records changed topic links, current deprecation metadata, fetch status and SHA-256 hashes of available delisted documents. This does not audit every symbol body, compile every example, or establish behavior on every iOS version. Full documentation bodies are not republished.

## Important corrections

- Apple Ads landing metadata now marks that entry deprecated. Consult the Apple source before choosing a replacement; this is not a claim that all advertising frameworks are deprecated.
- ATT replaces the indexed expanded-prompt parameter label; inspect the current signature and SDK before migration.
- Xcode 27.2 beta 2 resolves previously documented Device Hub input defects and adds an Apple MCP coverage tool.
- App Store Connect API 4.5 adds resources and deprecates app-tag territory relationships.
- September 28 TestFlight eligibility includes the listed beta 2 SDKs; it does not imply production submission approval.

## Changed landing pages

| Technology | Added topic links | Delisted topic links | Current deprecated flag |
|---|---:|---:|---|
| [Advanced Commerce API](https://developer.apple.com/documentation/advancedcommerceapi) | 0 | 0 | False |
| [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi) | 4 | 0 | False |
| [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency) | 1 | 1 | False |
| [Apple Ads](https://developer.apple.com/documentation/apple_ads) | 0 | 0 | True |
| [Background Assets](https://developer.apple.com/documentation/backgroundassets) | 1 | 0 | False |
| [Compute Graph](https://developer.apple.com/documentation/computegraph) | 11 | 0 | False |
| [Core Location](https://developer.apple.com/documentation/corelocation) | 0 | 0 | False |
| [Core Motion](https://developer.apple.com/documentation/coremotion) | 0 | 0 | False |
| [Image I/O](https://developer.apple.com/documentation/imageio) | 0 | 1 | False |
| [iOS & iPadOS Release Notes](https://developer.apple.com/documentation/ios-ipados-release-notes) | 0 | 0 | False |
| [macOS Release Notes](https://developer.apple.com/documentation/macos-release-notes) | 0 | 0 | False |
| [Nearby Interaction](https://developer.apple.com/documentation/nearbyinteraction) | 0 | 5 | False |
| [Safari Release Notes](https://developer.apple.com/documentation/safari-release-notes) | 1 | 0 | False |
| [Sample Code Library](https://developer.apple.com/documentation/samplecode) | 3 | 0 | False |
| [SCSIControllerDriverKit](https://developer.apple.com/documentation/scsicontrollerdriverkit) | 1 | 1 | False |
| [SCSIPeripheralsDriverKit](https://developer.apple.com/documentation/scsiperipheralsdriverkit) | 2 | 2 | False |
| [StoreKit](https://developer.apple.com/documentation/storekit) | 1 | 0 | False |
| [StoreKit Test](https://developer.apple.com/documentation/storekittest) | 0 | 0 | False |
| [Swift](https://developer.apple.com/documentation/swift) | 0 | 1 | False |
| [Technotes](https://developer.apple.com/documentation/technotes) | 0 | 0 | False |
| [tvOS Release Notes](https://developer.apple.com/documentation/tvos-release-notes) | 0 | 0 | False |
| [UIKit](https://developer.apple.com/documentation/uikit) | 0 | 7 | False |
| [visionOS Release Notes](https://developer.apple.com/documentation/visionos-release-notes) | 0 | 0 | False |
| [watchOS Release Notes](https://developer.apple.com/documentation/watchos-release-notes) | 0 | 0 | False |
| [Xcode Release Notes](https://developer.apple.com/documentation/xcode-release-notes) | 1 | 0 | False |

## Delisted URL verification

| Source | Result |
|---|---|
| [Documentation](https://developer.apple.com/documentation/apptrackingtransparency/attrackingmanager/requesttrackingauthorization(usingexpandedinterface:additionalinformationaction:completionhandler:)) | http-error 404 |
| [Documentation](https://developer.apple.com/documentation/bundleresources/information-property-list/nsnearbyinteractionallowonceusagedescription) | available  |
| [Documentation](https://developer.apple.com/documentation/bundleresources/information-property-list/nsnearbyinteractionusagedescription) | available  |
| [Documentation](https://developer.apple.com/documentation/imageio/kcgimagesourceallowabletypes) | available  |
| [Documentation](https://developer.apple.com/documentation/nearbyinteraction/nialgorithmconvergencestatus-2fnve) | available  |
| [Documentation](https://developer.apple.com/documentation/nearbyinteraction/nierror/code) | available  |
| [Documentation](https://developer.apple.com/documentation/nearbyinteraction/nimotionactivitystate) | available  |
| [Documentation](https://developer.apple.com/documentation/scsicontrollerdriverkit/kmaxbundledparalleltasks) | available  |
| [Documentation](https://developer.apple.com/documentation/scsiperipheralsdriverkit/scsiperipheralsdriverkit-data-types) | http-error 404 |
| [Documentation](https://developer.apple.com/documentation/scsiperipheralsdriverkit/scsiperipheralsdriverkit-enumerations) | http-error 404 |
| [Documentation](https://developer.apple.com/documentation/swift/iterable) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/preview(_:traits:arguments:body:)-6gm4c) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/preview(_:traits:arguments:body:)-7cbjv) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/uiconfigurationtextattributestransformer-swift.struct) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/uitextgrammarcheckingtype) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/uitraitbridgedenvironmentkey) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/uitraitnavigationtitlealignment-swift.struct) | available  |
| [Documentation](https://developer.apple.com/documentation/uikit/uitraitsystemprefersreducedresourceusage-swift.struct) | available  |

The guessed iOS 27.1 release-notes endpoint also returned 404; no removal conclusion is drawn because the baseline did not establish it as an existing page. Xcode 27.1 release notes are present in the refreshed directory.

## Remaining verification

SwiftUI/UIKit update articles, iOS 27 and 27.2 notes, Xcode 27.2 notes, and API 4.5 notes were inspected. Installed Xcode is 27.0, not 27.2 beta 2; new beta behavior and generated client migrations remain untested. Framework samples were not all recompiled during this documentation-only pass. The source refresh validates landing-page availability, not every outbound topic link.
