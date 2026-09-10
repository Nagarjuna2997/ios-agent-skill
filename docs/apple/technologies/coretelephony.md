# Core Telephony

## Context

Load this when a task names **Core Telephony** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/coretelephony) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Access information about a user’s cellular service provider, such as its unique identifier and whether the carrier allows VoIP.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Telephony`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 4.0 | — | No |
| iPadOS | 4.0 | — | No |
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Service information

- [CTTelephonyNetworkInfo](https://developer.apple.com/documentation/coretelephony/cttelephonynetworkinfo)
- [iPhone quick switch](https://developer.apple.com/documentation/coretelephony/iphone-quick-switch)

### eSIM

- [CTCellularPlanProvisioning](https://developer.apple.com/documentation/coretelephony/ctcellularplanprovisioning)
- [CTCellularPlanProvisioningRequest](https://developer.apple.com/documentation/coretelephony/ctcellularplanprovisioningrequest)
- [CTCellularPlanProperties](https://developer.apple.com/documentation/coretelephony/ctcellularplanproperties)
- [CTCellularPlanCapability](https://developer.apple.com/documentation/coretelephony/ctcellularplancapability)

### SIM

- [CTCellularPlanStatus](https://developer.apple.com/documentation/coretelephony/ctcellularplanstatus)

### Subscriber information

- [CTSubscriber](https://developer.apple.com/documentation/coretelephony/ctsubscriber)
- [CTSubscriberDelegate](https://developer.apple.com/documentation/coretelephony/ctsubscriberdelegate)
- [CTSubscriberInfo](https://developer.apple.com/documentation/coretelephony/ctsubscriberinfo)

### Cellular data access

- [CTCellularData](https://developer.apple.com/documentation/coretelephony/ctcellulardata)

### Network slicing

- [CTSlicingManager](https://developer.apple.com/documentation/coretelephony/ctslicingmanager)

### Errors

- [CTError](https://developer.apple.com/documentation/coretelephony/cterror)

### Deprecated

- [CTCarrier](https://developer.apple.com/documentation/coretelephony/ctcarrier) — deprecated
- [CTCall](https://developer.apple.com/documentation/coretelephony/ctcall) — deprecated
- [CTCallCenter](https://developer.apple.com/documentation/coretelephony/ctcallcenter) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
