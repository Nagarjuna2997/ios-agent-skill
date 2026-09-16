# ManagedApp

## Context

Load this when a task names **ManagedApp** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/managedapp) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Customize your app for managed deployments by providing configurable features that rely on secure access to secrets and data that an administrator provisions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `ManagedApp`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 18.4 | — | No |
| iPadOS | 18.4 | — | No |
| visionOS | 2.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Configuration

- [Specifying and decoding a configuration](https://developer.apple.com/documentation/managedapp/specifying-and-decoding-a-configuration)
- [ManagedAppConfigurationProvider](https://developer.apple.com/documentation/managedapp/managedappconfigurationprovider)

### Secrets and identifiers

- [Accessing provisioned secrets with identifiers](https://developer.apple.com/documentation/managedapp/accessing-provisioned-secrets-with-identifiers)
- [ManagedAppCertificatesProvider](https://developer.apple.com/documentation/managedapp/managedappcertificatesprovider)
- [ManagedAppIdentitiesProvider](https://developer.apple.com/documentation/managedapp/managedappidentitiesprovider)
- [ManagedAppPasswordsProvider](https://developer.apple.com/documentation/managedapp/managedapppasswordsprovider)

### Errors

- [ManagedAppError](https://developer.apple.com/documentation/managedapp/managedapperror)
- [ManagedAppConfigurationDecodingError](https://developer.apple.com/documentation/managedapp/managedappconfigurationdecodingerror)
- [ManagedAppConfigurationDecodingErrorCode](https://developer.apple.com/documentation/managedapp/managedappconfigurationdecodingerrorcode)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
