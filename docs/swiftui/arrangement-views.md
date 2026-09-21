# SwiftUI and UIKit arrangement views

## Context

Apple symbol metadata checked 2026-09-21 lists **iOS/iPadOS 27.1 beta**, not 27.0,
for [ArrangementView](https://developer.apple.com/documentation/swiftui/arrangementview)
and [UIArrangementViewController](https://developer.apple.com/documentation/uikit/uiarrangementviewcontroller).
A runtime guard cannot make an older SDK recognize these symbols.

## Pattern

In SwiftUI, `ArrangementView` owns primary and secondary view content.
`arrangementViewStyle(_:)` selects a split or overlay presentation. Restrict layout
axes through the style’s `axes(_:)`, and use `splitArrangementLayoutRatio(...)`
for proportional constraints. A custom `ArrangementViewStyle` implements
`makeBody(configuration:)` using the supplied primary/secondary content.
Keep app state outside layout decisions so changing orientation or arrangement
preserves selection, drafts and ongoing work.

In UIKit, use `setViewController(_:for:animated:)` with primary/secondary
placements and `updateArrangement(_:animated:)` to change between
`UISplitArrangement` and `UIOverlayArrangement`. Custom arrangements implement
the documented `Arrangement` contract, including default and per-placement view
properties. Query placement and state through the controller, rather than
inferring them from child ordering.

Review split, overlay, narrow/wide sizes, accessibility text sizes and state
preservation independently. For older deployment targets, provide a supported
layout fallback. Compile both paths using an SDK that declares the new APIs.

Sources: [SwiftUI September updates](https://developer.apple.com/documentation/updates/swiftui),
[UIKit September updates](https://developer.apple.com/documentation/updates/uikit).

## Related September APIs

The same update pages describe reserved-region queries, hinge updates, vertical
bar placement and camera-capture scene accessories. Retrieve their specific symbol
metadata before adoption; do not assume every item shares the same minimum OS.
Prefer documented reserved-region geometry over hardcoded hinge dimensions.

## Anti-Patterns

- Do not require migration from a working NavigationSplitView or custom layout.
- Do not confuse `.split` or `.axes` on an unrelated type with an arrangement API.
- Do not claim an iPad resize test validates Duo folding or outer-display behavior.

## Verification

`analyze_swift_project` recognizes nine specific arrangement API references with
source links and 27.1 metadata, excluding comments, strings and same-file type
shadows. This is lexical recognition, not Swift name resolution or a missing-guard
diagnostic. Tests validate recognition; real arrangement builds/runtime behavior
remain unverified because the local SDK is older.
