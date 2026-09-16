# Automator

## Context

Load this when a task names **Automator** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/automator) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Develop actions that the Automator app can load and run. View, edit, and run Automator workflows in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Automator`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Actions

- [AMBundleAction](https://developer.apple.com/documentation/automator/ambundleaction)
- [AMShellScriptAction](https://developer.apple.com/documentation/automator/amshellscriptaction)
- [AMAction](https://developer.apple.com/documentation/automator/amaction)

### Workflows

- [AMWorkflow](https://developer.apple.com/documentation/automator/amworkflow)
- [AMWorkflowController](https://developer.apple.com/documentation/automator/amworkflowcontroller)
- [AMWorkflowView](https://developer.apple.com/documentation/automator/amworkflowview)
- [AMWorkspace](https://developer.apple.com/documentation/automator/amworkspace)

### Errors

- [AMAutomatorErrorDomain](https://developer.apple.com/documentation/automator/amautomatorerrordomain)
- [AMActionErrorKey](https://developer.apple.com/documentation/automator/amactionerrorkey)
- [AMError](https://developer.apple.com/documentation/automator/amerror)
- [AMError.Code](https://developer.apple.com/documentation/automator/amerror/code)

### Deprecated

- [AMAppleScriptAction](https://developer.apple.com/documentation/automator/amapplescriptaction) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
