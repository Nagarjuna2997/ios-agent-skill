# Accessory Access

## Context

Load this when a task names **Accessory Access** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/accessoryaccess) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage access to connected USB accessories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Accessory Access`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 27.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Managing accessories

- [AAUSBAccessoryManager](https://developer.apple.com/documentation/accessoryaccess/aausbaccessorymanager)
- [AAUSBAccessory](https://developer.apple.com/documentation/accessoryaccess/aausbaccessory)

### Identifying specific USB accessories

- [AAUSBAccessoryMatchingCriteria](https://developer.apple.com/documentation/accessoryaccess/aausbaccessorymatchingcriteria)

### Responding to changes in accessory status

- [AAUSBAccessoryListener](https://developer.apple.com/documentation/accessoryaccess/aausbaccessorylistener)

### Errors

- [AAError](https://developer.apple.com/documentation/accessoryaccess/aaerror)
- [AAErrorDomain](https://developer.apple.com/documentation/accessoryaccess/aaerrordomain)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
