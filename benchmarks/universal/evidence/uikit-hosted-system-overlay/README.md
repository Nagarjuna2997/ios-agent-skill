# Hosted HTML/UIKit verification: system notification contamination

Run 38871194564 attempt 1, commit 6850d9b. Portable checks passed. The baseline built and the Large capture passed all three native tests with zero probe pixel differences. Resume reused that checkpoint. At XXXL, Apple's expanded-state accessibility audit reported contrast failures for node-4 and node-5. The attached failure screenshot visibly shows a Settings “Ready for Apple Intelligence” notification covering those headings.

This is contaminated environment evidence; the screenshot does not establish an intrinsic app-contrast defect. The audit still fails, no check is ignored, and the runner stops before building the UIKit candidate. There is no hosted UIKit fidelity verdict or pass. The original report retains its verification_failure classification.

A single unchanged failed-job retry was requested on a fresh hosted runner. Source, pins and quality thresholds remain unchanged. No automatic suppression of notification overlays or accessibility issues was introduced.
