# Design contract and independent review

**Load this when:** a change is substantial enough that a specification should be reviewed by someone who did not write it before code is written: a new persistence layer, authentication, payments, sensitive permissions, concurrency changes, multi-target work, or anything a single `/ios-build` plan cannot hold. Small, well-defined fixes stay on the existing `/ios-build` and review-tool workflow; nothing here is required for them.

The workflow is **Inspect → Design → Independent review → Resolve → Implement → Verify → Detect drift**. A context-aware planning agent writes a self-contained contract. Fresh reviewers examine only that contract and the evidence it references. Findings become dispositions, dispositions gate readiness, and verification is tracked per acceptance criterion against the exact revision that was approved.

## Status

Implemented in `mcp-server/src/design/` and covered by `mcp-server/test/design.test.js` (22 tests against fake providers, a fake `claude` runner, temporary projects, the real CLI entry point and the real MCP server). The deterministic lint evaluation in `benchmarks/design-review/` detects 12/12 seeded defects with no false positives on the clean control.

What has and has not been exercised for real:

- **VERIFIED:** schema validation, rendering, state transitions, locking, stale-run recovery, evidence packaging and redaction, reviewer output parsing, dedup, dispositions, readiness gating, approval provenance, verification tiers, `/ios-build` state import, drift checks, the `design` CLI and the six MCP tools, all on Linux with Node 22.
- **INSPECTED:** the `claude-code` provider's command line is asserted by a fake runner (`-p --no-session-persistence --tools "" --strict-mcp-config`), the same flags the build agent already uses for headless calls.
- **Live `claude-code` runs:** see [Recorded verification](#recorded-verification) below for what was actually executed and what the reviewers found.
- **UNVERIFIED:** the `ai-route` provider against a real cloud key; client-attested subagent isolation (the server records the attestation and cannot verify it); any claim that the workflow reduces rework or improves shipped quality. Those claims need the paired live evaluation that has not been run.

## What the contract holds

`DESIGN.json` is the machine-readable source of truth; `DESIGN.md` is rendered from it deterministically (same contract, same bytes, regardless of key order) and is never edited by hand. Schema version 1; `migrateContract` is the single place a future bump lands, and unknown versions fail loudly.

| Section | What goes in it |
|---|---|
| `objective`, `scope`, `nonGoals` | Why, how far, and what is explicitly out |
| `constraints`, `currentCode` | Claims about the existing code. A claim tagged `fact` **must** cite `evidence` (path, optional line and symbol); `decision`, `assumption` and `unknown` are labelled as such, and an `unknown` names what would settle it |
| `userJourneys`, `screens` | Journeys, per-screen states (`loading`, `empty`, `success`, `error`, `offline`, `partial`) and accessibility requirements |
| `architecture` | Summary plus claims for state ownership, data flow and persistence |
| `apiContracts`, `dependencies` | Service boundaries; packages, frameworks, services and tools |
| `deployment` | Minimum iOS, targets, toolchain claims |
| `concurrency`, `permissions`, `privacy` | Actor isolation decisions; Info.plist and entitlement keys with purpose; credential boundaries |
| `failureHandling`, `migration` | Recovery and data migration |
| `acceptanceCriteria` | `AC-n` with a statement, a verification `method` (`compile`, `unit-test`, `ui-test`, `simulator`, `visual`, `accessibility`, `external-service`, `signed-distribution`, `manual`) and an optional `target` (test name, screen id, system) that evidence is traced to |
| `steps` | `S-n` with the criteria it serves, dependencies and files |
| `unresolved`, `risks` | Open decisions and risks, tagged like other claims |
| `requiredFiles`, `requiredSymbols` | Drift anchors: paths that must exist, Swift identifiers that must appear |

Validation rejects duplicate IDs, steps that reference unknown criteria, criteria no step covers (once steps exist), facts without evidence and traversal in paths. Readiness additionally needs a non-empty objective, scope, criteria, steps, at least one observed fact about the current code, and no unknown without a settling check.

## Routing

`design route` (or the `create` output) recommends `lightweight` or `full` from signals anyone can check in the contract: architecture decisions, persistence or migration, authentication, payments, sensitive permission keys, concurrency decisions, multiple targets, external services, large scope, many unknowns. Persistence, authentication, payments, sensitive permissions and concurrency each justify a full review alone; the others need two together. The explanation says which signal fired and where. `design mode --mode lightweight --reason "..."` records an explicit override with its reason; the recommendation is kept beside it.

Lightweight mode: `drafting → ready` once mandatory fields are complete. Full mode: readiness also requires a completed **independent** review of the current revision.

## State machine

```
drafting → review-requested → reviewing → review-complete → resolving → ready → implementing → verifying → verified
     ↑__________________________________________________________|                 |
     any revision returns here and clears every bound flag                        blocked / cancelled / superseded
```

Four flags are recorded separately and each is bound to the contract hash it was set for:

| Flag | Set by | Means |
|---|---|---|
| `reviewCompleted` | a finished round whose reviewers all completed on an isolating provider | an independent review of this exact revision exists |
| `readyForImplementation` | `design ready` | computed: no open or re-review blocking findings, no mandatory gaps, review completed in full mode, no active run |
| `userApproved` | `design approve` | who authorized implementation, with `source` (`explicit-user-statement` or `existing-implementation-authorization`) and verbatim `provenance`. Never inferred from a review, elapsed time or silence |
| `verified` | `design verify` | every criterion has current evidence at its required tier |

A revision (`design update`) bumps the revision, snapshots the previous contract under `revisions/`, clears all four flags, and marks findings that touch changed sections or criteria as `re-review`. Editing `DESIGN.json` by hand is detected by hash on the next load and treated the same way. Nothing carries forward silently.

The review budget (`maxReviewers` 5, `maxConcurrency` 2, `maxRounds` 3 per revision, `reviewerTimeoutMs` 10 min, `maxContextChars` 120k) is stored in `workflow.json`. When rounds run out with findings still open, `design decision --resolution ... --reason ...` writes a concise decision record and moves to `blocked`; nothing manufactures consensus.

## Independent review

Each reviewer receives exactly one package: the contract revision and its hash, a bounded evidence manifest (every file the contract's claims cite plus `requiredFiles` and any `--evidence` paths, inside the project only, credential files excluded, secret-looking lines redacted, each file hashed and truncated at 64k characters within the context budget), its role criteria and the output schema. The package has no history, rounds, findings or conversation. Roles are selected from the signals, not always all five:

| Role | Covers |
|---|---|
| `requirements` | criteria testability, journey and state coverage, scope consistency |
| `architecture` | compatibility with observed code, single owner per state, dependencies and targets, migration |
| `concurrency` | main-actor isolation, cancellation and task lifetime, re-entrancy, lifecycle |
| `security` | credential boundaries, permission purposes, service boundaries, privacy |
| `ui-verification` | reachable states, Dynamic Type and VoiceOver, simulator feasibility |

Providers and what each records as `isolation`:

| Provider | Isolation recorded | Counts as independent |
|---|---|---|
| `claude-code` | fresh headless `claude -p` process per reviewer, `--no-session-persistence`, tools disabled, empty MCP config, temporary cwd | yes |
| `ai-route` | stateless HTTP completion through the existing `ai` router; needs `.ios-agent-ai.json` with `privacy cloud-permitted` and an allowed provider | yes |
| `client-subagent` | packages written for the connected client to dispatch; the submitter's `--attest-fresh-context` text is recorded as **client-attested, not verified by the server** | only when every reviewer in the round is attested |
| `self-review` | same context as the author | never; labelled self-review |

Every reviewer record stores provider, execution id, isolation text, verdict, elapsed time and model-reported usage (or `unavailable`). Cost is `null` unless pricing is configured, which it is not. Model calls happen only inside `design review` and the `design_review` tool, never at server startup, tool discovery or status inspection.

Reviewer output is validated against a strict schema (role, severity, category, affected criteria/sections/sources, concrete scenario, evidence, correction, verification expectation, confidence, uncertainty). Malformed output is recorded as `malformed` with the parse error; the raw text is kept privately and the run continues. Findings without evidence are kept but marked `unsupported`. Overlapping findings (same category, same affected IDs, similar title) collapse into one finding that keeps every reviewer's provenance; agreement never raises severity or confidence.

Dispositions: `accepted` (records the revision that incorporated it), `rejected` (needs a rationale), `deferred` (needs an impact statement), `superseded`. Readiness is blocked while any blocking finding is `open` or `re-review`.

## Implementation and verification

`design implement` requires approval bound to the current revision. During implementation, `design step S-1 --status done` tracks steps and `design evidence` records artifacts per criterion in **separate tiers**:

| Tier | Satisfies methods |
|---|---|
| `code-written` | nothing on its own |
| `compiled` | `compile` |
| `automated-checks` | `unit-test`, `ui-test` |
| `simulator-observed` | `simulator` |
| `visual-inspected` | `visual`, `accessibility`, `manual` |
| `external-verified` | `external-service`, `signed-distribution` |

Every evidence entry stores the artifact hash, the contract hash and a fingerprint of the project's buildable sources at the time. `design verify` reports each criterion as `verified`, `stale-evidence` (sources or revision changed since), `failed` or `unverified`, and marks the design verified only when all criteria are current at their required tier. A successful build or a screenshot never satisfies a criterion that needs a stronger tier.

`design import-build` maps the existing `/ios-build` state deterministically: successful builds to `compile` criteria, passing test runs to `unit-test`/`ui-test` criteria whose `target` appears in the test log, screenshots to `simulator` criteria whose `target` is the screen id, passing design reviews to `visual` criteria. Anything that cannot be matched is listed as unmapped rather than guessed. The existing protected acceptance files, retry caps and cancellation in the build loop are untouched; this layer only reads `state.json`.

If implementation needs a material departure, write the revision with `design update`; the review results it invalidates are marked `re-review` and the approval is cleared, so the departure is reviewed rather than smuggled in. Routine details stay within the recorded authorization.

## Drift

`design drift` compares the saved design with the project and the retained evidence. Every finding is labelled `deterministic` or `unknown`:

- required files missing; required symbols absent from Swift sources (presence only, not behaviour)
- deployment target in `spec.json`, `project.yml` or an xcconfig differing from the design; `unknown` when none states one
- Swift packages in the design not declared in the manifest; `unknown` when no manifest is found
- permission keys in the design but not in Info.plist/entitlements/project.yml, and the reverse
- criteria without current evidence; evidence invalidated by source or revision changes; steps not done

It never claims semantic equivalence between prose and code and never modifies the design. Exit code 1 means at least one deterministic finding.

## Commands

```sh
ios-agent-mcp design validate --contract design.json
ios-agent-mcp design create   --project /abs/App --id offline-sync --contract design.json
ios-agent-mcp design route    --project /abs/App --id offline-sync
ios-agent-mcp design review   --project /abs/App --id offline-sync --provider claude-code
ios-agent-mcp design findings --project /abs/App --id offline-sync
ios-agent-mcp design disposition --project /abs/App --id offline-sync --finding F-1a2b3c4d --as accepted
ios-agent-mcp design ready    --project /abs/App --id offline-sync
ios-agent-mcp design approve  --project /abs/App --id offline-sync --source explicit-user-statement --provenance "user: build it"
ios-agent-mcp design implement --project /abs/App --id offline-sync
ios-agent-mcp design step     --project /abs/App --id offline-sync --step S-1 --status done
ios-agent-mcp design import-build --project /abs/App --id offline-sync
ios-agent-mcp design verify   --project /abs/App --id offline-sync
ios-agent-mcp design drift    --project /abs/App --id offline-sync
ios-agent-mcp design status | inspect | resume | cancel | cleanup --project /abs/App --id offline-sync
```

For a client that can dispatch its own fresh subagents (Claude Code's Agent tool, for example):

```sh
ios-agent-mcp design review --project /abs/App --id offline-sync --provider client-subagent
# dispatch each printed prompt file to a subagent with no conversation access, then
ios-agent-mcp design submit --project /abs/App --id offline-sync --run run-... --reviewer requirements-... --file out.json --attest-fresh-context "Agent tool, fresh context"
```

MCP tools: `design_contract` (create, update, validate), `design_status` (read-only), `design_review` (run, prepare, submit), `design_resolve` (disposition, ready, approve, implement, decision, cancel), `design_verify` (step, evidence, import-build, report), `design_drift` (read-only). They live in the `design-review` tool group, included in the `all` and `build` profiles and absent from `review` and `docs`; `--tool-groups` can exclude it. With the group excluded, no other behaviour changes.

## State on disk

| Path | Contents | Version control |
|---|---|---|
| `.ios-agent/design/<id>/DESIGN.json` | the contract | commit it |
| `.ios-agent/design/<id>/DESIGN.md` | rendered view | commit it |
| `.ios-agent/design/<id>/workflow.json` | state, flags, rounds, findings, dispositions, history | commit it |
| `.ios-agent/design/<id>/verification.json` | evidence entries and step status | commit it |
| `.ios-agent/design/<id>/revisions/<n>.json` | last 20 revisions | commit it |
| `.ios-agent/design-private/<id>/runs/<runId>/` | packages, prompts, raw reviewer output, metrics (0o600) | gitignored by `design-private/.gitignore` |

Writes are atomic and serialised by a per-design lock that is never stolen from a live writer. A run whose process has exited or whose heartbeat is older than twice the reviewer timeout is reported as stale by `status` and cleared by `resume`, keeping any findings already recorded. `cleanup --keep N` prunes old private runs; durable files are never pruned automatically. Design ids are slugs; evidence paths must resolve inside the project and may not be symlinks.

Configuration precedence: command-line flags, then the budget stored in `workflow.json` at creation, then defaults. The `ai-route` provider reads `.ios-agent-ai.json` from the project (MCP) or the current directory (CLI), the same file `ios-agent-mcp ai config` writes.

## Privacy

Reviewer packages contain the contract and project files the contract cites, redacted of secret-looking lines and excluding credential files, `.env*` and `design-private/`. Those packages are sent to the provider you choose; choose non-sensitive evidence. Nothing is sent at startup, discovery or status. Reviewer responses and imported specifications are data: they populate findings and never change permissions or authorize actions. No credentials are collected; `claude-code` uses the installed CLI's own sign-in and `ai-route` uses the keys the `ai` router already reads.

## Evaluation

`benchmarks/design-review/` holds ten fixtures: a clean control and nine contracts with seeded structural defects. `node evaluate.mjs` scores the deterministic lint (12/12 detected, 0 false positives; this measures what a script can decide, not reviewer judgment). `node evaluate.mjs --live --provider claude-code|ai-route --out DIR` runs real independent reviews per fixture and scores findings by category against the seeded defects, recording reviewers, rounds, elapsed time, unsupported findings and model-reported usage. Live results are written separately from deterministic ones and are not combined.

## Recorded verification

Executed on 2026-10-28 from the session that opened the pull request, on Linux x86_64 with Node 22 and the Claude Code CLI installed there (no Mac, simulator or signing).

- `mcp-server`: `npm run typecheck`, `npm run build`, `npm test`: 873 passed, 0 failed, 1 skipped. `check-tool-manifest.mjs` and `render-tool-index.mjs --check`: 88 tools. `scripts/hooks/verify-repo.sh`: pass.
- `benchmarks/design-review/evaluate.mjs --self-test`: 10 fixtures, 12/12 seeded defects detected by lint, 0 false positives.
- Live `claude-code` provider, two runs over all ten fixtures, five reviewers each (`benchmarks/design-review/results/`):
  - Run 1: 25 of 50 reviewers completed, 25 marked malformed, 0 rounds independent. The raw outputs showed reviewers naming contract sub-sections (`persistence`, `dataFlow`, `stateOwnership`) that the strict `sections` enum rejected, discarding whole reviewers. That is exactly the kind of defect only a live adapter exposes; it was fixed by listing valid sections in the prompt, mapping sub-sections to their parent and dropping only unknown names (recorded on the reviewer).
  - Run 2: 48 of 50 reviewers completed, 2 malformed, 8 of 10 rounds independent, 12/12 seeded defect categories reported, 0 unsupported findings, 191 deduplicated findings in total, about 50 seconds per fixture with concurrency 2, roughly 10k output tokens per fixture as reported by the CLI (cost not computed). Every round of every fixture, including the clean control, also reported 14-23 findings beyond the seeded defect; the fixtures are deliberately thin and most of those are real gaps (empty user journeys, no criteria for upload or no-duplication, no synthetic path to screen states), so they are recorded as "beyond seeded", not as false positives.
- Not exercised: `ai-route` against a real cloud key; client-attested subagent isolation (recorded, not verified, by design); Mac, simulator and signed-distribution tiers, which come only from your own `/ios-build` runs through `design import-build`. No claim of reduced rework or improved shipped quality is made; that needs a paired evaluation with and without the workflow.
