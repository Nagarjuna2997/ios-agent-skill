# Apple Music API

## Context

Load this when a task names **Apple Music API** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/applemusicapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Integrate streaming music with catalog and personal content.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Apple Music API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Apple Music | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Generating Developer Tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)
- [User Authentication for MusicKit](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit)
- [Handling Requests and Responses](https://developer.apple.com/documentation/applemusicapi/handling-requests-and-responses)
- [Handling Resource Representation and Relationships](https://developer.apple.com/documentation/applemusicapi/handling-resource-representation-and-relationships)
- [Storefronts and Localization](https://developer.apple.com/documentation/applemusicapi/storefronts-and-localization)
- [Common Objects](https://developer.apple.com/documentation/applemusicapi/common-objects)
- [Managing Content Ratings, Alternate Versions, and Equivalencies](https://developer.apple.com/documentation/applemusicapi/managing-content-ratings-alternate-versions-and-equivalencies)
- [Fetching Resources by Page](https://developer.apple.com/documentation/applemusicapi/fetching-resources-by-page)

### Albums, Artists, Songs, and Videos

- [Albums](https://developer.apple.com/documentation/applemusicapi/albums-api)
- [Artists](https://developer.apple.com/documentation/applemusicapi/artists-api)
- [Songs](https://developer.apple.com/documentation/applemusicapi/songs-api)
- [Music Videos](https://developer.apple.com/documentation/applemusicapi/music-videos-api)

### Playlists and Stations

- [Playlists](https://developer.apple.com/documentation/applemusicapi/playlists-api)
- [Apple Music Stations](https://developer.apple.com/documentation/applemusicapi/apple-music-stations)

### Search

- [Search](https://developer.apple.com/documentation/applemusicapi/search)

### Ratings, Genres, and Charts

- [Ratings](https://developer.apple.com/documentation/applemusicapi/ratings-api)
- [Music Genres](https://developer.apple.com/documentation/applemusicapi/music-genres)
- [Charts](https://developer.apple.com/documentation/applemusicapi/charts-api)

### Activities, Curators, and Record Labels

- [Activities](https://developer.apple.com/documentation/applemusicapi/activities-api)
- [Curators](https://developer.apple.com/documentation/applemusicapi/curators-api)
- [Record Labels](https://developer.apple.com/documentation/applemusicapi/record-labels-api)

### Adding a resource to favorites

- [Add resource to favorites](https://developer.apple.com/documentation/applemusicapi/add-resource-to-favorites)

### Getting a user’s replay data

- [Get the user's replay data](https://developer.apple.com/documentation/applemusicapi/get-the-user's-replay-data)

### Recommendations and history

- [Recommendations](https://developer.apple.com/documentation/applemusicapi/recommendations)
- [History](https://developer.apple.com/documentation/applemusicapi/history)

### Fetching Multiple Resource Types

- [Get Multiple Catalog Resources Using Resource-Typed ID Parameters](https://developer.apple.com/documentation/applemusicapi/get-multiple-catalog-resources-by-resource-typed-ids-parameters)
- [Get Multiple Library Resources Using Resource-Typed ID Parameters](https://developer.apple.com/documentation/applemusicapi/get-multiple-library-resources-by-resource-typed-ids-parameters)

### Endpoints

- [Placeholder Endpoint to Test Connectivity](https://developer.apple.com/documentation/applemusicapi/dummy-endpoint-to-test-connectivity)
- [Get a User's Storefront](https://developer.apple.com/documentation/applemusicapi/get-a-user's-storefront)

### Dictionaries

- [AlbumPeriodSummaries](https://developer.apple.com/documentation/applemusicapi/albumperiodsummaries)
- [ArtistPeriodSummaries](https://developer.apple.com/documentation/applemusicapi/artistperiodsummaries)
- [Artwork](https://developer.apple.com/documentation/applemusicapi/artwork)
- [DescriptionAttribute](https://developer.apple.com/documentation/applemusicapi/descriptionattribute)
- [EditorialNotes](https://developer.apple.com/documentation/applemusicapi/editorialnotes)
- [LangageTagResponse](https://developer.apple.com/documentation/applemusicapi/langagetagresponse)
- [MusicSummaries](https://developer.apple.com/documentation/applemusicapi/musicsummaries)
- [MusicSummariesResponse](https://developer.apple.com/documentation/applemusicapi/musicsummariesresponse)
- [PaginatedResourceCollectionResponse](https://developer.apple.com/documentation/applemusicapi/paginatedresourcecollectionresponse)
- [PlayParameters](https://developer.apple.com/documentation/applemusicapi/playparameters)
- [Preview](https://developer.apple.com/documentation/applemusicapi/preview)
- [RelationshipResponse](https://developer.apple.com/documentation/applemusicapi/relationshipresponse)
- [RelationshipViewResponse](https://developer.apple.com/documentation/applemusicapi/relationshipviewresponse)
- [SongPeriodSummaries](https://developer.apple.com/documentation/applemusicapi/songperiodsummaries)
- [StorefrontsResponse](https://developer.apple.com/documentation/applemusicapi/storefrontsresponse)
- [View](https://developer.apple.com/documentation/applemusicapi/view)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
