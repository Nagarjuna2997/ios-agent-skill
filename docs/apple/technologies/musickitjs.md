# MusicKitJS

## Context

Load this when a task names **MusicKitJS** or one of the API topics below.

Apple categories: Media.

[Apple documentation](https://developer.apple.com/musickit/web/) · Source checked: 2026-09-16.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### External resource

Apple routes this entry to an external resource: [verified destination](https://js-cdn.music.apple.com/musickit/v3/docs/index.html). No DocC symbol inventory is claimed for this entry.

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
