# App Data Transfer

## Context

Load this when a task names **App Data Transfer** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/appdatatransfer) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Download App Store information and app-install activity about your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `App Data Transfer`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| App Data Transfer | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Request creation

- [Submit request](https://developer.apple.com/documentation/appdatatransfer/submit-request)
- [JobSubmission](https://developer.apple.com/documentation/appdatatransfer/jobsubmission)
- [CreatedJob](https://developer.apple.com/documentation/appdatatransfer/createdjob)
- [Resubmit request](https://developer.apple.com/documentation/appdatatransfer/resubmit-request)
- [ResubmissionRequest](https://developer.apple.com/documentation/appdatatransfer/resubmissionrequest)
- [ResubmissionResponse](https://developer.apple.com/documentation/appdatatransfer/resubmissionresponse)

### Status

- [Get one-time request status](https://developer.apple.com/documentation/appdatatransfer/get-one-time-request-status)
- [Get recurring request status](https://developer.apple.com/documentation/appdatatransfer/get-recurring-request-status)
- [RequestStatus](https://developer.apple.com/documentation/appdatatransfer/requeststatus)

### Downloads

- [Get one-time request download URLs](https://developer.apple.com/documentation/appdatatransfer/get-one-time-request-download-urls)
- [Get recurring request download URLs](https://developer.apple.com/documentation/appdatatransfer/get-recurring-request-download-urls)
- [DownloadLinks](https://developer.apple.com/documentation/appdatatransfer/downloadlinks)
- [DownloadError](https://developer.apple.com/documentation/appdatatransfer/downloaderror)

### Cancellation

- [Cancel request](https://developer.apple.com/documentation/appdatatransfer/cancel-request)
- [CancellationRequest](https://developer.apple.com/documentation/appdatatransfer/cancellationrequest)
- [CancellationResponse](https://developer.apple.com/documentation/appdatatransfer/cancellationresponse)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
