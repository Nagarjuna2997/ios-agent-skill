# CKTool JS

## Context

Load this when a task names **CKTool JS** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/cktooljs) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Manage your CloudKit containers and databases from JavaScript.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `CKTool JS`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| CKTool JS | 1.2.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Integrating CloudKit access into your JavaScript automation scripts](https://developer.apple.com/documentation/cktooljs/integrating-cloudkit-access-into-your-javascript-automation-scripts)

### Promises API

- [PromisesApi](https://developer.apple.com/documentation/cktooljs/promisesapi)
- [CancellablePromise](https://developer.apple.com/documentation/cktooljs/cancellablepromise)
- [CKToolDatabaseModule](https://developer.apple.com/documentation/cktooljs/cktooldatabasemodule)

### Configuration

- [Configuration](https://developer.apple.com/documentation/cktooljs/configuration)
- [CKToolNodeJsModule](https://developer.apple.com/documentation/cktooljs/cktoolnodejsmodule)
- [CKToolBrowserModule](https://developer.apple.com/documentation/cktooljs/cktoolbrowsermodule)

### Global Structures and Enumerations

- [Container](https://developer.apple.com/documentation/cktooljs/container)
- [ContainersResponse](https://developer.apple.com/documentation/cktooljs/containersresponse)
- [CKEnvironment](https://developer.apple.com/documentation/cktooljs/ckenvironment)
- [ContainersSortByField](https://developer.apple.com/documentation/cktooljs/containerssortbyfield)
- [SortDirection](https://developer.apple.com/documentation/cktooljs/sortdirection)

### Errors

- [ErrorBase](https://developer.apple.com/documentation/cktooljs/errorbase)
- [Database, Length, Validation, and Value Errors](https://developer.apple.com/documentation/cktooljs/database-length-validation-and-value-errors)

### Classes

- [Blob](https://developer.apple.com/documentation/cktooljs/blob)
- [File](https://developer.apple.com/documentation/cktooljs/file)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
