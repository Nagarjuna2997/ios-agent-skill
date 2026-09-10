# PCIDriverKit

## Context

Load this when a task names **PCIDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/pcidriverkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop device drivers for Peripheral Component Interconnect (PCI) accessories.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `PCIDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |
| macOS | 11.1 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Entitlements

- [com.apple.developer.driverkit.transport.pci](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.transport.pci)

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)
- [Connecting a network driver](https://developer.apple.com/documentation/pcidriverkit/connecting-a-network-driver)

### Device Interface

- [Creating Custom PCIe Drivers for Thunderbolt Devices](https://developer.apple.com/documentation/pcidriverkit/creating-custom-pcie-drivers-for-thunderbolt-devices)
- [IOPCIDevice](https://developer.apple.com/documentation/pcidriverkit/iopcidevice)

### Reference

- [PCIDriverKit Enumerations](https://developer.apple.com/documentation/pcidriverkit/pcidriverkit-enumerations)
- [PCIDriverKit Data Types](https://developer.apple.com/documentation/pcidriverkit/pcidriverkit-data-types)
- [PCIDriverKit Macros](https://developer.apple.com/documentation/pcidriverkit/pcidriverkit-macros)

### Macros

- [kIOPCIACSCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopciacscapabilitieskey)
- [kIOPCIAERCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopciaercapabilitieskey)
- [kIOPCIExpressDeviceCapabilities2Key](https://developer.apple.com/documentation/pcidriverkit/kiopciexpressdevicecapabilities2key)
- [kIOPCIExpressDeviceCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopciexpressdevicecapabilitieskey)
- [kIOPCIExpressLinkCapabilities2Key](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresslinkcapabilities2key)
- [kIOPCIExpressRootCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopciexpressrootcapabilitieskey)
- [kIOPCIExpressSlotCapabilities2Key](https://developer.apple.com/documentation/pcidriverkit/kiopciexpressslotcapabilities2key)
- [kIOPCIFPBCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopcifpbcapabilitieskey)
- [kIOPCIL1PMCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopcil1pmcapabilitieskey)
- [kIOPCIMSIMessageControlKey](https://developer.apple.com/documentation/pcidriverkit/kiopcimsimessagecontrolkey)
- [kIOPCIMSIXMessageControlKey](https://developer.apple.com/documentation/pcidriverkit/kiopcimsixmessagecontrolkey)
- [kIOPCIPTMCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopciptmcapabilitieskey)
- [kIOPCIPowerManagementCapabilitiesKey](https://developer.apple.com/documentation/pcidriverkit/kiopcipowermanagementcapabilitieskey)

### Enumeration Cases

- [kIOPCICapabilityIDAF](https://developer.apple.com/documentation/pcidriverkit/kiopcicapabilityidaf)
- [kIOPCICapabilityIDEnhancedAllocation](https://developer.apple.com/documentation/pcidriverkit/kiopcicapabilityidenhancedallocation)
- [kIOPCICapabilityIDSATAConfiguration](https://developer.apple.com/documentation/pcidriverkit/kiopcicapabilityidsataconfiguration)
- [kIOPCIExpressCapabilityIDAMD](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidamd)
- [kIOPCIExpressCapabilityIDATS](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidats)
- [kIOPCIExpressCapabilityIDAlternateProtocol](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidalternateprotocol)
- [kIOPCIExpressCapabilityIDCAC](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidcac)
- [kIOPCIExpressCapabilityIDDPA](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityiddpa)
- [kIOPCIExpressCapabilityIDDPC](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityiddpc)
- [kIOPCIExpressCapabilityIDDVSEC](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityiddvsec)
- [kIOPCIExpressCapabilityIDDataLinkFeature](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityiddatalinkfeature)
- [kIOPCIExpressCapabilityIDFRSQueueing](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidfrsqueueing)
- [kIOPCIExpressCapabilityIDHierarchyID](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidhierarchyid)
- [kIOPCIExpressCapabilityIDLNR](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidlnr)
- [kIOPCIExpressCapabilityIDLaneMarginingRx](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidlanemarginingrx)
- [kIOPCIExpressCapabilityIDMFVC](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidmfvc)
- [kIOPCIExpressCapabilityIDMPCIe](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidmpcie)
- [kIOPCIExpressCapabilityIDMRIOV](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidmriov)
- [kIOPCIExpressCapabilityIDMulticast](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidmulticast)
- [kIOPCIExpressCapabilityIDNPEM](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidnpem)
- [kIOPCIExpressCapabilityIDPASID](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidpasid)
- [kIOPCIExpressCapabilityIDPL16GTs](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidpl16gts)
- [kIOPCIExpressCapabilityIDPL32GTs](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidpl32gts)
- [kIOPCIExpressCapabilityIDPMUX](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidpmux)
- [kIOPCIExpressCapabilityIDPRI](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidpri)
- [kIOPCIExpressCapabilityIDRCECEndpointAssociation](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidrcecendpointassociation)
- [kIOPCIExpressCapabilityIDRCInternalLinkCtrl](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidrcinternallinkctrl)
- [kIOPCIExpressCapabilityIDRCLinkDeclaration](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidrclinkdeclaration)
- [kIOPCIExpressCapabilityIDReadinessTimeReporting](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidreadinesstimereporting)
- [kIOPCIExpressCapabilityIDResizableBAR](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidresizablebar)
- [kIOPCIExpressCapabilityIDRootComplexRegBlock](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidrootcomplexregblock)
- [kIOPCIExpressCapabilityIDSFI](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidsfi)
- [kIOPCIExpressCapabilityIDSPCIe](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidspcie)
- [kIOPCIExpressCapabilityIDSRIOV](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidsriov)
- [kIOPCIExpressCapabilityIDTPHRequester](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidtphrequester)
- [kIOPCIExpressCapabilityIDVC_MFVCPresent](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidvc_mfvcpresent)
- [kIOPCIExpressCapabilityIDVFResizableBAR](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidvfresizablebar)
- [kIOPCIExpressCapabilityIDVSEC](https://developer.apple.com/documentation/pcidriverkit/kiopciexpresscapabilityidvsec)
- [kIOPCISlotStatusAttentionButtonPressed](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatusattentionbuttonpressed)
- [kIOPCISlotStatusCommandCompleted](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatuscommandcompleted)
- [kIOPCISlotStatusDataLinkLayerStateChanged](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatusdatalinklayerstatechanged)
- [kIOPCISlotStatusElectromechanicalInterlockState](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatuselectromechanicalinterlockstate)
- [kIOPCISlotStatusMRLSensorChanged](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatusmrlsensorchanged)
- [kIOPCISlotStatusMRLSensorState](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatusmrlsensorstate)
- [kIOPCISlotStatusPowerFaultDetected](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatuspowerfaultdetected)
- [kIOPCISlotStatusPresenceDetectChanged](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatuspresencedetectchanged)
- [kIOPCISlotStatusPresenceDetectState](https://developer.apple.com/documentation/pcidriverkit/kiopcislotstatuspresencedetectstate)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
