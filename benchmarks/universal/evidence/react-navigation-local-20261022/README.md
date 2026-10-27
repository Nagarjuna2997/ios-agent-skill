# React navigation: local native evidence

Recorded October 22, 2026 UTC (October 21 locally) from implementation `9b5a69b5b17d302cc5c118e06a487229a35d16e3`.
The native run preceded that commit; its tested source and generated output are
preserved here. This is independent of HTML fidelity and hosted React results.

- One unsigned Xcode 27.0 / 27A266a simulator build passed, with zero compiler errors. The log includes an AppIntents metadata-extraction warning because no AppIntents dependency is present.
- Three XCUITests passed at Large and three at XXXL: 6 passed, 0 failed, 0 skipped.
- Three screens exercise two forward pushes, native Back, shared state retention, repeated visits and reset on relaunch.
- Explicit native semantics assertions passed for the home link and walk heading, including the home link's minimum 44-point height. Apple clipping/contrast/element-detection audits passed on all three screens at both sizes.
- Eight actual XCTest PNG attachments are retained with original manifests.
- Completed resume preserved all four checkpoint bytes/mtimes and all build/test records. See `resume-proof.json`.
- Portable full suite: 712 passed, 0 failed, 1 skipped (optional live compiler test); 15 focused navigation/evidence checks passed.

`visualFidelity` remains `not-evaluated`. There is no approved browser reference,
source/native pixel comparison, baseline promotion or general React Router claim.
This fixture does not prove real-device VoiceOver behavior or arbitrary app compatibility.
Hosted navigation verification has not yet run at the time of this archive.

`report.json` is the completed resumed report; `original-report.json` is the original
completed run. Neither has been rewritten to make archived paths portable.
Attachment directory names are preserved. The separate viewer extension at
`feat/universal-navigation-evidence-viewer` commit `1e3c6df` was used to render this
archive successfully; this navigation branch's inherited viewer does not yet support
native behavior reports. Checkpoints retain original raw artifact hashes;
this compact archive excludes compiled products and raw xcresult bundles, which
remain in the recorded local directory. Reproduce with the commands in
`../../react-navigation/README.md` at the source revision; do not resume from this
compact archive. `hashes.json` verifies the files stored here, not missing binaries.

The initial full-suite invocation used the repository root and failed CLI tests
because their expected working directory is `mcp-server`. The final recorded full
suite ran from `mcp-server`, with no source changes to bypass those failures.
