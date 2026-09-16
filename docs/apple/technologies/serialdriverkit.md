# SerialDriverKit

## Context

Load this when a task names **SerialDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/serialdriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for serial I/O devices connected to your Mac.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SerialDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Serial Interface

- [com.apple.developer.driverkit.family.serial](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.serial)
- [IOUserSerial](https://developer.apple.com/documentation/serialdriverkit/iouserserial)

### Reference

- [SerialDriverKit Enumerations](https://developer.apple.com/documentation/serialdriverkit/serialdriverkit-enumerations)
- [SerialDriverKit Data Types](https://developer.apple.com/documentation/serialdriverkit/serialdriverkit-data-types)

### Namespaces

- [driverkit](https://developer.apple.com/documentation/serialdriverkit/driverkit)

### Macros

- [PD_RS232_S_LE](https://developer.apple.com/documentation/serialdriverkit/pd_rs232_s_le)
- [PD_RS232_S_RNG](https://developer.apple.com/documentation/serialdriverkit/pd_rs232_s_rng)
- [kIOTTYBaseNameKey](https://developer.apple.com/documentation/serialdriverkit/kiottybasenamekey)
- [kIOTTYSuffixKey](https://developer.apple.com/documentation/serialdriverkit/kiottysuffixkey)

### Enumeration Cases

- [kIOSerialMemoryArena](https://developer.apple.com/documentation/serialdriverkit/kioserialmemoryarena)
- [kIOSerialMemoryRxBuf](https://developer.apple.com/documentation/serialdriverkit/kioserialmemoryrxbuf)
- [kIOSerialMemoryTxBuf](https://developer.apple.com/documentation/serialdriverkit/kioserialmemorytxbuf)
- [kIOSerialPTYMaster](https://developer.apple.com/documentation/serialdriverkit/kioserialptymaster)
- [kIOSerialUserClient](https://developer.apple.com/documentation/serialdriverkit/kioserialuserclient)
- [kIOSerialUserClientIoctl](https://developer.apple.com/documentation/serialdriverkit/kioserialuserclientioctl)
- [kIOSerialUserClientOpen](https://developer.apple.com/documentation/serialdriverkit/kioserialuserclientopen)
- [kIOSerialUserClientPoll](https://developer.apple.com/documentation/serialdriverkit/kioserialuserclientpoll)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
