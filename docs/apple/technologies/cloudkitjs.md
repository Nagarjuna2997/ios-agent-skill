# CloudKit JS

## Context

Load this when a task names **CloudKit JS** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/cloudkitjs) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide access from your web app to your CloudKit app’s containers and databases.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CloudKit JS`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| CloudKit JS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [CloudKit](https://developer.apple.com/documentation/cloudkitjs/cloudkit)
- [CloudKit.CKError](https://developer.apple.com/documentation/cloudkitjs/cloudkit.ckerror)
- [CloudKit.Container](https://developer.apple.com/documentation/cloudkitjs/cloudkit.container)
- [CloudKit.Database](https://developer.apple.com/documentation/cloudkitjs/cloudkit.database)
- [CloudKit.DatabaseChangesResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.databasechangesresponse)
- [CloudKit.Notification](https://developer.apple.com/documentation/cloudkitjs/cloudkit.notification)
- [CloudKit.QueryNotification](https://developer.apple.com/documentation/cloudkitjs/cloudkit.querynotification)
- [CloudKit.QueryResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.queryresponse)
- [CloudKit.RecordInfosResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordinfosresponse)
- [CloudKit.RecordsBatchBuilder](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordsbatchbuilder)
- [CloudKit.RecordsResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordsresponse)
- [CloudKit.RecordZoneChangesResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordzonechangesresponse)
- [CloudKit.RecordZoneNotification](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordzonenotification)
- [CloudKit.RecordZonesResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.recordzonesresponse)
- [CloudKit.Response](https://developer.apple.com/documentation/cloudkitjs/cloudkit.response)
- [CloudKit.ShareRecordType](https://developer.apple.com/documentation/cloudkitjs/cloudkit.sharerecordtype)
- [CloudKit.SubscriptionsResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.subscriptionsresponse)
- [CloudKit.UserIdentitiesResponse](https://developer.apple.com/documentation/cloudkitjs/cloudkit.useridentitiesresponse)

### Reference

- [CloudKit JS Data Types](https://developer.apple.com/documentation/cloudkitjs/cloudkit-js-data-types)
- [CloudKit JS Enumerations](https://developer.apple.com/documentation/cloudkitjs/cloudkit-js-enumerations)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
