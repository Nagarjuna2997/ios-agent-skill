# Paravirtualized Graphics

## Context

Load this when a task names **Paravirtualized Graphics** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/paravirtualizedgraphics) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Add graphics acceleration to your guest driver stack.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Paravirtualized Graphics`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 14.0 | — | No |
| macOS | 11.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### PCI Device Characteristics

- [PG_PCI_DEVICE_ID](https://developer.apple.com/documentation/paravirtualizedgraphics/pg_pci_device_id)
- [PG_PCI_VENDOR_ID](https://developer.apple.com/documentation/paravirtualizedgraphics/pg_pci_vendor_id)
- [PG_PCI_BAR_MMIO](https://developer.apple.com/documentation/paravirtualizedgraphics/pg_pci_bar_mmio)
- [PG_PCI_MAX_MSI_VECTORS](https://developer.apple.com/documentation/paravirtualizedgraphics/pg_pci_max_msi_vectors)
- [PGCopyOptionROMURL()](https://developer.apple.com/documentation/paravirtualizedgraphics/pgcopyoptionromurl())

### Devices

- [PGDeviceDescriptor](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdevicedescriptor)
- [PGDevice](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdevice)

### Displays

- [PGDisplayDescriptor](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdisplaydescriptor)
- [PGDisplay](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdisplay)
- [PGDisplayMode](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdisplaymode)
- [PGDisplayCoord_t](https://developer.apple.com/documentation/paravirtualizedgraphics/pgdisplaycoord_t)

### Reference

- [ParavirtualizedGraphics Constants](https://developer.apple.com/documentation/paravirtualizedgraphics/paravirtualizedgraphics-constants)
- [ParavirtualizedGraphics Functions](https://developer.apple.com/documentation/paravirtualizedgraphics/paravirtualizedgraphics-functions)
- [ParavirtualizedGraphics Data Types](https://developer.apple.com/documentation/paravirtualizedgraphics/paravirtualizedgraphics-data-types)

### Variables

- [HAS_NS_BITMAP_HEADER](https://developer.apple.com/documentation/paravirtualizedgraphics/has_ns_bitmap_header)
- [PG_SUPPORT_CREATE_DEVICE](https://developer.apple.com/documentation/paravirtualizedgraphics/pg_support_create_device)

### Functions

- [PGCreateDeviceWithDescriptor(_:)](https://developer.apple.com/documentation/paravirtualizedgraphics/pgcreatedevicewithdescriptor(_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
