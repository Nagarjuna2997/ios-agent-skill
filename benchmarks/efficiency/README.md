# Token-efficiency evaluation

This extension imports v2's pin validation and independent pair-outcome classification. It does not change historical scores or expose reference repairs to an agent. It consumes **trusted observer** receipts produced outside the isolated agent environment, not self-reported model success. Reuse the existing observability parsers for provider-reported token fields; never infer absent values from character counts.

Run contracts: `python3 -m unittest discover -s benchmarks/efficiency -p 'test_*.py'`.
Evaluate receipts: `python3 benchmarks/efficiency/evaluate.py /absolute/path/cells`.
Measure actual advertised schemas: `cd mcp-server && node scripts/measure-efficiency.mjs`.

Each JSON cell must contain:

- `version: "efficiency-pairs-1"`, `task`, `trial`, `arm: baseline|optimized`, `condition: cold|warm`, `component: profiles|responses|memory|intervention|combined`.
- The unchanged v2 `pins` contract: exact client/model/SDK/protocol, fixture/oracle/repair/skill/harness/analyzer hashes, networkless-container or separate-macos-vm isolation, worker count/cache policy. Baseline and optimized pins must be identical.
- Explicit identical `model_settings` including temperature, seed (null if unsupported), max_output_tokens.
- Unique `state_id` per cell, initial `memory_hash`, disjoint `training_tasks` for warm runs, and `evidence_hash` identifying immutable trusted verification evidence. Cold state must be fresh with no training tasks. Warm memory is prepared only from separate training tasks; no evaluation task from any pair may occur in training. The observer is responsible for actually creating separate state directories and verifying the hashes; identifiers are not a substitute for OS isolation.
- `status` from the v2 outcome contract, boolean `passed` for completed cells, and independent `quality` results (build/test/accessibility/acceptance as applicable). Use identical hidden checks across arms; never accept an agent's statement that tests passed.
- `metrics`: tool_calls, response_bytes, schema_bytes, retries, elapsed_ms, input_tokens, output_tokens, cached_tokens, overhead_ms, memory_characters, interventions. Unavailable fields are null. Elapsed includes optimization overhead. Cost is unavailable without separately supplied, sufficiently complete pricing and usage evidence.

`save_cell(directory, cell)` atomically retains each completed receipt; replaying identical evidence is idempotent, and a conflicting replay fails without overwriting it. The evaluator reports each pair's quality and metrics plus signed optimized-minus-baseline deltas. It does not turn incomplete/failed/provider runs into successful savings or pool cold/warm conditions. Contract unit tests use synthetic receipts; they are not scored model results.

No paired authenticated model comparison has been run for this change. The independently measured component result is serialized MCP schema size, recorded in [the implementation guide](../../docs/tooling/token-efficiency.md). A narrower schema is not proof of lower billed tokens or improved task success. Existing hidden-oracle isolation requirements still apply before any scored run.

## Real Xcode integration check (no model)

On a Mac with Xcode and an installed iOS Simulator SDK:

```sh
node mcp-server/scripts/verify-native-efficiency.mjs --out /tmp/efficiency-native-fresh
```

The output directory must not exist. This uses the existing project generator and recorded build pipeline, three intentional Swift compilation failures, a correct reference source, and two independent verification processes. It asserts the bounded intervention sequence and memory promotion. Unsigned simulator builds run locally; no provider, network dependency or app submission is involved. Logs remain under the selected output directory with SHA-256 digests in `verification.json`. It does not launch the simulator or test UI behavior, and it is not an isolated model comparison.

Recorded Xcode 27.0 (27A266a), Simulator SDK 27.0: **three expected failed compiler builds, then two passing repaired builds**; intervention sequence **continue / strategy / stop**, memory **candidate / promoted**. [Committed summary](evidence/native-compiler.json). An earlier fixture missing AppIcon setup failed before the intended Swift diagnostics; it was corrected, not counted as a successful result.
