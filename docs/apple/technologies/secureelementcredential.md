# SecureElementCredential

## Context

Load this when a task names **SecureElementCredential** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/secureelementcredential) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Allow access to credentials inside the Secure Element on device.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `SecureElementCredential`.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Accessing and using secure element credentials](https://developer.apple.com/documentation/secureelementcredential/accessing-and-using-secure-element-credentials)

### Entitlements

- [com.apple.developer.secure-element-credential](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.secure-element-credential)
- [com.apple.developer.secure-element-credential.default-contactless-app](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.secure-element-credential.default-contactless-app)

### Credentials

- [CredentialSession](https://developer.apple.com/documentation/secureelementcredential/credentialsession)

### Transactions

- [CredentialTransaction](https://developer.apple.com/documentation/secureelementcredential/credentialtransaction)

### UIKit scene delegate

- [CredentialSessionWindowSceneDelegate](https://developer.apple.com/documentation/secureelementcredential/credentialsessionwindowscenedelegate)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
