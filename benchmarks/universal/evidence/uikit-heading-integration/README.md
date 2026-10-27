# UIKit heading controlled integration — requires review

HTML adapter only. Local Xcode 27.0 (27A266a), iOS 27.0 (24A434), iPhone 18 Pro; Chrome 155.0.8059.82, English US, light appearance. Compare the original baseline to the benchmark-only UIKit text strategy. Original source text and tokens are preserved.

- Two builds passed; twelve native test executions passed (three per arm at Large and XXXL).
- Native disclosure behavior, Apple accessibility audits and clipping checks passed.
- Nine regions were measured in all four captures; all probe comparisons have exactly zero pixel error.
- Candidate typography passed with zero boundary mismatches, versus two for the original baseline.
- Mean pixel error: 0.018485192964781638 → 0.015590419613655544.
- Changed fraction: 0.07043119165668374 → 0.06523686906797063.
- Final decision: requires-review, missing matching manual reference approval. No known-good promotion. The original baseline also remains ineligible as known-good under the existing gate.

Disk exhaustion interrupted saving reference evidence after the baseline tests. Disposable caches from previous temporary builds were removed; the same run resumed and reused completed checkpoints. The report preserves the interruption. Source, screenshots, measurements, logs and executed verifier files are hashed. Raw xcresults and checkpoint files remain in /tmp/ios-uikit-integration-20261016.

After this run, independent review led to two changes: the runner now requires zero probe interference at both sizes, and explicit-size weight resolution now matches production rendering for nodes without their own bold flag. Portable regressions passed. The final helper emits the same native source hash as this candidate; no second native run is claimed. The recorded evidence satisfies the stricter two-size invariance check.

Limitations: no live in-place Dynamic Type/content-update test, no dark-mode or additional-language test, no hosted UIKit run, no independent reference approval. An Apple automated accessibility audit is not manual VoiceOver testing. This validates one local fixture, not production readiness.

Reproduce from repository root using the documented local profile, installed Playwright/Chrome paths, `FIDELITY_UIKIT_TEXT_NODES=node-5`, and `node benchmarks/universal/fidelity/run.mjs benchmarks/universal/fidelity/local.json NEW_OUTPUT_DIRECTORY`. Resume unchanged runs using `--resume`; changed verifiers require a fresh output directory. Production generator is unchanged.

Final portable validation: 670 package tests passed, zero failed, one skipped; ten benchmark tests passed with installed Chrome. The initial DOM test invocation lacked the bundled browser and failed setup; rerunning with the pinned installed browser passed. Repository consistency, local-library index and diff checks passed. Independent code review found no remaining blocking issue for benchmark-only integration. This code review is not independent reference approval.
