# AppKit

## Context

Load this when a task names **AppKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/appkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Construct and manage a graphical, event-driven user interface for your macOS app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AppKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass)
- [AppKit updates](https://developer.apple.com/documentation/updates/appkit)
- [Protecting the User’s Privacy](https://developer.apple.com/documentation/uikit/protecting-the-user-s-privacy)
- [Porting your macOS apps to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-your-macos-apps-to-apple-silicon)

### App Structure

- [App and Environment](https://developer.apple.com/documentation/appkit/app-and-environment)
- [Documents, Data, and Pasteboard](https://developer.apple.com/documentation/appkit/documents-data-and-pasteboard)
- [Cocoa Bindings](https://developer.apple.com/documentation/appkit/cocoa-bindings)
- [Resource Management](https://developer.apple.com/documentation/appkit/resource-management)
- [App Extensions](https://developer.apple.com/documentation/appkit/app-extensions)

### User Interface

- [Views and Controls](https://developer.apple.com/documentation/appkit/views-and-controls)
- [View Management](https://developer.apple.com/documentation/appkit/view-management)
- [View Layout](https://developer.apple.com/documentation/appkit/view-layout)
- [Appearance Customization](https://developer.apple.com/documentation/appkit/appearance-customization)
- [Animation](https://developer.apple.com/documentation/appkit/animation)
- [Windows, Panels, and Screens](https://developer.apple.com/documentation/appkit/windows-panels-and-screens)
- [Sound, Speech, and Haptics](https://developer.apple.com/documentation/appkit/sound-speech-and-haptics)
- [Supporting Continuity Camera in Your Mac App](https://developer.apple.com/documentation/appkit/supporting-continuity-camera-in-your-mac-app)

### User Interactions

- [Mouse, Keyboard, and Trackpad](https://developer.apple.com/documentation/appkit/mouse-keyboard-and-trackpad)
- [Menus, Cursors, and the Dock](https://developer.apple.com/documentation/appkit/menus-cursors-and-the-dock)
- [Gestures](https://developer.apple.com/documentation/appkit/gestures)
- [Touch Bar](https://developer.apple.com/documentation/appkit/touch-bar)
- [Drag and Drop](https://developer.apple.com/documentation/appkit/drag-and-drop)
- [Accessibility for AppKit](https://developer.apple.com/documentation/appkit/accessibility-for-appkit)

### Graphics, Drawing, Color, and Printing

- [Images and PDF](https://developer.apple.com/documentation/appkit/images-and-pdf)
- [Drawing](https://developer.apple.com/documentation/appkit/drawing)
- [Color](https://developer.apple.com/documentation/appkit/color)
- [Printing](https://developer.apple.com/documentation/appkit/printing)

### Text

- [Text Display](https://developer.apple.com/documentation/appkit/text-display)
- [TextKit](https://developer.apple.com/documentation/appkit/textkit)
- [Fonts](https://developer.apple.com/documentation/appkit/fonts)
- [Writing Tools](https://developer.apple.com/documentation/appkit/writing-tools)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/appkit/deprecated-symbols)

### Reference

- [Enumerations](https://developer.apple.com/documentation/appkit/enumerations)
- [Constants](https://developer.apple.com/documentation/appkit/constants)
- [Data Types](https://developer.apple.com/documentation/appkit/data-types)
- [Macros](https://developer.apple.com/documentation/appkit/macros)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
