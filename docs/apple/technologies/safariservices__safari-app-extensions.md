# Safari app extensions

## Context

Load this when a task names **Safari app extensions** or one of the API topics below.

Apple categories: Web.

[Apple documentation](https://developer.apple.com/documentation/safariservices/safari-app-extensions) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Learn how Safari app extensions extend the web-browsing experience in Safari by leveraging web technologies and native code.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Safari Services`.

Documentation language identifiers: occ, swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Building a Safari app extension](https://developer.apple.com/documentation/safariservices/building-a-safari-app-extension)
- [Converting a legacy Safari extension to a Safari app extension](https://developer.apple.com/documentation/safariservices/converting-a-legacy-safari-extension-to-a-safari-app-extension)
- [Troubleshooting your Safari app extension](https://developer.apple.com/documentation/safariservices/troubleshooting-your-safari-app-extension)

### Injected style sheets and scripts

- [Using injected style sheets and scripts](https://developer.apple.com/documentation/safariservices/using-injected-style-sheets-and-scripts)
- [Injecting a script into a webpage](https://developer.apple.com/documentation/safariservices/injecting-a-script-into-a-webpage)
- [Injecting CSS style sheets into a webpage](https://developer.apple.com/documentation/safariservices/injecting-css-style-sheets-into-a-webpage)
- [Passing messages between Safari app extensions and injected scripts](https://developer.apple.com/documentation/safariservices/passing-messages-between-safari-app-extensions-and-injected-scripts)
- [SFSafariExtensionHandler](https://developer.apple.com/documentation/safariservices/sfsafariextensionhandler)
- [SFSafariExtensionManager](https://developer.apple.com/documentation/safariservices/sfsafariextensionmanager)
- [SFSafariExtensionState](https://developer.apple.com/documentation/safariservices/sfsafariextensionstate)
- [SFSafariPageProperties](https://developer.apple.com/documentation/safariservices/sfsafaripageproperties)
- [SFSafariExtensionHandling](https://developer.apple.com/documentation/safariservices/sfsafariextensionhandling)
- [SFExtensionProfileKey](https://developer.apple.com/documentation/safariservices/sfextensionprofilekey)

### Information property list keys

- [Safari app extension information property list keys](https://developer.apple.com/documentation/safariservices/safari-app-extension-information-property-list-keys)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
