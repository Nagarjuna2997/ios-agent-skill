# Spatial Preview

## Context

Load this when a task names **Spatial Preview** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/spatialpreview) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Preview spatial content from a macOS app on a connected visionOS device.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Spatial Preview`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Working with content from your Mac app using Spatial Preview](https://developer.apple.com/documentation/spatialpreview/working-with-content-from-your-mac-app-using-spatial-preview)
- [Bridging an external USD runtime to Spatial Preview](https://developer.apple.com/documentation/spatialpreview/bridging-an-external-usd-runtime-to-spatial-preview)

### Nearby devices

- [SpatialPreviewEndpoint](https://developer.apple.com/documentation/spatialpreview/spatialpreviewendpoint)
- [SpatialPreviewDevicePicker](https://developer.apple.com/documentation/spatialpreview/spatialpreviewdevicepicker)
- [ConnectedSpatialEndpointObserver](https://developer.apple.com/documentation/spatialpreview/connectedspatialendpointobserver)

### Preview sessions

- [SpatialPreviewSession](https://developer.apple.com/documentation/spatialpreview/spatialpreviewsession)
- [DocumentPreviewSession](https://developer.apple.com/documentation/spatialpreview/documentpreviewsession)
- [USDPreviewSession](https://developer.apple.com/documentation/spatialpreview/usdpreviewsession)

### Session state and errors

- [SpatialPreviewSessionState](https://developer.apple.com/documentation/spatialpreview/spatialpreviewsessionstate)
- [SpatialPreviewSessionError](https://developer.apple.com/documentation/spatialpreview/spatialpreviewsessionerror)
- [ConnectedSpatialEndpointObserver.UnavailableError](https://developer.apple.com/documentation/spatialpreview/connectedspatialendpointobserver/unavailableerror)
- [USDPreviewSession.Error](https://developer.apple.com/documentation/spatialpreview/usdpreviewsession/error)
- [USDPreviewSession.Event](https://developer.apple.com/documentation/spatialpreview/usdpreviewsession/event)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
