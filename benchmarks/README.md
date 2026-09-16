# Paired Swift microbenchmark

This exploratory experiment compares the same client with and without explicitly
reading this repository's skill. It is not a comparison with Xcode's built-in
skills and cannot establish full-app, UI, accessibility or App Store quality.

## Protocol

- 20 fixed prompts; one trial per client × prompt × condition.
- Clients: Claude Code and Codex, using each account's default model without a model override.
- Baseline gets the task and source-file constraints. Treatment additionally gets
  the skill entry point plus local guides, templates, examples and retrieval scripts.
- No MCP server or subagent bundle is supplied to the model. This tests the
  guidance treatment, not the entire product.
- Each task gets an empty `Sources/Solution.swift`, Swift 6 and Foundation.
  No secrets or personal app source is used.
- Hidden assertions are introduced after the client exits, compiled separately
  with the generated file, and executed independently. The client cannot edit them.
- Alternate baseline-first and skill-first by task. Each call has a timeout.
- Claude uses safe-mode, no session persistence and file tools only; Codex uses
  ephemeral mode, ignores user config and disables automatic project docs.
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
python3 benchmarks/run.py --client claude --output /absolute/results
python3 benchmarks/run.py --client codex --output /absolute/results
```

Reference files are frozen once per run. Resume checks reject changes to the
harness, references, prompts, compiled scorer, timeout or client version. Use a
fresh output directory after changing any of these. Actual default model identity
is not captured, so results are not a reproducible model comparison. `Reference.swift` validates the test oracles; it is never
placed in agent workspaces. Raw provider responses are not published. Generated
synthetic Swift, metrics, client versions and task hashes are the public evidence.

One trial per condition has high variance and can be affected by model routing,
cache state, client restrictions and task simplicity. Zero blockers does not mean
correct behavior. An advantage on these tiny tasks would need replication and
real iOS app tasks before a broader improvement claim.
