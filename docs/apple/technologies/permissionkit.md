# PermissionKit

## Context

Load this when a task names **PermissionKit** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/permissionkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create communication experiences between a child and their parent or guardian.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PermissionKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 26.0 | — | No |
| iPadOS | 26.0 | — | No |
| Mac Catalyst | 26.0 | — | No |
| macOS | 26.0 | — | No |
| visionOS | 26.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Creating a communication experience](https://developer.apple.com/documentation/permissionkit/creating-a-communication-experience)
- [AskCenter](https://developer.apple.com/documentation/permissionkit/askcenter)
- [PermissionQuestion](https://developer.apple.com/documentation/permissionkit/permissionquestion)

### Permission topics

- [SignificantAppUpdateTopic](https://developer.apple.com/documentation/permissionkit/significantappupdatetopic)
- [CommunicationTopic](https://developer.apple.com/documentation/permissionkit/communicationtopic)

### Presentation

- [PermissionButton](https://developer.apple.com/documentation/permissionkit/permissionbutton)

### Response management

- [responses(for:)](https://developer.apple.com/documentation/permissionkit/askcenter/responses(for:))
- [PermissionResponse](https://developer.apple.com/documentation/permissionkit/permissionresponse)
- [CommunicationHandle](https://developer.apple.com/documentation/permissionkit/communicationhandle)
- [PermissionChoice](https://developer.apple.com/documentation/permissionkit/permissionchoice)
- [CommunicationLimits](https://developer.apple.com/documentation/permissionkit/communicationlimits)

### Supporting types

- [QuestionTopic](https://developer.apple.com/documentation/permissionkit/questiontopic)

### Errors

- [AskError](https://developer.apple.com/documentation/permissionkit/askerror)

### Deprecated APIs

- [CommunicationLimitsButton](https://developer.apple.com/documentation/permissionkit/communicationlimitsbutton) — deprecated

### Structures

- [AskPermissionAction](https://developer.apple.com/documentation/permissionkit/askpermissionaction)

### Enumerations

- [PermissionFlow](https://developer.apple.com/documentation/permissionkit/permissionflow)
- [PermissionResult](https://developer.apple.com/documentation/permissionkit/permissionresult)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
