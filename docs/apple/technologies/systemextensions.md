# System Extensions

## Context

Load this when a task names **System Extensions** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/systemextensions) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Install and manage user space code that extends the capabilities of macOS.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `System Extensions`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Implementing drivers, system extensions, and kexts](https://developer.apple.com/documentation/systemextensions/implementing-drivers-system-extensions-and-kexts)
- [Debugging and testing system extensions](https://developer.apple.com/documentation/driverkit/debugging-and-testing-system-extensions)
- [System Extension Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.system-extension.install)

### Usage descriptions

- [NSSystemExtensionUsageDescriptionKey](https://developer.apple.com/documentation/systemextensions/nssystemextensionusagedescriptionkey)
- [OSBundleUsageDescriptionKey](https://developer.apple.com/documentation/systemextensions/osbundleusagedescriptionkey)

### Extension activation and deactivation

- [Installing System Extensions and Drivers](https://developer.apple.com/documentation/systemextensions/installing-system-extensions-and-drivers)
- [OSSystemExtensionManager](https://developer.apple.com/documentation/systemextensions/ossystemextensionmanager)
- [OSSystemExtensionRequest](https://developer.apple.com/documentation/systemextensions/ossystemextensionrequest)
- [System Extension Redistributable Entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.system-extension.redistributable)

### Errors

- [OSSystemExtensionError](https://developer.apple.com/documentation/systemextensions/ossystemextensionerror)
- [OSSystemExtensionError.Code](https://developer.apple.com/documentation/systemextensions/ossystemextensionerror/code)
- [OSSystemExtensionErrorDomain](https://developer.apple.com/documentation/systemextensions/ossystemextensionerrordomain)

### Reference

- [SystemExtensions Constants](https://developer.apple.com/documentation/systemextensions/systemextensions-constants)

### Classes

- [OSSystemExtensionInfo](https://developer.apple.com/documentation/systemextensions/ossystemextensioninfo)
- [OSSystemExtensionsWorkspace](https://developer.apple.com/documentation/systemextensions/ossystemextensionsworkspace)

### Protocols

- [OSSystemExtensionsWorkspaceObserver](https://developer.apple.com/documentation/systemextensions/ossystemextensionsworkspaceobserver)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
