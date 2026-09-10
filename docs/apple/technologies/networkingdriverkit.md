# NetworkingDriverKit

## Context

Load this when a task names **NetworkingDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/networkingdriverkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop drivers for Ethernet networking devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `NetworkingDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.driverkit.family.networking](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.networking)

### Samples

- [Connecting a network driver](https://developer.apple.com/documentation/pcidriverkit/connecting-a-network-driver)
- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Network Service

- [IOUserNetworkEthernet](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkethernet)

### Packet Management

- [IOUserNetworkPacketBufferPool](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketbufferpool)
- [IOUserNetworkPacket](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacket)
- [IOUserNetworkPacketDirection](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketdirection)

### Packet Queues

- [IOUserNetworkRxSubmissionQueue](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxsubmissionqueue)
- [IOUserNetworkRxCompletionQueue](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxcompletionqueue)
- [IOUserNetworkTxSubmissionQueue](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxsubmissionqueue)
- [IOUserNetworkTxCompletionQueue](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxcompletionqueue)
- [IOUserNetworkPacketQueue](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketqueue)

### Reference

- [NetworkingDriverKit Structures](https://developer.apple.com/documentation/networkingdriverkit/networkingdriverkit-structures)
- [NetworkingDriverKit Data Types](https://developer.apple.com/documentation/networkingdriverkit/networkingdriverkit-data-types)
- [NetworkingDriverKit Constants](https://developer.apple.com/documentation/networkingdriverkit/networkingdriverkit-constants)

### Classes

- [IOUserNetworkPacketPoller](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketpoller)
- [IOUserNetworkPacketQueueCompat](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketqueuecompat)
- [IOUserNetworkRxCompletionQueueCompat](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxcompletionqueuecompat)
- [IOUserNetworkRxSubmissionQueueCompat](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxsubmissionqueuecompat)
- [IOUserNetworkTxCompletionQueueCompat](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxcompletionqueuecompat)
- [IOUserNetworkTxSubmissionQueueCompat](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxsubmissionqueuecompat)

### Structures

- [IOUserNetworkEthernet_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkethernet_ivars)
- [IOUserNetworkPacketQueueCompat_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketqueuecompat_ivars)
- [IOUserNetworkRxCompletionQueueCompat_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxcompletionqueuecompat_ivars)
- [IOUserNetworkRxSubmissionQueueCompat_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkrxsubmissionqueuecompat_ivars)
- [IOUserNetworkTxCompletionQueueCompat_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxcompletionqueuecompat_ivars)
- [IOUserNetworkTxSubmissionQueueCompat_IVars](https://developer.apple.com/documentation/networkingdriverkit/iousernetworktxsubmissionqueuecompat_ivars)

### Macros

- [NDK_25](https://developer.apple.com/documentation/networkingdriverkit/ndk_25)

### Enumeration Cases

- [kIOUserNetworkHWAssistLRONumSeg](https://developer.apple.com/documentation/networkingdriverkit/kiousernetworkhwassistlronumseg)

### Type Aliases

- [DequeueActionCompat](https://developer.apple.com/documentation/networkingdriverkit/dequeueactioncompat)
- [EnqueueActionCompat](https://developer.apple.com/documentation/networkingdriverkit/enqueueactioncompat)
- [IOUserNetworkPacketQueueCompatId](https://developer.apple.com/documentation/networkingdriverkit/iousernetworkpacketqueuecompatid)
- [QueryFreeSpaceActionCompat](https://developer.apple.com/documentation/networkingdriverkit/queryfreespaceactioncompat)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
