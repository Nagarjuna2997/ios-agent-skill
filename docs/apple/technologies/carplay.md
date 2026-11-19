# CarPlay

## Context

Load this when a task names **CarPlay** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/carplay) · Source checked: 2026-11-18.

Apple’s short description (excerpt):

> Deliver your iOS app’s audio, video, messaging, VoIP calling, navigation, or other features in CarPlay environments.

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

### Essentials

- [Preparing your iOS app for CarPlay development](https://developer.apple.com/documentation/carplay/preparing-your-ios-app-for-carplay-development)

### App management

- [Building your app’s initial CarPlay interface](https://developer.apple.com/documentation/carplay/building-your-apps-initial-carplay-interface)
- [CPTemplateApplicationScene](https://developer.apple.com/documentation/carplay/cptemplateapplicationscene)
- [CPTemplateApplicationSceneDelegate](https://developer.apple.com/documentation/carplay/cptemplateapplicationscenedelegate)
- [CPInterfaceController](https://developer.apple.com/documentation/carplay/cpinterfacecontroller)
- [CPSessionConfiguration](https://developer.apple.com/documentation/carplay/cpsessionconfiguration)
- [CPWindow](https://developer.apple.com/documentation/carplay/cpwindow)

### Interface templates

- [CPTabBarTemplate](https://developer.apple.com/documentation/carplay/cptabbartemplate)
- [CPListTemplate](https://developer.apple.com/documentation/carplay/cplisttemplate)
- [CPGridTemplate](https://developer.apple.com/documentation/carplay/cpgridtemplate)
- [CPMapTemplate](https://developer.apple.com/documentation/carplay/cpmaptemplate)
- [CPNowPlayingTemplate](https://developer.apple.com/documentation/carplay/cpnowplayingtemplate)
- [CPPointOfInterestTemplate](https://developer.apple.com/documentation/carplay/cppointofinteresttemplate)
- [CPInformationTemplate](https://developer.apple.com/documentation/carplay/cpinformationtemplate)
- [CPContactTemplate](https://developer.apple.com/documentation/carplay/cpcontacttemplate)
- [CPSearchTemplate](https://developer.apple.com/documentation/carplay/cpsearchtemplate)
- [CPVoiceControlTemplate](https://developer.apple.com/documentation/carplay/cpvoicecontroltemplate)
- [CPActionSheetTemplate](https://developer.apple.com/documentation/carplay/cpactionsheettemplate)
- [CPAlertTemplate](https://developer.apple.com/documentation/carplay/cpalerttemplate)
- [All templates and supporting types](https://developer.apple.com/documentation/carplay/all-templates-and-supporting-types)

### CarPlay app types

- [Audio](https://developer.apple.com/documentation/carplay/audio)
- [Communication](https://developer.apple.com/documentation/carplay/communication-apps)
- [Driving task](https://developer.apple.com/documentation/carplay/driving-task)
- [EV charging](https://developer.apple.com/documentation/carplay/ev-charging)
- [Fueling](https://developer.apple.com/documentation/carplay/fueling)
- [Navigation](https://developer.apple.com/documentation/carplay/navigation-apps)
- [Parking](https://developer.apple.com/documentation/carplay/parking)
- [Public safety](https://developer.apple.com/documentation/carplay/public-safety)
- [Quick food ordering](https://developer.apple.com/documentation/carplay/quick-food-ordering)
- [Video](https://developer.apple.com/documentation/carplay/video)
- [Voice-based conversation](https://developer.apple.com/documentation/carplay/voice-based-conversation)

### Testing

- [Testing your app in CarPlay Simulator](https://developer.apple.com/documentation/carplay/testing-your-app-in-carplay-simulator)

### Errors

- [CarPlayErrorDomain](https://developer.apple.com/documentation/carplay/carplayerrordomain)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/carplay/deprecated-symbols)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
