# Hosted React boolean-state verification

[Run 39697794137](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/39697794137)
passed its portable and simulator jobs on 2026-10-22 UTC. It tested PR #31's
merge commit `67b1fa6e2169673122d3ef5ff9fffe93fcd73bae`, combining head `cb6ef7a`
with base `e5d6258`. It ran the dedicated React state fixture, not the default
HTML fidelity workflow.

VERIFIED: one unsigned build, Xcode 26.5 (17F42), SDK 26.5, iOS 26.5 runtime
23F77, iPhone 17 Pro, host 25G83, light appearance, English, portrait. Native logs:

```text
Large: Executed 3 tests, with 0 failures (0 unexpected) in 134.995 (135.002) seconds
** TEST SUCCEEDED **
XXXL: Executed 3 tests, with 0 failures (0 unexpected) in 78.243 (78.246) seconds
** TEST SUCCEEDED **
```

These are the same three independently authored tests executed at two sizes:
boolean transitions/state isolation, native accessibility/clipping, and relaunch.
Initial and changed screenshots were inspected. This verifies the bounded native
behavior mapping, not arbitrary React support or visual equivalence.

`report.json`, compressed build/test logs, and all eight exported screenshots are
unaltered copies from [artifact 12392191314](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/39697794137/artifacts/12392191314).
The downloaded ZIP matched GitHub's SHA-256 digest recorded in `provenance.json`.
`hashes.json` covers this compact archive; raw xcresults and checkpoints remain in
the hosted artifact. That artifact does not contain every generated build binary,
so it is not a complete portable copy of every checkpoint input.

NOT VERIFIED here: browser/native visual fidelity, dark appearance, manual
VoiceOver operation, accessibility sizes 1–5, persistence, navigation, arbitrary
hooks or async behavior. Hosted resume was not exercised; the separate local
evidence records completed-run resume. No baseline promotion, merge, release or
npm publication follows from this result.
