# Dynamic Workflows and Large-Scale Jobs

**Load this when:** the work is too large for a handful of delegated tasks —
a codebase-wide migration, a rule applied across dozens of modules, or a batch of
independent changes that each want their own PR.

There is a scale at which conversational delegation stops working. Somewhere
around ten parallel units, the main agent's context becomes the bottleneck: it
is spending more effort tracking who is doing what than doing anything. Past
that point, the orchestration belongs in a script.

---

## 1. The scale ladder

Pick the cheapest rung that fits. Climbing early costs more than it saves.

| Scale | Approach | Coordination lives in |
|-------|----------|----------------------|
| 1–2 files | Do it inline | Your own context |
| 3–8 units, related | Delegate to subagents in one session | The main agent |
| Repeated until a condition | A loop, optionally with a verifier | The loop contract |
| 5–30 isolated changes, each wanting its own PR | `/batch` | The batch tooling |
| Dozens of units, custom logic, non-linear | A dynamic workflow (script + SDK) | Your script |

Two questions decide it:

1. **Are the units independent?** If unit 7 needs unit 3's result, it is not a
   batch — it is a pipeline, and the dependency has to be encoded somewhere.
2. **Does each unit want its own review boundary?** Thirty commits on one branch
   is unreviewable; thirty PRs is thirty reviews someone can actually do.

---

## 2. `/batch` — many isolated changes

`/batch` is a packaged use of subagents plus **git worktrees**, aimed at roughly
5–30 isolated changes that each become their own PR. Each unit gets a fresh
subagent working in its own worktree, so the changes cannot collide on disk.

Good fits:

- Apply one mechanical rule across many modules — "add `@MainActor` to every
  view model", "replace literal spacing with `Space.*` tokens".
- Fix the same class of bug in many independent places.
- Bump a dependency across several packages.
- Migrate N files to a new API where each file stands alone.

Bad fits:

- **Units that share files.** Two workers editing `AppDelegate.swift` will
  produce conflicting PRs.
- **Units with ordering constraints.** Batch has no dependency graph.
- **Exploratory work.** Batch executes a known change; it does not decide what
  the change should be. Plan first (`ios-plan`), then batch.
- **One large refactor.** That is one PR, not thirty.

### Making a batch succeed

The per-unit prompt must be **complete and self-contained** — each worker starts
cold and cannot see the others.

```
For <module>:
  goal:     every @Observable type the UI renders is @MainActor final class
  scope:    only files under <module>/ — do not touch shared/ or Package.swift
  rules:    behavior must not change; add nothing but the isolation annotations
  verify:   swift build && swift test --filter <module>
  report:   the diff, plus the real output of the verify command
  if the module has no such types: report "no change needed" and stop
```

That last line matters. Without an explicit no-op path, workers invent work to
justify their existence.

### Worktrees

Each unit gets its own working copy, so parallel writes are safe:

```bash
git worktree add ../wt-cart -b batch/cart-mainactor
git worktree add ../wt-orders -b batch/orders-mainactor
# … worker per worktree …
git worktree remove ../wt-cart
```

Isolation is the whole point. Without it, parallel writers corrupt each other's
work in ways that are extremely hard to diagnose after the fact.

---

## 3. Dynamic workflows — orchestration in code

When the job needs logic that does not fit a fixed batch — conditional
branching, fan-out that depends on discovered results, retries with different
strategies, a dependency graph — move the orchestration into a script that
drives many subagents through the Agent SDK.

The shape:

```
discover  -> a read-only pass produces the work list
plan      -> group into independent units; identify ordering constraints
fan out   -> one worker per unit, in parallel, each isolated
verify    -> an independent verifier per unit
gather    -> collect verdicts; retry, escalate, or report
```

```python
# orchestrate.py — illustrative shape, not a copy-paste script.
# The point is the control flow, not the API surface.

units = discover_units()                 # e.g. every module with a view model

results = []
for unit in units:                       # parallelize as your runner allows
    worker_report = run_agent(
        agent="swift-refactorer",
        prompt=build_unit_prompt(unit),  # complete and self-contained
        worktree=make_worktree(unit),
    )

    review = run_agent(
        agent="swift-reviewer",          # cold, read-only, no stake
        prompt=f"Verify this change in {unit.path}. Run the build and tests "
               f"and return their real output.\n\n{worker_report.diff}",
        worktree=worker_report.worktree,
    )

    results.append((unit, worker_report, review))

report(results)                          # verdicts + evidence, not narrative
```

Three properties make this work, and all three are easy to get wrong:

1. **Each unit is self-contained.** Workers start cold. Everything they need is
   in the prompt.
2. **The verifier is separate from the worker.** Same rule as everywhere else in
   `verification.md` — the thing declaring success is not the thing that wants
   success.
3. **The script owns the state.** Not the model's memory. The script knows what
   ran, what passed, and what to retry.

### When *not* to script it

Scripted orchestration is a real system with real maintenance cost. If the job
runs once and has under ten units, a session with subagents is cheaper and
easier to steer. Write the script when the workflow recurs, or when the unit
count makes conversational tracking unreliable.

---

## 4. Failure handling at scale

At thirty units, some will fail. Decide the policy up front:

| Policy | Behavior | Use when |
|--------|----------|----------|
| Fail fast | Stop the whole run on first failure | Units share risk; a failure implies a bad plan |
| Isolate and continue | Mark it failed, keep going, report at the end | Units are genuinely independent |
| Retry once, then isolate | One retry with the failure fed back | Flaky infra, transient toolchain issues |

Default to **isolate and continue** for independent units, with a summary at the
end that lists every failure. Twenty-eight successes and two clearly-reported
failures is a good run. Twenty-eight successes and two silently-skipped units is
a bad one that looks identical from the outside — which is exactly why the final
report must enumerate failures explicitly.

**Never let a unit "succeed" by doing nothing.** A worker that finds no work
should say "no change needed" — that is a distinct outcome from "changed and
verified", and collapsing the two hides coverage gaps.

---

## 5. Cost

Every subagent starts cold, which means re-establishing context it does not
inherit. Thirty subagents that each read the same five files pay that cost thirty
times.

Reduce it by:

- **Putting shared context in the prompt** rather than making each worker
  rediscover it. One `ios-explore` pass up front, its findings pasted into every
  unit prompt, beats thirty independent explorations.
- **Using cheaper models for mechanical units.** `sonnet` for a token
  replacement; reserve `inherit`/`opus` for planning and review.
- **Scoping tightly.** A worker told exactly which files to touch does not spend
  its budget searching.
- **Not delegating what is inline-sized.** The most common waste is spawning an
  agent for a two-call task.

---

## 6. Anti-patterns

```
# 1. Batching units that share files.
-> Conflicting PRs, and neither worker knows.

# 2. Batching work with ordering constraints.
-> Batch has no dependency graph. Sequence it, or encode the order in a script.

# 3. Batching exploratory work.
-> Plan first. Batch executes a decided change.

# 4. Scripting a one-off ten-unit job.
-> A session with subagents is cheaper and easier to redirect.

# 5. Workers that grade themselves at scale.
-> Thirty self-assessed successes is thirty unverified claims.

# 6. No explicit no-op path.
-> Workers invent work rather than report "nothing to do".

# 7. Silently dropping failed units.
-> Enumerate every failure in the final report.

# 8. Thirty cold agents rediscovering the same context.
-> One discovery pass, results pasted into each prompt.

# 9. Parallel writers without worktrees.
-> Corrupted working tree, unattributable damage.
```

---

## Checklist before scaling out

- [ ] The units are genuinely independent — no shared files, no ordering.
- [ ] Each unit prompt is complete and self-contained (workers start cold).
- [ ] Each unit has an explicit no-op path.
- [ ] Each unit has a `verify` command and returns its real output.
- [ ] Parallel writers are isolated in worktrees.
- [ ] The verifier is separate from the worker.
- [ ] A failure policy is chosen: fail fast, isolate, or retry-then-isolate.
- [ ] The final report enumerates failures, not just successes.
- [ ] Shared context was discovered once, not thirty times.
