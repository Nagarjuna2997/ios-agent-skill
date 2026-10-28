# Typed React compile evidence — 2026-10-28

The two-file `react-typed` fixture was imported without evaluating JavaScript or
resolving React type packages, then generated as a native Xcode project.
`xcodebuild -scheme TypedCard -destination 'generic/platform=iOS Simulator'
CODE_SIGNING_ALLOWED=NO build` succeeded with Xcode 27.0 / SDK 27.0,
Swift 6 mode and iOS 17 deployment target (arm64 and x86_64).

This is compilation evidence only. No simulator launch, native interaction tests,
accessibility audit, screenshot comparison or fidelity acceptance is claimed.
Source hashes and mappings are retained with the build log.
