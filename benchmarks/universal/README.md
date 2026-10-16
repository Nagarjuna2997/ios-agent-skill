# Universal input benchmark: first native screen

Experimental, unscored prototype; not a skill-vs-baseline comparison. No historical benchmark data changes.

The implemented fixture is `html-disclosure/index.html`: a synthetic trail recommendation screen with explicit inline design tokens and a real HTML details/summary interaction. The pipeline maps it to a native SwiftUI DisclosureGroup, not a WebView. React, Next.js, Flutter, screenshot reconstruction and existing SwiftUI redesign fixtures remain planned; they are not included in a claimed pass count.

## Actual evidence — October 15, 2026 (America/Chicago)

- Xcode 27.0, build 27A266a; iPhone 18 Pro simulator on iOS 27.0.
- Native deployment target iOS 17.0, unsigned simulator build.
- Build succeeded: zero compiler errors or warnings in the captured result.
- One XCUITest passed, zero failed/skipped. It verifies the title, initially hidden details, expanded text and collapse. No generated unit-test coverage is claimed.
- Real simulator capture and browser reference: 1206 × 2622 pixels each.
- Raw pixel mean absolute channel error: 0.0505763 (0–1).
- Fraction of pixels differing by more than 8/255 in at least one channel: 0.279274.
- Visual verdict: **requires review**. These are raw difference metrics, not 72% accuracy or a fidelity certification.
- One conversion run took approximately 35.5 seconds for native verification. No model calls or automatic repair iterations. A reference font mismatch was corrected manually before this recorded run; this is not evidence of autonomous visual repair.

Inspect [reference](evidence/html-disclosure/reference.png), [native screen](evidence/html-disclosure/native.png), [difference image](evidence/html-disclosure/difference.png), [actual verification result](evidence/html-disclosure/verification.json), [IR](evidence/html-disclosure/app-ir.json), [generated SwiftUI](evidence/html-disclosure/RootView.swift) and [artifact hashes](evidence/html-disclosure/hashes.json). Absolute paths in the result identify the local raw build/test logs and xcresult; those temporary paths are not portable artifacts. The JSON records raw UTC timestamps; the user-facing date above is Central time.

Manual pixel inspection: content, green card, spacing intent and expandable control are present. The headline breaks differently; native safe-area/status-bar spacing shifts content downward; the native chevron is on the opposite side from the HTML disclosure marker. These are unresolved differences. Dark appearance, XXL, VoiceOver, full accessibility audit, navigation, backend and production behavior are not verified by this fixture. Screenshot inspection alone cannot establish those properties.

## Reproduce

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node --test mcp-server/test/app-ir.test.js
node benchmarks/universal/run-html.mjs /tmp/unique-output SIMULATOR_UDID /absolute/reference.png
```

Choose an available simulator with `xcrun simctl list devices available`. The output directory must not exist. This benchmark is deliberately local; no imported scripts, provider calls, credentials or signing identity are needed. Xcode's existing build/test helpers enforce bounded command timeouts. Each stage saves its evidence so a failure preserves completed results; **automatic resume of this new benchmark runner is not implemented yet**. The existing agent's resumability remains unchanged.

The browser reference was captured using headless Google Chrome via Playwright at 402 × 874 CSS pixels and device scale factor 3, loading the local fixture with external requests blocked. No simulator frame, source content or image was synthesized. Pixel comparison does not resize images. Optional explicit equal-size crop regions are supported in `app-ir/compare.ts`; this recorded run compares full images without crops. To reproduce browser capture, use the same browser and viewport and save the screenshot before running the benchmark; status-bar time and rasterization affect exact pixels.

## Next verification work

Pin capture appearance/text size/browser version in the runner, normalize safe-area regions explicitly, add dark/XXL and accessibility checks, and make stage checkpoints atomically resumable with code/input/evidence hash validation. Connect a bounded reference-driven repair only after those gates are reliable. Keep raw visual differences and unsupported cases separate from build and behavior success.

## M2 visual gate

The experimental [M2 benchmark](fidelity/README.md) adds a framework-independent evidence contract, bounded repair decisions, a dedicated simulator capture protocol and accessibility audits. Its first native repair regressed the measured visual differences and was not accepted. M2 remains partial; automated layout and line-break measurements are still missing. The M1 evidence above is unchanged.
