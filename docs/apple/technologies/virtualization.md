# Virtualization

## Context

Load this when a task names **Virtualization** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/virtualization) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create virtual machines and run macOS and Linux-based operating systems.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Virtualization`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 11.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Adding the Virtualization Entitlement to Your Project](https://developer.apple.com/documentation/virtualization/adding-the-virtualization-entitlement-to-your-project)
- [com.apple.security.virtualization](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.virtualization)
- [Using iCloud with macOS virtual machines](https://developer.apple.com/documentation/virtualization/using-icloud-with-macos-virtual-machines)

### Virtual machine setup

- [Running macOS in a virtual machine on Apple silicon](https://developer.apple.com/documentation/virtualization/running-macos-in-a-virtual-machine-on-apple-silicon)
- [Running Linux in a Virtual Machine](https://developer.apple.com/documentation/virtualization/running-linux-in-a-virtual-machine)
- [Running GUI Linux in a virtual machine on a Mac](https://developer.apple.com/documentation/virtualization/running-gui-linux-in-a-virtual-machine-on-a-mac)
- [Installing macOS on a Virtual Machine](https://developer.apple.com/documentation/virtualization/installing-macos-on-a-virtual-machine)
- [Creating and Running a Linux Virtual Machine](https://developer.apple.com/documentation/virtualization/creating-and-running-a-linux-virtual-machine)
- [Virtualize macOS on a Mac](https://developer.apple.com/documentation/virtualization/virtualize-macos-on-a-mac)
- [Virtualize Linux on a Mac](https://developer.apple.com/documentation/virtualization/virtualize-linux-on-a-mac)
- [Running Intel Binaries in Linux VMs](https://developer.apple.com/documentation/virtualization/running-intel-binaries-in-linux-vms)
- [Accelerating the performance of Rosetta](https://developer.apple.com/documentation/virtualization/accelerating-the-performance-of-rosetta)

### Runtime

- [VZVirtualMachine](https://developer.apple.com/documentation/virtualization/vzvirtualmachine)
- [VZVirtualMachineView](https://developer.apple.com/documentation/virtualization/vzvirtualmachineview)
- [VZLinuxRosettaDirectoryShare](https://developer.apple.com/documentation/virtualization/vzlinuxrosettadirectoryshare)

### Devices

- [Audio](https://developer.apple.com/documentation/virtualization/audio)
- [Graphics](https://developer.apple.com/documentation/virtualization/graphics)
- [Keyboards and pointing devices](https://developer.apple.com/documentation/virtualization/keyboards-and-pointing-devices)
- [Memory](https://developer.apple.com/documentation/virtualization/memory)
- [Network](https://developer.apple.com/documentation/virtualization/network)
- [Randomization](https://developer.apple.com/documentation/virtualization/randomization)
- [Serial ports](https://developer.apple.com/documentation/virtualization/serial-ports)
- [Shared directories](https://developer.apple.com/documentation/virtualization/shared-directories)
- [Sockets](https://developer.apple.com/documentation/virtualization/sockets)
- [Storage](https://developer.apple.com/documentation/virtualization/storage)
- [Consoles](https://developer.apple.com/documentation/virtualization/consoles)
- [Clipboard sharing](https://developer.apple.com/documentation/virtualization/clipboard-sharing)
- [USB Devices](https://developer.apple.com/documentation/virtualization/usb-devices)
- [Custom Virtio drivers](https://developer.apple.com/documentation/virtualization/custom-drivers)

### Enumerations

- [Virtualization enumerations](https://developer.apple.com/documentation/virtualization/virtualization-enumerations)

### Errors

- [VZErrorDomain](https://developer.apple.com/documentation/virtualization/vzerrordomain)
- [VZError](https://developer.apple.com/documentation/virtualization/vzerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
