# Device Activity

## Context

Load this when a task names **Device Activity** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/deviceactivity) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Monitor device activity with your app extension while maintaining privacy.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Device Activity`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Manage activities

- [DeviceActivityEvent](https://developer.apple.com/documentation/deviceactivity/deviceactivityevent)
- [DeviceActivityName](https://developer.apple.com/documentation/deviceactivity/deviceactivityname)
- [DeviceActivitySchedule](https://developer.apple.com/documentation/deviceactivity/deviceactivityschedule)
- [DeviceActivityCenter](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter)

### Monitor activity

- [DeviceActivityMonitor](https://developer.apple.com/documentation/deviceactivity/deviceactivitymonitor)

### Report activity

- [DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- [DeviceActivityReportExtension](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportextension)
- [DeviceActivityReportScene](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportscene)
- [DeviceActivityReportBuilder](https://developer.apple.com/documentation/deviceactivity/deviceactivityreportbuilder)

### Filter activity data

- [DeviceActivityFilter](https://developer.apple.com/documentation/deviceactivity/deviceactivityfilter)
- [DeviceActivityData](https://developer.apple.com/documentation/deviceactivity/deviceactivitydata)
- [DeviceActivityResults](https://developer.apple.com/documentation/deviceactivity/deviceactivityresults)

### Authorize access

- [DeviceActivityAuthorization](https://developer.apple.com/documentation/deviceactivity/deviceactivityauthorization)
- [DeviceActivityAuthorizing](https://developer.apple.com/documentation/deviceactivity/deviceactivityauthorizing)

### Handle errors

- [DeviceActivityCenter.MonitoringError](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter/monitoringerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
