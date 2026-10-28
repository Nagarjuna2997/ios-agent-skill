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

## Backend app acceptance and interactive preview — 2026-10-01 follow-up

Environment: Node.js 24.15, Xcode 27.0 (27A266a), iPhone 18 Pro simulator on iOS 27. The Codex CLI was not installed on this Mac during this follow-up (the health endpoint reported it unavailable), so no new generation or chat refinement was exercised; the Studio Notes source below had been generated by Codex in the earlier session and was verified as-is.

### Studio Notes (local REST backend)

Workspace `30da8bcd-7411-48e2-92d1-5416c47d7059`, created with **Local REST backend · development**. The frozen plan has six criteria, three automated journeys (create and reload, edit and retain, delete and verify after relaunch) and two manual criteria (visual review; loading and failure recovery under controlled backend conditions). Seven Swift files implement a protocol-injected `URLSession` backend, an observable model with loading, empty and recoverable error states, and add/edit/delete forms.

**Run app checks** was started from the browser after restarting Studio and completed without repair:

```text
Test Case '-[AppProjectUITests.AcceptanceTests testJourney1]' passed (24.053 seconds).
Test Case '-[AppProjectUITests.AcceptanceTests testJourney2]' passed (26.786 seconds).
Test Case '-[AppProjectUITests.AcceptanceTests testJourney3]' passed (24.470 seconds).
Executed 3 tests, with 0 failures (0 unexpected) in 75.310 seconds
** TEST SUCCEEDED **
PASS: 3 frozen UI journeys and simulator screenshots. Manual criteria remain unverified.
```

Evidence was saved at `2026-10-02T00:33:29.812Z` with source hash `ed2a19f50faa3f4112c39f124b02bb9e92eebb6fff4b7f2902c531cdce445a43` and three hashed PNG captures. No SpringBoard SIGABRT report appeared in this run; the only "crash"-pattern hit in the log is an Objective-C duplicate-class warning from the simulator runtime.

The server-side records were inspected after the run. Each journey wrote to its own namespace under the workspace's private `backend/` folder:

| Namespace | Records after the journey |
| --- | --- |
| `test-…-journey1` | one record, title `Weekend plans` |
| `test-…-journey2` | one record, title `Final plan` (the `Draft` title was replaced, not duplicated) |
| `test-…-journey3` | empty array (the created note was deleted and stayed deleted after relaunch) |

The namespaces from the earlier cancelled run were left untouched. The 64-character backend key was searched for, without printing it, in `state.json`, both verification logs, all seven Swift files, `AcceptanceTests.swift`, `acceptance.json`, the live driver log and an export ZIP created through the UI. It appeared zero times in every file.

### Interactive simulator preview

From the verified Notes workspace, **Live simulator** compiled the trusted driver and reached `ready` on the iPhone 18 Pro. Each step below was performed in Chrome against the live frame and confirmed by the status line and the next frame:

1. Sent text before tapping any field. Status showed `input 1/1 · Tap a text field in the simulator before sending text.`; the session stayed `ready`.
2. Tapped the app's **+** button in the live image; the Add Note sheet opened and the input error cleared (`input 2/2`), confirming tap coordinates map to the native capture.
3. Tapped the title field (keyboard appeared), sent `Grocery run` through the Studio text box (`input 4/4`) and tapped **Save Note**.
4. Chose **Relaunch**; the list showed `1 note · Grocery run` (`input 6/6`). Screenshot: `../studio-live-notes-preview.jpg`.
5. Dragged down on the list; the swipe was accepted (`input 7/7`) and the pull-to-refresh completed with the note still present.

**Development backend data** and the API both reported one record in the separate `preview` namespace with title `Grocery run`; the automated test namespaces were not touched by the live session. During the session the workflow, export and undo buttons were disabled.

**Stop preview** returned `stopped` after 99 frames. The driver run ended with `** TEST SUCCEEDED **`, `xcodebuild` exited, and the session folder kept only a 50 KB redacted `driver.log`; the 185 MB derived-data folder and the temporary project copy were removed. The backend key was absent from the driver log.

### Export and cleanup fixes

Export ZIP from the UI contained the Swift sources, Xcode project, frozen tests, `acceptance.json`, the runner and license, with no key and no derived data. The archive also contained AppleDouble `._` metadata entries; export now passes `--norsrc` to `ditto`, matching the Mac packager. That export was created before this fix.

Five generated launcher bundles (about 1.2 GB) left behind by earlier runs of the packaging command were removed from `../studio-distribution/build-*` and the system temporary folder. The packaging command now deletes its temporary staging bundle after writing the ZIP.

### Mac preview bundle — cold launch

The ZIP was rebuilt after the source changes above and extracted to a fresh folder. `codesign --verify --deep --strict` passed with an ad-hoc signature (no Developer ID, not notarized). The bundled `studio/` folder was byte-identical to the working tree apart from the excluded `test/` and `distribution/` folders.

With no Studio server running and port 8844 free, opening the app started the bundled Node 24.15 runtime on the bundled `server.mjs`; `/_studio` answered within about three seconds, `launcher.log` recorded the server banner, and the API listed all four saved workspaces (Studio Notes, Pocket Habits and two Chapter One workspaces) with their prior statuses intact. The health check reported Xcode 27.0, Claude Code and an available iPhone simulator, and no Codex CLI. Quitting the app through AppleScript terminated the server it had started and released the port. Existing-server reuse had already been verified in the earlier session.

A stale launcher process from an earlier packaging run (still running from a since-deleted staging folder, owning no server) was found and quit during this check.

### Studio interface restyle — 2026-10-01

The browser interface was restyled to share the project website’s design system (light and dark tokens, system typography, floating frosted header, pill buttons, rounded cards). The workspace is now a chat column on the left beside the live simulator on the right, and saved projects appear as chips under the header on every screen. Element ids were kept, so the existing app logic and the 41 regression tests were unchanged and still pass.

Checked in Chrome against the running server: welcome and workspace screens in light and dark, the Studio Notes workspace with its verified capture, chat bubbles, plan summary, workflow buttons, composer, backend panel and build activity. At 390px (headless Chrome with device emulation) the document scroll width equalled the viewport on both screens; the only elements beyond the edge belong to the intentionally scrollable project switcher and header action row. No console errors were logged.

## Studio workspace branch — 2026-10-28

Local development evidence, not a public release:

- Full Studio suite: 99 passed, zero failed; subsequent release-draft regression suite: 8 passed, zero failed.
- MCP build passed; MCP suite: 830 passed, zero failed, one skipped.
- Real imported ReadingList: three unit tests and two UI tests passed on Xcode 27 / iOS 27, iPhone 18 Pro. Launch capture inspected. A separate live driver tapped Add and displayed the real add-book sheet.
- Real Codex JSON transport and persisted read-only task completed. Claude execution failed despite CLI authentication; no Claude generation success claimed.
- Browser check before release-panel addition passed creation, settings, source inspection, search, pinning, approval cancellation and desktop/narrow layouts. The approval test uses a synthetic plan, not fabricated generation evidence.
- Capture archive regression covers immutable copies, stale source labels, traversal rejection and tamper detection. Release draft regression rejects credential fields and refuses reports before preparation.
- Final independent review could not run because the reviewer hit an account usage limit. Latest archive/release changes are not independently reviewed. Native release preparation, complete shared-provider generation, signed packaging and the complete product acceptance matrix remain unverified.

No merge, npm publication, deployment, signing or Apple upload performed.

### Packaging follow-up

Full Studio suite rerun: 100 passed, zero failures/skips. Local arm64 macOS preview packaging passed compilation, ad-hoc signing and strict deep signature verification after preserving relative dependency symlinks during copy. ZIP SHA-256: `2adf8003a880d86512ff396598e6877c8c02c798607b5795c2ecc45c1a9d212f`. This is not notarization or a clean-machine launch test. Independent review remains blocked by the reviewer account limit.

### Launcher entry point

Runtime smoke checking found silent exit through a symlinked checkout path. Entry-point detection now compares real paths. The server starts through the symbolic checkout, covered by a new process-level regression test. The preceding full 100-test suite passed; the additional launch test passed independently.

## Connected workspace verification — 2026-10-28 follow-up

- Studio: **112 passed, zero failures, zero skips** (`node --test --test-concurrency=1 --test-timeout=30000 studio/test/*.test.mjs`).
- MCP: **831 passed, zero failures, one skipped**, after a successful TypeScript/data build.
- Browser workflow check passed creation, source browsing, project settings/search/pinning, approval/cancellation and desktop/narrow layout without console errors. Synthetic plan use remains explicitly labeled.
- Latest arm64 preview built and passed strict deep ad-hoc signature verification. ZIP SHA-256: `3549525e78a3890b7a369150e717ef22cf1dd7ce2cd7dc246e445742dceedeea`. Bundled runtime startup was also exercised independently of the checkout runtime. Not notarized; no clean-machine certification.
- Existing sample release preparation generated metadata, readiness, analysis and screenshot-set artifacts. Prepared preview retrieval passed hash checks. No signing, provisioning, archive or upload was executed.
- Real Codex shared-agent run generated a counter app, built it twice, launched it, captured iPhone/iPad light/dark/XXL screenshots and attempted a visual repair. It correctly stopped with unresolved visual findings at the configured repair limit. Native tests subsequently reported 15 passed, 3 failed, 0 skipped; this is **not** a passing end-to-end app result. A further explicit refinement was started against the unchanged tests; results must be reported separately.
- Claude remains blocked by an authentication/account restriction; the maintainer chose to leave that account issue alone. No fallback or subscription change was made.
- Independent read-only review found approval, input-confinement, output-limit, product-integrity, history-access and undo issues. These were corrected with regressions. Follow-up reviews found scheme-script/large-config validation and explicit-test-budget issues, also corrected. Final focused review reported no blocking findings in those paths; this is source-review evidence, not additional native execution.

Explicit Verify requests have their own bounded budget and preserve historical build-cycle evidence. Verify runs tests without re-entering generation or treating unresolved visual findings as passed. Imported repair preserves the original task undo snapshot and cannot edit tests, project configuration or external dependencies. Release operations require separate exact-plan approval and retain uncertain-upload receipts across restart.

### Hosted checks and second native run

The feature-branch hosted Linux Studio job and macOS Studio/launcher job passed. Docs Consistency passed. The MCP job stopped at a pre-existing stale generated tool title (`ios_import_html`); its deterministic index and dependent local-library index were regenerated and the tool-index check passed locally. This does not claim the subsequent hosted rerun has passed.

The explicit counter refinement preserved the test sources and added an accessibility container, rebuilt and recaptured the app. It still stopped at its visual-repair cap with an XXL button-label wrapping finding. A separate native rerun again reported 15 passed, 3 failed, 0 skipped. Both failed runs and their xcresults are retained; neither is counted as successful native app acceptance. This limits claims about autonomous generation quality even though the workspace infrastructure checks pass.

XcodeGen 2.46.0 was installed in the developer's user-local bin/share directories without overwriting an existing installation. Claude account access was left unchanged as requested.

## Native selector diagnosis and verification scope (2026-10-28)

The counter's failed UI assertions were reproduced with an accessibility-tree
diagnostic. The tree contained `ScrollView ... identifier: 'screen-counter'`;
the generated interaction tests queried `app.otherElements["screen-counter"]`.
The diagnostic logging was removed and the original test file restored byte for
byte before repair verification. A manually assisted application-source repair
moved the identifier onto the inner content container, without changing tests.
This is separate from the earlier autonomous repair attempts and their failures.

The test-generation prompt now follows the engine's existing type-independent
screen-root lookup. Button/text-field interaction queries remain typed. A new
regression checks this contract. An independent review also found that verify-only
was replacing unresolved workflow status with `verified`. It now reports
`tests-passed` and retains the saved workflow blocker; task events preserve both.
The focused 12 bridge/task tests and 6 generated-test tests pass. The MCP suite
reports 832 passed, zero failures, and one skipped. No release gates were relaxed.
