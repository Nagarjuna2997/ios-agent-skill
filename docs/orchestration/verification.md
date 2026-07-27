# Verification and the Evidence Contract

**Load this when:** you are about to report that something works, reviewing
another agent's output, closing a loop, or deciding whether a task is done.

This is the most important document in `docs/orchestration/`. Everything else
scales work out; this is what stops the scaled-out work from being confidently
wrong.

---

## 1. The rule

> **Never assert that something works. Show the output that proves it.**

"The tests pass" is a claim. This is evidence:

```
$ swift test
Test Suite 'All tests' passed at 2026-07-27 14:02:11.
	 Executed 47 tests, with 0 failures (0 unexpected) in 2.314 seconds
```

The difference is not stylistic. An agent that has written code has a strong
prior that the code is correct — it wrote it *intending* to be correct, and it
reads its own output through that intent. Requiring pasted command output
replaces that prior with a fact.

---

## 2. Every claim carries a label

Each factual claim in a report falls into exactly one bucket, and the report
says which:

| Label | Means | Requires |
|-------|-------|----------|
| **VERIFIED** | A command was run; this is its real output | The command and its output, verbatim |
| **INSPECTED** | The code was read and reasoned about | The `file:line` that was read |
| **UNVERIFIED** | Could not be checked | The reason (no scheme, no simulator, no network) |

A report with zero VERIFIED claims and no explanation of why is a failed report,
regardless of how confident it sounds.

**UNVERIFIED is a legitimate, useful result.** "I could not build this — there is
no Xcode on this machine, so the isolation fix is INSPECTED only" is honest and
actionable. Quietly implying it built is not.

---

## 3. What counts as evidence

Ordered by strength:

1. **Test output** — the suite ran, with counts and pass/fail state.
2. **Build output** — it compiles, with the exact command shown.
3. **Command output** — a lint run, a script, a grep whose emptiness is the point.
4. **A screenshot** — for UI work, the actual rendered result.
5. **A file diff** — what changed, when the change itself is the deliverable.
6. **A `file:line` citation** — for claims about what code does.

What does **not** count:

- "It should work now."
- "The change is correct."
- "I verified the logic."
- A summary of what a command would print.
- A test you wrote but did not run.

### Evidence for iOS specifically

```bash
# Build — SPM
swift build 2>&1 | tail -40

# Build — Xcode. List schemes first; never guess one.
xcodebuild -list -project MyApp.xcodeproj
xcodebuild build -scheme "MyApp" \
  -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -40

# Tests
swift test 2>&1 | tail -60
xcodebuild test -scheme "MyApp" \
  -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -60

# Lint
swiftlint lint --quiet
swiftformat --lint .

# Rule checks whose empty output IS the evidence
grep -rn "DispatchQueue.main.async" Sources/          # expect: nothing
grep -rn "APIClient\|URLSession" Sources/Presentation/ # expect: nothing
```

When a grep is the check, **show that it returned nothing**. An empty result you
did not display is indistinguishable from a check you did not run.

### When you genuinely cannot build

Common on Linux CI, in containers without Xcode, or in a docs-only repository.
Say it once, plainly, and downgrade the affected claims:

```
UNVERIFIED — no Xcode toolchain in this environment (`xcodebuild: command not
found`). All Swift samples are INSPECTED against the framework docs in
docs/frameworks/, not compiled. A human should build before merging.
```

Then verify what you *can*: markdown structure, cross-references, script syntax
(`bash -n`), JSON/YAML validity. Partial verification honestly labelled beats
none.

---

## 4. Separation of duties

**The agent that did the work does not decide whether the work is done.**

| Setup | Trust level | Use when |
|-------|-------------|----------|
| Worker self-checks | Low | Trivial, reversible changes |
| Worker self-checks with pasted output | Medium | Most routine work |
| Independent `swift-reviewer` subagent | High | Anything shipping, anything you will not manually read |
| Reviewer + deterministic hooks/CI | Highest | Rules that must never regress |

The reviewer must:
- Have **no write tools** — so it cannot fix what it should report.
- Start **cold** — so it evaluates the diff, not the author's intent.
- Return a **verdict plus evidence**, not a narrative.

```
worker    -> writes the change
reviewer  -> cold context, read + Bash only, runs the build and tests
           -> VERDICT: pass | pass-with-findings | fail  + real output
main agent -> routes findings back, or accepts
```

### Three layers, cheapest first

1. **Hooks** — deterministic, run automatically, no model judgment. Formatting,
   forbidden patterns, mirror sync. See `../../.claude/settings.json` and
   `templates/hooks/`.
2. **CI** — deterministic, runs on push. Build, tests, repo consistency.
3. **Reviewer subagent** — model judgment for what rules cannot express:
   is this correct, does it match intent, is the test meaningful.

Never use a reviewer subagent for something a hook can decide. A hook is free,
instant, and cannot be talked out of its opinion.

---

## 5. The report format

Every agent in this repository returns this shape:

```
VERDICT: <done | blocked | partial>

EVIDENCE
$ <command>
<real output>

$ <command>
<real output>

WHAT CHANGED
- path/to/File.swift:88 — <what and why>

NOT VERIFIED
- <claim> — <why it could not be checked>

FOLLOW-UPS
- <anything deliberately left, so nobody assumes it is covered>
```

`NOT VERIFIED` is not optional. An empty section is fine; omitting the section
suggests everything was verified, which is rarely true.

---

## 6. Reporting failure

Report outcomes faithfully. Specifically:

- If tests fail, say so and paste the failure.
- If you skipped a step, say which and why.
- If you could not reproduce a bug, say that — do not ship a speculative fix as
  a confirmed one.
- If part of the scope is blocked, finish everything else in full and state
  exactly what you left out.

A partial result honestly labelled is more useful than a complete-looking result
that is wrong, because the human can act on the first and will be misled by the
second.

---

## 7. Anti-patterns

```
# 1. Asserting without evidence.
"Fixed — tests pass now."
-> Paste the output.

# 2. Reporting a test you wrote but never ran.
"Added a test covering the cancellation path."
-> Did it pass? Did it fail before the fix?

# 3. Implying a build you could not run.
"The code compiles cleanly."   (on a box with no Xcode)
-> UNVERIFIED, and say why.

# 4. A grep check with no output shown.
"Confirmed no DispatchQueue usage remains."
-> Show the empty grep.

# 5. The author reviewing their own work and passing it.
-> Cold reviewer, no write tools.

# 6. Burying a failure in a success summary.
"Done. (One test is still red but it seems unrelated.)"
-> Lead with the failure. "Seems unrelated" needs evidence too.

# 7. Predicting a pending subagent's result.
"The reviewer will confirm this is fine."
-> It has not reported. Say it is still running.

# 8. A green check achieved by weakening the check.
-> Deleting a test, widening a catch, or loosening an assertion is not a pass.
```

---

## Checklist before reporting "done"

- [ ] The final check's real output is pasted, not summarized.
- [ ] Every claim is labelled VERIFIED, INSPECTED, or UNVERIFIED.
- [ ] Anything unverifiable in this environment says so, with the reason.
- [ ] The verifier is not the author, for anything that ships.
- [ ] Failures are stated plainly, not softened.
- [ ] Skipped or out-of-scope work is listed explicitly.
- [ ] No test was deleted, skipped, or loosened to reach green.
