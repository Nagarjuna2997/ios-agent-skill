# Retention Messaging API

## Context

Load this when a task names **Retention Messaging API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/retentionmessaging) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Provide a reason for customers to stay subscribed with a preconfigured message that you can choose in real time, appropriate to the product and locale.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Retention Messaging API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Retention Messaging API | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Setting up retention messages](https://developer.apple.com/documentation/retentionmessaging/setting-up-retention-messages)
- [Identifying rate limits](https://developer.apple.com/documentation/retentionmessaging/identifying-rate-limits)
- [Retention Messaging API changelog](https://developer.apple.com/documentation/retentionmessaging/retention-messaging-changelog)

### Image configuration

- [Upload Image](https://developer.apple.com/documentation/retentionmessaging/upload-image)
- [Delete Image](https://developer.apple.com/documentation/retentionmessaging/delete-image)
- [Get Image List](https://developer.apple.com/documentation/retentionmessaging/get-image-list)
- [GetImageListResponse](https://developer.apple.com/documentation/retentionmessaging/getimagelistresponse)
- [GetImageListResponseItem](https://developer.apple.com/documentation/retentionmessaging/getimagelistresponseitem)

### Message configuration

- [Upload Message](https://developer.apple.com/documentation/retentionmessaging/upload-message)
- [Delete Message](https://developer.apple.com/documentation/retentionmessaging/delete-message)
- [Get Message List](https://developer.apple.com/documentation/retentionmessaging/get-message-list)
- [UploadMessageRequestBody](https://developer.apple.com/documentation/retentionmessaging/uploadmessagerequestbody)
- [UploadMessageImage](https://developer.apple.com/documentation/retentionmessaging/uploadmessageimage)
- [GetMessageListResponse](https://developer.apple.com/documentation/retentionmessaging/getmessagelistresponse)
- [GetMessageListResponseItem](https://developer.apple.com/documentation/retentionmessaging/getmessagelistresponseitem)

### Default message configuration

- [Configure Default Message](https://developer.apple.com/documentation/retentionmessaging/configure-default-message)
- [Get Default Message](https://developer.apple.com/documentation/retentionmessaging/get-default-message)
- [Delete Default Message](https://developer.apple.com/documentation/retentionmessaging/delete-default-message)
- [DefaultConfigurationRequest](https://developer.apple.com/documentation/retentionmessaging/defaultconfigurationrequest)
- [DefaultConfigurationResponse](https://developer.apple.com/documentation/retentionmessaging/defaultconfigurationresponse)

### Real-time retention messaging setup

- [Setting up your Get Retention Message endpoint](https://developer.apple.com/documentation/retentionmessaging/setting-up-retention-messaging-endpoint)
- [Configure Realtime URL](https://developer.apple.com/documentation/retentionmessaging/configure-realtime-url)
- [Get Realtime URL](https://developer.apple.com/documentation/retentionmessaging/get-realtime-url)
- [Delete Realtime URL](https://developer.apple.com/documentation/retentionmessaging/delete-realtime-url)
- [RealtimeUrlRequest](https://developer.apple.com/documentation/retentionmessaging/realtimeurlrequest)
- [RealtimeRequestBody](https://developer.apple.com/documentation/retentionmessaging/realtimerequestbody)
- [RealtimeUrlResponse](https://developer.apple.com/documentation/retentionmessaging/realtimeurlresponse)

### Real-time retention messaging responses

- [Responding to real-time retention messaging requests](https://developer.apple.com/documentation/retentionmessaging/responding-to-realtime-retention-messaging-requests)
- [DecodedRealtimeRequestBody](https://developer.apple.com/documentation/retentionmessaging/decodedrealtimerequestbody)
- [RealtimeResponseBody](https://developer.apple.com/documentation/retentionmessaging/realtimeresponsebody)

### Server performance testing

- [Initiate Performance Test](https://developer.apple.com/documentation/retentionmessaging/initiate-performance-test)
- [Get Performance Test Results](https://developer.apple.com/documentation/retentionmessaging/get-performance-test-results)
- [PerformanceTestRequest](https://developer.apple.com/documentation/retentionmessaging/performancetestrequest)
- [PerformanceTestResponse](https://developer.apple.com/documentation/retentionmessaging/performancetestresponse)
- [PerformanceTestResultResponse](https://developer.apple.com/documentation/retentionmessaging/performancetestresultresponse)

### Data types

- [Data types](https://developer.apple.com/documentation/retentionmessaging/data-types)

### Error information

- [Error codes](https://developer.apple.com/documentation/retentionmessaging/error-codes)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
