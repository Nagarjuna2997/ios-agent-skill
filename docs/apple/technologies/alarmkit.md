# AlarmKit

## Context

Load this when a task names **AlarmKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/alarmkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Schedule prominent alarms and countdowns to help people manage their time.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `AlarmKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Alarm management

- [Scheduling an alarm with AlarmKit](https://developer.apple.com/documentation/alarmkit/scheduling-an-alarm-with-alarmkit)
- [AlarmManager](https://developer.apple.com/documentation/alarmkit/alarmmanager)
- [Alarm](https://developer.apple.com/documentation/alarmkit/alarm)

### Buttons

- [AlarmButton](https://developer.apple.com/documentation/alarmkit/alarmbutton)

### Views

- [AlarmPresentation](https://developer.apple.com/documentation/alarmkit/alarmpresentation)
- [AlarmPresentationState](https://developer.apple.com/documentation/alarmkit/alarmpresentationstate)
- [AlarmAttributes](https://developer.apple.com/documentation/alarmkit/alarmattributes)
- [AlarmMetadata](https://developer.apple.com/documentation/alarmkit/alarmmetadata)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
