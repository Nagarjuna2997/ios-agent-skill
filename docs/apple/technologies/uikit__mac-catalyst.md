# Mac Catalyst

## Context

Load this when a task names **Mac Catalyst** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/uikit/mac-catalyst) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create a version of your iPad app that users can run on a Mac device.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `UIKit`.

Documentation language identifiers: occ, swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Creating a Mac version of your iPad app](https://developer.apple.com/documentation/uikit/creating-a-mac-version-of-your-ipad-app)

### App support

- [Bring an iPad App to the Mac with Mac Catalyst](https://developer.apple.com/tutorials/mac-catalyst)
- [Choosing a user interface idiom for your Mac app](https://developer.apple.com/documentation/uikit/choosing-a-user-interface-idiom-for-your-mac-app)
- [Optimizing your iPad app for Mac](https://developer.apple.com/documentation/uikit/optimizing-your-ipad-app-for-mac)
- [LSMinimumSystemVersion](https://developer.apple.com/documentation/bundleresources/information-property-list/lsminimumsystemversion)
- [UIApplicationSupportsTabbedSceneCollection](https://developer.apple.com/documentation/bundleresources/information-property-list/uiapplicationscenemanifest/uiapplicationsupportstabbedscenecollection)

### User interface

- [UIKit Catalog: Creating and customizing views and controls](https://developer.apple.com/documentation/uikit/uikit-catalog-creating-and-customizing-views-and-controls)
- [Building and improving your app with Mac Catalyst](https://developer.apple.com/documentation/uikit/building-and-improving-your-app-with-mac-catalyst)
- [Displaying a checkbox in your Mac app built with Mac Catalyst](https://developer.apple.com/documentation/uikit/displaying-a-checkbox-in-your-mac-app-built-with-mac-catalyst)
- [Removing the title bar in your Mac app built with Mac Catalyst](https://developer.apple.com/documentation/uikit/removing-the-title-bar-in-your-mac-app-built-with-mac-catalyst)
- [Toolbar](https://developer.apple.com/documentation/uikit/toolbar)
- [Touch Bar](https://developer.apple.com/documentation/appkit/touch-bar)

### User interactions

- [Navigating an app’s user interface using a keyboard](https://developer.apple.com/documentation/uikit/navigating-an-app-s-user-interface-using-a-keyboard)
- [Adding menus and shortcuts to the menu bar and user interface](https://developer.apple.com/documentation/uikit/adding-menus-and-shortcuts-to-the-menu-bar-and-user-interface)
- [Handling key presses made on a physical keyboard](https://developer.apple.com/documentation/uikit/handling-key-presses-made-on-a-physical-keyboard)
- [UIHoverGestureRecognizer](https://developer.apple.com/documentation/uikit/uihovergesturerecognizer)

### User preferences

- [Displaying a Settings window](https://developer.apple.com/documentation/uikit/displaying-a-settings-window)
- [Detecting changes in the preferences window](https://developer.apple.com/documentation/uikit/detecting-changes-in-the-preferences-window)

### Tooltips

- [Showing help tags for views and controls using tooltip interactions](https://developer.apple.com/documentation/uikit/showing-help-tags-for-views-and-controls-using-tooltip-interactions)
- [UIToolTipInteraction](https://developer.apple.com/documentation/uikit/uitooltipinteraction)
- [UIToolTipInteractionDelegate](https://developer.apple.com/documentation/uikit/uitooltipinteractiondelegate)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
