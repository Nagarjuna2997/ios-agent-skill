# ClassKit Catalog API

## Context

Load this when a task names **ClassKit Catalog API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/classkitcatalogapi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Declare the activities supported by your educational app through a web interface.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ClassKit Catalog API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| ClassKit | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Authenticating Calls to the ClassKit Catalog API](https://developer.apple.com/documentation/classkitcatalogapi/authenticating-calls-to-the-classkit-catalog-api)
- [Testing Your ClassKit Catalog Implementation](https://developer.apple.com/documentation/classkitcatalogapi/testing-your-classkit-catalog-implementation)

### Declaring Contexts

- [Preparing Context Data](https://developer.apple.com/documentation/classkitcatalogapi/preparing-context-data)
- [Create or Replace Contexts](https://developer.apple.com/documentation/classkitcatalogapi/create-or-replace-contexts)
- [Get a Context](https://developer.apple.com/documentation/classkitcatalogapi/get-a-context)
- [Delete a Context](https://developer.apple.com/documentation/classkitcatalogapi/delete-a-context)
- [Context](https://developer.apple.com/documentation/classkitcatalogapi/context)
- [ContextsRequest](https://developer.apple.com/documentation/classkitcatalogapi/contextsrequest)
- [ContextsResponse](https://developer.apple.com/documentation/classkitcatalogapi/contextsresponse)

### Uploading Thumbnails

- [Create or Replace a Thumbnail](https://developer.apple.com/documentation/classkitcatalogapi/create-or-replace-a-thumbnail)
- [Get a Thumbnail](https://developer.apple.com/documentation/classkitcatalogapi/get-a-thumbnail)
- [Delete a Thumbnail](https://developer.apple.com/documentation/classkitcatalogapi/delete-a-thumbnail)

### Retrieving Status

- [Get Status](https://developer.apple.com/documentation/classkitcatalogapi/get-status)
- [Status](https://developer.apple.com/documentation/classkitcatalogapi/status)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
