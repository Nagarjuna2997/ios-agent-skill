# Installer JS

## Context

Load this when a task names **Installer JS** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/installer_js) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage and customize the installation and distribution experience.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: data.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Classes

- [Applications](https://developer.apple.com/documentation/installer_js/applications)
- [Choice](https://developer.apple.com/documentation/installer_js/choice)
- [Files](https://developer.apple.com/documentation/installer_js/files)
- [IORegistry](https://developer.apple.com/documentation/installer_js/ioregistry)
- [ProcessInformation](https://developer.apple.com/documentation/installer_js/processinformation)
- [Result](https://developer.apple.com/documentation/installer_js/result)
- [System](https://developer.apple.com/documentation/installer_js/system)
- [Target](https://developer.apple.com/documentation/installer_js/target)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
