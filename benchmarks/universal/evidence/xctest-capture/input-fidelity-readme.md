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
