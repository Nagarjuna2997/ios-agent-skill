# Swift packages

## Context

Load this when a task names **Swift packages** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/xcode/swift-packages) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create reusable code, organize it in a lightweight way, and share it across Xcode projects and with other developers.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Package dependencies

- [Adding package dependencies to your app](https://developer.apple.com/documentation/xcode/adding-package-dependencies-to-your-app)
- [Identifying binary dependencies](https://developer.apple.com/documentation/xcode/identifying-binary-dependencies)
- [Editing a package dependency as a local package](https://developer.apple.com/documentation/xcode/editing-a-package-dependency-as-a-local-package)

### Package creation

- [Creating a standalone Swift package with Xcode](https://developer.apple.com/documentation/xcode/creating-a-standalone-swift-package-with-xcode)
- [Bundling resources with a Swift package](https://developer.apple.com/documentation/xcode/bundling-resources-with-a-swift-package)
- [Localizing package resources](https://developer.apple.com/documentation/xcode/localizing-package-resources)
- [Distributing binary frameworks as Swift packages](https://developer.apple.com/documentation/xcode/distributing-binary-frameworks-as-swift-packages)
- [Developing a Swift package in tandem with an app](https://developer.apple.com/documentation/xcode/developing-a-swift-package-in-tandem-with-an-app)
- [Organizing your code with local packages](https://developer.apple.com/documentation/xcode/organizing-your-code-with-local-packages)
- [PackageDescription](https://developer.apple.com/documentation/packagedescription)

### Package distribution

- [Publishing a Swift package with Xcode](https://developer.apple.com/documentation/xcode/publishing-a-swift-package-with-xcode)

### Continuous integration

- [Building Swift packages or apps that use them in continuous integration workflows](https://developer.apple.com/documentation/xcode/building-swift-packages-or-apps-that-use-them-in-continuous-integration-workflows)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
