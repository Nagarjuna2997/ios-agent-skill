# vmnet

## Context

Load this when a task names **vmnet** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/vmnet) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Connect with network interfaces to read and write packets on guest operating systems.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `vmnet`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.vm.networking](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.vm.networking)

### Creating a network configuration

- [vmnet_network_create(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_create(_:_:))
- [vmnet_network_configuration_create(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_create(_:_:))
- [vmnet_network_create_with_serialization(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_create_with_serialization(_:_:))
- [vmnet_network_copy_serialization(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_copy_serialization(_:_:))

### Starting and stopping interfaces

- [vmnet_start_interface(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_start_interface(_:_:_:))
- [vmnet_interface_start_with_network(_:_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_interface_start_with_network(_:_:_:_:))
- [vmnet_interface_set_event_callback(_:_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_interface_set_event_callback(_:_:_:_:))
- [vmnet_stop_interface(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_stop_interface(_:_:_:))

### Customizing a network configuration

- [vmnet_network_configuration_ref](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_ref)
- [vmnet_network_configuration_add_dhcp_reservation(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_add_dhcp_reservation(_:_:_:))
- [vmnet_network_configuration_add_port_forwarding_rule(_:_:_:_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_add_port_forwarding_rule(_:_:_:_:_:_:))
- [vmnet_network_configuration_disable_router_advertisement(_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_disable_router_advertisement(_:))
- [vmnet_network_configuration_disable_nat66(_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_disable_nat66(_:))
- [vmnet_network_configuration_disable_nat44(_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_disable_nat44(_:))
- [vmnet_network_configuration_disable_dns_proxy(_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_disable_dns_proxy(_:))
- [vmnet_network_configuration_disable_dhcp(_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_disable_dhcp(_:))
- [vmnet_nat66_prefix_length_key](https://developer.apple.com/documentation/vmnet/vmnet_nat66_prefix_length_key)
- [vmnet_nat66_prefix_key](https://developer.apple.com/documentation/vmnet/vmnet_nat66_prefix_key)
- [vmnet_port_forwarding_rule_get_details(_:_:_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_port_forwarding_rule_get_details(_:_:_:_:_:))
- [vmnet_network_configuration_set_external_interface(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_set_external_interface(_:_:))
- [vmnet_network_configuration_set_ipv4_subnet(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_set_ipv4_subnet(_:_:_:))
- [vmnet_network_configuration_set_ipv6_prefix(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_set_ipv6_prefix(_:_:_:))
- [vmnet_network_configuration_set_mtu(_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_configuration_set_mtu(_:_:))
- [vmnet_network_get_ipv6_prefix(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_get_ipv6_prefix(_:_:_:))
- [vmnet_network_get_ipv4_subnet(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_network_get_ipv4_subnet(_:_:_:))

### Reading and Writing Packets

- [vmnet_read(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_read(_:_:_:))
- [vmnet_write(_:_:_:)](https://developer.apple.com/documentation/vmnet/vmnet_write(_:_:_:))

### Data types

- [vmnet_return_t](https://developer.apple.com/documentation/vmnet/vmnet_return_t)
- [vmpktdesc](https://developer.apple.com/documentation/vmnet/vmpktdesc)
- [interface_ref](https://developer.apple.com/documentation/vmnet/interface_ref)
- [interface_event_t](https://developer.apple.com/documentation/vmnet/interface_event_t)
- [operating_modes_t](https://developer.apple.com/documentation/vmnet/operating_modes_t)
- [vmnet_mode_t](https://developer.apple.com/documentation/vmnet/vmnet_mode_t)
- [vmnet_network_ref](https://developer.apple.com/documentation/vmnet/vmnet_network_ref)

### Constants

- [interface_desc XPC Dictionary Keys](https://developer.apple.com/documentation/vmnet/interface_desc_xpc_dictionary_keys)
- [interface_param XPC Dictionary Keys](https://developer.apple.com/documentation/vmnet/interface_param_xpc_dictionary_keys)
- [event XPC Dictionary](https://developer.apple.com/documentation/vmnet/event_xpc_dictionary)

### Reference

- [vmnet Constants](https://developer.apple.com/documentation/vmnet/vmnet_constants)
- [vmnet Functions](https://developer.apple.com/documentation/vmnet/vmnet_functions)
- [vmnet Data Types](https://developer.apple.com/documentation/vmnet/vmnet_data_types)

### Variables

- [vmnet_enable_virtio_header_key](https://developer.apple.com/documentation/vmnet/vmnet_enable_virtio_header_key-swift.var)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
