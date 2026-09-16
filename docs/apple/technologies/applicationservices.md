# Application Services

## Context

Load this when a task names **Application Services** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/applicationservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Perform common application tasks.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Managers

- [Apple Event Manager](https://developer.apple.com/documentation/applicationservices/apple_event_manager)
- [ColorSync Manager](https://developer.apple.com/documentation/applicationservices/colorsync_manager)
- [Speech Synthesis Manager](https://developer.apple.com/documentation/applicationservices/speech_synthesis_manager)

### Reference

- [Carbon Accessibility](https://developer.apple.com/documentation/applicationservices/carbon_accessibility)
- [Core Printing](https://developer.apple.com/documentation/applicationservices/core_printing)
- [AXActionConstants.h](https://developer.apple.com/documentation/applicationservices/axactionconstants_h)
- [AXAttributeConstants.h](https://developer.apple.com/documentation/applicationservices/axattributeconstants_h)
- [AXError.h](https://developer.apple.com/documentation/applicationservices/axerror_h)
- [AXNotificationConstants.h](https://developer.apple.com/documentation/applicationservices/axnotificationconstants_h)
- [AXRoleConstants.h](https://developer.apple.com/documentation/applicationservices/axroleconstants_h)
- [AXTextAttributedString.h](https://developer.apple.com/documentation/applicationservices/axtextattributedstring_h)
- [AXUIElement.h](https://developer.apple.com/documentation/applicationservices/axuielement_h)
- [AXValue.h](https://developer.apple.com/documentation/applicationservices/axvalue_h)
- [AXValueConstants.h](https://developer.apple.com/documentation/applicationservices/axvalueconstants_h)
- [UniversalAccess.h](https://developer.apple.com/documentation/applicationservices/universalaccess_h)
- [ApplicationServices Structures](https://developer.apple.com/documentation/applicationservices/applicationservices_structures)
- [ApplicationServices Enumerations](https://developer.apple.com/documentation/applicationservices/applicationservices_enumerations)
- [ApplicationServices Constants](https://developer.apple.com/documentation/applicationservices/applicationservices_constants)
- [ApplicationServices Functions](https://developer.apple.com/documentation/applicationservices/applicationservices_functions)
- [ApplicationServices Data Types](https://developer.apple.com/documentation/applicationservices/applicationservices_data_types)

### Classes

- [ColorSyncCMM](https://developer.apple.com/documentation/colorsync/colorsynccmm)
- [ColorSyncMutableProfile](https://developer.apple.com/documentation/colorsync/colorsyncmutableprofile)
- [ColorSyncProfile](https://developer.apple.com/documentation/colorsync/colorsyncprofile)
- [ColorSyncTransform](https://developer.apple.com/documentation/colorsync/colorsynctransform)
- [HIMutableShape](https://developer.apple.com/documentation/applicationservices/himutableshape)
- [HIShape](https://developer.apple.com/documentation/applicationservices/hishape)
- [Pasteboard](https://developer.apple.com/documentation/applicationservices/pasteboard)
- [Translation](https://developer.apple.com/documentation/applicationservices/translation)
- [AXTextMarker](https://developer.apple.com/documentation/applicationservices/axtextmarker)
- [AXTextMarkerRange](https://developer.apple.com/documentation/applicationservices/axtextmarkerrange)

### Protocols

- [PDEPanel](https://developer.apple.com/documentation/applicationservices/pdepanel)
- [PDEPlugIn](https://developer.apple.com/documentation/applicationservices/pdeplugin)
- [PDEPlugInCallbackProtocol](https://developer.apple.com/documentation/applicationservices/pdeplugincallbackprotocol)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
