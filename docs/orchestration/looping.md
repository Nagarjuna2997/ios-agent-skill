# Loops

**Load this when:** work must repeat until some condition holds — a failing
suite driven to green, a migration applied file by file, a CI run watched, a
recurring check — or when you are about to write "keep going until…".

A loop is a repeated cycle of work that continues until a **stop condition** is
met. The stop condition is the entire design. A loop without one is not a loop,
it is a runaway process.

---

## 1. The four loop patterns

| Pattern | Stops when | Use for |
|---------|-----------|---------|
| **Turn-based** | A fixed number of iterations completes | Bounded batch work: 12 files to migrate |
| **Goal-based** | A measurable condition becomes true | "Until `swift test` is green" |
| **Time-based** | A schedule fires, or a deadline passes | Recurring checks, watching CI |
| **Proactive** | An external event arrives | Reacting to a webhook, a PR comment, a failure |

Most real work is **goal-based with a turn cap** — repeat until the goal is met,
but never more than N times, so a goal that turns out to be unreachable
terminates instead of burning tokens forever.

---

## 2. Every loop declares four things

Before the first iteration, state these. If you cannot fill all four in, you do
not yet have a loop you should run.

```
GOAL:      swift test exits 0 with no skipped tests
CHECK:     $ swift test 2>&1 | tail -20   (the exact command, run every iteration)
MAX:       6 iterations
ON-STALL:  if two consecutive iterations produce the same failure, stop and report
```

- **GOAL** — an outcome, not an activity. "Tests pass" is a goal. "Work on the
  tests" is not.
- **CHECK** — a real command whose output decides whether to continue. Not your
  own judgment. If the check is "does it look right", the loop cannot terminate
  reliably.
- **MAX** — a hard iteration cap. Always.
- **ON-STALL** — what counts as no progress, and what to do about it.

---

## 3. Goal-based loops

The common case. Structure:

```
1. Run CHECK. Capture the output.
2. If the goal is met -> stop, report the passing output.
3. If MAX iterations reached -> stop, report the last failure and what you tried.
4. If the failure is identical to the previous iteration -> stop (stalled).
5. Otherwise: fix ONE thing, then go to 1.
```

Step 5 is where loops go wrong. Fixing several things per iteration means that
when the check still fails you cannot tell which change helped, which regressed,
and which did nothing.

### Detecting a stall

Three signals that a loop should stop even though the goal is unmet:

- **Identical failure twice.** Your change did not affect the failure. Continuing
  will not help.
- **Oscillation.** Failure A → fix → failure B → fix → failure A. You are
  trading one problem for another; the design is wrong, not the code.
- **Growing blast radius.** Each iteration touches more files than the last. You
  are chasing symptoms.

On any of these: stop and report. A loop that halts with "I could not get past
this, here is the failure and the three approaches I tried" is a good outcome. A
loop that runs twenty iterations and reports success is usually lying.

### Never fake termination

```
# WRONG — these make the check pass without meeting the goal.
- Deleting or skipping the failing test
- Widening a catch until the error disappears
- Adding a sleep until a race stops reproducing
- Loosening an assertion to match wrong output
- Force-unwrapping to get past a compile error

# RIGHT
Stop. Report the failure, the root cause if you found it, and what you tried.
```

If the only way to satisfy the stop condition is to weaken the check, the loop
has failed and must say so.

---

## 4. Turn-based loops

Bounded, known work. The cap *is* the stop condition.

```
GOAL:  all 14 view models in Features/ are @MainActor-isolated
CHECK: $ grep -rLn "@MainActor" --include="*ViewModel.swift" Features/
MAX:   14 (one per file)
```

Work one unit per iteration and verify each before moving on. Batching all
fourteen and verifying once at the end means a single failure invalidates the
whole pass with no way to tell which file caused it.

---

## 5. Time-based loops

Two distinct cases, and the difference matters:

**Fixed schedule** — a recurring task. Use a scheduled trigger rather than a
sleeping session: "check the release branch for new failures every weekday at
09:00".

**Self-paced polling** — waiting for something to change. Choose the interval
from how fast the thing actually changes:

| Waiting on | Interval |
|------------|----------|
| A CI run that takes ~8 minutes | one check at ~8 min, not eight at 1 min |
| A deploy | matched to the deploy's typical duration |
| Nothing specific (idle tick) | 20–30 minutes |
| A signal that will notify you anyway | a long fallback (20 min+), not polling |

**Never poll with `sleep` for something the harness will wake you for.** If
work is tracked and will notify you on completion, waiting in a sleep loop is
pure waste. Use a long fallback so the loop survives a hang, and let the
notification do the work.

---

## 6. Proactive loops

Driven by external events rather than your own schedule: a PR comment arrives, a
CI job fails, a webhook fires.

Rules:

- **Every event gets a visible outcome.** Either an action taken, or a stated
  reason for not acting. Silently dropping an event is how a "watched" PR sits
  broken for a day.
- **Deduplicate.** The same event can arrive twice. So can an echo of your own
  action. Neither is a new request.
- **Do not narrate every round.** Report when a round resolves the task, hits a
  blocker, or raises a question.
- **The loop ends when the underlying thing is done** — the PR merges, the job
  goes green — not when you run out of events.

---

## 7. Loops and subagents

Two ways to combine them, with different properties:

**Loop inside one agent** — the agent iterates itself. Cheaper, keeps context
across iterations, but the agent is grading its own work at every step.

**Loop with a verifier** — the worker fixes, a fresh `swift-reviewer` subagent
checks, the loop continues on the reviewer's verdict. More expensive, and
substantially more trustworthy: the thing deciding "done" is not the thing that
wants to be done.

Use a verifier loop when the cost of a false "it works" is high — anything you
will not manually check before it ships. See `verification.md`.

```
iterate:
  worker  -> makes one change
  reviewer -> runs the build and tests, returns VERDICT + real output
  if VERDICT == pass -> stop
  if MAX reached or stalled -> stop and report
  else -> feed the reviewer's findings back to the worker
```

---

## 8. Anti-patterns

```
# 1. No stop condition.
"Keep improving the code."
-> Improve until what is true? Unbounded.

# 2. Self-assessed check.
CHECK: "does the code look correct now?"
-> Not a check. Use a command with an exit code.

# 3. No iteration cap.
-> One unreachable goal burns the whole budget.

# 4. Multiple changes per iteration.
-> You cannot attribute the result to a cause.

# 5. Polling with sleep for work that notifies you.
while true; do sleep 30; check_status; done
-> Wasted turns. Use a long fallback and let the notification wake you.

# 6. Ignoring a stall.
Same failure, iteration 3, 4, 5, 6…
-> Stop at 2. Report.

# 7. Weakening the check to terminate.
-> That is not success, and reporting it as success is a false claim.

# 8. Reporting success without the final check's output.
-> Paste the passing output. Otherwise it is an assertion.
```

---

## Checklist before starting a loop

- [ ] GOAL is a measurable outcome, not an activity.
- [ ] CHECK is a real command with an exit code, run every iteration.
- [ ] MAX iteration cap is set.
- [ ] Stall detection is defined (identical failure, oscillation, growth).
- [ ] One change per iteration.
- [ ] The termination report includes the final check's real output.
- [ ] For high-stakes work, an independent verifier decides "done", not the worker.
