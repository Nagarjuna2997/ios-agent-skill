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

## Scope and remaining work

This preview supports the reading-list starter and two editable Swift files. The tests verify that starter’s persistence, search, progress and failure states, not arbitrary plan requirements. The simulator panel displays captured screens rather than an interactive stream. Generic app generation, additional frameworks/files, hosted operation and native Mac packaging remain future work. No comparative benchmark or improvement claim is made.
