# BrowserEngineKit

## Context

Load this when a task names **BrowserEngineKit** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/browserenginekit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create a browser that renders content using an alternative browser engine.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `BrowserEngineKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 18.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Developing a browser app that uses an alternative browser engine](https://developer.apple.com/documentation/browserenginekit/developing-a-browser-app-that-uses-an-alternative-browser-engine)
- [Designing your browser architecture](https://developer.apple.com/documentation/browserenginekit/designing-your-browser-architecture)
- [Preparing your app to be the default web browser](https://developer.apple.com/documentation/xcode/preparing-your-app-to-be-the-default-browser)

### Browser extensions

- [Creating browser extensions in Xcode](https://developer.apple.com/documentation/browserenginekit/creating-browser-extensions-in-xcode)
- [Extension life cycle](https://developer.apple.com/documentation/browserenginekit/extension-lifecycle)
- [Extension resources](https://developer.apple.com/documentation/browserenginekit/extension-resources)

### Web content

- [View and input coordination](https://developer.apple.com/documentation/browserenginekit/view-coordination)
- [Text interaction](https://developer.apple.com/documentation/browserenginekit/text-interaction)
- [BEWebAppManifest](https://developer.apple.com/documentation/browserenginekit/bewebappmanifest)

### Scroll view interaction

- [BEScrollView](https://developer.apple.com/documentation/browserenginekit/bescrollview)
- [BEScrollViewScrollUpdate](https://developer.apple.com/documentation/browserenginekit/bescrollviewscrollupdate)
- [BEScrollViewDelegate](https://developer.apple.com/documentation/browserenginekit/bescrollviewdelegate)

### Drag interaction

- [BEDragInteraction](https://developer.apple.com/documentation/browserenginekit/bedraginteraction)
- [BEDragInteractionDelegate](https://developer.apple.com/documentation/browserenginekit/bedraginteractiondelegate)

### Context menus

- [BEContextMenuConfiguration](https://developer.apple.com/documentation/browserenginekit/becontextmenuconfiguration)

### Accessibility

- [BEAccessibilityTextMarkerSupport](https://developer.apple.com/documentation/browserenginekit/beaccessibilitytextmarkersupport)
- [valueChangedNotification](https://developer.apple.com/documentation/browserenginekit/beaccessibility/valuechangednotification)
- [selectionChangedNotification](https://developer.apple.com/documentation/browserenginekit/beaccessibility/selectionchangednotification)
- [BEAccessibilityContainerType](https://developer.apple.com/documentation/browserenginekit/beaccessibilitycontainertype)
- [BEAccessibilityPressedState](https://developer.apple.com/documentation/browserenginekit/beaccessibilitypressedstate)
- [menuItem](https://developer.apple.com/documentation/browserenginekit/beaccessibility/menuitem)
- [popUpButton](https://developer.apple.com/documentation/browserenginekit/beaccessibility/popupbutton)
- [radioButton](https://developer.apple.com/documentation/browserenginekit/beaccessibility/radiobutton)
- [readOnly](https://developer.apple.com/documentation/browserenginekit/beaccessibility/readonly)
- [visited](https://developer.apple.com/documentation/browserenginekit/beaccessibility/visited)
- [BEAccessibilityRemoteElement](https://developer.apple.com/documentation/browserenginekit/beaccessibilityremoteelement)
- [BEAccessibilityRemoteHostElement](https://developer.apple.com/documentation/browserenginekit/beaccessibilityremotehostelement)
- [BEAccessibility](https://developer.apple.com/documentation/browserenginekit/beaccessibility)

### Just-in-time code compilation

- [Protecting code compiled just in time](https://developer.apple.com/documentation/browserenginekit/protecting-code-compiled-just-in-time)
- [Improving control flow integrity with pointer authentication](https://developer.apple.com/documentation/apple-silicon/improving-control-flow-integrity-with-pointer-authentication)
- [BE_JIT_WRITE_PROTECT_TAG](https://developer.apple.com/documentation/browserenginecore/be_jit_write_protect_tag)

### Downloads

- [Downloading files in a web browser with an alternative browser engine](https://developer.apple.com/documentation/browserenginekit/downloading-files-in-a-web-browser)
- [BEDownloadMonitor](https://developer.apple.com/documentation/browserenginekit/bedownloadmonitor-9bwls)

### Enumerations

- [BEAccessibilityOrientation](https://developer.apple.com/documentation/browserenginekit/beaccessibilityorientation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
