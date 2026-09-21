# Thirty diagnostic fixtures

These are independent fixture contracts, not model comparison results. A reference
repair must pass the same check that rejects the starter. See README.md for lanes,
privacy/isolation requirements and the validator commands. App/source names and
all data are synthetic. No oracle depends on skill-specific wording or comments.

| Category / ID | Broken state | Independent acceptance evidence |
|---|---|---|
| Concurrency C01 | Worker mutates a main-actor model off actor | Swift 6 strict build; 31 awaited increments retained on the actor |
| Concurrency C02 | Mutable payload reused after crossing actor isolation | Strict Swift 6 compilation without unsafe escapes; 100 concurrent inputs sum to 5050 |
| Concurrency C03 | Continuation resumes twice on success and never on cancellation | Bounded executable checks success=7, specific failure and cancellation errors across repeated calls |
| Concurrency C04 | Old search completion replaces the latest query | Controlled out-of-order completions preserve newest results; empty results clear state |
| Concurrency C05 | Cancelled worker commits data and skips cleanup | Controlled gate suspends work, cancellation happens before release; no mutation and cleanup true; normal path commits once |
| SwiftUI U01 | View recreates its observable owner on parent updates | Increment, navigate/back, refresh parent; count remains two in Simulator |
| SwiftUI U02 | Old service completion overwrites newer UI state | Injected service completion controls Loading, New, Empty and Error; old completion cannot replace New |
| SwiftUI U03 | Deep-link route is not persisted/restored | Real app URL opening navigates to item 42; termination/relaunch restores it |
| SwiftUI U04 | Different rows expose duplicate identities | Select Beta, reverse rows, select Alpha; correct selected text both times |
| SwiftUI U05 | View-owned stream task is not cancelled and retains owner | Hide view, emit controlled event, inspect zero mutations and released weak owner |
| Persistence D01 | Renamed SwiftData property loses old schema compatibility | Evaluator-owned V1 disk-store seeder; V2 migration preserves notebook, both notes and relationship |
| Persistence D02 | Folder deletion nullifies ownership instead of deleting notes | Isolated SwiftData store deletes owned notes only; unrelated folder/note retained |
| Codable D03 | Decode error replaced with a success-shaped default | Required/missing/null/malformed payload matrix plus valid JSONEncoder/JSONDecoder round trip |
| Persistence D04 | Failing writer overwrites part of existing cache | Injected prefix-write failure leaves previous bytes readable; successful write replaces; no temporary-file leak |
| Persistence D05 | Actor reentrancy inserts duplicate logical IDs | Coordinated concurrent bursts across a controlled checkpoint retain one ID plus distinct record; early reservation allowed |
| Testing T01 | Unawaited async assertion can outlive its test | Candidate tests pass correct fetch and detect wrong value; compiler errors/zero tests/timeouts are not detection |
| Testing T02 | Error branch never asserted | Same candidate tests pass correct service and reject seeded swallowed-error implementation |
| Testing T03 | Wall-clock smoke test misses exact expiry boundary | Tests must reject the > versus >= defect using injected time; correct service passes repeated runs |
| Testing T04 | Parallel tests share one mutable counter | Correct implementation must pass repeated parallel tests; broken increment implementation must be detected |
| Testing T05 | Parameter matrix omits zero | Test matrix must reject zero-items→one-page defect while accepting correct implementation |
| Build B01 | Package product points to wrong local dependency identity | Offline SwiftPM resolves bundled LocalMath; signed/zero/positive doubling tests |
| Build B02 | Package resource missing from declared bundle | Offline build plus runtime JSON catalog lookup verifies bundled synthetic contents |
| Build B03 | Existing feature source omitted from app target | Unsigned Simulator build and runtime Ready 42 feature text |
| Build B04 | iOS 17 symbol effect used unguarded with iOS 16 minimum | Build at fixed iOS 16 deployment target; injected legacy path renders Static on installed Simulator |
| Build B05 | Simulator configuration requires an unavailable signing identity | Effective project settings disable signing; forced-unsigned build and working feature screen; no signing attempted |
| Quality Q01 | Login event includes credential and personal identifier | Captured synthetic events retain useful login information and are identical for different secret/identity inputs |
| Quality Q02 | Callback strongly retains its owner | Current-value callback works while alive; weak owner becomes nil even with callback retained externally |
| Quality Q03 | Save control has empty accessibility label | Named enabled save control has action label; exposed Empty→Saved state transition |
| Quality Q04 | Privacy manifest has wrong types/shape | Pinned plist structural contract preserves already-reviewed CA92.1 reason and false tracking; no legal claims invented |
| Quality Q05 | Navigation appearance repeatedly reloads data | Operation counter: one initial load including empty data, no repeated navigation loads, one explicit refresh |

**Lanes:** 19 portable, 2 macOS/SwiftData, 9 Simulator. Fixture validation does not
measure agent efficiency, compare arms, or claim a skill improvement. Missing
runtimes are unsupported, provider failures are separate, and scored comparisons
remain deliberately unavailable in this phase.
