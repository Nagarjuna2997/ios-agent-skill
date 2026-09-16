# QuickLook UI

## Context

Load this when a task names **QuickLook UI** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/quicklookui) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create previews of files to use inside your macOS app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Quick Look UI`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 12.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Previews

- [QLPreviewPanel](https://developer.apple.com/documentation/quicklookui/qlpreviewpanel)
- [QLPreviewView](https://developer.apple.com/documentation/quicklookui/qlpreviewview)
- [QLPreviewItem](https://developer.apple.com/documentation/quicklookui/qlpreviewitem)
- [QLPreviewPanelDataSource](https://developer.apple.com/documentation/quicklookui/qlpreviewpaneldatasource)
- [QLPreviewPanelDelegate](https://developer.apple.com/documentation/quicklookui/qlpreviewpaneldelegate)
- [QLPreviewItemLoadingBlock](https://developer.apple.com/documentation/quicklookui/qlpreviewitemloadingblock) — deprecated

### Preview Extensions

- [QLPreviewingController](https://developer.apple.com/documentation/quicklookui/qlpreviewingcontroller)

### Data-based Preview Extensions

- [QLPreviewProvider](https://developer.apple.com/documentation/quicklookui/qlpreviewprovider)
- [QLFilePreviewRequest](https://developer.apple.com/documentation/quicklookui/qlfilepreviewrequest)
- [QLPreviewReply](https://developer.apple.com/documentation/quicklookui/qlpreviewreply)
- [QLPreviewReplyAttachment](https://developer.apple.com/documentation/quicklookui/qlpreviewreplyattachment)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
