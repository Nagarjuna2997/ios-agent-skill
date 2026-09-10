# Apple Pencil

## Context

Load this when a task names **Apple Pencil** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/applepencil) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Enhance your iPad app’s user experience by supporting drawing, handwriting, and other features of Apple Pencil.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Apple Pencil updates](https://developer.apple.com/documentation/updates/applepencil)

### Drawing

- [Drawing with PencilKit](https://developer.apple.com/documentation/pencilkit/drawing-with-pencilkit)
- [Inspecting, Modifying, and Constructing PencilKit Drawings](https://developer.apple.com/documentation/pencilkit/inspecting-modifying-and-constructing-pencilkit-drawings)
- [Getting high-fidelity input with coalesced touches](https://developer.apple.com/documentation/uikit/getting-high-fidelity-input-with-coalesced-touches)
- [Implementing coalesced touch support in an app](https://developer.apple.com/documentation/uikit/implementing-coalesced-touch-support-in-an-app)

### Handwriting

- [Customizing Scribble with Interactions](https://developer.apple.com/documentation/pencilkit/customizing-scribble-with-interactions)
- [Handwriting recognition](https://developer.apple.com/documentation/uikit/handwriting-recognition)

### Double tap and squeeze

- [Apple Pencil interactions](https://developer.apple.com/documentation/uikit/apple-pencil-interactions)
- [Handling squeezes from Apple Pencil](https://developer.apple.com/documentation/applepencil/handling-squeezes-from-apple-pencil)
- [Handling double taps from Apple Pencil](https://developer.apple.com/documentation/applepencil/handling-double-taps-from-apple-pencil)

### Haptics

- [Playing haptic feedback in your app](https://developer.apple.com/documentation/applepencil/playing-haptic-feedback-in-your-app)

### Hover

- [Adopting hover support for Apple Pencil](https://developer.apple.com/documentation/uikit/adopting-hover-support-for-apple-pencil)

### Pointers

- [Input events](https://developer.apple.com/documentation/swiftui/input-events)
- [Pointer interactions](https://developer.apple.com/documentation/uikit/pointer-interactions)
- [Integrating pointer interactions into your iPad app](https://developer.apple.com/documentation/uikit/integrating-pointer-interactions-into-your-ipad-app)

### Design

- [Apple Pencil and Scribble](https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble)
- [Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
