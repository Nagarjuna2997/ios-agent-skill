# Controlled-input touch-size repair — 2026-10-28

Xcode 27.0 / iOS 27 / iPhone 18 Pro, Large Dynamic Type. Native build passed.
The padded plain-field style passes both 44-point minimum accessibility-frame
assertions that previously failed. Typing, independent state updates, conditional
retention and relaunch reset pass. Result remains 2 tests passed / 1 failed:
Apple audit still reports placeholder clipping and button contrast. The fixture
button has explicit source colors; this does not fix all default buttons.
XXXL was not run after the Large failure. No native-completion, visual-fidelity
or baseline-promotion claim is made.

Original report, generated source, tests, logs and screenshot retained unchanged.
Raw xcresult remains at the local path in report.json. Hashes identify archive
bytes, not independent authentication. The first failed attempt is preserved
separately in ../react-input-first-failure-local-20261028/.
