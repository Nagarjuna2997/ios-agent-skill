# Notary API

## Context

Load this when a task names **Notary API** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/notaryapi) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Submit your macOS software for notarization through a web interface.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Notary API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Notary API | 2.0.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Submitting software for notarization over the web](https://developer.apple.com/documentation/notaryapi/submitting-software-for-notarization-over-the-web)

### Software submission

- [Submit Software](https://developer.apple.com/documentation/notaryapi/submit-software)
- [NewSubmissionRequest](https://developer.apple.com/documentation/notaryapi/newsubmissionrequest)
- [NewSubmissionResponse](https://developer.apple.com/documentation/notaryapi/newsubmissionresponse)

### Notarization results

- [Get Submission Status](https://developer.apple.com/documentation/notaryapi/get-submission-status)
- [SubmissionResponse](https://developer.apple.com/documentation/notaryapi/submissionresponse)
- [Get Submission Log](https://developer.apple.com/documentation/notaryapi/get-submission-log)
- [SubmissionLogURLResponse](https://developer.apple.com/documentation/notaryapi/submissionlogurlresponse)

### History

- [Get Previous Submissions](https://developer.apple.com/documentation/notaryapi/get-previous-submissions)
- [SubmissionListResponse](https://developer.apple.com/documentation/notaryapi/submissionlistresponse)

### Errors

- [ErrorResponse](https://developer.apple.com/documentation/notaryapi/errorresponse)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
