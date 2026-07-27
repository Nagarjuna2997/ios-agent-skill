# Hooks — Deterministic Enforcement

**Load this when:** a rule must hold every time rather than usually, you are
repeating the same correction to an agent, or you are deciding between a hook,
a CI check, and a reviewer subagent.

A hook is a shell command that runs automatically at a fixed lifecycle point.
It is not a suggestion the model weighs — it executes, and its exit code decides
what happens next. That makes it the correct home for anything a script can
decide.

---

## 1. Hook vs. CI vs. reviewer

Three enforcement layers. Use the cheapest one that can decide the question.

| Layer | Decides | Cost | Feedback speed |
|-------|---------|------|----------------|
| **Hook** | Rules a script can evaluate | ~free | Immediate — model self-corrects mid-turn |
| **CI** | Same, plus full build/test | minutes | After push |
| **Reviewer subagent** | Judgment: is this correct, does it match intent | tokens | End of task |

The ordering matters. Spending a reviewer subagent on "did you use
`DispatchQueue.main.async`" is waste — a grep answers that for free, instantly,
and cannot be argued with. Reserve model judgment for what rules cannot express.

**Rule of thumb:** if you can write the check as a grep or an exit code, it is a
hook. If it needs to understand intent, it is a reviewer.

---

## 2. Events

| Event | Fires | Typical use |
|-------|-------|-------------|
| `PreToolUse` | Before a tool runs | Block edits to generated or protected files |
| `PostToolUse` | After a tool succeeds | Format, lint, check the file just written |
| `UserPromptSubmit` | On each user message | Inject project context |
| `Stop` | Before the turn ends | Build/test verification |
| `SubagentStop` | When a subagent finishes | Validate a subagent's output |
| `SessionStart` | Session begins | Environment setup, load state |
| `SessionEnd` | Session ends | Cleanup |
| `PreCompact` | Before context compaction | Persist state that must survive |

`PreToolUse`, `PostToolUse`, and `Stop` cover almost every practical need.

---

## 3. The exit-code contract

This is the whole interface:

| Exit | Meaning |
|------|---------|
| `0` | Pass. stdout goes to the transcript. |
| `2` | **Block.** stderr is fed back to the model as the reason. |
| other | Non-blocking error, surfaced to the user. |

Exit 2 is what makes hooks valuable: the model reads the failure and fixes it
without the user having to notice, let alone intervene.

```bash
# The message on stderr IS the instruction the model acts on.
# Say what is wrong AND what to do instead.
echo "BLOCKED: CLAUDE.md is generated from SKILL.md." >&2
echo "Edit SKILL.md, then run ./scripts/sync-mirrors.sh" >&2
exit 2
```

A blocking message that only says "not allowed" wastes the round trip. Every
exit-2 message names the fix.

Hooks receive JSON on stdin — `tool_name`, `tool_input`, `cwd`, `session_id`,
and for `PostToolUse` also `tool_response`. Parse it rather than guessing:

```bash
INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c '
import json, sys
print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))
')"
```

---

## 4. Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/swift-format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

- `matcher` is a regex over the tool name. Omit it to match every invocation of
  the event.
- Always use `$CLAUDE_PROJECT_DIR` for paths — a relative path breaks the moment
  the working directory differs.
- Set a `timeout`. A hook that hangs blocks the session.

---

## 5. This repository's hooks

Wired in `.claude/settings.json`, implemented in `scripts/hooks/`:

| Hook | Event | Effect |
|------|-------|--------|
| `guard-generated-files.sh` | PreToolUse | Denies edits to the 24 generated mirror files, points at `SKILL.md` |
| `sync-mirrors-on-edit.sh` | PostToolUse | Regenerates all mirrors whenever `SKILL.md` changes |
| `verify-repo.sh` | Stop | Runs the CI checks — mirror sync, frontmatter, doc references, subagent frontmatter |

Together these make an entire class of mistake impossible rather than merely
discouraged: a hand-edited mirror is blocked, a forgotten sync is automatic, and
a broken doc reference cannot survive the end of a turn.

---

## 6. Hooks for iOS projects

Drop-in templates live in `templates/hooks/`:

| Hook | Event | Effect |
|------|-------|--------|
| `swift-format.sh` | PostToolUse | SwiftFormat + SwiftLint autocorrect on the edited file |
| `forbid-antipatterns.sh` | PostToolUse | Blocks `SKILL.md`'s banned patterns with line numbers and the fix |
| `build-check.sh` | Stop | Builds (and tests) before the turn ends |

`forbid-antipatterns.sh` catches, among others: `DispatchQueue.main.async`,
`Task.detached`, `@Observable` without `@MainActor`, empty `catch`, `try!`,
`NavigationView`, `AnyView`, fixed font sizes, live-implementation default
arguments, `print()`, and a type named `Task`. Test and mock files are exempt
from the app-code-only rules.

Installation is in `templates/hooks/README.md`.

---

## 7. Design rules

**Fail fast, and say what to do.** A hook that blocks without naming the fix
costs a round trip and teaches nothing.

**Be conservative about blocking.** A false positive on exit 2 stops legitimate
work. When a rule has real exceptions, either exempt them by path (as
`forbid-antipatterns.sh` does for test and mock files) or downgrade to a warning
on exit 0.

**Keep them fast.** `PostToolUse` runs on every edit. Check the single file that
changed, never the whole tree.

**Degrade gracefully.** A missing formatter or absent toolchain is not a failure
— exit 0 and say the check was skipped. `build-check.sh` prints `UNVERIFIED`
rather than implying a build that never ran, which keeps it honest under the
evidence contract in `verification.md`.

**Never let a hook fabricate a pass.** A check that cannot run reports that it
could not run. Silence reads as success and is the one failure mode that makes
the whole layer untrustworthy.

---

## 8. Anti-patterns

```
# 1. Using a reviewer subagent for what a grep decides.
-> Tokens spent on something free and deterministic.

# 2. Blocking without naming the fix.
echo "Not allowed" >&2; exit 2
-> The model does not know what to do next.

# 3. A PostToolUse hook that scans the whole repo.
-> Runs on every edit. Check only the changed file.

# 4. Treating a missing tool as a failure.
swiftformat ... || exit 2
-> The project may not use it. Exit 0 and skip.

# 5. A hook with no timeout.
-> One hang blocks the session.

# 6. Relative paths in the command.
"command": "./hooks/check.sh"
-> Breaks whenever cwd differs. Use $CLAUDE_PROJECT_DIR.

# 7. A check that silently passes when it could not run.
-> Reports success for work nobody verified.

# 8. Enforcing style opinions with exit 2.
-> Reserve blocking for correctness. Formatting is auto-fixed, not blocked.
```

---

## Checklist for a new hook

- [ ] The rule is genuinely deterministic — no judgment required.
- [ ] It checks only what changed, not the whole tree.
- [ ] Exit 2 messages name both the problem and the fix.
- [ ] Legitimate exceptions are exempted by path, not by weakening the rule.
- [ ] A missing tool or toolchain exits 0 and says the check was skipped.
- [ ] A `timeout` is set.
- [ ] The command uses `$CLAUDE_PROJECT_DIR`.
- [ ] It has been run against both a passing and a failing input.
