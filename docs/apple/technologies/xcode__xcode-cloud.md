# Xcode Cloud

## Context

Load this when a task names **Xcode Cloud** or one of the API topics below.

Apple categories: Developer Tools.

[Apple documentation](https://developer.apple.com/documentation/xcode/xcode-cloud) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Automatically build, test, and distribute your apps with Xcode Cloud to verify changes and create high-quality apps.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Getting started with Xcode Cloud](https://developer.apple.com/documentation/xcode/getting-started-with-xcode-cloud)
- [Distributing your Xcode Cloud builds through TestFlight](https://developer.apple.com/documentation/xcode/distributing-your-xcode-cloud-builds-through-testflight)
- [About continuous integration and delivery with Xcode Cloud](https://developer.apple.com/documentation/xcode/about-continuous-integration-and-delivery-with-xcode-cloud)
- [Setting up your project to use Xcode Cloud](https://developer.apple.com/documentation/xcode/setting-up-your-project-to-use-xcode-cloud)
- [Configuring your first Xcode Cloud workflow](https://developer.apple.com/documentation/xcode/configuring-your-first-xcode-cloud-workflow)

### Setup and maintenance

- [Making dependencies available to Xcode Cloud](https://developer.apple.com/documentation/xcode/making-dependencies-available-to-xcode-cloud)
- [Configuring Xcode Cloud for your team](https://developer.apple.com/documentation/xcode/configuring-xcode-cloud-for-your-team)
- [Sharing macOS and Xcode versions across Xcode Cloud workflows](https://developer.apple.com/documentation/xcode/sharing-custom-aliases-across-xcode-cloud-workflows)
- [Sharing environment variables across Xcode Cloud workflows](https://developer.apple.com/documentation/xcode/sharing-environment-variables-across-xcode-cloud-workflows)
- [Building Swift packages and Swift Playgrounds app projects with Xcode Cloud](https://developer.apple.com/documentation/xcode/building-swift-packages-or-swift-playground-app-projects-with-xcode-cloud)
- [Setting the next build number for Xcode Cloud builds](https://developer.apple.com/documentation/xcode/setting-the-next-build-number-for-xcode-cloud-builds)
- [Including notes for testers with a beta release of your app](https://developer.apple.com/documentation/xcode/including-notes-for-testers-with-a-beta-release-of-your-app)
- [Removing your project from Xcode Cloud](https://developer.apple.com/documentation/xcode/removing-your-project-from-xcode-cloud)
- [Changing the bundle identifier](https://developer.apple.com/documentation/xcode/changing-the-bundle-identifier)

### Usage data

- [Reviewing Xcode Cloud usage data](https://developer.apple.com/documentation/xcode/reviewing-xcode-cloud-usage-data)

### Workflows

- [Developing a workflow strategy for Xcode Cloud](https://developer.apple.com/documentation/xcode/developing-a-workflow-strategy-for-xcode-cloud)
- [Xcode Cloud workflow reference](https://developer.apple.com/documentation/xcode/xcode-cloud-workflow-reference)
- [Creating a workflow that builds your app for distribution](https://developer.apple.com/documentation/xcode/creating-a-workflow-that-builds-your-app-for-distribution)
- [Understanding Xcode Cloud infrastructure validation builds](https://developer.apple.com/documentation/xcode/understanding-infrastructure-validation-builds)

### Source code management

- [Source code management setup](https://developer.apple.com/documentation/xcode/source-code-management-setup)
- [Configuring requirements for merging a pull request](https://developer.apple.com/documentation/xcode/configuring-requirements-for-merging-a-pull-request)

### Custom build scripts

- [Writing custom build scripts](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)
- [Environment variable reference](https://developer.apple.com/documentation/xcode/environment-variable-reference)

### Troubleshooting

- [Resolving common configuration and build issues](https://developer.apple.com/documentation/xcode/resolving-common-configuration-and-build-issues)
- [Resolve GitHub Enterprise connection issues](https://developer.apple.com/documentation/xcode/resolve-github-enterprise-connection-issues)
- [Reporting feedback for Xcode Cloud](https://developer.apple.com/documentation/xcode/reporting-feedback-for-xcode-cloud)

### Notifications

- [Configuring webhooks in Xcode Cloud](https://developer.apple.com/documentation/xcode/configuring-webhooks-in-xcode-cloud)
- [Xcode Cloud webhook payload reference](https://developer.apple.com/documentation/xcode/webhook-payload)
- [Connecting Xcode Cloud to Slack](https://developer.apple.com/documentation/xcode/connecting-xcode-cloud-to-slack)

### REST API

- [Xcode Cloud Workflows and Builds](https://developer.apple.com/documentation/appstoreconnectapi/xcode-cloud-workflows-and-builds)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
