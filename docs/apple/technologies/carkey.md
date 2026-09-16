# CarKey

## Context

Load this when a task names **CarKey** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/carkey) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access the remote keyless features of configured vehicles in the Wallet app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CarKey`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Setup

- [CarKeyRemoteControl](https://developer.apple.com/documentation/carkey/carkeyremotecontrol)
- [CarKeyRemoteControlSession](https://developer.apple.com/documentation/carkey/carkeyremotecontrolsession)
- [CarKeyRemoteControlSessionDelegate](https://developer.apple.com/documentation/carkey/carkeyremotecontrolsessiondelegate)
- [VehicleReport](https://developer.apple.com/documentation/carkey/vehiclereport)

### Vehicle Actions

- [RemoteKeylessEntryAction](https://developer.apple.com/documentation/carkey/remotekeylessentryaction)
- [RemoteKeylessEntryEnduringAction](https://developer.apple.com/documentation/carkey/remotekeylessentryenduringaction) — deprecated
- [FunctionIdentifier](https://developer.apple.com/documentation/carkey/functionidentifier)
- [ActionIdentifier](https://developer.apple.com/documentation/carkey/actionidentifier)

### Error Codes

- [CarKeyErrorCode](https://developer.apple.com/documentation/carkey/carkeyerrorcode)

### Structures

- [ExecutionStatus](https://developer.apple.com/documentation/carkey/executionstatus)
- [RemoteKeylessEntryConfigurableEnduringAction](https://developer.apple.com/documentation/carkey/remotekeylessentryconfigurableenduringaction)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
