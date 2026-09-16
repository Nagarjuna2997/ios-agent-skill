# Xcode

## Context

Load this when a task names **Xcode** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/xcode) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build, test, and submit your app with Apple’s integrated development environment.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Creating an Xcode project for an app](https://developer.apple.com/documentation/xcode/creating-an-xcode-project-for-an-app)
- [Interacting with previews in the canvas](https://developer.apple.com/documentation/xcode/interacting-with-previews-in-the-canvas)
- [Adding previews to your interface files](https://developer.apple.com/documentation/xcode/adding-previews-to-your-interface-files)
- [Running your app on simulated or physical devices](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices)
- [Xcode updates](https://developer.apple.com/documentation/updates/xcode)

### Xcode IDE

- [Projects and workspaces](https://developer.apple.com/documentation/xcode/projects-and-workspaces)
- [Source control management](https://developer.apple.com/documentation/xcode/source-control-management)
- [Capabilities](https://developer.apple.com/documentation/xcode/capabilities)
- [Build system](https://developer.apple.com/documentation/xcode/build-system)
- [Command-line tools](https://developer.apple.com/documentation/xcode/command-line-tools)

### Code

- [Source editor](https://developer.apple.com/documentation/xcode/source-editor)
- [Coding intelligence](https://developer.apple.com/documentation/xcode/coding-intelligence)
- [Bundles and frameworks](https://developer.apple.com/documentation/xcode/bundles-and-frameworks)
- [Swift packages](https://developer.apple.com/documentation/xcode/swift-packages)

### Interface

- [Asset management](https://developer.apple.com/documentation/xcode/asset-management)
- [Localization](https://developer.apple.com/documentation/xcode/localization)
- [Accessibility Inspector](https://developer.apple.com/documentation/accessibility/accessibility-inspector)

### Documentation

- [Writing documentation](https://developer.apple.com/documentation/xcode/writing-documentation)

### Tuning and debugging

- [Device Hub](https://developer.apple.com/documentation/xcode/device-hub)
- [Debugging](https://developer.apple.com/documentation/xcode/debugging)
- [Performance and metrics](https://developer.apple.com/documentation/xcode/performance-and-metrics)
- [Testing](https://developer.apple.com/documentation/xcode/testing)

### Distribution and continuous integration

- [Distribution](https://developer.apple.com/documentation/xcode/distribution)
- [Xcode Cloud](https://developer.apple.com/documentation/xcode/xcode-cloud)

### Hardware considerations

- [Apple silicon](https://developer.apple.com/documentation/apple-silicon)
- [Application binary interfaces](https://developer.apple.com/documentation/xcode/application-binary-interfaces)

### Articles

- [Managing files and folders in your Xcode project](https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project)
- [Managing multiple projects and their dependencies](https://developer.apple.com/documentation/xcode/managing-multiple-projects-and-their-dependencies)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
