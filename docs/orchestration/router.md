# Main Agent Router

**Load this when:** you are the main agent deciding how to execute a request —
do it yourself, delegate it, loop on it, or scale it out.

This is the entry point to `docs/orchestration/`. It answers one question:
**given this request, what shape of execution does it need?**

The default is **do it yourself**. Everything below is an exception that has to
earn its cost.

---

## 1. The decision

Work top to bottom. Take the first row that matches.

| If the request… | Then | Doc |
|-----------------|------|-----|
| Touches 1–2 files you can already see | **Do it inline.** No delegation. | — |
| Is a question you can answer from files you have read | **Answer it.** | — |
| Requires sweeping many files to locate something | Delegate to `ios-explore` | `subagents.md` |
| Is a multi-file feature, migration, or architecture change | `ios-plan` first, then execute | `subagents.md` |
| Produced code that will ship | `swift-reviewer` after | `verification.md` |
| Is a failure whose cause is not obvious | `swift-debugger` | `subagents.md` |
| Is a behavior-preserving cleanup | `swift-refactorer` | `subagents.md` |
| Is documentation, README, or CHANGELOG work | `ios-docs` | `subagents.md` |
| Must repeat until a condition holds | A **loop** with a stop condition | `looping.md` |
| Is 5–30 isolated changes each wanting its own PR | `/batch` | `dynamic-workflows.md` |
| Is dozens of units with branching or dependencies | A **dynamic workflow** | `dynamic-workflows.md` |
| Needs workers to talk to each other | **Reconsider.** That is agent teams — experimental, off by default | `subagents.md` §6 |

---

## 2. When to delegate

Delegate when at least one is true:

- **Context cost.** The investigation would read more files than you want in
  context. One paragraph of findings beats forty files.
- **Independence.** The work needs judging by something that did not write it.
- **Parallelism.** Several genuinely independent read-only investigations.
- **Isolation.** The work should happen in a worktree, not your working tree.

Do **not** delegate because a task sounds big. "Thorough", "multiple angles",
"several parts", and "check everything" are not delegation triggers — they are
descriptions of ordinary work. A subagent starts cold and must be told
everything; for anything you could finish in a few tool calls, that overhead
exceeds the benefit.

### Choosing the specialist

```
Where is X? / which files do Y?        -> ios-explore      (read-only, parallel-safe)
How should I build X?                  -> ios-plan         (read-only, returns a plan)
Is this change correct? Does it build? -> swift-reviewer   (read + Bash, no writes)
Why is this broken?                    -> swift-debugger   (reproduce, fix, prove)
Clean this up without changing behavior-> swift-refactorer (baseline, change, re-verify)
Write/update docs                      -> ios-docs         (structure + mirror sync)
Doesn't fit any of these               -> general-purpose  (built-in)
```

---

## 3. Standard sequences

### Feature (multi-file)

```
1. ios-explore    — find the existing seams and conventions      [parallel-safe]
2. ios-plan       — a step-by-step plan with file paths and verify commands
3. main agent     — execute the plan
4. swift-reviewer — cold verification: build + tests + real output
5. main agent     — route findings back, or report done with evidence
```

Skip steps 1–2 when the feature is small and the codebase is already familiar.
Never skip step 4 for code that ships.

### Bug

```
1. swift-debugger — reproduce, isolate, root cause, fix, prove
2. swift-reviewer — independent confirmation, if the fix is non-trivial
```

The debugger already proves its own fix by re-running the failing command. A
second reviewer is for fixes that touch shared code or change behavior beyond
the bug.

### Drive a red suite to green

```
GOAL:  swift test exits 0
CHECK: $ swift test 2>&1 | tail -20
MAX:   6
loop:
  swift-debugger  — one root cause per iteration
  swift-reviewer  — verdict + real output
  stop on: pass | MAX | identical failure twice
```

See `looping.md` for stall detection and the rules against faking termination.

### Codebase-wide mechanical change

```
1. ios-explore — enumerate every affected file (this is the work list)
2. ios-plan    — group into independent units; flag shared files
3. /batch      — one worker per unit, own worktree, own PR
4. per-unit    — swift-reviewer verdict before the PR opens
```

If step 2 finds that units share files, it is not a batch. Sequence it instead.

---

## 4. What the main agent stays responsible for

Delegation moves work, not accountability. The main agent always owns:

- **The user's actual request.** Subagents see a slice; you see the whole thing.
- **Deciding what "done" means**, and confirming evidence supports it.
- **Reconciling reports.** Subagents cannot talk to each other. If explore found
  something plan needs, *you* carry it across.
- **Reporting faithfully** — including failures, skips, and anything a subagent
  marked UNVERIFIED. Never launder a subagent's uncertainty into your own
  confidence.
- **Not fabricating pending results.** A background subagent that has not
  reported has no result. Say it is still running.

Subagent reports are input, not truth. If one says "tests pass" with no pasted
output, that is an unverified claim — treat it as such.

---

## 5. Cost discipline

Each subagent starts cold. Before spawning, ask:

1. Could I do this in two or three tool calls? → Do it.
2. Does an already-running subagent have this context? → Continue that one
   instead of starting fresh.
3. Will I re-explain more than the task is worth? → Do it inline.
4. Are these units really independent? → If not, do not parallelize.

Then reduce the cost of the ones you do spawn:

- One discovery pass, its findings pasted into every downstream prompt — not N
  agents rediscovering the same five files.
- `sonnet` for mechanical work, `inherit` for reasoning work.
- Tight scope: name the files, state what is out of scope.

---

## 6. Non-negotiables

These hold no matter which path you took:

- **Evidence, not assertion.** Every "it works" carries the command output that
  proves it. `verification.md`.
- **The author does not grade the work** for anything that ships.
- **Every loop has a stop condition and an iteration cap.** `looping.md`.
- **Parallel writers are isolated** in worktrees, or they are not parallel.
- **Failures are reported plainly**, never softened or buried.
- **Hooks and CI decide what they can decide.** Do not spend a reviewer subagent
  on something a grep in a hook settles for free.

---

## 7. Quick reference

```
inline            1–2 files, context already loaded          ← the default
ios-explore       "where is X" across many files             read-only, parallel
ios-plan          multi-file feature or migration            read-only
swift-reviewer    verify work you or another agent did       no write tools
swift-debugger    something is broken, cause unclear         reproduce → fix → prove
swift-refactorer  cleanup with no behavior change            green baseline required
ios-docs          prose about code                           enforces doc structure
loop              repeat until a measured condition          needs GOAL/CHECK/MAX
/batch            5–30 isolated PRs                          worktree per unit
dynamic workflow  dozens of units, branching logic           orchestration in a script
```
