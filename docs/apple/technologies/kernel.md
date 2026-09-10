# Kernel

## Context

Load this when a task names **Kernel** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/kernel) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop kernel-resident device drivers and kernel extensions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Kernel Extensions

- [Implementing drivers, system extensions, and kexts](https://developer.apple.com/documentation/kernel/implementing_drivers_system_extensions_and_kexts)
- [Installing a Custom Kernel Extension](https://developer.apple.com/documentation/apple-silicon/installing-a-custom-kernel-extension)
- [Debugging a Custom Kernel Extension](https://developer.apple.com/documentation/apple-silicon/debugging-a-custom-kernel-extension)
- [Generating a Non-Maskable Interrupt](https://developer.apple.com/documentation/kernel/generating_a_non-maskable_interrupt)

### IOKit Drivers

- [IOKit Fundamentals](https://developer.apple.com/documentation/kernel/iokit_fundamentals)
- [Hardware Families](https://developer.apple.com/documentation/kernel/hardware_families)
- [Driver Support](https://developer.apple.com/documentation/kernel/driver_support)
- [libkern](https://developer.apple.com/documentation/kernel/libkern)

### BSD

- [architecture](https://developer.apple.com/documentation/kernel/architecture)
- [bsm](https://developer.apple.com/documentation/kernel/bsm)
- [hfs](https://developer.apple.com/documentation/kernel/hfs)
- [kern](https://developer.apple.com/documentation/kernel/kern)
- [Math](https://developer.apple.com/documentation/kernel/math)
- [miscfs](https://developer.apple.com/documentation/kernel/miscfs)
- [net](https://developer.apple.com/documentation/kernel/net)
- [Strings](https://developer.apple.com/documentation/kernel/strings)
- [sys](https://developer.apple.com/documentation/kernel/sys)
- [vfs](https://developer.apple.com/documentation/kernel/vfs)
- [vm](https://developer.apple.com/documentation/kernel/vm)

### Mach

- [mach](https://developer.apple.com/documentation/kernel/mach)
- [mach-o](https://developer.apple.com/documentation/kernel/mach-o)

### Utilities

- [Debugging](https://developer.apple.com/documentation/kernel/debugging)
- [AppleDSP](https://developer.apple.com/documentation/kernel/appledsp)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/kernel/deprecated_symbols)

### Additional Reference

- [Kernel Functions](https://developer.apple.com/documentation/kernel/kernel_functions)
- [Kernel Structures](https://developer.apple.com/documentation/kernel/kernel_structures)
- [Kernel Data Types](https://developer.apple.com/documentation/kernel/kernel_data_types)
- [Kernel Enumerations](https://developer.apple.com/documentation/kernel/kernel_enumerations)
- [Kernel Constants](https://developer.apple.com/documentation/kernel/kernel_constants)

### Classes

- [IOCatalogue](https://developer.apple.com/documentation/kernel/iocatalogue)
- [IOEventLink](https://developer.apple.com/documentation/kernel/ioeventlink)
- [IOEventLinkInterface](https://developer.apple.com/documentation/kernel/ioeventlinkinterface)
- [IOGuardPageMemoryDescriptor](https://developer.apple.com/documentation/kernel/ioguardpagememorydescriptor)
- [IOHIDTranslationService](https://developer.apple.com/documentation/kernel/iohidtranslationservice)
- [IOServiceStateNotificationDispatchSource](https://developer.apple.com/documentation/kernel/ioservicestatenotificationdispatchsource)
- [IOServiceStateNotificationDispatchSourceInterface](https://developer.apple.com/documentation/kernel/ioservicestatenotificationdispatchsourceinterface)
- [IOWorkGroup](https://developer.apple.com/documentation/kernel/ioworkgroup)
- [IOWorkGroupInterface](https://developer.apple.com/documentation/kernel/ioworkgroupinterface)
- [OSAction_IOHIDEventService__CopyEvent](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_copyevent)
- [OSAction_IOHIDEventService__CopyEventInterface](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_copyeventinterface)
- [OSAction_IOHIDEventService__SetLED](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_setled)
- [OSAction_IOHIDEventService__SetLEDInterface](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_setledinterface)
- [OSAction_IOHIDEventService__SetUserProperties](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_setuserproperties)
- [OSAction_IOHIDEventService__SetUserPropertiesInterface](https://developer.apple.com/documentation/kernel/osaction_iohideventservice_setuserpropertiesinterface)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
