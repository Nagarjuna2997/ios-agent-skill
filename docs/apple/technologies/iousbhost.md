# IOUSBHost

## Context

Load this when a task names **IOUSBHost** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/iousbhost) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create host-mode user space drivers for USB devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `IOUSBHost`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Function Drivers

- [IOUSBHostInterface](https://developer.apple.com/documentation/iousbhost/iousbhostinterface)
- [IOUSBHostPipe](https://developer.apple.com/documentation/iousbhost/iousbhostpipe)
- [IOUSBHostStream](https://developer.apple.com/documentation/iousbhost/iousbhoststream)

### Device Drivers

- [IOUSBHostDevice](https://developer.apple.com/documentation/iousbhost/iousbhostdevice)

### Base Classes

- [IOUSBHostObject](https://developer.apple.com/documentation/iousbhost/iousbhostobject)
- [IOUSBHostIOSource](https://developer.apple.com/documentation/iousbhost/iousbhostiosource)

### IOServicePlane Properties

- [IOUSBHostInterfacePropertyKey](https://developer.apple.com/documentation/iousbhost/iousbhostinterfacepropertykey)
- [IOUSBHostDevicePropertyKey](https://developer.apple.com/documentation/iousbhost/iousbhostdevicepropertykey)
- [IOUSBHostMatchingPropertyKey](https://developer.apple.com/documentation/iousbhost/iousbhostmatchingpropertykey)
- [IOUSBHostPropertyKey](https://developer.apple.com/documentation/iousbhost/iousbhostpropertykey)

### Error Domain

- [IOUSBHostErrorDomain](https://developer.apple.com/documentation/iousbhost/iousbhosterrordomain)

### Classes

- [IOUSBHostCIControllerStateMachine](https://developer.apple.com/documentation/iousbhost/iousbhostcicontrollerstatemachine)
- [IOUSBHostCIDeviceStateMachine](https://developer.apple.com/documentation/iousbhost/iousbhostcidevicestatemachine)
- [IOUSBHostCIEndpointStateMachine](https://developer.apple.com/documentation/iousbhost/iousbhostciendpointstatemachine)
- [IOUSBHostCIPortStateMachine](https://developer.apple.com/documentation/iousbhost/iousbhostciportstatemachine)
- [IOUSBHostControllerInterface](https://developer.apple.com/documentation/iousbhost/iousbhostcontrollerinterface)

### Reference

- [IOUSBHost Structures](https://developer.apple.com/documentation/iousbhost/iousbhost-structures)
- [IOUSBHost Enumerations](https://developer.apple.com/documentation/iousbhost/iousbhost-enumerations)
- [IOUSBHost Constants](https://developer.apple.com/documentation/iousbhost/iousbhost-constants)
- [IOUSBHost Functions](https://developer.apple.com/documentation/iousbhost/iousbhost-functions)
- [IOUSBHost Data Types](https://developer.apple.com/documentation/iousbhost/iousbhost-data-types)

### Structures

- [IOUSBHostObjectDataOptions](https://developer.apple.com/documentation/iousbhost/iousbhostobjectdataoptions)

### Variables

- [IOUSBHostCIDeviceSpeedOther](https://developer.apple.com/documentation/iousbhost/iousbhostcidevicespeedother)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
