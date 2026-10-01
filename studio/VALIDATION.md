# Local Studio validation — 2026-10-01

## Environment

- Node.js 24.15; Xcode 27.0 (27A266a).
- iPhone 18 Pro simulator with iOS 27; unsigned local simulator execution.
- Existing local Codex CLI authentication. No credentials are stored in the workspace.

## Results

- 19 Studio regression tests passed, including cancellation, process limits, concurrent actions, interrupted-state recovery, source/evidence tampering, exact-context edits, undo, neutral identifiers and source export.
- A real Codex session generated the Chapter One plan and Swift changes, then accepted a targeted chat refinement.
- Final sample verification passed: three unit tests and two UI tests, with six simulator captures (empty, add, library, detail, search-empty and error).
- Final verification completed at 2026-10-01T23:18:24.587Z. Verified source SHA-256: `b769b92d8c29b01a45fe76d67e14e80f1e6ef8e5b28e6220558f9e4e4aa1afbf`.
- The workspace retains `state.json`, `verification.log`, `project/.ios-agent/acceptance.xcresult` and hashed PNG evidence. These local artifacts are not published with this document.
- Actual browser checks at 390px and 1440px found no horizontal overflow. Light and dark appearances were inspected; the real simulator image decoded successfully.
- Export ZIP was invoked in the browser, saved in the workspace exports folder, and inspected for Swift source and the Xcode project. Derived data, verification logs and simulator evidence are excluded.
- Independent review passed for the local-preview scope. Repository hook verification passed.

## Failures preserved, not hidden

The first generated app changed an error-state label expected by the existing UI test. The bounded automatic repair did not resolve it. The run remained unsuccessful and was stopped. A subsequent explicit chat refinement restored the label; the same acceptance suite then passed. This is evidence of an end-to-end repair workflow, not a claim that generation always succeeds autonomously.

Claude Code was authenticated, but its provider rejected the live request because the organization subscription was disabled (403). Claude support has adapter tests; a successful live Claude generation was not verified.

## Initial-preview scope (extended by the follow-up below)

This preview supports the reading-list starter and two editable Swift files. The tests verify that starter’s persistence, search, progress and failure states, not arbitrary plan requirements. The simulator panel displays captured screens rather than an interactive stream. Generic app generation, additional frameworks/files, hosted operation and native Mac packaging remain future work. No comparative benchmark or improvement claim is made.

## Custom app generation — 2026-10-01 follow-up

The new **Your own app idea** path was exercised through the browser using Codex. The brief requested Pocket Habits: named habits, completion/undo for today, a Progress tab, local persistence and no network. Planning produced seven criteria, three automated UI journeys and one manual design/accessibility criterion. Tests were generated before implementation and remained fixed.

Codex generated eight Swift files: an entry point, habit model, persistence store, theme, home navigation, habit list, add form and progress screen. Studio generated their Xcode project references. The first generated build compiled and passed all three journeys without an automatic repair:

```text
Executed 3 tests, with 0 failures (0 unexpected) in 99.711 seconds
** TEST SUCCEEDED **
PASS: 3 frozen UI journeys and simulator screenshots. Manual criteria remain unverified.
```

The journeys exercised initial empty states, creation, persistence after relaunch, completion, progress counts, undo across launches and cancel-without-saving. The final source hash was `d576e757637ff1e997da10ee4dd5333afe43523f3768158613258b4d96ddc355`; evidence was saved at `2026-10-01T23:45:02.433Z`. There are three hashed PNG captures, one per journey. The exported ZIP was created through the UI and contains the multi-file source, project, frozen tests and runner.

```text
$ node --test studio/test/*.test.mjs
ℹ tests 32
ℹ pass 32
ℹ fail 0
ℹ skipped 0
```

New regression coverage includes adding/removing source, protected test paths, case collisions, app-specific plan validation, Swift literal escaping, multi-file undo, transactional crash recovery, orphan journal preparation, source symlinks, concurrent user edits and stale evidence. The independent reviewer passed the implementation after fixes to journal publication and Swift escaping. Light/dark UI and 390px/1440px layouts were inspected with no horizontal page overflow.

The Xcode result also attached a simulator **SpringBoard** SIGABRT report during a relaunch. All app assertions and the test run completed successfully; this is retained as an environment caveat, not described as an app crash or a clean simulator diagnostic run.

This demonstrates one newly generated app, not universal reliability across arbitrary ideas. Generated tests are model-proposed and must be reviewed; a criterion-to-journey mapping does not prove exhaustive coverage. The manual design/accessibility criterion remains unverified. The new path supports small offline SwiftUI apps, up to 24 Swift files, without package dependencies, service provisioning, binary assets or signing. It does not add an interactive simulator stream or guarantee App Store readiness.

### Negative control

A disposable copy of the generated project was changed to skip writing its persisted JSON. The original frozen `testJourney1` compiled, ran and failed specifically after relaunch:

```text
XCTAssertTrue failed - Missing: Drink water
Executed 1 test, with 1 failure (0 unexpected) in 44.397 seconds
Exit: 65
```

The original workspace and its passing evidence were unchanged. Xcode's post-failure `simctl diagnose` collector was stopped after the assertion was recorded; Xcode then returned 65. New custom runners use the installed, documented `-collect-test-diagnostics never` option to avoid collecting a lengthy system-wide diagnostic bundle. Test logs, results and screenshots remain available. This negative control is a correctness check, not a scored model comparison.
