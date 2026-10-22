# UIKit candidate: corrected controls and completed local verification

Local Xcode 27.0 / 27A266a, iOS 27.0 / 24A434, iPhone 18 Pro, Chrome 155.0.8059.85, English US, light mode. Source is `5920209` plus the retained LiveTextHarness.swift change. The test-only controls now retain their natural label height and at least a 44-point target. The UIKit heading component, source text, tokens, test assertions and quality thresholds are unchanged. No production generator integration.

Both native builds passed. The baseline passed 3 Large + 3 XXXL tests. The UIKit candidate passed 5 Large + 5 XXXL tests: disclosure/content, geometry, Apple accessibility checks, in-place type/content changes, accessibility sizes 1–5, restore and relaunch. The prior two live-update failures are retained in the sibling local/hosted failure archives. All 16 test executions passed without filtering the whole-app clipping audits.

All four captures have nine traced text regions and exactly zero normal/probe changed pixels. The candidate has zero line-boundary mismatches; the original baseline has two. Mean pixel error improves 0.018485192964781638 → 0.015590419613655544 (15.7%); changed-pixel fraction improves 0.07043119165668374 → 0.06523686906797063 (0.519 percentage points). Candidate build, functionality, accessibility, layout and typography checks pass.

The complete run exits 2, `requires-review`, solely because this reference hash/environment lacks matching manual approval. The earlier reference approval was for Chrome .82, not this .85 capture. No approval was inferred or copied. Promotion was not requested; knownGood is null. The original baseline remains ineligible. These measured improvements are not an accepted fidelity result, production readiness or general framework support.

The full run, raw xcresults, checkpoints and all attachments remain in `/Users/nagarjunareddy/Documents/Codex/universal-ax-harness-fixed-20261021`. This compact record retains actual source, reports, screenshots, diffs, summaries, selected AX-size/content screenshots and compressed logs, hashed in hashes.json. Selected filenames are prefixed with their Large/XXXL cell; their original identities remain in the selected manifest.

Limitations: one synthetic English/LTR/light-mode fixture. Automated accessibility audits and static-text semantics are not a manual VoiceOver session; size changes are driven in-place by the test harness, not Settings. Large-font text is in a ScrollView; this does not establish whole-app production accessibility. Hosted verification of the corrected harness remains pending.

## Subsequent human reference approval

After viewing this .85 reference, the user explicitly answered “Approve this recorded reference” to a question that excluded promotion, production integration, merging and publication. The separately recorded approval matches this reference and pin hash. Re-evaluating the retained evidence with the existing gate returns `requires-review`: **Baseline does not qualify as known-good**. The original report and repair ledger are untouched. No new native execution or promotion is implied. See reference-approval-20261022.json and approval-evaluation-20261022.json.

Final portable verification in the original checkout encountered an operating-system `ETIMEDOUT` while Node read a module (12 checks passed; module loading failed before the remaining candidate checks). Independent Git inspection also hit an mmap timeout. A fresh clone of the same branch, with only the reviewed changes copied, built successfully and passed all 15 fidelity tests. Both logs are retained. Repository hooks, local-library index and diff checks were run in the fresh checkout. These are environment recovery results; no timeout, test or gate was weakened.
