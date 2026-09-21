# Roadmap

## Available

- One MCP installation for reviews, local references, app scaffolding and simulator tools.
- Dated Apple technology and release-note snapshots, with original Swift implementations and tests.
- Reading List demo with persistence, search and simulator acceptance checks.
- Resumable loop engine with bounded repairs and saved evidence; a bounded real Claude repair is recorded in `examples/client-verification/claude-repair.json`; full app generation remains unverified.

## This release

- iOS 27/Xcode 27 release-status correction and refreshed Apple snapshots.
- `review_app_intents` with conservative migration advice and opt-in integration checks.
- Compiled Foundation Models tool-calling sample, availability fallback and deterministic tests.
- Official MCP Registry metadata; registry acceptance requires publication and authentication.

## Evidence-first priorities

These are acceptance gates, not shipped-feature claims. Finish and publish evidence
for one gate before broadening the tool inventory.

1. **Reproducible paired evaluation.** Start from the [existing 20-microtask
   harness](benchmarks/README.md) and the [30-task v2 proposal](benchmarks/v2/PLAN.md).
   The separate [launch-screen suite](benchmarks/launch-screen/README.md) has twelve
   implemented fixtures, but no paired agent results yet. Freeze starting projects,
   model versions, retry budgets and independent acceptance checks for both conditions. Report compile success, test success and Swift 6
   concurrency diagnostics separately. Publish every result, including failures
   and provider errors; do not infer app quality from microtasks or claim savings
   without measured data.
2. **One proof artifact.** Export selected build logs, test results, screenshots
   and structured findings from the saved loop evidence into one local bundle.
   Include toolchain, revision, commands, exit codes, timestamps and file hashes.
   Missing or failed checks must remain visible. Exclude credentials and unrelated
   project files, provide a contents preview, and never upload automatically.
3. **Reviewable patch proposals.** Offer opt-in patches with preconditions, a diff
   and post-change compiler/test checks. Do not automatically replace
   `Task.detached`, invent empty-catch recovery, or assume every `@Observable`
   model belongs on `@MainActor`; these require semantic context.

## Friction and maintenance backlog

| Proposal | Existing foundation | Required before advertising it |
|---|---|---|
| Xcode project synchronization | CLI emits an opt-in XcodeGen specification | Generate and validate a project; handle existing files without destructive overwrite. Arbitrary `.pbxproj` editing is not implemented. |
| Privacy manifests | Privacy guidance | Scan documented required-reason APIs, let the developer select applicable reasons, validate the manifest and explain scan limits. Never invent a legal justification. |
| Simulator accessibility audit | Screenshots and simulator commands | Inspect accessibility labels, text scaling, hit targets and contrast with reproducible fixtures; screenshots alone do not prove VoiceOver coverage. |
| SDK drift checks | Swift builds in CI | Compile representative availability/deprecation fixtures against the selected SDK and record its exact version. |
| Per-project UI baselines | Captured demo screens | Explicit baseline approval, pinned simulator settings, meaningful diffs and a reviewed update process. |

## Next verification gates

- Xcode 27 compilation and in-editor MCP/agent acceptance; current local host is Xcode 26.6.
- Live Foundation Models generation and provider routing, Core AI model execution and real Siri behavior.
- Muse Code model-directed tool use and verification observer; MCP discovery and a Stop hook are verified.
- Full app-generation acceptance across clients; do not generalize the bounded Claude repair check into a complete app-building claim.

## Later, based on demand

- Deploy the requested private-feedback receiver after choosing HTTPS hosting, restricted server credentials and an operator privacy/retention policy. Source prototype exists; submission is not live.

- `review_foundation_models`, `review_core_ai` and the remaining [analysis tool contracts](docs/mcp/vnext-analysis-tools.md).
- Simulator video/log streaming, UI automation backend and visual review.
- Measured token/context savings on reproducible tasks.
