# Benchmark v2: diagnostic Swift and iOS tasks

Status: fixture implementation is available; scored agent execution remains unimplemented and has not run. See README.md for validation and isolation requirements.

The original 20-task suite and its completed 120-run evidence remain unchanged.
Both arms passed all 60 runs. This is a ceiling result on synchronous Foundation
microtasks, not evidence about complete iOS apps or specific review tools.
Do not revise those tasks, delete unfavorable runs, or rescore the archived run
with a new analyzer. Any new scorer gets a distinct version and output directory.

## Selection and freeze

Select realistic failures by category before running either arm. Both conditions
receive the same broken project, brief, tools, dependencies and time budget. Only
the skill/reference treatment differs. Do not put skill-specific phrases, rule
names or required coding styles into task prompts. Accept multiple valid repairs.
Have an independent reviewer check task neutrality and hidden checks. Every fixture
must fail its intended acceptance check before repair and pass with a reference
repair. Reference repairs and hidden checks are never available to either agent.
Freeze task, fixture, oracle, skill, scorer and harness hashes before scored runs.
A tie or regression is a valid outcome; a skill win is never an acceptance gate.

## Proposed 30 tasks

These specifications are implemented under fixtures/. Fixture self-validation is separate from any measured agent comparison.

| ID | Starting failure | Required independent evidence |
|---|---|---|
| C01 | UI model mutated outside its actor | Swift 6 build; main-actor state transition test |
| C02 | Mutable reference crosses an isolation boundary | Strict-concurrency build; race-sensitive behavior checks without unsafe escape hatches |
| C03 | A continuation resumes twice or never | Success/error/cancellation paths complete once within bounded time |
| C04 | Stale search response overwrites newer results | Controlled response ordering preserves the newest query result |
| C05 | Work continues after cancellation | Deterministic cancellation test observes cleanup and no later state mutation |
| U01 | Observable owner recreated during navigation | UI state survives expected view updates and navigation |
| U02 | Older loading task replaces newer UI state | Injected service drives loading, success, empty and failure states |
| U03 | Navigation state cannot restore a deep link | Simulator opens and restores the intended route |
| U04 | Duplicate row identities cause wrong selection | Stable-identity test and selection behavior on reordered data |
| U05 | Background work leaks after a view disappears | Lifecycle test observes cancellation and no retained owner |
| D01 | SwiftData schema change loses stored data | Open a fixed old store, migrate, verify records and relationships |
| D02 | SwiftData relationship deletion is incorrect | Isolated store validates documented delete behavior |
| D03 | Malformed Codable payload silently becomes success | Required/optional/null/malformed payload tests preserve contract |
| D04 | Cache writes can leave a partial file | Injected write failure preserves the previous readable state |
| D05 | Concurrent duplicate inserts violate uniqueness | Deterministic repository test checks one logical record |
| T01 | Async XCTest completes before assertions | Test fails on an intentionally broken implementation and passes the repair |
| T02 | Async error path is never exercised | Injected error is asserted; timeout detects hangs |
| T03 | Clock-dependent test is flaky | Injected clock exercises timing boundaries without real sleeps |
| T04 | Parallel tests share mutable global state | Repeated isolated and parallel execution produces the same outcomes |
| T05 | Swift Testing parameterized test misses an edge case | Frozen input matrix detects the seeded defect |
| B01 | Swift package target cannot find a local dependency | Offline package build and tests with a fixed local dependency |
| B02 | Package resources are missing from the bundle | Build plus runtime resource lookup |
| B03 | Target membership omits a source file | Simulator build and feature test include the intended implementation |
| B04 | Deployment target conflicts with an API | Build at the fixed minimum deployment target; fallback behavior test |
| B05 | Signing configuration blocks simulator development | Unsigned simulator build succeeds without accounts or credential changes |
| Q01 | Sensitive value is written to logs | Captured synthetic log output omits the seeded secret |
| Q02 | Retain cycle keeps an owner alive | Weak-reference lifetime assertion after teardown |
| Q03 | UI interaction state lacks accessible labels | Simulator accessibility assertions for named controls and states |
| Q04 | Privacy manifest contains invalid structure | Plist/schema validation against a pinned fixture contract; no invented legal justification |
| Q05 | Navigation repeatedly performs avoidable data work | Injected operation counter verifies documented work budget, not wall-clock guesses |

Use an installed, recorded Xcode/SDK. Tasks requiring unavailable runtimes are
explicitly unsupported, never scored as failures or silently replaced. SwiftData
and UI fixtures require macOS/Xcode; use a separate lane from portable SPM tasks.
No Apple account, real signing identity, personal app, network package resolution,
or production secret is required. Privacy checks establish structure only.

## Measurements

For each client/arm/task/trial preserve a stable run ID and:

- Provider completion status, requested/observed model identity, CLI and SDK versions.
- Build/test result and full sanitized diagnostics, warning/error deltas from the starter.
- Agent turns and tool calls parsed from structured client events, with parser version.
- Observed build/test invocations and retries; indirect scripts remain unknown unless instrumented.
- Reported input, cached-input, output and reasoning tokens when available; missing means unknown.
- Provider elapsed time and independent build/test time, recorded separately.
- Added/deleted lines and changed files relative to the fixture; smaller is not inherently better.
- Blinded quality checks: behavior preservation, unsafe-concurrency bypasses, cancellation,
  lifetime, data preservation and task-relevant accessibility. Report each dimension separately.

Test event parsers against fixed transcripts, including failures and missing fields.
Do not infer turns from token totals or call missing metrics zero. Keep provider
failures separate from code failures. Efficiency comparisons require complete
matched pairs, counterbalanced order, fixed worker counts and disclosed cache
conditions. Do not turn aggregate CLI token counters into cost/savings claims.

## Acceptance and publication gates

1. Implement and validate 30 broken/reference fixture pairs and independent oracles.
2. Freeze the protocol and hashes before any scored agent output is examined.
3. Verify each client's real inference access and isolation. Claude is blocked until
   its organization permits Claude Code subscription access; login alone is insufficient.
4. Run a separately labelled harness smoke test; repair infrastructure, not task difficulty
   in response to which arm wins. Version any protocol correction and retain old evidence.
5. Run the predeclared paired trial count with atomic per-cell logs and resume checks.
6. Report every task, all ties/regressions, unsupported cases and provider failures.
   Review the full table before deciding on publication. No npm release is needed.
