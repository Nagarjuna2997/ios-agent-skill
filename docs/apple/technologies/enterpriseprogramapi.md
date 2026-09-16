# Enterprise Program API

## Context

Load this when a task names **Enterprise Program API** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/enterpriseprogramapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Automate the tasks you perform on the Apple Developer website.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Enterprise Program API`.

Documentation language identifiers: data.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Creating API Keys for Enterprise Program API](https://developer.apple.com/documentation/enterpriseprogramapi/creating-api-keys-for-enterprise-program-api)
- [Generating Tokens for API Requests](https://developer.apple.com/documentation/enterpriseprogramapi/generating-tokens-for-api-requests)
- [Revoking API Keys](https://developer.apple.com/documentation/enterpriseprogramapi/revoking-api-keys)
- [Identifying Rate Limits](https://developer.apple.com/documentation/enterpriseprogramapi/identifying-rate-limits)
- [Enterprise Program API Release Notes](https://developer.apple.com/documentation/enterpriseprogramapi/enterprise-api-release-notes)

### Provisioning

- [Bundle IDs](https://developer.apple.com/documentation/enterpriseprogramapi/bundle-ids)
- [Bundle ID Capabilities](https://developer.apple.com/documentation/enterpriseprogramapi/bundle-id-capabilities)
- [Certificates](https://developer.apple.com/documentation/enterpriseprogramapi/certificates)
- [Devices](https://developer.apple.com/documentation/enterpriseprogramapi/devices)
- [Pass Type Ids](https://developer.apple.com/documentation/enterpriseprogramapi/passtypeids)
- [Profiles](https://developer.apple.com/documentation/enterpriseprogramapi/profiles)

### Users and Roles

- [Users](https://developer.apple.com/documentation/enterpriseprogramapi/users)
- [User Invitations](https://developer.apple.com/documentation/enterpriseprogramapi/user-invitations)

### Error Handling

- [Interpreting and Handling Errors](https://developer.apple.com/documentation/enterpriseprogramapi/interpreting-and-handling-errors)
- [ErrorResponse](https://developer.apple.com/documentation/enterpriseprogramapi/errorresponse)

### Paging

- [Large Data Sets](https://developer.apple.com/documentation/enterpriseprogramapi/large-data-sets)

### Dictionaries

- [JsonPointer](https://developer.apple.com/documentation/enterpriseprogramapi/jsonpointer)
- [Parameter](https://developer.apple.com/documentation/enterpriseprogramapi/parameter)
- [RelationshipLinks](https://developer.apple.com/documentation/enterpriseprogramapi/relationshiplinks)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
