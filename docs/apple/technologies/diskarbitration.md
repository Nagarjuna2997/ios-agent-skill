# Disk Arbitration

## Context

Load this when a task names **Disk Arbitration** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/diskarbitration) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provides mechanisms to register and block disk mount or unmount events.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Disk Arbitration`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Reference

- [DADisk.h](https://developer.apple.com/documentation/diskarbitration/dadisk-h)
- [DADissenter.h](https://developer.apple.com/documentation/diskarbitration/dadissenter-h)
- [DASession.h](https://developer.apple.com/documentation/diskarbitration/dasession-h)
- [DiskArbitration.h](https://developer.apple.com/documentation/diskarbitration/diskarbitration-h)
- [DiskArbitration Enumerations](https://developer.apple.com/documentation/diskarbitration/diskarbitration-enumerations)
- [DiskArbitration Constants](https://developer.apple.com/documentation/diskarbitration/diskarbitration-constants)
- [DiskArbitration Data Types](https://developer.apple.com/documentation/diskarbitration/diskarbitration-data-types)

### Variables

- [kDADiskDescriptionFSKitPrefix](https://developer.apple.com/documentation/diskarbitration/kdadiskdescriptionfskitprefix)
- [kDADiskDescriptionRepairRunningKey](https://developer.apple.com/documentation/diskarbitration/kdadiskdescriptionrepairrunningkey)
- [kDADiskMountOptionNoFollow](https://developer.apple.com/documentation/diskarbitration/kdadiskmountoptionnofollow)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
