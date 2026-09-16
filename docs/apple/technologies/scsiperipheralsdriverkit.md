# SCSIPeripheralsDriverKit

## Context

Load this when a task names **SCSIPeripheralsDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/scsiperipheralsdriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for peripherals that use SCSI Block Command and Multimedia Command protocols.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SCSIPeripheralsDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 22.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Driver interfaces

- [IOUserSCSIPeripheralDeviceType00](https://developer.apple.com/documentation/scsiperipheralsdriverkit/iouserscsiperipheraldevicetype00)
- [IOUserSCSIPeripheralDeviceType05](https://developer.apple.com/documentation/scsiperipheralsdriverkit/iouserscsiperipheraldevicetype05)

### Device commands

- [SCSI commands](https://developer.apple.com/documentation/scsiperipheralsdriverkit/scsi-commands)

### Classes

- [IOUserSCSIPeripheralDeviceType07](https://developer.apple.com/documentation/scsiperipheralsdriverkit/iouserscsiperipheraldevicetype07)

### Reference

- [SCSIPeripheralsDriverKit Enumerations](https://developer.apple.com/documentation/scsiperipheralsdriverkit/scsiperipheralsdriverkit-enumerations)
- [SCSIPeripheralsDriverKit Data Types](https://developer.apple.com/documentation/scsiperipheralsdriverkit/scsiperipheralsdriverkit-data-types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
