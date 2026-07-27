# Xcode 27 Coding Agents

**Load this when:** working inside Xcode's agent features, deciding what to
delegate to an in-Xcode agent versus a CLI agent, or setting up agent-assisted
localization or testing.

Xcode 27 has coding agents built in, powered by a model of your choice. This
document covers what they are good at, what they are not, and how the discipline
in `docs/orchestration/` applies inside Xcode.

> **Verification status:** written against Xcode 27 beta documentation. Feature
> names and UI placement can shift before release — treat the workflow guidance
> as stable and re-check specific menu paths against the current beta.

---

## 1. What they are

Agents in Xcode work across the development cycle — prototyping, filling in
implementation, and polishing — and work the same whether you are solo or on a
team. Xcode supplies the agent with **project context**: your targets, your
schemes, your code style, and your string catalogs.

That project context is the real difference from a general-purpose agent in a
terminal. An in-Xcode agent knows the build graph. An external agent has to
rediscover it.

| Strength | Because |
|----------|---------|
| Localization and string catalogs | It sees the catalogs and Apple's language-specific style guidance |
| Scaffolding UI and boilerplate | It knows the project's targets and conventions |
| Test authoring | It can run the tests it writes |
| Diagnosing a build failure | It has the actual compiler output |

| Weakness | Because |
|----------|---------|
| Cross-repo work | Scoped to the Xcode project |
| Long-running orchestration | No worktrees, no batch fan-out |
| Non-Swift toolchain work | Not what it is built for |

---

## 2. Xcode agent vs. Claude Code

These are complements, not competitors. Route by the shape of the work.

| Work | Use |
|------|-----|
| "Add German and update the string catalog" | **Xcode agent** — it owns catalogs |
| "Why does this fail on iPad only?" | **Xcode agent** — Device Hub is right there |
| "Write tests for this view model" | **Xcode agent** — can run them immediately |
| "Apply this rule across 30 modules" | **Claude Code** — `/batch`, worktrees, PRs |
| "Restructure our architecture layers" | **Claude Code** — plan/review subagents |
| "Audit the repo against our skill rules" | **Claude Code** — hooks and CI |

Rule of thumb: **inside one project and one build graph → Xcode. Across files,
repos, or PRs → Claude Code.**

---

## 3. The same verification contract applies

An agent in Xcode is still an agent. Everything in
`docs/orchestration/verification.md` holds:

- **Never accept "done" without evidence.** In Xcode the evidence is right
  there — the build result and the test navigator. Look at it.
- **The author does not grade the work.** If the agent wrote the code *and* the
  test, both encode the same misunderstanding. Read the test yourself and ask
  whether it would fail against the old behavior.
- **A green build is not a passing feature.** It compiles. That is one claim.

```
Agent says                          What you check
"Added tests, they pass."      →    Run them. Read them. Would they fail before?
"Fixed the layout issue."      →    Run it on the device size that broke.
"Localized to 8 languages."    →    Check pluralization and RTL, not just presence.
"Build succeeds."              →    True and insufficient.
```

---

## 4. Agent-assisted localization

The strongest first use, because it is high-volume, low-ambiguity, and verifiable.

Agents can add languages, update string catalogs, and translate strings, using
Apple-provided language-specific style guidance and your app's context.

What still needs you:

- **Plural variants.** Agents handle language-specific plural forms, but the
  *rule* per string is a product decision. Check the catalog's variants.
- **Context strings.** A key named `title` translates badly without a comment.
  Add comments before running the agent, not after.
- **RTL layout.** Translation is not layout. Verify Arabic and Hebrew visually.
- **Truncation.** German and Finnish run long. Check at accessibility text sizes.

```swift
// Give the agent something to work with — the comment IS the context.
Text("cart.checkout.button", comment: "Button that starts checkout. Keep under 15 characters.")
```

See `docs/design/interaction-standards.md` §6 for the localization standards the
output must meet.

---

## 5. Agent-assisted testing

Agents write tests and can run them. Two failure modes to watch:

**Tests that assert the implementation, not the behavior.** A test that mirrors
the code line for line passes forever and catches nothing.

```swift
// WEAK — restates the implementation.
#expect(viewModel.items.count == viewModel.repository.items.count)

// STRONG — asserts the behavior the user depends on.
#expect(viewModel.errorMessage != nil)     // a failed load must surface
```

**Tests written to pass rather than to catch.** Ask of any generated test: *would
this have failed before the fix?* If not, delete it.

Use `docs/testing/mocking-strategy.md` for what to substitute, and
`checklists/testing.md` for coverage shape.

---

## 6. Instruments

Xcode 27's profiling improvements matter for the concurrency rules this skill
enforces:

| Instrument | Shows |
|------------|-------|
| **Swift Concurrency** | Async task scheduling, **actor contention**, thread usage |
| **Time Profiler** | CPU bottlenecks, with a "top functions" view |
| **System Trace** | System-level view of threads and hardware |
| Run comparisons | The measured impact of a change |

The Swift Concurrency instrument is the tool for the failure this skill warns
about most: main-actor contention from CPU work that should have been
`nonisolated` or on an actor. Do not guess at isolation performance — measure it.
See `docs/swift/swift-concurrency.md`.

---

## 7. Keeping agents on this skill's rules

The rules in `SKILL.md` apply to code an Xcode agent writes too, but Xcode does
not read `CLAUDE.md`. Two ways to keep them enforced:

1. **A pre-commit hook or CI**, so the rules bind regardless of which agent wrote
   the code. `templates/hooks/forbid-antipatterns.sh` runs standalone:

   ```bash
   # .git/hooks/pre-commit
   for file in $(git diff --cached --name-only --diff-filter=ACM | grep '\.swift$'); do
     echo "{\"tool_input\":{\"file_path\":\"$PWD/$file\"}}" \
       | .claude/hooks/forbid-antipatterns.sh || exit 1
   done
   ```

2. **Review with `swift-reviewer`** before the PR, which checks the same rules
   with model judgment where a grep cannot reach.

Deterministic enforcement is what makes multi-agent work safe: it does not matter
which agent wrote the line if the rule is checked mechanically. See
`docs/orchestration/hooks.md`.

---

## Anti-Patterns

```
# 1. Accepting a diff you have not read because the build went green.
   Compiling is one claim, not a review.

# 2. Letting the agent write both the code and its only test.
   Same misunderstanding, encoded twice.

# 3. Shipping generated translations without checking plurals, RTL, or truncation.

# 4. Using an in-Xcode agent for a 30-module migration.
   No worktrees, no isolation. Use /batch.

# 5. Using Claude Code for string-catalog work.
   Xcode owns the catalogs and the style guidance.

# 6. Assuming Xcode agents follow SKILL.md.
   They do not read it. Enforce with hooks or CI.

# 7. Guessing at concurrency performance.
   The Swift Concurrency instrument measures actor contention directly.
```

---

## Checklist

- [ ] The work is scoped to one project — otherwise route it to `/batch`.
- [ ] Generated diffs are read, not just built.
- [ ] Generated tests would have failed before the change.
- [ ] Localization output checked for plurals, RTL, and truncation.
- [ ] String keys have comments before the agent runs.
- [ ] This skill's rules are enforced by a hook or CI, not by hoping.
- [ ] Isolation performance is measured, not assumed.
