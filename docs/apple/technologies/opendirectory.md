# Open Directory

## Context

Load this when a task names **Open Directory** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/opendirectory) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Authenticate users, and search for contact information in Open Directory and LDAP directories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Open Directory`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.6 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [ODAttributeMap](https://developer.apple.com/documentation/opendirectory/odattributemap)
- [ODConfiguration](https://developer.apple.com/documentation/opendirectory/odconfiguration)
- [ODContext](https://developer.apple.com/documentation/opendirectory/odcontext)
- [ODMappings](https://developer.apple.com/documentation/opendirectory/odmappings)
- [ODModuleEntry](https://developer.apple.com/documentation/opendirectory/odmoduleentry)
- [ODNode](https://developer.apple.com/documentation/opendirectory/odnode)
- [ODNodeRef](https://developer.apple.com/documentation/opendirectory/odnoderef)
- [ODQuery](https://developer.apple.com/documentation/opendirectory/odquery)
- [ODQueryRef](https://developer.apple.com/documentation/opendirectory/odqueryref)
- [ODRecord](https://developer.apple.com/documentation/opendirectory/odrecord)
- [ODRecordMap](https://developer.apple.com/documentation/opendirectory/odrecordmap)
- [ODRecordRef](https://developer.apple.com/documentation/opendirectory/odrecordref)
- [ODSession](https://developer.apple.com/documentation/opendirectory/odsession)
- [ODSessionRef](https://developer.apple.com/documentation/opendirectory/odsessionref)
- [ODContextRef](https://developer.apple.com/documentation/opendirectory/odcontextref)

### Protocols

- [ODQueryDelegate](https://developer.apple.com/documentation/opendirectory/odquerydelegate)

### Structures

- [ODFrameworkErrors](https://developer.apple.com/documentation/opendirectory/odframeworkerrors)

### Reference

- [OpenDirectory Functions](https://developer.apple.com/documentation/opendirectory/opendirectory-functions)
- [OpenDirectory Enumerations](https://developer.apple.com/documentation/opendirectory/opendirectory-enumerations)
- [OpenDirectory Constants](https://developer.apple.com/documentation/opendirectory/opendirectory-constants)
- [OpenDirectory Data Types](https://developer.apple.com/documentation/opendirectory/opendirectory-data-types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
