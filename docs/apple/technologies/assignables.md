# Assignables

## Context

Load this when a task names **Assignables** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/assignables) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> A framework that contains wrappers for a PDF to allow creation of an assessment and student work on that assessment.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Assignables`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.4 | — | No |
| iPadOS | 15.4 | — | No |
| Mac Catalyst | 15.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Assignable document

- [AssignableDocument](https://developer.apple.com/documentation/assignables/assignabledocument)
- [AssignedWorkDocument](https://developer.apple.com/documentation/assignables/assignedworkdocument)
- [Assignable](https://developer.apple.com/documentation/assignables/assignable)

### Configuration

- [AssignableDocumentConfiguration](https://developer.apple.com/documentation/assignables/assignabledocumentconfiguration)
- [AssignedWorkDocumentConfiguration](https://developer.apple.com/documentation/assignables/assignedworkdocumentconfiguration)

### Presentation

- [AssignableDocumentView](https://developer.apple.com/documentation/assignables/assignabledocumentview)
- [AssignedWorkDocumentView](https://developer.apple.com/documentation/assignables/assignedworkdocumentview)

### Document elements

- [DocumentElement](https://developer.apple.com/documentation/assignables/documentelement)
- [BasicDocumentElementID](https://developer.apple.com/documentation/assignables/basicdocumentelementid)
- [DocumentElementID](https://developer.apple.com/documentation/assignables/documentelementid)
- [AssignableDocumentElement](https://developer.apple.com/documentation/assignables/assignabledocumentelement)
- [AssignedWorkDocumentElement](https://developer.apple.com/documentation/assignables/assignedworkdocumentelement)

### Mergeable document

- [MergeableDocument](https://developer.apple.com/documentation/assignables/mergeabledocument)
- [MergeablePartsContainerPartID](https://developer.apple.com/documentation/assignables/mergeablepartscontainerpartid)
- [MergeableDocumentPage](https://developer.apple.com/documentation/assignables/mergeabledocumentpage)
- [MergeablePartsContainer](https://developer.apple.com/documentation/assignables/mergeablepartscontainer)
- [DocumentThumbnail](https://developer.apple.com/documentation/assignables/documentthumbnail)

### Identity

- [UserIdentity](https://developer.apple.com/documentation/assignables/useridentity)
- [AnonymousUserIdentity](https://developer.apple.com/documentation/assignables/anonymoususeridentity)
- [AnyUserIdentity](https://developer.apple.com/documentation/assignables/anyuseridentity)
- [StringUserIdentity](https://developer.apple.com/documentation/assignables/stringuseridentity)
- [UserIdentityTypeRegistry](https://developer.apple.com/documentation/assignables/useridentitytyperegistry)
- [UserIdentityFactory](https://developer.apple.com/documentation/assignables/useridentityfactory)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
