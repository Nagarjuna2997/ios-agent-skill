# Native reset input and hit-region evidence — 2026-10-28

Xcode 27.0 / iOS 27 / iPhone 18 Pro, Large Dynamic Type. Build passed.
Three of four tests passed: typing/independent updates/conditional retention,
literal clear/reset buttons, and relaunch reset. Accessible field geometry and
labels passed; the contrast audit no longer reported the button failure.
The accessibility test still fails on placeholder clipping. XXXL was not run
after that failure; native acceptance and visual fidelity remain incomplete.

Original report, generated source, tests, compressed logs and selected screenshots
are retained unchanged. Raw xcresult remains at the local path in report.json.
Earlier rejected experiments remain in adjacent evidence directories.
No baseline promotion is claimed. Hashes identify archived bytes only.
