# Execution Policy

## Context

Load this when a task names **Execution Policy** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/executionpolicy) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Provide functionality so developer tools can manage execution policy exceptions.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Execution Policy`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Structures

- [EPError](https://developer.apple.com/documentation/executionpolicy/eperror-swift.struct)

### Classes

- [EPDeveloperTool](https://developer.apple.com/documentation/executionpolicy/epdevelopertool)
- [EPExecutionPolicy](https://developer.apple.com/documentation/executionpolicy/epexecutionpolicy)

### Reference

- [ExecutionPolicy Constants](https://developer.apple.com/documentation/executionpolicy/executionpolicy-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
