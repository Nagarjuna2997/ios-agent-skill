# Pocket Notes — fresh Studio/Codex run

On November 18, 2026, the Studio agent bridge ran the shared iOS build loop on
a Mac with the synthetic request: “An offline notes app with a list, add and
delete actions, and synthetic sample notes.” The run used the existing signed-in
Codex client, without a separate API key. It planned first, selected the first
design direction, and resumed through generation and verification in the same
Studio session. This is not a run of the Claude Code quickstart.

Xcode 27.2 (27B52) and iOS 27.2 (24B8117) were used. Two unsigned simulator
builds succeeded: the first before, and the second after, a model-suggested
visual repair. Six screenshots cover the one top-level screen on iPhone 18 Pro
and iPad mini in light, dark and XXL appearances. The model requested dark-mode
changes in its first review and accepted the second; that is a model assessment,
not a visual-fidelity measurement or accessibility certification.

The iPhone simulator test run passed **11 tests**: five Swift Testing unit
tests and six UI tests. The [sanitized Xcode result summary](evidence/test-summary.json)
omits the machine-specific simulator ID. It is a summary of the recorded run,
not a replacement for the original result bundle. A second Xcode run against
the archived project also passed all 11 tests; its [sanitized summary](evidence/test-summary-recheck.json)
is separate from the original run. The source, plan, generated
tests, review records and screenshots are preserved here; [SHA-256 hashes](evidence/hashes.json)
identify the archived files. No source or logs from a personal application were used.

To rebuild and run the checked-in tests with an installed iOS simulator:

```sh
xcodebuild -project PocketNotes.xcodeproj -scheme PocketNotes \
  -destination 'platform=iOS Simulator,id=YOUR-SIMULATOR-UDID' \
  CODE_SIGNING_ALLOWED=NO test
```

Run the command from this directory and select the UDID with
`xcrun simctl list devices available`. This repeats the native tests; it does
not reproduce the model's planning or visual review, which may differ on
another run. Service accounts, purchases, physical-device signing, VoiceOver,
and comprehensive accessibility and visual fidelity are not verified by this run.
