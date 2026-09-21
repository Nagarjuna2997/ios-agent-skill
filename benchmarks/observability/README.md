# Benchmark efficiency measurements

Issue #13 adds an offline metrics API for future experiments. It does not invoke
clients, alter the original 20 tasks, modify archived scores, or run a comparison.
The existing historical runner remains frozen. Import `metrics.py` in the next
versioned experiment runner; do not retrofit historical measurements as if observed.

`measurement(events, event_format, ...)` returns an allowlisted numeric record:

- Versioned `codex-jsonl-1` and `claude-stream-json-1` event adapters, parser version.
- Observed turns, unique tool calls, direct build/test invocations, repeated invocations.
- Explicit retry counts only when a trusted driver emits `benchmark.retry-observer.v1`
  and unique `benchmark.retry.v1` IDs. Otherwise retry intent remains null.
- Reported token fields, including zero; absent counters remain null. Claude terminal
  cumulative usage is not added to per-message usage. Codex usage sums completed turns.
- Separate provider/scorer seconds, worker count, cache condition.
- Initial/final warning and error counts with deltas, and synthetic fixture diff size.

Codex turns mean completed top-level turns; Claude turns mean assistant messages.
They are not interchangeable model iteration counts. A `swift test` invocation counts
as a test attempt, not a second independently observed build attempt. Shell wrappers,
compound commands and scripts remain indirect/unknown; do not infer what they ran.
Counters are observations, not proof that the stream includes every internal action.

Only pass synthetic fixture path-to-bytes maps to `diff_size`; exclude treatment
material, build products and evaluator files at collection time. No source, file
names, command text, tool arguments, output text or arbitrary usage fields are retained
by this API. Do not save raw provider transcripts for this purpose. Diagnostic counts
must be supplied by the evaluator's pinned scorer for both starter and final output.

`compare(cells)` requires one client/protocol and unique baseline/skill cells per
(task, trial). It compares only completed pairs with completed event streams and
matching worker/cache/parser conditions. Missing data remains null. Provider failures,
unsupported/skipped states and incomplete pairs are retained without efficiency
comparison. Returned differences are descriptive; they do not establish cost savings.

Run synthetic regression transcripts, without provider calls:

```sh
python3 -m unittest discover -s benchmarks/observability -p 'test_*.py'
```

Future scored execution still requires the isolation and pinning gates in
`../v2/README.md`. No real-client efficiency comparison has run in this implementation.
