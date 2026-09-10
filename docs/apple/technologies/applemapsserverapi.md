# Apple Maps Server API

## Context

Load this when a task names **Apple Maps Server API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/applemapsserverapi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Reduce API calls and conserve device power by streamlining your app’s georelated searches.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Maps Server API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Apple Maps Server API | 1.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating and using tokens with Maps Server API](https://developer.apple.com/documentation/applemapsserverapi/creating-and-using-tokens-with-maps-server-api)
- [Creating a Maps identifier and a private key](https://developer.apple.com/documentation/applemapsserverapi/creating-a-maps-identifier-and-a-private-key)
- [Generate a Maps token](https://developer.apple.com/documentation/applemapsserverapi/-v1-token)
- [Debugging an Invalid token](https://developer.apple.com/documentation/applemapsserverapi/debugging-an-invalid-token)
- [Common objects](https://developer.apple.com/documentation/applemapsserverapi/common-objects)
- [Integrating the Apple Maps Server API into Java server applications](https://developer.apple.com/documentation/applemapsserverapi/integrating-the-apple-maps-server-api-into-java-server-applications)

### Geocoding

- [Geocode an address](https://developer.apple.com/documentation/applemapsserverapi/-v1-geocode)
- [Reverse geocode a location](https://developer.apple.com/documentation/applemapsserverapi/-v1-reversegeocode)

### Searching

- [AddressCategory](https://developer.apple.com/documentation/applemapsserverapi/addresscategory)
- [SearchACResultType](https://developer.apple.com/documentation/applemapsserverapi/searchacresulttype)
- [SearchResultType](https://developer.apple.com/documentation/applemapsserverapi/searchresulttype)
- [AlternateIdsResponse](https://developer.apple.com/documentation/applemapsserverapi/alternateidsresponse)
- [AlternateIdsResponse.AlternateIds](https://developer.apple.com/documentation/applemapsserverapi/alternateidsresponse/alternateids)
- [PlacesResponse](https://developer.apple.com/documentation/applemapsserverapi/placesresponse)
- [PlacesResponse.PlaceLookupError](https://developer.apple.com/documentation/applemapsserverapi/placesresponse/placelookuperror)
- [Search for places that match specific criteria](https://developer.apple.com/documentation/applemapsserverapi/-v1-search)
- [Search for places that meet specific criteria to autocomplete a place search](https://developer.apple.com/documentation/applemapsserverapi/-v1-searchautocomplete)
- [Search for a place using an identifier](https://developer.apple.com/documentation/applemapsserverapi/-v1-place-:id)
- [Search for places using mulitple identifiers](https://developer.apple.com/documentation/applemapsserverapi/-v1-place)
- [Obtain a list of alternate place identifiers](https://developer.apple.com/documentation/applemapsserverapi/-v1-place-alternateids)

### Directions

- [Search for directions and estimated travel time between locations](https://developer.apple.com/documentation/applemapsserverapi/-v1-directions)
- [Determine estimated arrival times and distances to one or more destinations](https://developer.apple.com/documentation/applemapsserverapi/-v1-etas)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
