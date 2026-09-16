# GeoToolbox

## Context

Load this when a task names **GeoToolbox** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/geotoolbox) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Determine place descriptor information for map coordinates.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `GeoToolbox`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |
| tvOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |
| watchOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Getting rich information about a place

- [PlaceDescriptor](https://developer.apple.com/documentation/geotoolbox/placedescriptor)

### Creating a place descriptor

- [init(item:)](https://developer.apple.com/documentation/geotoolbox/placedescriptor/init(item:))
- [init(representations:commonName:supportingRepresentations:)](https://developer.apple.com/documentation/geotoolbox/placedescriptor/init(representations:commonname:supportingrepresentations:))

### Values that describe places and mapping service providers

- [PlaceDescriptor.PlaceRepresentation](https://developer.apple.com/documentation/geotoolbox/placedescriptor/placerepresentation)
- [PlaceDescriptor.SupportingPlaceRepresentation](https://developer.apple.com/documentation/geotoolbox/placedescriptor/supportingplacerepresentation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
