# Authorized initial local baseline — October 28, 2026

The user explicitly answered **“Authorize this local baseline only”** to the
separate promotion request for the archived UIKit candidate. This record seeds
that candidate as the initial known-good baseline for the already approved local
HTML fixture. It does not approve production integration, a hosted baseline or
npm publication.

Scope: iPhone 18 Pro, iOS 27.0 / 24A434, Xcode 27.0, Chrome 155.0.8059.85,
English US, light appearance, collapsed state, and the exact dimensions, fonts,
normalization and source/reference hashes in `baseline.json`. It is not a default
baseline for other apps, devices, frameworks, browser versions or capture states.

Before recording this baseline, all 44 files in the original archive's manifest
were rehashed successfully. The existing `authorizedKnownGood` / `seedKnownGood`
checks accepted the archived candidate with the matching reference approval and
unchanged policy. Its build, functionality, accessibility, layout and typography
checks pass; line mismatches, clipping and accessibility issues are zero.
Mean error is 0.015590419613655544 and changed-pixel fraction is
0.06523686906797063. The archive records 16 native test executions across both
variants/sizes; the baseline evidence's `testsPassed: 5` is its per-cell count,
not a new run or a replacement total.

The [original archive](../uikit-ax-harness-fixed-local-20261021/README.md), report,
repair ledger, screenshots and hashes are unchanged. Its historical
`requires-review` repair outcome remains intact: that comparison used an original
baseline with failing typography. This is a separately authorized initial seed,
not a retroactively accepted repair or relaxed threshold.

No native build/test was rerun for this authorization record. Future repairs must
still use matching capture pins/reference, run the complete verifier, reject
regressions and retain their own evidence. This record does not wire the UIKit
renderer into production or automatically select a baseline in any runner.
Authorization is a transcript-backed record, not a cryptographic human signature.

Files: `baseline.json` (validated evidence), `authorization.json` (specific scope),
`reference-approval.json` (unchanged reference approval), `provenance.json`
(archive linkage and policy), and `hashes.json` (this record's file digests).
