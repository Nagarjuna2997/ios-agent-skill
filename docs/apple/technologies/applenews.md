# Apple News

## Context

Load this when a task names **Apple News** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/documentation/applenews) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Design, create, and publish signature content for Apple News.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Apple News API | 1.0 | — | No |
| Apple News Format | 1.7 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Getting Started as an Apple News Publisher](https://developer.apple.com/documentation/applenews/getting-started-as-an-apple-news-publisher)

### Article Design and Creation

- [Apple News Format Tutorials](https://developer.apple.com/documentation/applenews/apple-news-format-tutorials)
- [Apple News Format](https://developer.apple.com/documentation/applenewsformat)

### Article Publication and Management

- [Apple News API Tutorial](https://developer.apple.com/documentation/applenews/apple-news-api-tutorial)
- [Apple News API](https://developer.apple.com/documentation/applenewsapi)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
