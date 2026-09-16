# TV Services

## Context

Load this when a task names **TV Services** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/tvservices) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Display content and descriptions, provide channel guides, and support multiple users on Apple TV.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TV Services`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| tvOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Top shelf app extensions

- [Building a Full Screen Top Shelf Extension](https://developer.apple.com/documentation/tvservices/building-a-full-screen-top-shelf-extension)
- [TVTopShelfContentProvider](https://developer.apple.com/documentation/tvservices/tvtopshelfcontentprovider)
- [Legacy Extension](https://developer.apple.com/documentation/tvservices/legacy-extension)

### Carousel content

- [TVTopShelfCarouselItem](https://developer.apple.com/documentation/tvservices/tvtopshelfcarouselitem)
- [TVTopShelfCarouselContent](https://developer.apple.com/documentation/tvservices/tvtopshelfcarouselcontent)

### Sectioned and inset content

- [TVTopShelfSectionedItem](https://developer.apple.com/documentation/tvservices/tvtopshelfsectioneditem)
- [TVTopShelfItemCollection](https://developer.apple.com/documentation/tvservices/tvtopshelfitemcollection)
- [TVTopShelfSectionedContent](https://developer.apple.com/documentation/tvservices/tvtopshelfsectionedcontent)
- [TVTopShelfInsetContent](https://developer.apple.com/documentation/tvservices/tvtopshelfinsetcontent)

### Multiple users

- [Personalizing Your App for Each User on Apple TV](https://developer.apple.com/documentation/tvservices/personalizing-your-app-for-each-user-on-apple-tv)
- [Supporting Multiple Users in Your tvOS App](https://developer.apple.com/documentation/tvservices/supporting-multiple-users-in-your-tvos-app)
- [Mapping Apple TV users to app profiles](https://developer.apple.com/documentation/tvservices/mapping-apple-tv-users-to-app-profiles)
- [TVUserManager](https://developer.apple.com/documentation/tvservices/tvusermanager)

### Channel guide

- [Providing Channel Navigation](https://developer.apple.com/documentation/tvservices/providing-channel-navigation)
- [TVUserActivityTypeBrowsingChannelGuide](https://developer.apple.com/documentation/tvservices/tvuseractivitytypebrowsingchannelguide)

### Common types

- [TVTopShelfItem](https://developer.apple.com/documentation/tvservices/tvtopshelfitem)
- [TVTopShelfAction](https://developer.apple.com/documentation/tvservices/tvtopshelfaction)
- [TVTopShelfContent](https://developer.apple.com/documentation/tvservices/tvtopshelfcontent)
- [TVTopShelfObject](https://developer.apple.com/documentation/tvservices/tvtopshelfobject)

### Variables

- [TVUserActivityTypeBrowsingEntertainmentContent](https://developer.apple.com/documentation/tvservices/tvuseractivitytypebrowsingentertainmentcontent)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
