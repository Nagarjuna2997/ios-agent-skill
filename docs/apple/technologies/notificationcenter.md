# Notification Center

## Context

Load this when a task names **Notification Center** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/notificationcenter) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create and manage widgets for the Today view.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Notification Center`.

Documentation language identifiers: occ, swift.

**Apple marks this technology as deprecated.** Read the migration/replacement guidance before selecting it for new work.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 8.0 | — | No |
| iPadOS | 8.0 | — | No |
| Mac Catalyst | 8.0 | — | No |
| macOS | 10.10 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Core Widget

- [NCWidgetProviding](https://developer.apple.com/documentation/notificationcenter/ncwidgetproviding) — deprecated
- [NCWidgetController](https://developer.apple.com/documentation/notificationcenter/ncwidgetcontroller) — deprecated

### Search View

- [NCWidgetSearchViewController](https://developer.apple.com/documentation/notificationcenter/ncwidgetsearchviewcontroller) — deprecated
- [NCWidgetSearchViewDelegate](https://developer.apple.com/documentation/notificationcenter/ncwidgetsearchviewdelegate) — deprecated

### List View

- [NCWidgetListViewController](https://developer.apple.com/documentation/notificationcenter/ncwidgetlistviewcontroller) — deprecated

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
