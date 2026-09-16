# Safari Developer Features

## Context

Load this when a task names **Safari Developer Features** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/safari-developer-tools) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Inspect, debug, and test web content in Safari, in other apps, and on other devices including iPhone and iPad.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `safari-developer-tools`.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Enabling features for web developers](https://developer.apple.com/documentation/safari-developer-tools/enabling-developer-features)

### Tools

- [Develop menu](https://developer.apple.com/documentation/safari-developer-tools/develop-menu)
- [Web Inspector](https://developer.apple.com/documentation/safari-developer-tools/web-inspector)
- [Responsive Design Mode](https://developer.apple.com/documentation/safari-developer-tools/responsive-design-mode)
- [Inspect Apps and Devices](https://developer.apple.com/documentation/safari-developer-tools/inspect-apps-and-devices)
- [Connecting an AI agent to Safari](https://developer.apple.com/documentation/safari-developer-tools/connecting-an-ai-agent-to-safari)
- [WebDriver](https://developer.apple.com/documentation/safari-developer-tools/webdriver)

### Content inspection

- [Inspecting Safari on macOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-safari-macos)
- [Inspecting iOS and iPadOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)
- [Inspecting visionOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-visionos)
- [Inspecting tvOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-tvos)
- [Enabling inspecting content in your apps](https://developer.apple.com/documentation/safari-developer-tools/enabling-inspecting-content-in-your-apps)

### Simulators

- [Installing Xcode and Simulators](https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators)
- [Adding additional simulators](https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators)

### Settings

- [Changing Developer settings in Safari on macOS](https://developer.apple.com/documentation/safari-developer-tools/developer-settings)
- [Changing Feature Flag settings in Safari on macOS](https://developer.apple.com/documentation/safari-developer-tools/feature-flag-settings)

### AutoFill

- [Improving AutoFill experiences for your forms](https://developer.apple.com/documentation/safari-developer-tools/autofill)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
