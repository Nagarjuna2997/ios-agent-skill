# Paired Swift microbenchmark

This exploratory experiment compares the same client with and without explicitly
reading this repository's skill. It is not a comparison with Xcode's built-in
skills and cannot establish full-app, UI, accessibility or App Store quality.

## Protocol

- 20 fixed prompts; three trials per client × prompt × condition (120 runs per client).
- Clients: Claude Code and Codex, with an explicitly selected model recorded in the protocol.
- Baseline gets the task and source-file constraints. Treatment additionally gets
  the skill entry point plus local guides, templates, examples and retrieval scripts.
- No MCP server or subagent bundle is supplied to the model. This tests the
  guidance treatment, not the entire product.
- Each task gets an empty `Sources/Solution.swift`, Swift 6 and Foundation.
  No secrets or personal app source is used.
- Hidden assertions are introduced after the client exits, compiled separately
  with the generated file, and executed independently. The client cannot edit them.
- Alternate baseline-first and skill-first by task and trial. Each call has a timeout.
- Claude uses safe-mode, no session persistence and file tools only; Codex uses
  ephemeral mode, ignores user config and disables automatic project docs and plugins, and excludes installed user skills in both arms.
  Client tools/default prompts still differ, so compare conditions within a client.
- Report compilation, assertions, static review blockers and client-reported token
  usage. Cache/input token accounting differs by client; do not compare raw token
  totals across providers or convert them into savings/cost without pricing data.
- Provider failures/timeouts are recorded separately from acceptance failures.
  A missing token field or failed scorer is unknown, not zero.

## Run

Requires authenticated local client CLIs, Node.js 20+, Python 3 and Swift 6.
Authentication stays with the clients. Do not put credentials in result files.

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
python3 benchmarks/validate.py
python3 benchmarks/run.py --client claude --model YOUR_VERIFIED_MODEL --output /absolute/results
python3 benchmarks/run.py --client codex --model YOUR_VERIFIED_MODEL --output /absolute/results
```

Reference files are frozen once per run. Resume checks reject changes to the
harness, references, prompts, compiled scorer, timeout or client version. Use a
fresh output directory after changing any of these. The requested model, Xcode and Swift versions are pinned in the protocol; provider-side model routing is outside this harness’s control. `Reference.swift` validates the test oracles; it is never
placed in agent workspaces. Raw provider responses are not published. Generated
synthetic Swift, metrics, full build/test logs, structured review findings, client versions and task hashes are saved locally for review. Results are not published automatically. Completed cells are atomic and their artifact hashes are checked on resume. Provider errors stop the run without recording an acceptance loss; resume retries that cell.

Three trials per condition are still exploratory and can be affected by model routing,
cache state, client restrictions and task simplicity. Zero blockers does not mean
correct behavior. An advantage on these tiny tasks would need replication and
real iOS app tasks before a broader improvement claim.

## Inspect before publishing

```sh
python3 benchmarks/test_run.py
python3 benchmarks/summarize.py /absolute/results --client codex > /absolute/results/summary.json
```

Use only complete matched pairs for win/tie/regression counts. Inspect every
regression and its full build/test diagnostics before forming a conclusion.
The scorer's `no-tests` finding is a fixture artifact: hidden acceptance tests
live outside the reviewed `Sources` directory. Keep it visible but do not count
it as an agent failure. These synchronous Foundation tasks do not measure actor
isolation, SwiftUI, simulator workflows, or the value of individual review tools.
Do not change prompts or assertions in response to observed scores.

A provider access failure is a blocked run, not evidence against the skill.
Client login status alone does not establish that the subscription permits CLI
inference; run a small preflight before starting the experiment. Keep all results
local until the paired table and limitations have been reviewed.

## Next evaluation

[Benchmark v2 protocol proposal](v2/PLAN.md) specifies 30 diagnostic task fixtures,
neutral selection, independent acceptance checks and efficiency metrics. It is
planned work, not an implemented or executed suite. The original tasks stay frozen.
