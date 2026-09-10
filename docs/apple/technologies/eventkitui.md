# EventKit UI

## Context

Load this when a task names **EventKit UI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/eventkitui) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Display an interface for viewing, selecting, and editing calendar events and reminders.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `EventKit UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Calendar Views

- [EKEventViewController](https://developer.apple.com/documentation/eventkitui/ekeventviewcontroller)

### Calendar Edits

- [EKEventEditViewController](https://developer.apple.com/documentation/eventkitui/ekeventeditviewcontroller)

### Calendar Selection

- [EKCalendarChooser](https://developer.apple.com/documentation/eventkitui/ekcalendarchooser)

### EventKit Bundle Access

- [EventKitUIBundle()](https://developer.apple.com/documentation/eventkitui/eventkituibundle())

### Reference

- [EventKitUI Constants](https://developer.apple.com/documentation/eventkitui/eventkitui-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
