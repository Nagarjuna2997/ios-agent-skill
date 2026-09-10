# Preference Panes

## Context

Load this when a task names **Preference Panes** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/preferencepanes) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Integrate your app’s custom preferences into the System Preferences app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Preference Panes`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Mac Catalyst | 14.0 | — | No |
| macOS | 10.1 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Preference Pane Interface

- [NSPreferencePane](https://developer.apple.com/documentation/preferencepanes/nspreferencepane)

### Notifications

- [NSPreferencePrefPaneIsAvailable](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/nspreferenceprefpaneisavailable)
- [NSPreferencePaneDoUnselect](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/nspreferencepanedounselect)
- [NSPreferencePaneCancelUnselect](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/nspreferencepanecancelunselect)
- [NSPreferencePaneSwitchToPane](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/nspreferencepaneswitchtopane)
- [NSPreferencePaneUpdateHelpMenu](https://developer.apple.com/documentation/foundation/nsnotification/name-swift.struct/nspreferencepaneupdatehelpmenu)

### Help Menu Keys

- [NSPrefPaneHelpMenuInfoPListKey](https://developer.apple.com/documentation/preferencepanes/nsprefpanehelpmenuinfoplistkey)
- [NSPrefPaneHelpMenuTitleKey](https://developer.apple.com/documentation/preferencepanes/nsprefpanehelpmenutitlekey)
- [NSPrefPaneHelpMenuAnchorKey](https://developer.apple.com/documentation/preferencepanes/nsprefpanehelpmenuanchorkey)

### Reference

- [PreferencePanes Constants](https://developer.apple.com/documentation/preferencepanes/preferencepanes-constants)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
