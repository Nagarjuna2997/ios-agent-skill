# Address Book

## Context

Load this when a task names **Address Book** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/addressbook) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access the centralized database for storing users’ contacts.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Address Book`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 2.0 | — | No |
| iPadOS | 2.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.2 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [ABAddressBook](https://developer.apple.com/documentation/addressbook/abaddressbook-swift.class)

### Data Types

- [ABPerson](https://developer.apple.com/documentation/addressbook/abperson)
- [ABGroup](https://developer.apple.com/documentation/addressbook/abgroup)
- [ABMultiValue](https://developer.apple.com/documentation/addressbook/abmultivalue-swift.class)
- [ABMutableMultiValue](https://developer.apple.com/documentation/addressbook/abmutablemultivalue-swift.class)
- [ABImageClient](https://developer.apple.com/documentation/addressbook/abimageclient)
- [ABRecord](https://developer.apple.com/documentation/addressbook/abrecord-swift.class)

### Pickers

- [ABPeoplePickerView](https://developer.apple.com/documentation/addressbook/abpeoplepickerview)
- [ABPersonView](https://developer.apple.com/documentation/addressbook/abpersonview)

### Search Elements

- [ABSearchElement](https://developer.apple.com/documentation/addressbook/absearchelement)
- [ABSearchElementRef](https://developer.apple.com/documentation/addressbook/absearchelementref)

### Action Plug-In

- [ABActionDelegate](https://developer.apple.com/documentation/addressbook/abactiondelegate)

### C Interfaces

- [C Types](https://developer.apple.com/documentation/addressbook/c-types)
- [AddressBook Functions](https://developer.apple.com/documentation/addressbook/addressbook-functions)
- [Address Book Constants](https://developer.apple.com/documentation/addressbook/address-book-constants)
- [AddressBook Enumerations](https://developer.apple.com/documentation/addressbook/addressbook-enumerations)
- [AddressBook Data Types](https://developer.apple.com/documentation/addressbook/addressbook-data-types)

### Deprecated symbols

- [Deprecated symbols](https://developer.apple.com/documentation/addressbook/deprecated-symbols)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
