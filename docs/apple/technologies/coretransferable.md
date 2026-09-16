# Core Transferable

## Context

Load this when a task names **Core Transferable** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/coretransferable) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Declare a transfer representation for your model types to participate in system sharing and data transfer operations.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Core Transferable`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Transferable](https://developer.apple.com/documentation/coretransferable/transferable)
- [TransferRepresentation](https://developer.apple.com/documentation/coretransferable/transferrepresentation)
- [Choosing a transfer representation for a model type](https://developer.apple.com/documentation/coretransferable/choosing-a-transfer-representation-for-a-model-type)

### Data transfer

- [CodableRepresentation](https://developer.apple.com/documentation/coretransferable/codablerepresentation)
- [DataRepresentation](https://developer.apple.com/documentation/coretransferable/datarepresentation)

### File transfer

- [FileRepresentation](https://developer.apple.com/documentation/coretransferable/filerepresentation)
- [SentTransferredFile](https://developer.apple.com/documentation/coretransferable/senttransferredfile)
- [ReceivedTransferredFile](https://developer.apple.com/documentation/coretransferable/receivedtransferredfile)

### Transfer customization

- [ProxyRepresentation](https://developer.apple.com/documentation/coretransferable/proxyrepresentation)
- [TransferRepresentationVisibility](https://developer.apple.com/documentation/coretransferable/transferrepresentationvisibility)

### Supporting types

- [TransferRepresentationBuilder](https://developer.apple.com/documentation/coretransferable/transferrepresentationbuilder)
- [TupleTransferRepresentation](https://developer.apple.com/documentation/coretransferable/tupletransferrepresentation)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
