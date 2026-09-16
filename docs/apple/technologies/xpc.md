# XPC

## Context

Load this when a task names **XPC** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/xpc) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Access a low-level interprocess communication mechanism.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `XPC`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.4 | — | No |
| iPadOS | 17.4 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [XPC updates](https://developer.apple.com/documentation/updates/xpc)

### Interprocess communication

- [Creating XPC services](https://developer.apple.com/documentation/xpc/creating-xpc-services)
- [XPCListener](https://developer.apple.com/documentation/xpc/xpclistener)
- [XPCSession](https://developer.apple.com/documentation/xpc/xpcsession)
- [XPCReceivedMessage](https://developer.apple.com/documentation/xpc/xpcreceivedmessage)
- [xpc_listener_t](https://developer.apple.com/documentation/xpc/xpc_listener_t)
- [xpc_session_t](https://developer.apple.com/documentation/xpc/xpc_session_t-10if0)

### Tasks

- [XPC activities](https://developer.apple.com/documentation/xpc/xpc-activities)

### Events

- [XPC events](https://developer.apple.com/documentation/xpc/xpc-events)

### Additional Types

- [XPC objects](https://developer.apple.com/documentation/xpc/xpc-objects)
- [Utilities](https://developer.apple.com/documentation/xpc/utilities)
- [XPC connections](https://developer.apple.com/documentation/xpc/xpc-connections)

### Classes

- [OS_xpc_session](https://developer.apple.com/documentation/xpc/os_xpc_session-swift.class)

### Structures

- [XPCEndpoint](https://developer.apple.com/documentation/xpc/xpcendpoint)
- [XPCLiteralValue](https://developer.apple.com/documentation/xpc/xpcliteralvalue)
- [XPCPeerRequirement](https://developer.apple.com/documentation/xpc/xpcpeerrequirement)

### Type Aliases

- [xpc_peer_requirement_t](https://developer.apple.com/documentation/xpc/xpc_peer_requirement_t)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
