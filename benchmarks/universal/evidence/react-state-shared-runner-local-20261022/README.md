# Existing React state fixture: shared-runner compatibility

Executed on October 22, 2026 UTC (October 21 locally), using implementation
`9b5a69b5b17d302cc5c118e06a487229a35d16e3`. The new navigation fixture reuses
the native runner; this independent run verifies the existing boolean-state
fixture still builds and executes through that shared implementation.

One unsigned Xcode 27.0 / 27A266a build passed on iPhone 18 Pro / iOS 27.0.
All three existing XCUITests passed at Large and XXXL: six executions, zero
failures or skips. Existing tests cover toggle/assignment, independence, reset,
relaunch, expected and stale labels, selected native semantics, and Apple
clipping/contrast/element-detection audits. See the unchanged test source.

The generated RootView is byte-identical to the pre-navigation version at
`d9513cc`; SHA-256 `9fbdccaec6bc415c1db9eab7f39f06e0a3de30828aacb1fcd18a2d57fb1d6e07`.
This demonstrates compatibility for this fixture, not arbitrary applications.
No source/reference visual fidelity was evaluated. This is a fresh run, not a
new state-fixture resume experiment; the shared runner's completed resume was
separately verified by the navigation evidence in the adjacent directory.

Original reports, four checkpoints, source, IR, source map, eight screenshots,
attachment manifests and losslessly compressed build/test logs are retained.
The build log includes the benign missing-AppIntents metadata-extraction warning.
Raw xcresults and compiled products remain in the report's local directory;
the compact archive is not resumable. Historical evidence remains unchanged.
The separately pushed navigation-aware viewer can display this archive.
`hashes.json` covers archived files, not excluded raw products.
