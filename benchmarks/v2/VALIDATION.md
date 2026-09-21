# Fixture validation record

This records trusted starter/reference validation only. No baseline or skill arm,
client inference, scored comparison, npm publication or historical rescoring occurred.

All 30 current fixtures match the input hashes in the successful evidence protocols.
Toolchain: Apple Swift 6.3.3, Xcode 26.6 (17F113), SDK 26.5. Simulator:
iPhone 17 Pro, iOS 26.4. Protocol: diagnostic-v2-fixtures-1; client/model: none.

| Fixture | Lane | Broken starter | Reference repair |
|---|---|---|---|
| B01 | portable | fail | pass |
| B02 | portable | fail | pass |
| B03 | simulator | fail | pass |
| B04 | simulator | fail | pass |
| B05 | simulator | fail | pass |
| C01 | portable | fail | pass |
| C02 | portable | fail | pass |
| C03 | portable | fail | pass |
| C04 | portable | fail | pass |
| C05 | portable | fail | pass |
| D01 | macos | fail | pass |
| D02 | macos | fail | pass |
| D03 | portable | fail | pass |
| D04 | portable | fail | pass |
| D05 | portable | fail | pass |
| Q01 | portable | fail | pass |
| Q02 | portable | fail | pass |
| Q03 | simulator | fail | pass |
| Q04 | portable | fail | pass |
| Q05 | portable | fail | pass |
| T01 | portable | fail | pass |
| T02 | portable | fail | pass |
| T03 | portable | fail | pass |
| T04 | portable | fail | pass |
| T05 | portable | fail | pass |
| U01 | simulator | fail | pass |
| U02 | simulator | fail | pass |
| U03 | simulator | fail | pass |
| U04 | simulator | fail | pass |
| U05 | simulator | fail | pass |

Eight harness tests and both existing JSONDecoder/JSONEncoder performance regression
tests passed. Simulator resume reused all 18 completed cells without rebuilding.
Validation evidence uses atomic completion markers and hashes for each command log
and result; source changes invalidate resume. Earlier Simulator startup failures
were infrastructure failures and were not accepted as behavioral failures.

Local evidence (not model benchmark results):
- /tmp/v2-portable-verified
- /tmp/v2-macos-verified
- /tmp/v2-ui-verified

Portable fixtures were validated on macOS; the Linux CI job is configured but has
not run here. B04 uses an injected legacy path, not an installed iOS 16 runtime.
The future container tool command is unit-tested but not runtime-smoke-tested;
Apple agent isolation still requires a separate disposable macOS VM. The CLI has
no scoring/provider command and refuses an Apple host-isolation fallback. Do not
start a comparison until the actual agent tool boundary is verified. Hidden checks
and repairs are excluded from exports; the evaluator checkout must never be given
to the agent. Public source memorization is outside filesystem isolation guarantees.

See FIXTURES.md for the independent acceptance contract of every fixture.
