# Reviewing iOS launch screens

The source version of `audit_app_store_readiness` and `analyze_swift_project`
includes launch-screen checks. No additional MCP connection or tool is needed.
This change is not yet an npm release. Point a source-built server at an app's
project directory; the audit prints findings and a separate coverage summary.

A system launch screen is static. A SwiftUI or UIKit intro shown after the app
starts is ordinary app UI. The analyzer does not classify an animated Swift view
as an invalid launch screen merely because its name includes “Splash”. See the
existing [splash/intro pattern](../../patterns/motion/splash-screens.md).

## What is resolved

The reader parses OpenStep Xcode project files and XML/binary Info.plists. It
selects iOS application targets, merges matching project and target build
configurations, and follows explicit resource build phases and localized variant
groups. Configuration findings identify the target/configuration, file and line.
For binary plists, line 1 is used because binary data has no source line mapping.

Supported launch sources are `UILaunchStoryboardName`, `UILaunchScreen`, an
explicit `INFOPLIST_FILE`, and generated-plist settings including
`INFOPLIST_KEY_UILaunchStoryboardName` and `INFOPLIST_KEY_UILaunchScreen_Generation`.
SwiftUI and UIKit use the same project evidence; neither framework import proves
that launch configuration is present or absent. An empty `UILaunchScreen`
dictionary and a plain background are valid, not automatically “blank-screen” bugs.

The reader checks explicit target asset catalogs, case-sensitive image/color
names, namespaced asset groups, and referenced image payload filenames. A file
in another target does not satisfy this target's resource membership. System
colors and explicitly system-catalog storyboard images are not treated as missing
app assets. Static presence does not certify that a resource was compiled or that
it looks correct on a device.

## Diagnostics

| Rule | Evidence required |
|---|---|
| `launch-configuration-missing` | Resolved iOS app configuration lacks either supported mechanism; no alternative launch key or unknown resource pipeline explains it |
| `launch-configuration-type` | A single-storyboard key is not a nonempty string, or `UILaunchScreen` is not a dictionary |
| `launch-storyboard-missing` | Explicit target resource membership or the referenced file is absent, with a complete applicable inventory |
| `launch-asset-missing` | A referenced launch image/color is absent from the target's explicit resources; namespace resolution is known |
| `launch-asset-file-missing` | A referenced image set names a payload file that is absent |
| `launch-storyboard-invalid` | The selected storyboard is malformed XML |
| `launch-initial-controller-missing` | The storyboard has no initial entry point or its identifier cannot resolve |
| `launch-custom-class` | The selected launch storyboard declares a custom class |
| `launch-code-connection` | It declares actions, outlets or outlet collections |
| `launch-runtime-attribute` | It declares user-defined runtime attributes |
| `launch-deprecated-view` | It contains a UIWebView element |
| `launch-dictionary-availability` | Dictionary-only launch configuration with a known deployment target below iOS 14 |
| `launch-mechanisms-overlap` | Both single-storyboard and dictionary mechanisms are configured with a known minimum iOS 14+ target; minor review advisory, not a build/rejection claim |

The overlap advisory asks the developer to review intent. It does not delete
configuration or override deliberate compatibility decisions. Lower deployment
targets with a storyboard fallback do not receive that advisory.

## Conservative limits

Unresolved cases produce coverage notes rather than speculative missing-resource
findings. These include xcconfig inheritance, conditional build settings,
preprocessed plists, launch-variable substitutions, unsupported or unreadable
plists/projects, resource inclusion/exclusion settings, generated resources from
scripts, copy phases, synchronized groups, folder references and referenced paths
inside skipped dependency/build directories. Device-qualified launch keys,
multiple launch screens/storyboards and legacy launch-image configurations are
recognized but deferred. Non-generated plists with launch build-setting overrides
need resolved Xcode evidence and are deferred too.

The inventory does not follow symlinks and limits files/directories and parsed
file size. An incomplete inventory cannot prove an asset is absent. Malformed
namespace metadata is not interpreted as a valid non-namespaced group. Libraries,
packages, extensions and unconfigured source folders are not accused of missing
an app launch screen. Missing/unparseable Info.plists are coverage gaps, not
launch-specific defects.

This does not evaluate layout quality, contrast, exact rendered appearance,
launch duration, screenshot caching, state-restoration snapshots, compiled asset
variants, asset file encoding, app-store acceptance, or arbitrary third-party
project generators. It never runs Xcode, scripts or app code during a review.
Validate unresolved cases with resolved build settings, the built app's Info.plist
and resources, an actual build, and a cold launch on supported simulators/devices.
Do not delete user data to clear launch caches without explicit approval.

## Evidence and benchmark

[Launch benchmark suite](../../benchmarks/launch-screen/README.md) contains valid
and intentionally broken multi-file projects, a separate contract oracle, and a
resumable Codex runner. Fixture validation is not evidence that the skill improves
agent output. The original 120-run benchmark and its 60 paired ties stay unchanged.

## Apple references

- [Specifying your app’s launch screen](https://developer.apple.com/documentation/xcode/specifying-your-apps-launch-screen)
- [UILaunchScreen](https://developer.apple.com/documentation/bundleresources/information-property-list/uilaunchscreen)
- [UILaunchStoryboardName](https://developer.apple.com/documentation/bundleresources/information-property-list/uilaunchstoryboardname)
- [Debugging your app’s launch screen (TN3118)](https://developer.apple.com/documentation/technotes/tn3118-debugging-your-apps-launch-screen)

These sources informed the configuration and static-document constraints. A
project-level finding is based on local evidence, not a claim that Apple tested it.
