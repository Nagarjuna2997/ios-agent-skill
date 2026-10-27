# UIKit accessibility-control failure — local 2026-10-21

Source `5920209`, experimental `node-5` UIKit candidate. Original report and logs
are retained without reinterpretation. Xcode 27.0 / iOS 27.0, iPhone 18 Pro,
light appearance and the pinned local profile; Chromium 155.0.8059.85.

Both builds passed. The unmodified baseline passed its three native tests at
Large and XXXL, but retained two heading line-break mismatches. Candidate Large
completed three passing tests and two failed tests (32 audit assertions):

```text
LiveTextUpdateTests/testAccessibilityTypeSizesAndRestore(): Text clipped
LiveTextUpdateTests/testLiveTypeAndContentUpdates(): Text clipped
```

The failing elements in the retained console are the harness's Accessibility
size 1–4 button labels. Heading growth, restoration, content-change and width
assertions did not fail. That does not establish a full candidate pass: its
whole-app audit failed, and candidate XXXL was not executed. Xcode subsequently
spent several minutes collecting simulator diagnostics before finalizing the
failure; the test timeout was not increased.

The gate returned `requires-review` with `verification_failure`. No candidate
was promoted. The next run changes only the harness controls' sizing; audits,
heading tokens, UIKit text implementation, normal app layout and visual
thresholds stay unchanged. This archive remains the failed result even if a
later run passes.

`hashes.json` covers original report/summary, compressed logs and selected native
screenshots. `selected-attachments.json` retains their XCTest identities. The
full xcresult and all diagnostic attachments remain at the report's local paths.
This is not a fidelity pass or a reference approval.
