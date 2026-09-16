# WatchKit

## Context

Load this when a task names **WatchKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/watchkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build watchOS apps that use features the app delegate monitors or controls, such as background tasks and extended runtime sessions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `WatchKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### App structure

- [Setting up a watchOS project](https://developer.apple.com/documentation/watchos-apps/setting-up-a-watchos-project)
- [WKApplication](https://developer.apple.com/documentation/watchkit/wkapplication)
- [WKApplicationDelegate](https://developer.apple.com/documentation/watchkit/wkapplicationdelegate)
- [WKExtension](https://developer.apple.com/documentation/watchkit/wkextension) — deprecated
- [WKExtensionDelegate](https://developer.apple.com/documentation/watchkit/wkextensiondelegate) — deprecated
- [WKApplicationMain(_:_:_:)](https://developer.apple.com/documentation/watchkit/wkapplicationmain(_:_:_:))
- [WKInterfaceDevice](https://developer.apple.com/documentation/watchkit/wkinterfacedevice)
- [WKPrefersNetworkUponForeground](https://developer.apple.com/documentation/bundleresources/information-property-list/wkprefersnetworkuponforeground)

### Runtime management

- [Background execution](https://developer.apple.com/documentation/watchkit/background-execution)
- [Life cycles](https://developer.apple.com/documentation/watchkit/life-cycles)
- [Using extended runtime sessions](https://developer.apple.com/documentation/watchkit/using-extended-runtime-sessions)
- [WKExtendedRuntimeSession](https://developer.apple.com/documentation/watchkit/wkextendedruntimesession)
- [Interacting with Bluetooth peripherals during background app refresh](https://developer.apple.com/documentation/watchkit/interacting-with-bluetooth-peripherals-during-background-app-refresh)

### User interface

- [Storyboard support](https://developer.apple.com/documentation/watchkit/storyboard-support)
- [NowPlayingView](https://developer.apple.com/documentation/watchkit/nowplayingview)

### Errors

- [WatchKitError](https://developer.apple.com/documentation/watchkit/watchkiterror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
