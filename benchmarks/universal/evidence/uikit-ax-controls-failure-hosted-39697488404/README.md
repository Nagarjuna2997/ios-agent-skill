# Hosted UIKit accessibility-controls failure

Explicit HTML/UIKit run [39697488404](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/39697488404) tested commit `59202096df5653f6371dad166b492e53bfaefdaa` with Xcode 26.5 / 17F42, iOS 26.5 / 23F77, iPhone 17 Pro, light mode and Chrome 151.0.7922.34. This is separate from React state verification.

Both native builds passed. The original baseline passed three tests at Large and three at XXXL, but still failed typography with two line-boundary mismatches. Its mean pixel error was 0.0184944511; changed-pixel fraction was 0.0704759550.

The UIKit candidate passed three tests and failed two live-update tests at Large. XCTest reports “Text clipped”; retained element evidence shows an Accessibility size test-control label. The candidate XXXL cell and visual measurements were not reached. This is a verification failure, not a passing fidelity result or an infrastructure-only failure. The local run with the same source independently reproduced the controls problem.

The deliberate interruption after baseline Large was recorded, and the hosted resume reused that completed checkpoint before proceeding. The final result was `requires-review`, with candidateFailure.category `verification_failure`; CI exited 2. No known-good baseline was promoted or requested. The later control-sizing repair is not covered by this run.

The downloaded artifact ZIP matched GitHub’s SHA-256. This compact record retains the report, test summary, command diagnostics, compressed logs and selected original attachments. The full extracted artifact (including raw xcresults and checkpoints) remains at the path in provenance.json. hashes.json covers this compact record; it is an integrity manifest, not independent approval.
