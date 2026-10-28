# Rejected native-title diagnostic — 2026-10-28

An isolated generated project gave TextField a nonempty native title while
retaining its explicit accessible label and original prompt. Production unchanged.
Xcode 27 / iOS 27 / iPhone 18 Pro, Large/light.

The test log records the selected accessibility test failing with Text clipped
(0 passed, 1 failed). Xcode stalled afterward collecting diagnostics. SIGINT did
not terminate it; SIGTERM stopped this owned process with exit 143. The resulting
xcresult lacks Info.plist, so attachment export was unavailable. Do not treat
this as a completed native verification run. No screenshots or pass inferred.
The wrapper cleaned up its owned simulator. Source and full log are retained;
the generator was not changed and the candidate was rejected.
