# Account Data Transfer

## Context

Load this when a task names **Account Data Transfer** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/accountdatatransfer) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Download App Store information, app install, and push notification activity on behalf of people who use your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Account Data Transfer`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Account Data Transfer | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Request creation

- [Submit request](https://developer.apple.com/documentation/accountdatatransfer/submit-request)
- [JobSubmission](https://developer.apple.com/documentation/accountdatatransfer/jobsubmission)
- [CreatedJob](https://developer.apple.com/documentation/accountdatatransfer/createdjob)
- [Resubmit request](https://developer.apple.com/documentation/accountdatatransfer/resubmit-request)
- [ResubmissionRequest](https://developer.apple.com/documentation/accountdatatransfer/resubmissionrequest)
- [ResubmissionResponse](https://developer.apple.com/documentation/accountdatatransfer/resubmissionresponse)

### Status

- [Get one-time request status](https://developer.apple.com/documentation/accountdatatransfer/get-one-time-request-status)
- [Get recurring request status](https://developer.apple.com/documentation/accountdatatransfer/get-recurring-request-status)
- [RequestStatus](https://developer.apple.com/documentation/accountdatatransfer/requeststatus)

### Downloads

- [Get one-time request download URLs](https://developer.apple.com/documentation/accountdatatransfer/get-one-time-request-download-urls)
- [Get recurring request download URLs](https://developer.apple.com/documentation/accountdatatransfer/get-recurring-request-download-urls)
- [DownloadLinks](https://developer.apple.com/documentation/accountdatatransfer/downloadlinks)
- [DownloadError](https://developer.apple.com/documentation/accountdatatransfer/downloaderror)

### Cancellation

- [Cancel request](https://developer.apple.com/documentation/accountdatatransfer/cancel-request)
- [CancellationRequest](https://developer.apple.com/documentation/accountdatatransfer/cancellationrequest)
- [CancellationResponse](https://developer.apple.com/documentation/accountdatatransfer/cancellationresponse)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
