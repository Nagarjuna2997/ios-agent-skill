# IOKit

## Context

Load this when a task names **IOKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/iokit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access hardware devices and drivers from your apps and services.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Serial Ports

- [Communicating with a Modem on a Serial Port](https://developer.apple.com/documentation/iokit/communicating_with_a_modem_on_a_serial_port)

### Reference

- [IODataQueueClient.h](https://developer.apple.com/documentation/iokit/iodataqueueclient_h)
- [IOKitLib.h](https://developer.apple.com/documentation/iokit/iokitlib_h)
- [IOTypes.h User-Space](https://developer.apple.com/documentation/iokit/iotypes_h_user-space)
- [IOKit Structures](https://developer.apple.com/documentation/iokit/iokit_structures)
- [IOKit Enumerations](https://developer.apple.com/documentation/iokit/iokit_enumerations)
- [IOKit Constants](https://developer.apple.com/documentation/iokit/iokit_constants)
- [IOKit Functions](https://developer.apple.com/documentation/iokit/iokit_functions)
- [IOKit Data Types](https://developer.apple.com/documentation/iokit/iokit_data_types)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
