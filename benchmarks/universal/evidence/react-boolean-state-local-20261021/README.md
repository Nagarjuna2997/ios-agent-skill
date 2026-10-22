# Local React boolean-state verification — 2026-10-21

VERIFIED on source commit `cb6ef7a`: Xcode 27.0 (27A266a), iOS SDK 27.0,
iPhone 18 Pro Simulator runtime 27.0 (24A434), host 26A434, English, portrait,
light appearance. The UTC run completed on October 22; local date was October 21.

```sh
node benchmarks/universal/react-state/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory
node benchmarks/universal/react-state/run.mjs benchmarks/universal/fidelity/local.json /absolute/new/evidence-directory --resume
```

One unsigned native build passed. Three native tests passed at each text size:

```text
Large: Executed 3 tests, with 0 failures (0 unexpected) in 58.783 (58.800) seconds
** TEST SUCCEEDED **
XXXL: Executed 3 tests, with 0 failures (0 unexpected) in 65.445 (65.461) seconds
** TEST SUCCEEDED **
```

These tests exercise toggling twice, repeated literal assignment, independence
of two states, reset and relaunch, expected label appearance and stale label
absence, native button/static-text semantics, and Apple text-clipping, contrast
and element-detection audits. Initial and changed screenshots at both sizes were
also visually inspected. This is six test executions, not six different tests.

An explicit completed-run resume validated all four checkpoints and returned the
identical project/build/Large/XXXL cells without rerunning tests. Exactly two raw
xcresult bundles remain in the external evidence directory. `resumed-report.json`
retains that second execution and its setup commands. Interruption and tampering
coverage is portable in `react-state/evidence.test.mjs`; this native run did not
inject a crash mid-test.

The original reports, generated SwiftUI, IR, source map, fixture/test source,
compressed build/test logs, checkpoints and all exported PNG attachments are
preserved here. `hashes.json` covers those original evidence bytes. Checkpoints
also retain hashes of raw xcresult files; the full bundles remain locally at the
report's recorded paths and are uploaded by hosted CI rather than committed as
large binary trees. Absolute local paths are historical provenance, not portable
reproduction paths.

The final portable suite, including the installed CLI regression, passed with
`node --test --test-concurrency=1 test/*.test.js` from `mcp-server`:

```text
tests 703
pass 702
fail 0
skipped 1
```

The preceding concurrency-2 run recorded 698 passes, four MCP/server-startup
timeouts and one skip while native diagnostics were active. Its log is retained
alongside the serial run in `portable/`; it is not a passing run. An independent
reviewer also observed the new CLI check exceed its unchanged 10-second bound
once, then a direct invocation passed. One later unchanged CLI regression passed
in 361 ms, and the two agent-tool checks passed individually. The serial suite
passed all four previously failing checks. No timeout was raised, assertion
removed or failure filtered out. The precise cause of the transient timeouts is
unresolved; reduced process contention is a hypothesis, not a confirmed fix.
`portable/hashes.json` covers these additional logs separately from the native
evidence manifest.

NOT VERIFIED: browser-to-native visual fidelity, dark mode, accessibility sizes
1–5, manual VoiceOver interaction, arbitrary React state/hooks, navigation,
backend behavior, persistence or cross-framework compatibility. Hosted evidence
is separate and was still pending when this local record was written. No visual
baseline was approved or promoted, and no production UIKit heading change is
part of this result.
