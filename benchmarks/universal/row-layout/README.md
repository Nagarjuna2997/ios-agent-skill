# Explicit horizontal row

The HTML fixture uses an explicit flex row with centered cross-axis alignment,
16-point gap and two text leaves. It exercises the shared IR 1.5/HStack mapping.
The portable suite checks equivalent React, Vue and Svelte input, intrinsic leaf
sizing, old schema compatibility, state coexistence and rejected nested layouts.

```sh
node mcp-server/dist/unified.js app-ir inspect benchmarks/universal/row-layout/index.html TrailSummary > /tmp/row.json
node mcp-server/dist/unified.js app-ir generate /tmp/row.json /tmp/row-project
xcodebuild -project /tmp/row-project/TrailSummary.xcodeproj -scheme TrailSummary -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

The local unsigned generic Simulator build succeeded on 2026-10-28 with
Xcode 27.0 (27A266a), iOS 27 SDK and an iOS 17 deployment target. The final renderer
produces the identical RootView bytes used by that build. This is limited native
layout support, not general CSS flexbox or a passing HTML visual-fidelity gate.

The built app was installed and launched on a fresh iPhone 18 Pro / iOS 27
simulator in light appearance and Large text size. `simulator.png` was visually
inspected: both row labels appear side by side, with the separate disclosure
visible below. Commands and exit codes are retained; the temporary simulator was
shut down and deleted. Interaction and accessibility audits were not run for this
fixture. No browser pixel comparison or baseline promotion is claimed.
