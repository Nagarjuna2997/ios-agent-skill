# Native token-efficiency controls (opt-in)

The unified MCP gateway can advertise a smaller tool catalog, bound selected reference responses, and record local usage. The build CLI can reuse confirmed build facts and intervene in repetitive repairs. These controls use existing dependencies; there is no optimization service, background model, or external runtime plugin. Full tools and existing generation behavior remain the defaults.

## MCP profiles and output budgets

```sh
# Default: every existing tool, unchanged identifiers and schemas
npx ios-agent-mcp --project /absolute/path/App
# Explicit profile; tool-groups prints available groups and effective selection
npx ios-agent-mcp --project /absolute/path/App --tool-profile review
npx ios-agent-mcp --tool-groups build,simulator,apple-docs
npx ios-agent-mcp tool-groups --project /absolute/path/App
# Optional reference response budget and local call observations
npx ios-agent-mcp --project /absolute/path/App --tool-profile docs --output-chars 8000 --record-usage
# Restore all tools and original response contracts
npx ios-agent-mcp --project /absolute/path/App --tool-profile all --output-chars 0
```

Until this branch is released, use `node mcp-server/dist/unified.js` in place of `npx ios-agent-mcp` after `npm --prefix mcp-server ci && npm --prefix mcp-server run build`. The published npm package does not gain these options merely because the branch exists.

Put those arguments in the client's existing stdio MCP server configuration. All supported MCP clients use the same filtering and invocation checks. CLI selection overrides `IOS_AGENT_TOOL_PROFILE` / `IOS_AGENT_TOOL_GROUPS`, which override the explicitly applied project recommendation, which overrides `all`. CLI profile and groups are mutually exclusive. Environment groups take precedence over environment profile. `IOS_AGENT_OUTPUT_CHARS` supplies the output budget unless overridden by `--output-chars`. Selection is fixed at connection startup; reconnect after changing it. The effective configuration is also printed to stderr, never into the MCP stdout protocol.

[Generated tool/profile reference](../mcp/tools.md) comes from the runtime registry. Required advertised-tool dependencies are resolved transitively, with missing/cyclic dependencies rejected. Current tools depend on internal backends, not on other advertised tools; their dependency lists are empty. All child servers still start and discover tools, even with a narrow profile. This change reduces advertised schema bytes, not that initial discovery work.

Output budgets are **serialized JSON characters**, not tokens. Only read-only Apple/reference group tools without output schemas are eligible. Error, structured, binary and other tool results are left intact. The explicit opt-in envelope contains an excerpt, SHA-256 and `ios-agent-output://…` resource URI. `resources/read` returns paginated original JSON and a `next` URI; concatenate `text` fields and parse the result. This preserves full evidence but changes the eligible text response envelope, so use only with clients that support MCP resource retrieval. Expired references require repeating the original read-only request. Retention is connection-local RAM: eight payloads, ten minutes, at most 2 MB each. Larger payloads are returned unchanged rather than silently discarding details. Errors and contract exemptions can exceed the budget. No tool payload is written to disk by this feature.

## Project memory and repair intervention

```sh
node mcp-server/dist/unified.js build "A habit tracker" --out /absolute/path/App --memory --repeat-threshold 3 --efficiency-report
node mcp-server/dist/unified.js memory inspect --project /absolute/path/App
node mcp-server/dist/unified.js memory disable --project /absolute/path/App
node mcp-server/dist/unified.js memory diagnose --project /absolute/path/App
node mcp-server/dist/unified.js memory clear --project /absolute/path/App
# No intervention or automatic memory context without these build flags
node mcp-server/dist/unified.js build --resume --out /absolute/path/App
```

`--memory` explicitly enables recording and context for this build invocation (and re-enables previously disabled storage). The initial extractor records verified local simulator build profiles: scheme, fixed Debug/unsigned xcodebuild command kind and destination. It does not learn arbitrary shell commands, error transcripts, source code, credentials, or model-proposed instructions. Automatic setup-fix extraction is deliberately not implemented: a successful build alone cannot prove which suggested setup fix caused it. Remote build results are not learned as local evidence.

Facts are candidates until two separate CLI invocations actually confirm them with a compiler result. Repeated builds within one invocation count once. Hashed invocation receipts, confirmation counts, timestamps, lifecycle reasons and project/configuration/toolchain fingerprints accompany each fact. A compiler contradiction invalidates a fact; changed project configuration/environment invalidates it at selection, and verification expires after 30 days. Scheme/destination content is allowlisted, stored documents are strictly validated, and prompt text labels facts as untrusted context subordinate to repository/user instructions. Build facts are only relevant to the build adapter; unrelated tools do not receive them. At most 1,200 characters are injected, with a 64-fact / 16-receipt bound. The CLI creates separate stateless model requests, so relevant facts must be included again; it cannot assume an earlier prompt remains in the provider context. Prompt rules retain deterministic prefixes.

The intervention threshold is 2–10 completed failures (default off). Compiler diagnostic fingerprints include affected files and preserve multiplicity; changed diagnostics and partial reductions reset the repetition count. Source hashes distinguish unchanged source from edits that leave the diagnostic set unchanged. Test repairs use separate fingerprints including passed/failed/skipped counts. Infrastructure/unknown test evidence and timed-out builds do not trigger this detector. One different-strategy instruction is allowed per repeated pattern, then another unchanged completed failure stops that pattern. Original build/test attempt caps, wall-clock deadlines, protected test rules, and verification requirements remain authoritative. There are no recursive model calls. State and intervention reasons persist across resume; restarting does not erase a repeated pattern within the same cycle. Starting the existing new cycle resets it.

Automatic prompt memory and strategy intervention currently apply to this repository's `build` CLI/agent adapter, not arbitrary Claude/Codex/Gemini/Grok client loops, the legacy `loop` CLI, or external MCP callers. The server cannot control a client's private conversation assembly. `memory inspect` is available to any terminal user; inspection does not promote facts.

## Local state and recommendations

Everything lives under the selected project's `.ios-agent/efficiency/`, with owner-only files and a scoped `.ios-agent/.gitignore`. Existing ignore rules are preserved; if an existing scoped ignore lacks `*`, enabling fails with an actionable error. Ensure this directory is not already tracked in Git. Canonical project paths isolate memory, and state directories/files reject symlinks. Version 1 is the initial format; unknown schemas fail closed instead of being reinterpreted as trusted facts.

Writers use exclusive locks and atomic fsynced temporary files. Concurrent updates wait up to two seconds. Locks are never stolen from a potentially live writer. After a process crash, use `diagnose`; only manually remove a stale lock after confirming that its PID has exited. Corrupt memory is not overwritten by learning. `clear` atomically disables memory and retains one `.recovery` file for diagnosis; delete that local recovery copy if you want permanent erasure. Memory failures omit learned context without substituting invented facts; progress-state errors stop rather than discard intervention history. This is not a shared/network-filesystem database.

```sh
node mcp-server/dist/unified.js tool-profile recommend --project /absolute/path/App
node mcp-server/dist/unified.js tool-profile apply --project /absolute/path/App
node mcp-server/dist/unified.js tool-profile restore --project /absolute/path/App
```

Only `--record-usage` records server call observations. After at least three observed sessions, a matching narrower profile may be recommended. `apply` explicitly saves it for future connections using that project; `restore` reinstates the prior local selection. Nothing edits client settings or drops tools mid-session. The last 20 sessions retain groups, aggregate counts and bytes, not arguments or responses. Unseen future work may need more tools: use `--tool-profile all`. Server observations cannot reveal other servers' tools, client prompts, token billing, or unobserved model calls.

## Usage and evaluation

Opt-in `.ios-agent/efficiency/usage.json` and CLI `RUN_REPORT.md` distinguish unavailable metrics from zero. The MCP path measures tool calls, failures, serialized schema/response bytes (including paginated resource retrieval), separate resource read counts/bytes and elapsed time; model calls/tokens/cost are unavailable. The CLI path records its own model invocations, completed builds/retries, intervention count, memory characters and model-reported input/output/cache-read tokens. A failed or unparseable provider call makes aggregate tokens unavailable instead of presenting a partial sum as complete. No token estimates or cost assumptions are made. CLI MCP-call counts are unavailable. Reports describe the latest invocation; build evidence remains in the existing resumable state. Measured overhead covers context selection, memory observation, intervention and usage recording; final report serialization/flush itself is not included. Elapsed time includes those operations, with that final-flush exception.

[Paired evaluation protocol](../../benchmarks/efficiency/README.md) extends the existing v2 contracts. Cold and warm conditions remain separate; model/task/environment/acceptance pins must match, state identities cannot be shared, and evaluation tasks cannot appear in training memory. Incomplete, infrastructure/provider failures, unsupported/skipped cells, ties and regressions remain separate. Historical benchmark scores are unchanged.

Component measurements (this branch, Node v24.15.0): all **82 tools / 79,729 UTF-8 schema bytes**, build **47 / 32,213**, review **31 / 33,575**, docs **19 / 10,632**, design **21 / 21,478**. These are schema sizes, **not measured token savings**. Reproduce with `cd mcp-server && node scripts/measure-efficiency.mjs`. No authenticated paired model benchmark, cost evaluation, native Xcode efficiency comparison or client-specific billing validation has been performed for this feature.
