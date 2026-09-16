# TVMLKit JS

## Context

Load this when a task names **TVMLKit JS** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/tvmljs) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create tvOS client-server apps using web technologies to stream media and respond to events.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: data.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| tvOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a Client-Server TVML App](https://developer.apple.com/documentation/tvmljs/creating_a_client-server_tvml_app)

### App Initialization

- [App](https://developer.apple.com/documentation/tvmljs/app)
- [UserDefaults](https://developer.apple.com/documentation/tvmljs/userdefaults)
- [NavigationDocument](https://developer.apple.com/documentation/tvmljs/navigationdocument)
- [Responding to User Interaction](https://developer.apple.com/documentation/tvmljs/responding_to_user_interaction)
- [EventListenerObject](https://developer.apple.com/documentation/tvmljs/eventlistenerobject)

### Device Settings

- [Device](https://developer.apple.com/documentation/tvmljs/device)
- [Settings](https://developer.apple.com/documentation/tvmljs/settings)
- [Restrictions](https://developer.apple.com/documentation/tvmljs/restrictions)

### Media Playback

- [Playing Media in a Client-Server App](https://developer.apple.com/documentation/tvmljs/playing_media_in_a_client-server_app)
- [Player](https://developer.apple.com/documentation/tvmljs/player)
- [Playlist](https://developer.apple.com/documentation/tvmljs/playlist)
- [MediaItem](https://developer.apple.com/documentation/tvmljs/mediaitem)
- [Slideshow](https://developer.apple.com/documentation/tvmljs/slideshow)
- [Browser](https://developer.apple.com/documentation/tvmljs/browser)

### Element Access

- [Keyboard](https://developer.apple.com/documentation/tvmljs/keyboard)
- [MenuBarDocument](https://developer.apple.com/documentation/tvmljs/menubardocument)

### Data Storage and Retrieval

- [Binding JSON data to TVML documents](https://developer.apple.com/documentation/tvmljs/binding_json_data_to_tvml_documents)
- [XMLHttpRequest](https://developer.apple.com/documentation/tvmljs/xmlhttprequest)
- [DataItem](https://developer.apple.com/documentation/tvmljs/dataitem)
- [Storage](https://developer.apple.com/documentation/tvmljs/storage)
- [DataSource](https://developer.apple.com/documentation/tvmljs/datasource)
- [LoadIndexesRequest](https://developer.apple.com/documentation/tvmljs/loadindexesrequest)

### Errors

- [TVError](https://developer.apple.com/documentation/tvmljs/tverror)
- [NSError](https://developer.apple.com/documentation/tvmljs/nserror)

### Reference

- [TVMLKit JS Functions](https://developer.apple.com/documentation/tvmljs/tvmlkit_js_functions)

### Classes

- [DOMException](https://developer.apple.com/documentation/tvmljs/domexception)
- [DOMImplementationLS](https://developer.apple.com/documentation/tvmljs/domimplementationls)
- [DOMImplementationRegistry](https://developer.apple.com/documentation/tvmljs/domimplementationregistry)
- [EventException](https://developer.apple.com/documentation/tvmljs/eventexception)
- [LSException](https://developer.apple.com/documentation/tvmljs/lsexception)
- [LSInput](https://developer.apple.com/documentation/tvmljs/lsinput)
- [LSParser](https://developer.apple.com/documentation/tvmljs/lsparser)
- [LSSerializer](https://developer.apple.com/documentation/tvmljs/lsserializer)
- [ParsingElement](https://developer.apple.com/documentation/tvmljs/parsingelement)
- [ViewModelLink](https://developer.apple.com/documentation/tvmljs/viewmodellink)
- [XPathException](https://developer.apple.com/documentation/tvmljs/xpathexception)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
