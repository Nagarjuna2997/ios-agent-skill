# USBDriverKit

## Context

Load this when a task names **USBDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/usbdriverkit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop drivers for USB-based devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `USBDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.driverkit.transport.usb](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.transport.usb)

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Providers

- [IOUSBHostInterface](https://developer.apple.com/documentation/usbdriverkit/iousbhostinterface)
- [IOUSBHostDevice](https://developer.apple.com/documentation/usbdriverkit/iousbhostdevice)

### Endpoint Communication

- [IOUSBHostPipe](https://developer.apple.com/documentation/usbdriverkit/iousbhostpipe)

### USB Specifications

- [USB Device Descriptors](https://developer.apple.com/documentation/usbdriverkit/usb-device-descriptors)
- [Additional Specifications](https://developer.apple.com/documentation/usbdriverkit/additional-specifications)
- [Registry Property Names](https://developer.apple.com/documentation/usbdriverkit/registry-property-names)
- [Utilities](https://developer.apple.com/documentation/usbdriverkit/utilities)

### References

- [USBDriverKit Enumerations](https://developer.apple.com/documentation/usbdriverkit/usbdriverkit-enumerations)
- [USBDriverKit Functions](https://developer.apple.com/documentation/usbdriverkit/usbdriverkit-functions)
- [USBDriverKit Data Types](https://developer.apple.com/documentation/usbdriverkit/usbdriverkit-data-types)
- [USBDriverKit Macros](https://developer.apple.com/documentation/usbdriverkit/usbdriverkit-macros)

### Macros

- [IOUSBHOST_PROPERTY_DEPRECATED](https://developer.apple.com/documentation/usbdriverkit/iousbhost_property_deprecated)
- [kUSBHostBillboardDevicePropertyAltModeFailed](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertyaltmodefailed)
- [kUSBHostBillboardDevicePropertyAltModePowerFailed](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertyaltmodepowerfailed)
- [kUSBHostBillboardDevicePropertyCurrentMode](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertycurrentmode)
- [kUSBHostBillboardDevicePropertyModeValueDisplayPort](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertymodevaluedisplayport)
- [kUSBHostBillboardDevicePropertyModeValueThunderbolt](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertymodevaluethunderbolt)
- [kUSBHostBillboardDevicePropertyModeValueUSB4](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertymodevalueusb4)
- [kUSBHostBillboardDevicePropertyPreferredMode](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertypreferredmode)
- [kUSBHostBillboardDevicePropertySupportedModes](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertysupportedmodes)
- [kUSBHostBillboardDevicePropertyVersion](https://developer.apple.com/documentation/usbdriverkit/kusbhostbillboarddevicepropertyversion)
- [kUSBHostControllerPropertyProtocolRevision](https://developer.apple.com/documentation/usbdriverkit/kusbhostcontrollerpropertyprotocolrevision)
- [kUSBHostDevicePropertyFunction](https://developer.apple.com/documentation/usbdriverkit/kusbhostdevicepropertyfunction)
- [kUSBHostDevicePropertyIdlePolicy](https://developer.apple.com/documentation/usbdriverkit/kusbhostdevicepropertyidlepolicy)
- [kUSBHostDevicePropertyPowerSinkAllocation](https://developer.apple.com/documentation/usbdriverkit/kusbhostdevicepropertypowersinkallocation)
- [kUSBHostDevicePropertyUSB3Preferred](https://developer.apple.com/documentation/usbdriverkit/kusbhostdevicepropertyusb3preferred)
- [kUSBHostDevicePropertyUSB3Required](https://developer.apple.com/documentation/usbdriverkit/kusbhostdevicepropertyusb3required)
- [kUSBHostPortPropertyIOPortServicePath](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyioportservicepath)
- [kUSBHostPortPropertyProtocolCompanionRevision1](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolcompanionrevision1)
- [kUSBHostPortPropertyProtocolCompanionRevision2](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolcompanionrevision2)
- [kUSBHostPortPropertyProtocolCompanionRevision3](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolcompanionrevision3)
- [kUSBHostPortPropertyProtocolRevision1](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolrevision1)
- [kUSBHostPortPropertyProtocolRevision2](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolrevision2)
- [kUSBHostPortPropertyProtocolRevision3](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolrevision3)
- [kUSBHostPortPropertyProtocolRevision4](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyprotocolrevision4)
- [kUSBHostPortPropertyTransportState](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertytransportstate)
- [kUSBHostPortPropertyUSB2ExternalRemoteWake](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyusb2externalremotewake)
- [kUSBHostPortPropertyUSB2Repeater](https://developer.apple.com/documentation/usbdriverkit/kusbhostportpropertyusb2repeater)
- [kUSBHostPropertyLinkSpeed](https://developer.apple.com/documentation/usbdriverkit/kusbhostpropertylinkspeed)

### Enumeration Cases

- [kIOUSBLinkSpeed10Gbps](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeed10gbps)
- [kIOUSBLinkSpeed20Gbps](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeed20gbps)
- [kIOUSBLinkSpeed40Gbps](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeed40gbps)
- [kIOUSBLinkSpeed5Gbps](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeed5gbps)
- [kIOUSBLinkSpeed80Gbps](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeed80gbps)
- [kIOUSBLinkSpeedFull](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeedfull)
- [kIOUSBLinkSpeedHigh](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeedhigh)
- [kIOUSBLinkSpeedLow](https://developer.apple.com/documentation/usbdriverkit/kiousblinkspeedlow)

### Enumerations

- [tIOUSB40LinkStateTimeout](https://developer.apple.com/documentation/usbdriverkit/tiousb40linkstatetimeout)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
