# MailKit

## Context

Load this when a task names **MailKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/mailkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Secure, customize, and act on email messages that users send and receive.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `MailKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 12.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [MEExtension](https://developer.apple.com/documentation/mailkit/meextension)
- [Build Mail App Extensions](https://developer.apple.com/documentation/mailkit/build-mail-app-extensions)

### Content Blockers

- [MEContentBlocker](https://developer.apple.com/documentation/mailkit/mecontentblocker)

### Message Actions

- [MEMessageActionHandler](https://developer.apple.com/documentation/mailkit/memessageactionhandler)

### Compose Window Enhancements

- [MEComposeSessionHandler](https://developer.apple.com/documentation/mailkit/mecomposesessionhandler)

### Message Encryption, Decryption, and Digital Signatures

- [MEMessageSecurityHandler](https://developer.apple.com/documentation/mailkit/memessagesecurityhandler)

### Message Properties

- [MEMessage](https://developer.apple.com/documentation/mailkit/memessage)
- [MEMessageState](https://developer.apple.com/documentation/mailkit/memessagestate)

### Custom View Controllers

- [MEExtensionViewController](https://developer.apple.com/documentation/mailkit/meextensionviewcontroller)

### Structures

- [MEMessageSecurityError](https://developer.apple.com/documentation/mailkit/memessagesecurityerror)

### Classes

- [MEComposeContext](https://developer.apple.com/documentation/mailkit/mecomposecontext)
- [MEDecodedMessageBanner](https://developer.apple.com/documentation/mailkit/medecodedmessagebanner)
- [MEEmailAddress](https://developer.apple.com/documentation/mailkit/meemailaddress)
- [MEExtensionManager](https://developer.apple.com/documentation/mailkit/meextensionmanager)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
