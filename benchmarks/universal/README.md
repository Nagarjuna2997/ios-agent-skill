# Universal input benchmark: first native screen

Experimental, unscored prototype; not a skill-vs-baseline comparison. No historical benchmark data changes.

The implemented fixture is `html-disclosure/index.html`: a synthetic trail recommendation screen with explicit inline design tokens and a real HTML details/summary interaction. The pipeline maps it to a native SwiftUI DisclosureGroup, not a WebView. Additional fixtures are described below. Next.js, Flutter, screenshot reconstruction and existing SwiftUI redesign remain planned; they are not included in a claimed pass count.

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

The experimental [M2 benchmark](fidelity/README.md) adds a framework-independent evidence contract, bounded repair decisions, a dedicated simulator capture protocol and accessibility audits. Its first native repair regressed the measured visual differences and was not accepted. M2 now measures native text geometry/clipping, compares recognized line breaks conservatively, and resumes hash-checked stages. The latest local run passed twelve native test executions and resumed successfully; typography remained unavailable and the repair was rejected. See the M2 report for limits and hosted verification status. The M1 evidence above is unchanged.

## Static React and offline review (experimental)

The same FieldNotes fixture now has a static JSX counterpart in `html-disclosure/App.tsx`. It contains same-file component composition and native disclosure behavior. Inspect with `app-ir inspect-react`; run the shared fidelity runner with `FIDELITY_ADAPTER=react-static`. The adapter is read-only and rejects executable/dynamic React rather than guessing. See the [architecture](../../docs/architecture/universal-app-engine.md#static-react-adapter-experimental-not-general-reactnextjs-support) for supported syntax and limits.

To review an extracted GitHub Actions artifact, local fidelity output, or React boolean-state output without a server:

```sh
node benchmarks/universal/render-evidence.mjs /path/to/evidence /tmp/review.html
```

The review page includes the source reference, native images, differences, capture profile, tests and repair decision. It is not live streaming or human approval. Native execution and visual acceptance are separate outcomes; a successfully built React fixture can still fail typography/fidelity.

### Recorded local React result (2026-10-16)

[Report](evidence/react-static-local/report.json) and [hash manifest](evidence/react-static-local/hashes.json): Xcode 27.0 / iOS 27.0, iPhone 18 Pro, two builds succeeded and 12 native test executions passed across default/XXXL size and baseline/candidate. The run completed as **rejected**, not a fidelity pass: the heading retains two unmatched boundary positions and the candidate worsens visual metrics. No reference approval or baseline promotion was created. The final adapter's generated baseline source hash matches this verified native build even after unsupported-input hardening.

The first setup attempt could not find Playwright's downloaded browser. A fresh directory using explicit installed Chrome completed; its actual browser version is recorded in the report. A setup failure is not a failed native test. These results establish only this static React fixture's generation/build/native behavior, not general React compatibility or browser-runtime equivalence.

### Heading sizing investigation

A separate local native experiment added `.fixedSize(horizontal: false, vertical: true)` only to the heading. One XCTest passed, but the measured heading still wrapped after word index 2 rather than reference index 3. [Source, observations and logs](evidence/heading-sizing-experiment/summary.json) are retained with hashes. The hypothesis was not supported, so this change was **not** added to the generator. No source font, spacing or gate tolerance was changed to hide the mismatch. Heading repair remains open.

## Boolean React state (separate native behavior fixture)

See [react-state/README.md](react-state/README.md) for entry-component boolean state,
explicit button transitions, independent state and relaunch tests. It uses the
same App IR and native generator, with a separate pinned, resumable runner.
This fixture does not contribute to HTML or React visual-fidelity scores.

Native behavior reports have their own view with recorded build status, separate Large/XXXL test counts, and labelled XCTest screenshots. They never appear as visual fidelity results. Missing screenshots stay unavailable; contradictory completion counts are rejected. The viewer does not rerun verification or authenticate checkpoint hashes.

The native evidence viewer also accepts the separately recorded
`react-memory-router` navigation fixture. It displays that fixture's own identity,
Large/XXXL tests and captured screens. For the two supported native fixtures, a
completed report requires exactly three passing tests per size, zero failures or
skips, a successful build and no recorded execution error. A report with a reduced
passing subset or an inconsistent declared test count is rejected. Failed reports
can still show the actual partial results. Unknown fixture IDs are rejected.
These checks validate report consistency; they do not authenticate evidence,
rerun tests, approve a reference or establish visual fidelity.
