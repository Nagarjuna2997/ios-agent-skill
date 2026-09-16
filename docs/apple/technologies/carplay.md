# CarPlay

## Context

Load this when a task names **CarPlay** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/carplay) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Integrate CarPlay in apps related to audio, communication, navigation, parking, EV charging, food ordering, and more.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CarPlay`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 12.0 | — | No |
| iPadOS | 12.0 | — | No |
| Mac Catalyst | 14.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### CarPlay Integration

- [Requesting CarPlay Entitlements](https://developer.apple.com/documentation/carplay/requesting-carplay-entitlements)
- [Displaying Content in CarPlay](https://developer.apple.com/documentation/carplay/displaying-content-in-carplay)
- [Supporting Previous Versions of iOS](https://developer.apple.com/documentation/carplay/supporting-previous-versions-of-ios)
- [Using the CarPlay Simulator](https://developer.apple.com/documentation/carplay/using-the-carplay-simulator)
- [CPTemplateApplicationScene](https://developer.apple.com/documentation/carplay/cptemplateapplicationscene)
- [CPTemplateApplicationSceneDelegate](https://developer.apple.com/documentation/carplay/cptemplateapplicationscenedelegate)
- [CPSessionConfiguration](https://developer.apple.com/documentation/carplay/cpsessionconfiguration)

### General Purpose Templates

- [CPListTemplate](https://developer.apple.com/documentation/carplay/cplisttemplate)
- [CPGridTemplate](https://developer.apple.com/documentation/carplay/cpgridtemplate)
- [CPTabBarTemplate](https://developer.apple.com/documentation/carplay/cptabbartemplate)
- [CPTemplate](https://developer.apple.com/documentation/carplay/cptemplate)
- [CPBarButtonProviding](https://developer.apple.com/documentation/carplay/cpbarbuttonproviding)

### Audio

- [Integrating CarPlay with Your Music App](https://developer.apple.com/documentation/carplay/integrating-carplay-with-your-music-app)
- [CPNowPlayingTemplate](https://developer.apple.com/documentation/carplay/cpnowplayingtemplate)

### Instrument cluster

- [CPInstrumentClusterController](https://developer.apple.com/documentation/carplay/cpinstrumentclustercontroller)
- [CPInstrumentClusterControllerDelegate](https://developer.apple.com/documentation/carplay/cpinstrumentclustercontrollerdelegate)
- [CPTemplateApplicationInstrumentClusterScene](https://developer.apple.com/documentation/carplay/cptemplateapplicationinstrumentclusterscene)
- [CPTemplateApplicationInstrumentClusterSceneDelegate](https://developer.apple.com/documentation/carplay/cptemplateapplicationinstrumentclusterscenedelegate)

### Navigation

- [Integrating CarPlay with Your Navigation App](https://developer.apple.com/documentation/carplay/integrating-carplay-with-your-navigation-app)
- [CPTemplateApplicationDashboardScene](https://developer.apple.com/documentation/carplay/cptemplateapplicationdashboardscene)
- [CPTemplateApplicationDashboardSceneDelegate](https://developer.apple.com/documentation/carplay/cptemplateapplicationdashboardscenedelegate)
- [CPMapTemplate](https://developer.apple.com/documentation/carplay/cpmaptemplate)
- [CPSearchTemplate](https://developer.apple.com/documentation/carplay/cpsearchtemplate)
- [CPVoiceControlTemplate](https://developer.apple.com/documentation/carplay/cpvoicecontroltemplate)

### Location and Information

- [CPPointOfInterestTemplate](https://developer.apple.com/documentation/carplay/cppointofinteresttemplate)
- [CPInformationTemplate](https://developer.apple.com/documentation/carplay/cpinformationtemplate)
- [CPTextButton](https://developer.apple.com/documentation/carplay/cptextbutton)
- [Integrating CarPlay with your quick-ordering app](https://developer.apple.com/documentation/carplay/integrating-carplay-with-your-quick-ordering-app)

### Maneuvers

- [CPManeuver](https://developer.apple.com/documentation/carplay/cpmaneuver)
- [CPManeuverState](https://developer.apple.com/documentation/carplay/cpmaneuverstate)
- [CPManeuverType](https://developer.apple.com/documentation/carplay/cpmaneuvertype)

### Routes, lanes and junctions

- [CPRouteInformation](https://developer.apple.com/documentation/carplay/cprouteinformation)
- [CPLane](https://developer.apple.com/documentation/carplay/cplane)
- [CPLaneGuidance](https://developer.apple.com/documentation/carplay/cplaneguidance)
- [CPLaneStatus](https://developer.apple.com/documentation/carplay/cplanestatus)
- [CPJunctionType](https://developer.apple.com/documentation/carplay/cpjunctiontype)

### Communication

- [CPContactTemplate](https://developer.apple.com/documentation/carplay/cpcontacttemplate)

### Actions and Alerts

- [CPActionSheetTemplate](https://developer.apple.com/documentation/carplay/cpactionsheettemplate)
- [CPAlertTemplate](https://developer.apple.com/documentation/carplay/cpalerttemplate)
- [CPAlertAction](https://developer.apple.com/documentation/carplay/cpalertaction)

### Related Types

- [CPButton](https://developer.apple.com/documentation/carplay/cpbutton)
- [CPImageSet](https://developer.apple.com/documentation/carplay/cpimageset)
- [CarPlayErrorDomain](https://developer.apple.com/documentation/carplay/carplayerrordomain)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/carplay/deprecated-symbols)

### Reference

- [CarPlay Enumerations](https://developer.apple.com/documentation/carplay/carplay-enumerations)
- [CarPlay Constants](https://developer.apple.com/documentation/carplay/carplay-constants)

### Classes

- [CPChargingStationConnection](https://developer.apple.com/documentation/carplay/cpchargingstationconnection)
- [CPImageOverlay](https://developer.apple.com/documentation/carplay/cpimageoverlay)
- [CPListImageRowItemCardElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemcardelement)
- [CPListImageRowItemCondensedElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemcondensedelement)
- [CPListImageRowItemElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemelement)
- [CPListImageRowItemGridElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemgridelement)
- [CPListImageRowItemImageGridElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemimagegridelement)
- [CPListImageRowItemRowElement](https://developer.apple.com/documentation/carplay/cplistimagerowitemrowelement)
- [CPListTemplateDetailsHeader](https://developer.apple.com/documentation/carplay/cplisttemplatedetailsheader)
- [CPMapPanel](https://developer.apple.com/documentation/carplay/cpmappanel)
- [CPMapPanelButtonConfiguration](https://developer.apple.com/documentation/carplay/cpmappanelbuttonconfiguration)
- [CPMapPanelItem](https://developer.apple.com/documentation/carplay/cpmappanelitem)
- [CPMapPanelSection](https://developer.apple.com/documentation/carplay/cpmappanelsection)
- [CPMapTemplateWaypoint](https://developer.apple.com/documentation/carplay/cpmaptemplatewaypoint)
- [CPMessageGridItemConfiguration](https://developer.apple.com/documentation/carplay/cpmessagegriditemconfiguration)
- [CPMultiStopCardConfiguration](https://developer.apple.com/documentation/carplay/cpmultistopcardconfiguration)
- [CPNavigationWaypoint](https://developer.apple.com/documentation/carplay/cpnavigationwaypoint)
- [CPNowPlayingMode](https://developer.apple.com/documentation/carplay/cpnowplayingmode)
- [CPNowPlayingModeSports](https://developer.apple.com/documentation/carplay/cpnowplayingmodesports)
- [CPNowPlayingSportsClock](https://developer.apple.com/documentation/carplay/cpnowplayingsportsclock)
- [CPNowPlayingSportsEventStatus](https://developer.apple.com/documentation/carplay/cpnowplayingsportseventstatus)
- [CPNowPlayingSportsTeam](https://developer.apple.com/documentation/carplay/cpnowplayingsportsteam)
- [CPNowPlayingSportsTeamLogo](https://developer.apple.com/documentation/carplay/cpnowplayingsportsteamlogo)
- [CPPanel](https://developer.apple.com/documentation/carplay/cppanel)
- [CPPanelButtonConfiguration](https://developer.apple.com/documentation/carplay/cppanelbuttonconfiguration)
- [CPPanelItem](https://developer.apple.com/documentation/carplay/cppanelitem)
- [CPPlaybackConfiguration](https://developer.apple.com/documentation/carplay/cpplaybackconfiguration)
- [CPRouteDetail](https://developer.apple.com/documentation/carplay/cproutedetail)
- [CPRouteSegment](https://developer.apple.com/documentation/carplay/cproutesegment)
- [CPSportsOverlay](https://developer.apple.com/documentation/carplay/cpsportsoverlay)
- [CPThumbnailImage](https://developer.apple.com/documentation/carplay/cpthumbnailimage)

### Protocols

- [CPPlayableItem](https://developer.apple.com/documentation/carplay/cpplayableitem)

### Structures

- [CPLocationCoordinate3D](https://developer.apple.com/documentation/carplay/cplocationcoordinate3d)

### Variables

- [CPMaximumMessageItemLeadingDetailTextImageSize](https://developer.apple.com/documentation/carplay/cpmaximummessageitemleadingdetailtextimagesize)

### Functions

- [NSStringFromCPJunctionType(_:)](https://developer.apple.com/documentation/carplay/nsstringfromcpjunctiontype(_:))
- [NSStringFromCPLaneStatus(_:)](https://developer.apple.com/documentation/carplay/nsstringfromcplanestatus(_:))
- [NSStringFromCPManeuverType(_:)](https://developer.apple.com/documentation/carplay/nsstringfromcpmaneuvertype(_:))
- [NSStringFromCPRerouteReason(_:)](https://developer.apple.com/documentation/carplay/nsstringfromcpreroutereason(_:))
- [NSStringFromCPTrafficSide(_:)](https://developer.apple.com/documentation/carplay/nsstringfromcptrafficside(_:))

### Enumerations

- [CPRerouteReason](https://developer.apple.com/documentation/carplay/cpreroutereason)
- [CPRouteSource](https://developer.apple.com/documentation/carplay/cproutesource)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
