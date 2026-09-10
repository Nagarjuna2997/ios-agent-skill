# DriverKit

## Context

Load this when a task names **DriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/driverkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop device drivers that run in user space.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `DriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Implementing drivers, system extensions, and kexts](https://developer.apple.com/documentation/kernel/implementing_drivers_system_extensions_and_kexts)
- [Creating drivers for iPadOS](https://developer.apple.com/documentation/driverkit/creating-drivers-for-ipados)

### Entitlements

- [Requesting Entitlements for DriverKit Development](https://developer.apple.com/documentation/driverkit/requesting-entitlements-for-driverkit-development)
- [com.apple.developer.driverkit](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit)
- [com.apple.developer.driverkit.userclient-access](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.userclient-access)
- [com.apple.developer.driverkit.allow-any-userclient-access](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.allow-any-userclient-access)
- [Communicates with Drivers](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.communicates-with-drivers)
- [DriverKit Allow Third Party User Clients](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.allow-third-party-userclients)

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Services

- [Creating a Driver Using the DriverKit SDK](https://developer.apple.com/documentation/driverkit/creating-a-driver-using-the-driverkit-sdk)
- [Debugging and testing system extensions](https://developer.apple.com/documentation/driverkit/debugging-and-testing-system-extensions)
- [IOService](https://developer.apple.com/documentation/driverkit/ioservice)

### Event management

- [IODispatchQueue](https://developer.apple.com/documentation/driverkit/iodispatchqueue)
- [IOInterruptDispatchSource](https://developer.apple.com/documentation/driverkit/iointerruptdispatchsource)
- [IOTimerDispatchSource](https://developer.apple.com/documentation/driverkit/iotimerdispatchsource)
- [IODataQueueDispatchSource](https://developer.apple.com/documentation/driverkit/iodataqueuedispatchsource)
- [IODispatchSource](https://developer.apple.com/documentation/driverkit/iodispatchsource)
- [OSAction](https://developer.apple.com/documentation/driverkit/osaction)

### Memory management

- [IOBufferMemoryDescriptor](https://developer.apple.com/documentation/driverkit/iobuffermemorydescriptor)
- [IOMemoryDescriptor](https://developer.apple.com/documentation/driverkit/iomemorydescriptor)
- [IOMemoryMap](https://developer.apple.com/documentation/driverkit/iomemorymap)
- [Memory Utilities](https://developer.apple.com/documentation/driverkit/memory-utilities)

### Registry data types

- [OSArray](https://developer.apple.com/documentation/driverkit/osarray)
- [OSDictionary](https://developer.apple.com/documentation/driverkit/osdictionary)
- [OSBoolean](https://developer.apple.com/documentation/driverkit/osboolean)
- [OSData](https://developer.apple.com/documentation/driverkit/osdata)
- [OSNumber](https://developer.apple.com/documentation/driverkit/osnumber)
- [OSString](https://developer.apple.com/documentation/driverkit/osstring)
- [OSSerialization](https://developer.apple.com/documentation/driverkit/osserialization)
- [OSCollection](https://developer.apple.com/documentation/driverkit/oscollection)
- [OSContainer](https://developer.apple.com/documentation/driverkit/oscontainer)
- [OSObject](https://developer.apple.com/documentation/driverkit/osobject)
- [OSSymbol](https://developer.apple.com/documentation/driverkit/ossymbol)
- [IOFixed](https://developer.apple.com/documentation/driverkit/iofixed)

### External drivers

- [IOUserClient](https://developer.apple.com/documentation/driverkit/iouserclient)
- [IOUserServer](https://developer.apple.com/documentation/driverkit/iouserserver)
- [com.apple.developer.driverkit.userclient-access](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.userclient-access)
- [Communicating between a DriverKit extension and a client app](https://developer.apple.com/documentation/driverkit/communicating-between-a-driverkit-extension-and-a-client-app)

### Runtime support

- [OSDynamicCast](https://developer.apple.com/documentation/driverkit/osdynamiccast)
- [OSRequiredCast](https://developer.apple.com/documentation/driverkit/osrequiredcast)
- [IMPL](https://developer.apple.com/documentation/driverkit/impl)
- [TYPE](https://developer.apple.com/documentation/driverkit/type)
- [QUEUENAME](https://developer.apple.com/documentation/driverkit/queuename)
- [SUPERDISPATCH](https://developer.apple.com/documentation/driverkit/superdispatch)
- [IIG_KERNEL](https://developer.apple.com/documentation/driverkit/iig_kernel)
- [LOCAL](https://developer.apple.com/documentation/driverkit/local)
- [LOCALONLY](https://developer.apple.com/documentation/driverkit/localonly)
- [Error Codes](https://developer.apple.com/documentation/driverkit/error-codes)
- [C++ Runtime Support](https://developer.apple.com/documentation/driverkit/c-runtime-support)

### Classes

- [IOHistogramReporter](https://developer.apple.com/documentation/driverkit/iohistogramreporter)
- [IOReportLegend](https://developer.apple.com/documentation/driverkit/ioreportlegend)
- [IOReporter](https://developer.apple.com/documentation/driverkit/ioreporter)
- [IOServiceStateNotificationDispatchSource](https://developer.apple.com/documentation/driverkit/ioservicestatenotificationdispatchsource)
- [IOSimpleReporter](https://developer.apple.com/documentation/driverkit/iosimplereporter)
- [IOStateReporter](https://developer.apple.com/documentation/driverkit/iostatereporter)
- [OSBundle](https://developer.apple.com/documentation/driverkit/osbundle)
- [OSMappedFile](https://developer.apple.com/documentation/driverkit/osmappedfile)
- [IOEventLink](https://developer.apple.com/documentation/driverkit/ioeventlink)
- [IOExtensiblePaniclog](https://developer.apple.com/documentation/driverkit/ioextensiblepaniclog)
- [IOWorkGroup](https://developer.apple.com/documentation/driverkit/ioworkgroup)

### Reference

- [DriverKit Structures](https://developer.apple.com/documentation/driverkit/driverkit-structures)
- [DriverKit Enumerations](https://developer.apple.com/documentation/driverkit/driverkit-enumerations)
- [DriverKit Constants](https://developer.apple.com/documentation/driverkit/driverkit-constants)
- [DriverKit Functions](https://developer.apple.com/documentation/driverkit/driverkit-functions)
- [DriverKit Data Types](https://developer.apple.com/documentation/driverkit/driverkit-data-types)
- [DriverKit Namespaces](https://developer.apple.com/documentation/driverkit/driverkit-namespaces)

### Macros

- [Macros](https://developer.apple.com/documentation/driverkit/driverkit-macros)
- [IOKIT](https://developer.apple.com/documentation/driverkit/iokit)
- [IOPhysSize](https://developer.apple.com/documentation/driverkit/iophyssize)
- [IOPhysical32](https://developer.apple.com/documentation/driverkit/iophysical32)
- [IO_NULL_VM_TASK](https://developer.apple.com/documentation/driverkit/io_null_vm_task)
- [IO_OBJECT_NULL](https://developer.apple.com/documentation/driverkit/io_object_null)
- [PRIIOByteCount](https://developer.apple.com/documentation/driverkit/priiobytecount)
- [SERIALIZABLE](https://developer.apple.com/documentation/driverkit/serializable)
- [kIOConfigOrderKey](https://developer.apple.com/documentation/driverkit/kioconfigorderkey)
- [kIOPropertyHashTypeKey](https://developer.apple.com/documentation/driverkit/kiopropertyhashtypekey)
- [kIOPropertySHA3256Key](https://developer.apple.com/documentation/driverkit/kiopropertysha3256key)
- [kIOPropertySHA3384Key](https://developer.apple.com/documentation/driverkit/kiopropertysha3384key)
- [kIOPropertySHA3512Key](https://developer.apple.com/documentation/driverkit/kiopropertysha3512key)
- [kIOUserPlatformFunctionHandlerGet](https://developer.apple.com/documentation/driverkit/kiouserplatformfunctionhandlerget)
- [kIOUserResourcesSetPropertyKey](https://developer.apple.com/documentation/driverkit/kiouserresourcessetpropertykey)
- [kIOUserServrMaxExitReasonLength](https://developer.apple.com/documentation/driverkit/kiouserservrmaxexitreasonlength)
- [kIOUserServrMaxModulePathLength](https://developer.apple.com/documentation/driverkit/kiouserservrmaxmodulepathlength)
- [kIOUserServrMaxPanicReasonLength](https://developer.apple.com/documentation/driverkit/kiouserservrmaxpanicreasonlength)
- [queue_extend_first](https://developer.apple.com/documentation/driverkit/queue_extend_first)
- [queue_extend_last](https://developer.apple.com/documentation/driverkit/queue_extend_last)

### Structures

- [IONamedValue](https://developer.apple.com/documentation/driverkit/ionamedvalue)
- [IOPhysicalRange](https://developer.apple.com/documentation/driverkit/iophysicalrange)
- [IOVirtualRange](https://developer.apple.com/documentation/driverkit/iovirtualrange)

### Functions

- [IOSysCtlByName](https://developer.apple.com/documentation/driverkit/iosysctlbyname)
- [getpid](https://developer.apple.com/documentation/driverkit/getpid)

### Enumeration Cases

- [kIOConnectMethodVarOutputSize](https://developer.apple.com/documentation/driverkit/kioconnectmethodvaroutputsize)
- [kIOEventLinkAssociateCurrentThread](https://developer.apple.com/documentation/driverkit/kioeventlinkassociatecurrentthread)
- [kIOEventLinkAssociateOnWait](https://developer.apple.com/documentation/driverkit/kioeventlinkassociateonwait)
- [kIOEventLinkClockMachAbsoluteTime](https://developer.apple.com/documentation/driverkit/kioeventlinkclockmachabsolutetime)
- [kIOEventLinkMaxNameLength](https://developer.apple.com/documentation/driverkit/kioeventlinkmaxnamelength)
- [kIOExtensiblePaniclogOptionsNone](https://developer.apple.com/documentation/driverkit/kioextensiblepaniclogoptionsnone)
- [kIOExtensiblePaniclogOptionsWithBuffer](https://developer.apple.com/documentation/driverkit/kioextensiblepaniclogoptionswithbuffer)
- [kIOMemoryMapCacheModePostedCombinedReordered](https://developer.apple.com/documentation/driverkit/kiomemorymapcachemodepostedcombinedreordered)
- [kIORPCMessageDeepSerialization](https://developer.apple.com/documentation/driverkit/kiorpcmessagedeepserialization)
- [kIOServicePMAssertionCPUBit](https://developer.apple.com/documentation/driverkit/kioservicepmassertioncpubit)
- [kIOServicePMAssertionForceFullWakeupBit](https://developer.apple.com/documentation/driverkit/kioservicepmassertionforcefullwakeupbit)
- [kIOServicePowerCapabilityLPW](https://developer.apple.com/documentation/driverkit/kioservicepowercapabilitylpw)
- [kIOWorkGroupMaxNameLength](https://developer.apple.com/documentation/driverkit/kioworkgroupmaxnamelength)
- [kSCSICmd_ATA_PASS_THROUGH](https://developer.apple.com/documentation/driverkit/kscsicmd_ata_pass_through)
- [kSCSICmd_ATA_PASS_THROUGH_EXT](https://developer.apple.com/documentation/driverkit/kscsicmd_ata_pass_through_ext)
- [kTickScale](https://developer.apple.com/documentation/driverkit/ktickscale)

### Type Aliases

- [IOAddressRange](https://developer.apple.com/documentation/driverkit/ioaddressrange)
- [IOAlignment](https://developer.apple.com/documentation/driverkit/ioalignment)
- [IODeviceNumber](https://developer.apple.com/documentation/driverkit/iodevicenumber)
- [IOLogicalAddress](https://developer.apple.com/documentation/driverkit/iologicaladdress)
- [OSSerializationPortCopyInHandler](https://developer.apple.com/documentation/driverkit/osserializationportcopyinhandler)
- [OSSerializationPortCopyOutHandler](https://developer.apple.com/documentation/driverkit/osserializationportcopyouthandler)
- [io_connect_t](https://developer.apple.com/documentation/driverkit/io_connect_t)
- [io_enumerator_t](https://developer.apple.com/documentation/driverkit/io_enumerator_t)
- [io_ident_t](https://developer.apple.com/documentation/driverkit/io_ident_t)
- [io_iterator_t](https://developer.apple.com/documentation/driverkit/io_iterator_t)
- [io_object_t](https://developer.apple.com/documentation/driverkit/io_object_t)
- [io_registry_entry_t](https://developer.apple.com/documentation/driverkit/io_registry_entry_t)
- [io_service_t](https://developer.apple.com/documentation/driverkit/io_service_t)
- [pid_t](https://developer.apple.com/documentation/driverkit/pid_t)
- [uext_object_t](https://developer.apple.com/documentation/driverkit/uext_object_t)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
