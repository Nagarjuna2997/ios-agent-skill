# Apple silicon

## Context

Load this when a task names **Apple silicon** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/apple-silicon) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Get the resources you need to create software for Macs with Apple silicon.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documentation language identifiers: swift.

Apple’s directory does not supply platform availability for this entry. It may be a web API, tool, service, resource, or archived technology; inspect its source before choosing a target.

### Essentials

- [Porting your macOS apps to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-your-macos-apps-to-apple-silicon)
- [Building a universal macOS binary](https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary)

### General porting tips

- [Addressing architectural differences in your macOS code](https://developer.apple.com/documentation/apple-silicon/addressing-architectural-differences-in-your-macos-code)
- [Porting your audio code to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-your-audio-code-to-apple-silicon)
- [Porting just-in-time compilers to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-just-in-time-compilers-to-apple-silicon)

### Graphics

- [Porting your Metal code to Apple silicon](https://developer.apple.com/documentation/apple-silicon/porting-your-metal-code-to-apple-silicon)

### Performance

- [Tuning your code’s performance for Apple silicon](https://developer.apple.com/documentation/apple-silicon/tuning-your-code-s-performance-for-apple-silicon)
- [Apple Silicon CPU Optimization Guide](https://developer.apple.com/documentation/apple-silicon/cpu-optimization-guide)

### Rosetta

- [About the Rosetta translation environment](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment)

### iOS apps on Mac

- [Running your iOS apps in macOS](https://developer.apple.com/documentation/apple-silicon/running-your-ios-apps-in-macos)
- [Adapting iOS code to run in the macOS environment](https://developer.apple.com/documentation/apple-silicon/adapting-ios-code-to-run-in-the-macos-environment)
- [Providing touch gesture equivalents using Touch Alternatives](https://developer.apple.com/documentation/apple-silicon/providing-touch-gesture-equivalents-using-touch-alternatives)
- [Providing an edge-to-edge, full-screen experience in your iPad app running on a Mac](https://developer.apple.com/documentation/apple-silicon/providing-an-edge-to-edge-full-screen-experience-in-your-ipad-app-running-on-a-mac)

### Kernel and drivers

- [Implementing drivers, system extensions, and kexts](https://developer.apple.com/documentation/kernel/implementing_drivers_system_extensions_and_kexts)
- [Installing a custom kernel extension](https://developer.apple.com/documentation/apple-silicon/installing-a-custom-kernel-extension)
- [Debugging a custom kernel extension](https://developer.apple.com/documentation/apple-silicon/debugging-a-custom-kernel-extension)

### Security

- [Improving control flow integrity with pointer authentication](https://developer.apple.com/documentation/apple-silicon/improving-control-flow-integrity-with-pointer-authentication)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
