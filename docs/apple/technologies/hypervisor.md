# Hypervisor

## Context

Load this when a task names **Hypervisor** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/hypervisor) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Build virtualization solutions on top of a lightweight hypervisor, without third-party kernel extensions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Hypervisor`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Platforms

- [Apple Silicon](https://developer.apple.com/documentation/hypervisor/apple-silicon)
- [Intel-based Mac](https://developer.apple.com/documentation/hypervisor/intel-based-mac)

### Entitlements

- [com.apple.security.hypervisor](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.hypervisor)
- [com.apple.vm.hypervisor](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.vm.hypervisor) — deprecated
- [com.apple.vm.networking](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.vm.networking)
- [com.apple.vm.device-access](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.vm.device-access)

### Reference

- [Hypervisor Structures](https://developer.apple.com/documentation/hypervisor/hypervisor-structures)
- [Hypervisor Constants](https://developer.apple.com/documentation/hypervisor/hypervisor-constants)
- [Hypervisor Functions](https://developer.apple.com/documentation/hypervisor/hypervisor-functions)
- [Hypervisor Data Types](https://developer.apple.com/documentation/hypervisor/hypervisor-data-types)

### Structures

- [hv_ipa_granule_t](https://developer.apple.com/documentation/hypervisor/hv_ipa_granule_t)
- [hv_tlbi_op_t](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_t)

### Variables

- [HV_FEATURE_REG_ID_AA64ISAR2_EL1](https://developer.apple.com/documentation/hypervisor/hv_feature_reg_id_aa64isar2_el1)
- [HV_FEATURE_REG_ID_AA64MMFR3_EL1](https://developer.apple.com/documentation/hypervisor/hv_feature_reg_id_aa64mmfr3_el1)
- [HV_FEATURE_REG_ID_AA64MMFR4_EL1](https://developer.apple.com/documentation/hypervisor/hv_feature_reg_id_aa64mmfr4_el1)
- [HV_FEATURE_REG_ID_AA64PFR2_EL1](https://developer.apple.com/documentation/hypervisor/hv_feature_reg_id_aa64pfr2_el1)
- [HV_IPA_GRANULE_16KB](https://developer.apple.com/documentation/hypervisor/hv_ipa_granule_16kb)
- [HV_IPA_GRANULE_4KB](https://developer.apple.com/documentation/hypervisor/hv_ipa_granule_4kb)
- [HV_SYS_REG_ID_AA64ISAR2_EL1](https://developer.apple.com/documentation/hypervisor/hv_sys_reg_id_aa64isar2_el1)
- [HV_SYS_REG_ID_AA64MMFR3_EL1](https://developer.apple.com/documentation/hypervisor/hv_sys_reg_id_aa64mmfr3_el1)
- [HV_SYS_REG_ID_AA64MMFR4_EL1](https://developer.apple.com/documentation/hypervisor/hv_sys_reg_id_aa64mmfr4_el1)
- [HV_SYS_REG_ID_AA64PFR2_EL1](https://developer.apple.com/documentation/hypervisor/hv_sys_reg_id_aa64pfr2_el1)
- [HV_TLBI_OP_ASIDE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_aside1is)
- [HV_TLBI_OP_RVAAE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_rvaae1is)
- [HV_TLBI_OP_RVAALE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_rvaale1is)
- [HV_TLBI_OP_RVAE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_rvae1is)
- [HV_TLBI_OP_RVALE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_rvale1is)
- [HV_TLBI_OP_VAAE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_vaae1is)
- [HV_TLBI_OP_VAALE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_vaale1is)
- [HV_TLBI_OP_VAE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_vae1is)
- [HV_TLBI_OP_VALE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_vale1is)
- [HV_TLBI_OP_VMALLE1IS](https://developer.apple.com/documentation/hypervisor/hv_tlbi_op_vmalle1is)

### Functions

- [hv_vcpu_get_serror(_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vcpu_get_serror(_:_:))
- [hv_vcpu_get_wait_for_interrupt_time(_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vcpu_get_wait_for_interrupt_time(_:_:))
- [hv_vcpu_invalidate_tlb(_:_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vcpu_invalidate_tlb(_:_:_:))
- [hv_vcpu_set_serror(_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vcpu_set_serror(_:_:))
- [hv_vm_config_get_default_ipa_granule(_:)](https://developer.apple.com/documentation/hypervisor/hv_vm_config_get_default_ipa_granule(_:))
- [hv_vm_config_get_ipa_granule(_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vm_config_get_ipa_granule(_:_:))
- [hv_vm_config_set_ipa_granule(_:_:)](https://developer.apple.com/documentation/hypervisor/hv_vm_config_set_ipa_granule(_:_:))

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
