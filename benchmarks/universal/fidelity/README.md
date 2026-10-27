# M2: Visual Fidelity & Self-Repair (experimental)

This benchmark reuses App IR and the native project/build/test pipeline. Measurement, checkpoint and acceptance contracts are framework-independent. React/Next/Flutter adapters are not implemented here. No release, conversion-accuracy or production-readiness claim is made.

## Reproduce

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
npm ci --prefix benchmarks/universal/fidelity
(cd benchmarks/universal/fidelity && npx playwright install chromium)
node benchmarks/universal/fidelity/run.mjs benchmarks/universal/fidelity/local.json /tmp/new-fidelity-run
# Restart using the same inputs, installed toolchain and output directory:
node benchmarks/universal/fidelity/run.mjs benchmarks/universal/fidelity/local.json /tmp/new-fidelity-run --resume
```

Requires the exact Xcode build, SDK, runtime and device type declared by the profile; a mismatch stops before comparison. `ci.json` targets the hosted Mac. Browser version, runtime build, host build, fonts, dimensions, appearance, locale, text size and UI state are recorded. Changes invalidate resume. A different environment needs its own baseline. Optional local `PLAYWRIGHT_MODULE`/`CHROME_PATH` overrides record the actual browser version. CI uses pinned Playwright dependencies.

Native images are exported from the successful XCTest geometry test, which asserts foreground and collapsed state before attaching the app screenshot. The selector requires exactly one attachment from the pinned device; it never substitutes a simulator Home Screen image.

The runner creates and deletes only its dedicated simulator. No signing, provider calls, credentials or imported scripts are needed. Dependency installation may need network access; fixture rendering blocks external requests. Local OCR uses Apple Vision revision 3 with English recognition and CPU-only execution. The compatibility flag is deprecated but supported by the tested SDK; OCR failure or a 30-second timeout is explicitly unavailable.

## Measurements and scope

- **Clipping:** XCUITest captures text frames and runs Apple's text-clipping audit. Horizontal overflow reports the affected label and rectangle. Fully offscreen scroll content is separate; partial viewport intersections require review. This does not establish arbitrary image clipping, overlap, shadows or occlusion.
- **Wrapping:** OCR line-end token offsets are compared only when both full transcripts match expected visible source text after NFKC/whitespace normalization. Signs and punctuation are preserved. Confidence below 0.8, missing text, decorative-marker differences or failed recognition yield unavailable, never zero mismatches.
- **Interactions/accessibility:** native disclosure expansion/collapse, queried labels/traits and Apple's accessibility audit run at large and extra-extra-extra-large Dynamic Type. This is not the largest accessibility text category and does not replace manual VoiceOver navigation.
- **Pixels:** the example policy requires normalized mean error <= 0.02, changed-pixel fraction <= 0.10, minimum improvement 0.001 and zero measured line-break mismatches. These are experimental thresholds, not calibrated perceptual accuracy.

Safe-area normalization is explicit: 62 points top and 34 bottom at scale 3. These are fixture/device assumptions, not automatic measurements. There is no image resizing. The browser viewport matches the cropped native region; captures use collapsed state and light appearance. Dark mode and expanded-state pixel comparison remain unsupported.

## Gate and known-good baseline

**Accepted** requires all independent checks to pass, thresholds to be met, and no measured functional, accessibility or visual regression. **Rejected** means a failed check, clipping/accessibility problem, reduced test coverage or metric regression. **Requires review** means incomplete evidence, changed capture conditions, unchanged source, insufficient improvement or verifier failure. Improved pixels alone cannot accept a candidate. Both rejected and review-required exit nonzero in CI.

A known-good baseline must satisfy every required check and threshold. It remains null until then. `known-good.ts` advances it only after acceptance; rejected/review candidates never become the next comparison baseline. The current fixture implements one deterministic leading-disclosure strategy. It does not implement a vision-model repair loop or cross-run import of a previously approved application's baseline.

## Resume and evidence integrity

Generation, build, tests/captures, reference and measurements have atomic checkpoints. Reuse validates the input/environment contract and every declared artifact hash. Changed/missing evidence stops reuse. Completed repair decisions also revalidate candidate checkpoints before returning a verdict.

Interrupted stages rerun; completed stages do not. Interrupted generation preserves partial output and creates a new isolated directory. A PID lock serializes writers, and explicit resume reclaims only a dead owner. A hard crash can leave the dedicated simulator for manual cleanup. Hashes provide integrity checks, not signatures, a sandbox or protection from a malicious local writer.

The coordinator allows up to three reserved attempts; this adapter declares one. Checkpoint-backed recovery reuses its reserved attempt number. `FIDELITY_INTERRUPT_AFTER=baseline-large` exercises stopping after an atomic capture checkpoint. The hosted workflow tests that stop and then resumes. Completed-run resume was also verified locally without changing any of the twelve checkpoints.

## Actual local results

Code commit: `9682582a579f5318557d90c023fb1fb8e5c473bb`, October 15, 2026 (America/Chicago).

- Both unsigned native builds passed on Xcode 27.0 (27A266a), iPhone 18 Pro/iOS 27.0.
- Twelve native test executions passed; zero failed/skipped. Text geometry and clipping audits passed at both text sizes for both candidates.
- The injected stop was resumed successfully. A subsequent completed-run resume reused all twelve checkpoints unchanged and retained the rejected verdict.
- Typography was **unavailable** in this run because OCR failed/timed out. No known-good baseline was established.
- The leading-disclosure candidate increased visual error and was **rejected**. No promotion occurred.
- Portable full-suite result: 640 passed, zero failures, one skipped. A later focused run including the added checkpoint-interruption regression passed 38 tests.

See [preserved report](../evidence/fidelity-resume/report.json), [summary](../evidence/fidelity-resume/summary.json), [resume proof](../evidence/fidelity-resume/resume-proof.json), [baseline](../evidence/fidelity-resume/baseline/native-large.png), [candidate](../evidence/fidelity-resume/candidate-1/native-large.png), and [hashes](../evidence/fidelity-resume/hashes.json). The raw report retains the earlier injected interruption in its `error` field; its final status is rejected, not a new pipeline failure. Logs are gzip-compressed without altering their original bytes. Absolute raw-run paths are local provenance, not portable artifact links.

The earlier [M2 foundation evidence](../evidence/fidelity-m2/) and M1 evidence are unchanged. An intermediate run recovered OCR and observed the headline wrapping difference, but also encountered disk exhaustion; it is not a completed result for this protocol. Unknown typography, limited clipping coverage and hosted results must remain separate from successful native tests. M2 is not yet a visual-fidelity pass.

## Hosted capture correction

The first hosted run ([38839913120](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38839913120)) built both variants and passed all 12 native test executions, including checkpoint restart. Its post-test simulator screenshots captured SpringBoard, so those pixel comparisons are invalid and are not evidence of app fidelity. The revised runner uses XCTest attachments as described above. Empty OCR returns unavailable rather than crashing the verifier; resumed errors move into interruption history. The corrected local and hosted results are recorded below.

## Corrected local capture evidence

Implementation `52097f5`: two native builds and all 12 native test executions passed (three tests × two text sizes × two variants). Native images came from the foreground/collapsed XCTest attachment. The candidate increased mean pixel error from 0.018485 to 0.019507 and changed-pixel fraction from 0.070431 to 0.088576; the gate rejected it. Typography remained unavailable because local Vision OCR failed/timed out. No known-good baseline was promoted.

An interrupted run resumed from its completed capture; a completed-run resume revalidated all 12 checkpoints without changing their mtimes. An intervening documentation edit was correctly refused by the input contract and matching input was restored before continuation. The input README snapshot is included because it differed from the committed documentation.

See [report](../evidence/xctest-capture/report.json), [summary](../evidence/xctest-capture/summary.json), [resume proof](../evidence/xctest-capture/resume-proof.json), [baseline](../evidence/xctest-capture/baseline/native-large.png), [candidate](../evidence/xctest-capture/candidate-1/native-large.png), and [hashes](../evidence/xctest-capture/hashes.json). This verifies capture and resumability, not a passing visual-fidelity result. The full portable suite passed 645 tests, failed zero and skipped one.

## Corrected hosted verification

[Run 38842111648](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38842111648) at implementation `52097f5` completed on Xcode 26.5 / iOS 26.5 / iPhone 17 Pro. Both native builds and all 12 test executions passed. The intentional post-capture interruption resumed successfully, and exported screenshots show the app. Mean pixel error increased from 0.018494 to 0.019517; changed-pixel fraction increased from 0.070476 to 0.088625. The candidate was **rejected**. The workflow is red by design for that result; it is not a passing fidelity run.

Hosted OCR ran, but its transcript differed from expected visible source, so typography remained unavailable. No known-good baseline was promoted. See the preserved [summary](../evidence/hosted-xctest-capture/summary.json), [report](../evidence/hosted-xctest-capture/report.json), [baseline](../evidence/hosted-xctest-capture/baseline/native-large.png), [candidate](../evidence/hosted-xctest-capture/candidate-1/native-large.png), and [hashes](../evidence/hosted-xctest-capture/hashes.json). Raw log bytes are preserved in gzip files.

Next blocker: reliable per-text-region transcription/line measurement with explicit decorative-glyph handling and an independently verified known-good fixture. Do not loosen global transcript checks or promote a baseline solely to turn CI green. M2 remains partial; no merge or npm publication is justified by these results.

## M2.1 region-based typography (partial)

The new experiment maps source byte ranges through App IR to native leaf identifiers. DOM ranges and SwiftUI TextRenderer word attributes provide line boundaries; OCR is supporting evidence only. Decorative disclosure glyphs are excluded while meaningful punctuation is preserved. See the [architecture and manual reference-approval protocol](../../../docs/architecture/universal-app-engine.md#m21--deterministic-typography-verification-experimental).

The corrected local capture built successfully and passed three native tests on Xcode 27.0 / iOS 27.0 / iPhone 18 Pro. All nine visible text regions had distinct IDs and complete word evidence. Container accessibility identifiers initially overwrote descendant IDs; the generator now omits them and a regression test covers this.

The probe changed some text pixels by one channel level (mean absolute channel error 0.00000997403514). Strict pixel identity is retained, so typography remains **unavailable**; all derived region diagnostics are provisional. No reference approval or known-good baseline was created. This local run intentionally stopped after `baseline-large`; it is not a completed repair comparison or a resume-success claim. See [summary](../evidence/typography-regions/summary.json), [capture](../evidence/typography-regions/capture.json), [ordinary screenshot](../evidence/typography-regions/native-large.png), [probe screenshot](../evidence/typography-regions/probe-large.png) and [hashes](../evidence/typography-regions/hashes.json).

The new hosted branch workflow executes the same adapter and interruption/resume path. Hosted results must be reported separately after completion. M2.1 is a draft measurement foundation, not a visual-fidelity pass, and does not authorize release or npm publication.

Final local portable validation: 658 passed, zero failures, one skipped; 45 focused gate/typography/capture tests passed, and the DOM geometry/pixel-invariance test passed. Repository consistency and local-library checks passed. An earlier load-sensitive process-interruption test passed on isolated rerun; the final lower-concurrency full suite passed. No historical scores were changed.

### M2.1 hosted setup failure (not a fidelity verdict)

[Run 38847195825](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38847195825), PR head `b3e82c8`, passed the portable and DOM tests but failed during simulator setup before generation or native builds. Its [preserved report](../evidence/typography-hosted-setup/report.json) has an empty `runs` array and `xcrun failed: ` with no diagnostic text. A boot timeout is a hypothesis, not established by that report. The failure must not be described as regression rejection or passing native verification.

The setup wrapper now records bounded command arguments/output, exit code, timeout, spawn error and duration in `setup-commands.jsonl`, uploaded even on failure. Its existing 120-second timeout is unchanged. Three portable tests cover successful recording, empty-stderr failure/timeout/spawn cases and bounded output. This diagnostic correction does not resolve measurement interference or authorize baseline promotion.

### Controlled renderer experiment

A local Xcode 27.0 / iOS 27.0 experiment captured the same foreground, collapsed screen five times on one dedicated iPhone 18 Pro simulator: ordinary Text twice, word attributes only, custom renderer only, and the full probe. One XCTest containing all five captures passed. Ordinary repeated captures and attributes-only matched ordinary Text exactly. Renderer-only and the full probe each changed 24,541 pixels with a maximum channel delta of 1. This isolates the custom drawing path as the interference source **for this fixture**; it does not prove a universal SwiftUI behavior or justify any tolerance change.

[Results and pinned conditions](../evidence/typography-ablation/summary.json), [exact experimental view](../evidence/typography-ablation/RootView.swift), [XCTest](../evidence/typography-ablation/InteractionTests.swift), [test log](../evidence/typography-ablation/test.log.gz), and [hashes](../evidence/typography-ablation/hashes.json) preserve the experiment. To reproduce, generate the existing FieldNotes fixture with typography instrumentation, replace its RootView and UI test with these exact experimental files, and run its UI-test scheme on the recorded simulator profile. These are experiment inputs, not a production renderer change. Summary error values use RGB channels, explicitly named `meanRGBError`; the main comparator uses RGBA, so the two means are not interchangeable.

Setup errors now carry `infrastructure_failure`, other top-level execution errors `verification_failure`, and the explicitly requested checkpoint stop `interrupted`. These categories are separate from accepted/rejected/requires-review visual decisions. Candidate verification errors caught by the repair coordinator remain `requires-review` with `candidateFailure` details. Resume retains interruption category history. Typography trust and reference approval remain unresolved.


### Passive observer and completed hosted rerun

The current probe observes `Text.LayoutKey` instead of installing a TextRenderer. Apple's [LayoutKey documentation](https://developer.apple.com/documentation/swiftui/text/layoutkey) identifies it as a preference exposing layouts in the queried subtree. The local controlled experiment passed one XCTest with five captures: the passive probe reported all nine regions and matched ordinary Text with **zero changed pixels**. The custom-renderer control still changed 24,541 pixels. See [passive summary](../evidence/typography-passive/summary.json), [exact experiment](../evidence/typography-passive/RootView.swift), [test](../evidence/typography-passive/InteractionTests.swift), and [hashes](../evidence/typography-passive/hashes.json). This validates default-size observation for one local fixture, not universal noninterference or visual equivalence to HTML.

[Hosted run 38848150029](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/38848150029) at `64e0817` completed both builds and all 12 native tests, including interruption/resume, and rejected the worse repair. It used the **old drawing-based probe**, so typography stayed unavailable. Setup succeeded on this rerun; the earlier failure's precise cause remains unknown. The [report](../evidence/typography-hosted-resume/report.json), setup records, measurement files, images and compressed logs are preserved with [hashes](../evidence/typography-hosted-resume/hashes.json). These results do not validate the new passive implementation on the hosted SDK.

The separate uninterrupted local run reached baseline verification but the candidate build failed with `No space left on device`. Its [report](../evidence/typography-disk-failure/report.json) and [build log](../evidence/typography-disk-failure/candidate-build.log.gz) are preserved. Outcome: requires review after an environment failure, not an accepted comparison or visual regression. No known-good baseline or human approval was created. Repeat complete local/hosted verification with sufficient disk space before promotion.

The final observer invalidates empty/ambiguous preferences and serialization failures synchronously; no queued task can restore an older measurement. A second [native capture](../evidence/typography-passive-sync/summary.json) verified this synchronous version: one XCTest passed, nine regions were observed, and passive/default rendering again differed by zero pixels. The [source and log hashes](../evidence/typography-passive-sync/hashes.json) preserve that run. The invalidation regression test checks the generated source contract; dynamic invalid-preference transitions have not been exercised in XCTest.

Final validation for the passive observer: 660 package tests passed, zero failed, one skipped; all five setup/classification tests passed; Swift 6 / iOS 17 deployment type-check and repository/index checks passed. An earlier full run overlapped native work and hit the existing 10-second CLI version-test timeout (659 passed, one failed, one skipped); the CLI group passed in isolation, and the subsequent complete suite above passed without native work running alongside it. No timeout or pixel threshold was relaxed.
